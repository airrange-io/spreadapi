import { NextResponse } from 'next/server';

// Store recent debug logs in memory
global.chatDebugLogs = global.chatDebugLogs || [];
const MAX_LOGS = 100;

export async function POST(req) {
  try {
    const { log } = await req.json();
    
    // Add timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...log
    };
    
    // Store in memory
    global.chatDebugLogs.push(logEntry);
    
    // Keep only recent logs
    if (global.chatDebugLogs.length > MAX_LOGS) {
      global.chatDebugLogs = global.chatDebugLogs.slice(-MAX_LOGS);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    logs: global.chatDebugLogs || [],
    count: (global.chatDebugLogs || []).length
  });
}