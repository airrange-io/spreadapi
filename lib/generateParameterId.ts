/**
 * Generates a unique parameter ID
 * Format: 21 character alphanumeric string with - and _
 * Example: A7xK9mP_2nQ-Lz4Bw8Rt5
 */
export function generateParameterId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = '';
  for (let i = 0; i < 21; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}