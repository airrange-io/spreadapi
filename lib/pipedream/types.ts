// Domain types for the Pipedream Connect integration. Frontend and backend
// both import from here; nothing here depends on the SDK or React.

export interface PipedreamApp {
  nameSlug: string;        // e.g. 'google_sheets'
  name: string;            // 'Google Sheets'
  description?: string;
  imgSrc?: string;
  authType?: string;       // 'oauth' | 'keys' | …
  categories?: string[];
}

export interface PipedreamAccount {
  id: string;              // 'apn_xxx' — also called authProvisionId
  app: string;             // app nameSlug
  name: string;            // user-visible label (often the email)
  externalUserId: string;
  createdAt?: string;
  healthy?: boolean;
}

export type PipedreamPropType =
  | 'string'
  | 'integer'
  | 'boolean'
  | 'app'
  | 'object'
  | 'string[]'
  | 'integer[]'
  | string;                // catch-all for SDK additions

export interface PipedreamPropOption {
  label: string;
  value: string | number | boolean;
}

export interface PipedreamProp {
  name: string;
  type: PipedreamPropType;
  label?: string;
  description?: string;
  optional?: boolean;
  default?: unknown;
  // If true → call /configure-prop endpoint to fetch options for this prop
  // (used for things like "list spreadsheets in the connected Google account").
  remoteOptions?: boolean;
  // If true → after the user changes this prop's value, refetch the schema
  // because subsequent props may change.
  reloadProps?: boolean;
  // For type === 'app' this is the slug; the value to send is `{ authProvisionId }`.
  app?: string;
  // Static options (when remoteOptions is false).
  options?: Array<string | PipedreamPropOption>;
  // For some props the SDK echoes back the dynamic-options handle.
  asyncHandle?: string;
}

export interface PipedreamComponent {
  key: string;             // 'google_sheets-list-sheet-values'
  name: string;
  version?: string;
  componentType?: 'action' | 'trigger';
  description?: string;
  configurableProps?: PipedreamProp[];
}

// The `source` value we persist inside apiConfig.dataSources[i] for a
// Pipedream-backed snapshot. Same shape we send to actions.run() at refresh.
export interface PipedreamSource {
  type: 'pipedream';
  appSlug: string;
  actionId: string;
  accountId: string;       // authProvisionId
  externalUserId: string;
  // The user's choices, sent verbatim when calling actions.run() at refresh.
  configuredProps: Record<string, unknown>;
  // Optional fallback for response normalization when auto-detect fails.
  arrayPath?: string;
}
