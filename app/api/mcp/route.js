import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { mcpAuthMiddleware } from '../../../lib/mcp-auth';
import { POST as bridgePOST } from './bridge/route.js';

/**
 * MCP (Model Context Protocol) Server - Streamable HTTP Transport
 *
 * Implements MCP specification 2025-03-26 with Streamable HTTP transport.
 * Compatible with:
 * - ChatGPT Developer Mode
 * - OpenAI Agent Builder (MCPServerStreamableHttp)
 * - Any MCP client supporting Streamable HTTP
 *
 * Protocol: HTTP with streaming responses
 * Session Management: Via Mcp-Session-Id header (stored in Redis)
 *
 * For stdio bridge clients (Claude Desktop), use /api/mcp/bridge instead.
 */

// Session configuration
const SESSION_TTL = 600; // 10 minutes in seconds

/**
 * Generate a new session ID
 */
function generateSessionId() {
  return `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new session in Redis
 * Uses hash for structured data with TTL for automatic cleanup
 */
async function createSession(userId) {
  const sessionId = generateSessionId();
  const now = Date.now();

  // Store session as hash under mcp:session:{sessionId}
  // This keeps sessions organized under mcp:session:* namespace
  await redis.hSet(`mcp:session:${sessionId}`, {
    userId: userId,
    created: now.toString(),
    lastActivity: now.toString()
  });

  // Set TTL for automatic cleanup (no setInterval needed!)
  await redis.expire(`mcp:session:${sessionId}`, SESSION_TTL);

  return sessionId;
}

/**
 * Get session from Redis
 * Returns null if session doesn't exist or expired
 */
async function getSession(sessionId) {
  if (!sessionId) return null;

  try {
    const session = await redis.hGetAll(`mcp:session:${sessionId}`);

    // Check if session exists (hGetAll returns empty object if key doesn't exist)
    if (!session || Object.keys(session).length === 0) {
      return null;
    }

    return {
      userId: session.userId,
      created: parseInt(session.created),
      lastActivity: parseInt(session.lastActivity)
    };
  } catch (error) {
    console.error('[MCP Session] Error getting session:', error);
    return null;
  }
}

/**
 * Update session activity timestamp and refresh TTL
 */
async function touchSession(sessionId) {
  if (!sessionId) return;

  try {
    // Update last activity
    await redis.hSet(`mcp:session:${sessionId}`, 'lastActivity', Date.now().toString());

    // Refresh TTL
    await redis.expire(`mcp:session:${sessionId}`, SESSION_TTL);
  } catch (error) {
    console.error('[MCP Session] Error touching session:', error);
  }
}

/**
 * POST /api/mcp
 *
 * Streamable HTTP transport endpoint
 * Handles MCP protocol messages with Redis-based session management
 */
export async function POST(request) {
  console.log('========================================');
  console.log('[MCP] POST REQUEST RECEIVED - OAUTH TEST');
  console.log('========================================');

  try {
    // Validate authentication
    const auth = await mcpAuthMiddleware(request);

    console.log('[MCP] Auth result:', {
      valid: auth.valid,
      isOAuth: auth.isOAuth,
      userId: auth.userId,
      serviceIdsCount: auth.serviceIds?.length || 0
    });

    if (!auth.valid) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: `Authentication failed: ${auth.error}`
          },
          id: null
        },
        {
          status: auth.status || 401,
          headers: {
            'Content-Type': 'application/json',
            // WWW-Authenticate header tells ChatGPT to initiate OAuth flow
            'WWW-Authenticate': `Bearer realm="${baseUrl}/api/mcp", scope="mcp:read mcp:write"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id'
          }
        }
      );
    }

    // Session management with Redis
    let sessionId = request.headers.get('Mcp-Session-Id');
    let session = null;

    if (sessionId) {
      // Try to get existing session
      session = await getSession(sessionId);

      if (session) {
        // Verify session belongs to authenticated user
        if (session.userId !== auth.userId) {
          console.warn(`[MCP Session] Session ${sessionId} user mismatch: ${session.userId} vs ${auth.userId}`);
          session = null;
          sessionId = null;
        } else {
          // Touch session to update activity and refresh TTL
          await touchSession(sessionId);
        }
      } else {
        // Session expired or invalid
        sessionId = null;
      }
    }

    if (!sessionId) {
      // Create new session
      sessionId = await createSession(auth.userId);
      console.log(`[MCP Session] Created new session: ${sessionId} for user: ${auth.userId}`);
    }

    // Parse the JSON-RPC request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error'
          },
          id: null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Mcp-Session-Id': sessionId,
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Delegate to bridge handler (reuses all JSON-RPC logic)
    const mockRequest = {
      json: async () => body,
      headers: request.headers
    };

    // Call bridge handler (now using static import)
    const bridgeResponse = await bridgePOST(mockRequest, {});
    const jsonRpcResponse = await bridgeResponse.json();

    // Return with Streamable HTTP headers including session ID
    return NextResponse.json(jsonRpcResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id'
      }
    });

  } catch (error) {
    console.error('MCP Streamable HTTP error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

/**
 * OPTIONS /api/mcp
 *
 * CORS preflight handler
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
      'Access-Control-Max-Age': '86400'
    }
  });
}
