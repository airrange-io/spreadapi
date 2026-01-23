// Simple file-based logging

const fs = require('fs').promises;
const path = require('path');

const LOGS_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_ENTRIES = 1000;

// In-memory recent logs
const recentLogs = [];

async function ensureDir() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

function getLogFileName() {
  const date = new Date().toISOString().split('T')[0];
  return `requests-${date}.log`;
}

async function logRequest(entry) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Add to in-memory buffer
  recentLogs.push(logEntry);
  if (recentLogs.length > MAX_LOG_ENTRIES) {
    recentLogs.shift();
  }

  // Write to file (non-blocking)
  try {
    await ensureDir();
    const filePath = path.join(LOGS_DIR, getLogFileName());
    await fs.appendFile(filePath, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error('Failed to write log:', err.message);
  }

  return logEntry;
}

function getRecentLogs(options = {}) {
  let logs = [...recentLogs];

  if (options.serviceId) {
    logs = logs.filter(l => l.serviceId === options.serviceId);
  }

  if (options.status) {
    logs = logs.filter(l => l.status === options.status);
  }

  const limit = options.limit || 100;
  return logs.slice(-limit).reverse();
}

async function getLogsFromFile(date) {
  try {
    const fileName = date ? `requests-${date}.log` : getLogFileName();
    const filePath = path.join(LOGS_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (err) {
    return [];
  }
}

// Simple analytics from recent logs
function getAnalytics(serviceId) {
  const logs = serviceId
    ? recentLogs.filter(l => l.serviceId === serviceId)
    : recentLogs;

  if (logs.length === 0) {
    return {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      avgExecutionTime: 0,
    };
  }

  const successLogs = logs.filter(l => l.status === 'success');
  const errorLogs = logs.filter(l => l.status === 'error');
  const totalTime = successLogs.reduce((sum, l) => sum + (l.executionTime || 0), 0);

  return {
    totalRequests: logs.length,
    successCount: successLogs.length,
    errorCount: errorLogs.length,
    avgExecutionTime: successLogs.length > 0 ? Math.round(totalTime / successLogs.length) : 0,
    lastRequest: logs[logs.length - 1]?.timestamp,
  };
}

module.exports = {
  logRequest,
  getRecentLogs,
  getLogsFromFile,
  getAnalytics,
};
