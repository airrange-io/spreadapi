import type { ProviderOverrides } from './types';
import { fetchGoogleSheetsValues } from './google_sheets.backend';

// Per-app overrides. Empty registry by design — every entry should be
// justified by a real product need, not speculation. The generic flow is
// expected to handle most apps unaided.
export const providers: Record<string, ProviderOverrides> = {
  google_sheets: {
    // The action id is a stable label for saved configs only; the actual
    // fetch goes through customFetch which hits the Sheets API directly.
    defaultActionId: 'google_sheets-list-sheet-values',
    customFormActionId: 'google_sheets-list-sheet-values',
    customFetch: ({ pd, source, maxRows }) =>
      fetchGoogleSheetsValues({ pd, source, maxRows }),
  },
};

export function getProvider(appSlug: string): ProviderOverrides {
  return providers[appSlug] ?? {};
}

// Re-export types so callers only need a single import.
export type { ProviderOverrides, PropRendererProps } from './types';
