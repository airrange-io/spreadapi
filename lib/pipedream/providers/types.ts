import type {
  PipedreamAccount,
  PipedreamComponent,
  PipedreamProp,
  PipedreamSource,
} from '../types';

// Per-app extension points. Generic flow runs by default; an entry in the
// registry below selectively overrides specific stages.
//
// Rule for the codebase: generic code never matches on appSlug directly.
// If a customisation is needed, add a hook here.
export interface ProviderOverrides {
  // ─── Backend hooks ──────────────────────────────────────────────────────

  // Filter and/or reorder the list of actions returned to the action picker.
  filterActions?: (actions: PipedreamComponent[]) => PipedreamComponent[];

  // Suggested action id when the picker first opens (e.g. the canonical
  // "list rows" action for a sheet provider). The user can still pick
  // anything else.
  defaultActionId?: string;

  // Inject sensible defaults into configuredProps when an action is first
  // selected. Returned partial gets merged into the user-edited props.
  prefillProps?: (
    action: PipedreamComponent,
    account: PipedreamAccount,
  ) => Record<string, unknown>;

  // Replace the generic envelope-detection for actions.run results.
  normalizeResponse?: (ret: unknown) => unknown[];

  // Replace the single-shot fetch with a paginated loop. `runOne` accepts a
  // configuredProps payload and returns the SDK result; the override decides
  // when to stop and how to combine pages.
  paginate?: (
    runOne: (
      configuredProps: Record<string, unknown>,
    ) => Promise<{ ret: unknown; exports?: unknown }>,
    initial: Record<string, unknown>,
    maxRows: number,
  ) => Promise<unknown[]>;

  // Replace the entire fetch path — including the action-run — with a custom
  // implementation. Best for apps where Pipedream's pre-built actions are a
  // poor fit and we prefer to hit the provider's API directly via pd.proxy.
  // If set, the generic actions.run flow is skipped entirely for this app.
  customFetch?: (opts: {
    pd: unknown;
    source: PipedreamSource;
    maxRows: number;
  }) => Promise<unknown[]>;

  // ─── Frontend hooks (consumed by the modal) ─────────────────────────────

  // Per-prop custom React renderer. Key is the prop name in the action
  // schema. Falls back to the default renderer when absent. Type kept loose
  // here to avoid pulling React into a backend-importable file; the
  // frontend casts on read.
  propRenderers?: Record<string, unknown>;

  // Replace the entire Configure step (ActionPicker + ConfigurableForm) with
  // a provider-specific component. The frontend imports this lazily so the
  // backend import of providers/ doesn't pull in React. Shape here is loose
  // for the same reason — the frontend casts on read.
  customForm?: unknown;

  // When customForm is set, this is the action id the custom form writes to
  // as its target (so saved sources are consistent). For google_sheets this
  // is the list-sheet-values action — but with customFetch it isn't actually
  // invoked; it's just a stable label for saved configs.
  customFormActionId?: string;
}

export type PropRendererProps = {
  prop: PipedreamProp;
  value: unknown;
  onChange: (value: unknown) => void;
  // Allows custom renderers to fetch dynamic options through the same
  // /configure-prop endpoint the generic renderer uses.
  fetchOptions: () => Promise<
    Array<{ label: string; value: string | number | boolean }>
  >;
};
