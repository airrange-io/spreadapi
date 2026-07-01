/**
 * Format a calculateDirect() error result into a single, AI-actionable message.
 *
 * Goal: when an AI (via MCP or the /d REST endpoint) sends bad inputs, the error
 * must tell it the exact input KEY to fix, WHAT went wrong, and any allowed
 * values / bounds — so it can self-correct without guessing.
 *
 * Single source of truth, shared by the MCP tool handler and /d, so both channels
 * give identical, high-quality errors.
 */
export function formatCalcError(result) {
  const base = result?.error || 'Calculation failed';

  // Missing required parameters — name them by their canonical input key.
  if (result?.details?.required?.length) {
    const keys = result.details.required.map(p => p.name || p.title).filter(Boolean);
    return `${base}. Missing required input(s): ${keys.join(', ')}. Add these keys and retry.`;
  }

  // Validation failures — one clear line per parameter, keyed by its NAME.
  // e.error already contains the specifics (allowed values / min / max), so we
  // do NOT append them again (that was a source of duplicated text).
  if (result?.details?.errors?.length) {
    const parts = result.details.errors.map(e => {
      const key = e.name || e.parameter || 'parameter';
      return `${key}: ${e.error}`;
    });
    return `${base}: ${parts.join('; ')}`;
  }

  if (result?.message) return `${base}: ${result.message}`;
  return base;
}
