import { NextResponse, after } from 'next/server';
import redis from '@/lib/redis';
import { getApiDefinition } from '@/utils/helperApi';
import { validateServiceToken } from '@/utils/tokenAuth';
import { validateParameters, applyDefaults, coerceTypes, NULL_DEFAULT_VALUE } from '@/lib/parameterValidation.js';
import { getSheetNameFromAddress } from '@/utils/helper';
import { logCalls } from '../execute/calculateDirect';
import { verifyExportSignature } from '@/lib/exportUrlSigner';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';

// Lazy SpreadJS init (same pattern as calculateDirect) to keep cold start cheap.
let spreadjsModule = null;
let spreadjsInitialized = false;
const getSpreadjsModule = () => {
  if (!spreadjsModule) {
    spreadjsModule = require('@/lib/spreadjs-server');
  }
  if (!spreadjsInitialized) {
    spreadjsModule.initializeSpreadJS();
    spreadjsInitialized = true;
  }
  return spreadjsModule;
};

/**
 * GET /api/v1/services/[id]/export
 *
 * Stateless, on-demand Excel export. Takes the same input values as the
 * execute endpoint (as query params), fills the service's template, recalculates,
 * and streams the resulting .xlsx as a download. Nothing is stored — the URL
 * itself is the state, so a shared/opened link regenerates the file each time.
 *
 * Auth mirrors the calc path: token via ?token= or Authorization: Bearer.
 * Protected services require a valid token.
 *
 * Uses a FRESH workbook (not the shared calc cache): the .xlsx export is async,
 * which would open a concurrency window on the shared instance. This mirrors the
 * area-update path and leaves the hot calc path completely untouched.
 */
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);

    // Rate limiting — parity with /execute (shared bucket via the same key).
    // Export is public and CPU-heavier (full workbook load + xlsx serialization).
    const rateLimitResult = await checkRateLimit(`service:${serviceId}`, RATE_LIMITS.PRO);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMITS.PRO.maxRequests} requests per minute.`,
        },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Existence / published check (clean 404 like the execute route).
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished === 0) {
      return NextResponse.json(
        { error: 'Not found', message: 'Service not found or not published' },
        { status: 404 }
      );
    }

    // Parse params from the query (same convention as execute GET).
    const inputs = {};
    const candidatePairs = []; // all non-special [key,value] string pairs (may include
                               // consumer-added noise like utm_source that was never signed)
    let token = null;
    let sig = null;
    let exp = null;
    let filenameParam = null;

    for (const [key, value] of searchParams) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'token') {
        token = value;
      } else if (lowerKey === 'sig') {
        sig = value;
      } else if (lowerKey === 'exp') {
        exp = value;
      } else if (lowerKey === '_filename') {
        filenameParam = value;
      } else if (lowerKey === 'nocdn' || lowerKey === 'nocache') {
        // ignored for export
      } else if (!key.startsWith('_')) {
        candidatePairs.push([lowerKey, String(value)]);
        // Parse value types for the calculation: boolean > number > string
        let parsedValue = value;
        if (value === 'true') {
          parsedValue = true;
        } else if (value === 'false') {
          parsedValue = false;
        } else {
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== '') {
            parsedValue = numValue;
          }
        }
        inputs[lowerKey] = parsedValue;
      }
    }

    // Fall back to Authorization header for the token.
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    // Load the definition. A signed link carries no token, so when a signature is
    // present pass a placeholder to clear getApiDefinition's presence-only gate;
    // the real authorization is the signature check below.
    const hasSig = !!(sig && exp);
    const gateToken = token || (hasSig ? '__signed__' : null);
    const apiDefinition = await getApiDefinition(serviceId, gateToken);
    if (!apiDefinition || apiDefinition.error) {
      return NextResponse.json(
        { error: apiDefinition?.error || 'Service not found' },
        { status: 404 }
      );
    }

    // Per-service opt-in: Excel export must be explicitly enabled.
    if (!apiDefinition.allowExcelExport) {
      return NextResponse.json(
        { error: 'Excel export is not enabled for this service.' },
        { status: 403 }
      );
    }

    const apiJson = apiDefinition?.apiJson ?? {};
    const apiInputs = apiJson?.inputs || apiJson?.input || [];

    // Verify the signature over ONLY the service's defined input parameters.
    // Consumers (e.g. ChatGPT) append tracking params like utm_source that were
    // never part of the signature — filtering to known inputs ignores them.
    const definedNames = new Set(
      apiInputs.map((i) => (i.name || '').toLowerCase()).filter(Boolean)
    );
    const signedPairs = candidatePairs.filter(([k]) => definedNames.has(k));
    const signatureValid = hasSig && verifyExportSignature(serviceId, signedPairs, sig, exp);

    // Enforce auth for protected services. A valid signature (bound to these exact
    // inputs and not expired) authorizes the request; otherwise fall back to token.
    if (apiDefinition.needsToken || apiDefinition.requireToken) {
      if (!signatureValid) {
        const mockRequest = {
          headers: {
            get: (name) => {
              if (name.toLowerCase() === 'authorization' && token) {
                return `Bearer ${token}`;
              }
              return null;
            },
          },
          url: `http://localhost?token=${token || ''}`,
        };
        const tokenValidation = await validateServiceToken(mockRequest, serviceId);
        if (!tokenValidation.valid) {
          return NextResponse.json(
            { error: tokenValidation.error || 'Authentication required' },
            { status: 401 }
          );
        }
      }
    }

    const fileJson = apiDefinition?.fileJson;
    if (!fileJson) {
      return NextResponse.json({ error: 'no service data' }, { status: 404 });
    }

    // Validate → default → coerce (same helpers as the calc path).
    const validation = validateParameters(inputs, apiInputs);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message, details: validation.details },
        { status: 400 }
      );
    }
    const finalInputs = coerceTypes(applyDefaults(inputs, apiInputs), apiInputs);

    // Prepare SpreadJS.
    const spreadjs = getSpreadjsModule();
    const { createWorkbook, exportWorkbookToXlsx, needsTablesheetModule, loadTablesheetModule } = spreadjs;

    const withTables = needsTablesheetModule(fileJson);
    if (withTables && !loadTablesheetModule()) {
      return NextResponse.json({ error: 'error loading required modules' }, { status: 500 });
    }

    // FRESH workbook — never the shared calc cache (export is async).
    const spread = createWorkbook();
    spread.fromJSON(fileJson, {
      calcOnDemand: false,
      doNotRecalculateAfterLoad: true,
    });

    // Set input cells (same address/sheet logic as calculateDirect).
    let actualSheet = spread.getActiveSheet();
    let actualSheetName = actualSheet.name();

    const inputDefMap = new Map();
    for (const inp of apiInputs) {
      if (inp.name) inputDefMap.set(inp.name.toLowerCase(), inp);
      if (inp.address) inputDefMap.set(inp.address.toLowerCase(), inp);
    }

    for (const [key, value] of Object.entries(finalInputs)) {
      const inputDef = inputDefMap.get(key.toLowerCase());
      if (!inputDef) continue;

      let cellValue = value === NULL_DEFAULT_VALUE ? null : value;

      const inputSheetName = getSheetNameFromAddress(inputDef.address).replace(/^'|'$/g, '');
      if (inputSheetName !== actualSheetName) {
        const sheet = spread.getSheetFromName(inputSheetName);
        if (!sheet) {
          return NextResponse.json({ error: `sheet not found: ${inputSheetName}` }, { status: 400 });
        }
        actualSheet = sheet;
        actualSheetName = sheet.name();
      }

      actualSheet.getCell(inputDef.row, inputDef.col).value(cellValue);
    }

    // Recalculate before exporting the whole workbook.
    spread.calculate();

    // Export → Buffer.
    const buffer = await exportWorkbookToXlsx(spread, {});

    // Build a safe download filename.
    const serviceName = apiDefinition?.serviceName || apiJson?.name || apiJson?.title || 'export';
    const safeName =
      String(filenameParam || serviceName)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80) || 'export';
    const dateStr = new Date().toISOString().split('T')[0];

    // Analytics consistency with the calc path.
    after(() => logCalls(serviceId, token));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeName}_${dateStr}.xlsx"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[export] error:', error);
    return NextResponse.json(
      { error: 'export failed: ' + (error.message || 'unknown error') },
      { status: 500 }
    );
  }
}
