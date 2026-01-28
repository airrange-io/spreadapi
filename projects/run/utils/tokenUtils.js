import crypto from 'crypto';

// Hash a token for secure lookup
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Parse token from authorization header
export function parseAuthToken(authHeader) {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}
