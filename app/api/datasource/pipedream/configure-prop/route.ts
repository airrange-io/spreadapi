import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import { normalizeComponent } from '@/lib/pipedream/normalize';

// POST — two related Pipedream-Connect SDK calls share this endpoint:
//
//   mode='options'  →  pd.components.configureProps(...)
//     Fetch dynamic options for a single prop (e.g. list the user's
//     spreadsheets after they picked a Google account). Returns
//     { options: [{label, value}] }.
//
//   mode='reload'   →  pd.components.retrieveProps(...)
//     Re-fetch the component's configurableProps schema after a value
//     changed on a prop flagged reloadProps:true. Returns the new
//     schema ({ configurableProps: [...] }).
//
// Both calls need externalUserId (server-derived from Hanko), the component
// id, and the currently-configured props (what the user has filled in so far).
interface Body {
  mode: 'options' | 'reload';
  componentId: string;
  configuredProps: Record<string, unknown>;
  propName?: string;        // required for mode='options'
  dynamicPropsId?: string;  // echoes the previous reloadProps response id
  query?: string;           // optional server-side search for large option lists
}

export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.componentId) {
    return NextResponse.json({ ok: false, error: 'componentId is required' }, { status: 400 });
  }

  try {
    const pd = makePipedreamClient();
    const configuredProps = body.configuredProps || {};

    if (body.mode === 'options') {
      if (!body.propName) {
        return NextResponse.json(
          { ok: false, error: 'propName is required for options mode' },
          { status: 400 },
        );
      }
      const raw = await pd.components.configureProp({
        externalUserId: userId,
        id: body.componentId,
        propName: body.propName,
        configuredProps,
        ...(body.query ? { query: body.query } : {}),
        ...(body.dynamicPropsId ? { dynamicPropsId: body.dynamicPropsId } : {}),
      });
      const r: any = (raw as any)?.data ?? raw ?? {};
      // SDK returns a mix of shapes:
      //   - r.options:        [{label,value}]  OR  [{lv:{label,value}}]  (nested)
      //   - r.stringOptions:  string[]                                    (scalar-only)
      // Flatten everything to {label,value} so the frontend Select can
      // render uniformly.
      const normalized: Array<{ label: string; value: unknown }> = [];
      if (Array.isArray(r.options)) {
        for (const o of r.options) {
          if (!o) continue;
          if (typeof o === 'object' && 'lv' in o && o.lv) {
            normalized.push({ label: String(o.lv.label ?? o.lv.value), value: o.lv.value });
          } else if (typeof o === 'object' && 'label' in o) {
            normalized.push({ label: String(o.label), value: (o as any).value });
          }
        }
      }
      if (Array.isArray(r.stringOptions)) {
        for (const s of r.stringOptions) {
          normalized.push({ label: String(s), value: s });
        }
      }
      return NextResponse.json({
        ok: true,
        options: normalized,
        errors: r.errors || [],
        observations: r.observations || [],
      });
    }

    if (body.mode === 'reload') {
      const raw = await pd.components.reloadProps({
        externalUserId: userId,
        id: body.componentId,
        configuredProps,
        ...(body.dynamicPropsId ? { dynamicPropsId: body.dynamicPropsId } : {}),
      });
      const r: any = (raw as any)?.data ?? raw ?? {};
      const dynamicProps = r.dynamicProps || r.dynamic_props;
      const component = normalizeComponent(
        dynamicProps
          ? { configurableProps: dynamicProps.configurableProps || dynamicProps.configurable_props }
          : r,
      );
      return NextResponse.json({
        ok: true,
        configurableProps: component?.configurableProps || [],
        dynamicPropsId: dynamicProps?.id,
        errors: r.errors || [],
        observations: r.observations || [],
      });
    }

    return NextResponse.json({ ok: false, error: `Unknown mode "${body.mode}"` }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'configure-prop failed';
    console.error('[pipedream/configure-prop]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
