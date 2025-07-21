import crypto from 'crypto';

// Generate a secure random token
export function generateToken(prefix = 'svc_tk') {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

// Hash a token for secure storage
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify a token against its hash
export function verifyToken(token, hash) {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash)
  );
}

// Generate a token ID
export function generateTokenId() {
  return crypto.randomBytes(16).toString('hex');
}

// Format token for display (show only first and last few characters)
export function formatTokenForDisplay(token) {
  if (!token || token.length < 20) return token;
  const prefix = token.substring(0, 10);
  const suffix = token.substring(token.length - 4);
  return `${prefix}...${suffix}`;
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