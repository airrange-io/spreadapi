import type {
  PipedreamAccount,
  PipedreamApp,
  PipedreamComponent,
} from './types';

// SDK responses sometimes come as bare arrays, sometimes as { data: [...] }.
// Other times v1 vs v2 field names mix (createdAt vs created_at, name_slug vs
// nameSlug). All of this is handled here so the rest of the codebase sees a
// single canonical shape.

function unwrapList<T = unknown>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

export function normalizeAccounts(raw: unknown): PipedreamAccount[] {
  return unwrapList<any>(raw).map((a) => ({
    id: a.id,
    app:
      typeof a.app === 'object'
        ? a.app?.nameSlug || a.app?.name_slug || a.app?.name || ''
        : a.app || '',
    name: a.name || '',
    externalUserId: a.externalUserId || a.external_user_id || '',
    createdAt: a.createdAt || a.created_at,
    healthy: a.healthy,
  }));
}

export function normalizeApps(raw: unknown): PipedreamApp[] {
  return unwrapList<any>(raw).map((a) => ({
    nameSlug: a.nameSlug || a.name_slug || a.slug || '',
    name: a.name || '',
    description: a.description,
    imgSrc: a.imgSrc || a.img_src || a.logo_url || a.logoUrl,
    authType: a.authType || a.auth_type,
    categories: a.categories,
  }));
}

export function normalizeComponents(raw: unknown): PipedreamComponent[] {
  return unwrapList<any>(raw).map((c) => ({
    key: c.key,
    name: c.name,
    version: c.version,
    componentType: c.componentType || c.component_type,
    description: c.description,
    configurableProps: Array.isArray(c.configurableProps || c.configurable_props)
      ? (c.configurableProps || c.configurable_props).map(normalizeProp)
      : undefined,
  }));
}

export function normalizeComponent(raw: unknown): PipedreamComponent | null {
  if (!raw) return null;
  const c: any = (raw as any).data ?? raw;
  return {
    key: c.key,
    name: c.name,
    version: c.version,
    componentType: c.componentType || c.component_type,
    description: c.description,
    configurableProps: Array.isArray(c.configurableProps || c.configurable_props)
      ? (c.configurableProps || c.configurable_props).map(normalizeProp)
      : undefined,
  };
}

function normalizeProp(p: any) {
  return {
    name: p.name,
    type: p.type,
    label: p.label,
    description: p.description,
    optional: p.optional,
    default: p.default,
    remoteOptions: p.remoteOptions ?? p.remote_options,
    reloadProps: p.reloadProps ?? p.reload_props,
    app: p.app,
    options: p.options,
    asyncHandle: p.asyncHandle ?? p.async_handle,
  };
}

// Auto-detect an array inside a possibly-wrapped action result. Order matters:
// the most common envelope keys first, then a single-object → wrapped-array
// fallback. Per-app overrides can replace this entirely via providers.
const COMMON_ARRAY_KEYS = [
  'records',
  'rows',
  'data',
  'items',
  'results',
  'values',
  'entries',
  'list',
];

export function normalizeActionResult(ret: unknown): unknown[] {
  if (Array.isArray(ret)) return ret;
  if (ret && typeof ret === 'object') {
    for (const key of COMMON_ARRAY_KEYS) {
      const candidate = (ret as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate;
    }
    // Sometimes the array is one level deeper (e.g. { data: { records: [] } }).
    const data = (ret as Record<string, unknown>).data;
    if (data && typeof data === 'object') {
      for (const key of COMMON_ARRAY_KEYS) {
        const candidate = (data as Record<string, unknown>)[key];
        if (Array.isArray(candidate)) return candidate;
      }
    }
    // Single object — wrap it so the table at least shows one row.
    return [ret];
  }
  return [];
}

// Walk a dot-separated path on an object — used as user-supplied fallback
// when auto-detect can't find the array.
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}
