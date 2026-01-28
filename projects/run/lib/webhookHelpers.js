/**
 * Webhook Automation - Stripped down for execution only
 * Non-blocking, fire-and-forget webhook calls
 */

const WEBHOOK_TIMEOUT = 5000;

// In-memory rate limiting
const rateLimitTracker = new Map();
const MAX_WEBHOOKS_PER_MINUTE = 100;
const RATE_LIMIT_WINDOW = 60000;

function validateWebhookUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and private IPs
    const blocked = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./, /^169\.254\./
    ];

    for (const pattern of blocked) {
      if (typeof pattern === 'string' ? hostname === pattern : pattern.test(hostname)) {
        return { valid: false };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false };
  }
}

function isRateLimited(serviceId) {
  const now = Date.now();
  const tracker = rateLimitTracker.get(serviceId);

  if (!tracker || now - tracker.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitTracker.set(serviceId, { count: 1, windowStart: now });
    return false;
  }

  tracker.count++;
  return tracker.count > MAX_WEBHOOKS_PER_MINUTE;
}

export function triggerWebhook(serviceConfig, calculationResult) {
  if (!serviceConfig.webhookUrl) return;

  const serviceId = calculationResult.apiId;
  const webhookUrl = serviceConfig.webhookUrl;
  const webhookSecret = serviceConfig.webhookSecret;

  setImmediate(async () => {
    try {
      if (!validateWebhookUrl(webhookUrl).valid) return;
      if (isRateLimited(serviceId)) return;

      const payload = {
        event: 'calculation.completed',
        timestamp: new Date().toISOString(),
        serviceId,
        inputs: calculationResult.inputs,
        outputs: calculationResult.outputs,
      };

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'SpreadAPI-Webhook/1.0'
      };

      if (webhookSecret) {
        headers['X-Webhook-Secret'] = webhookSecret;
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT)
      });
    } catch (error) {
      // Fire and forget - don't log to avoid noise
    }
  });
}
