# Live Data Sources — Architecture

Current architecture for user-defined data sources in SpreadAPI services. The feature was iterated through v1–v3 internally but never went live; this document describes v4, the shipping architecture.

## Infrastructure

- **Redis backend: [redis.io](https://redis.io) (Redis Cloud / Redis Enterprise) — NOT Upstash.** `lib/redis.js` uses a single shared `createClient()` from `@redis/client` v5 with `RESP: 2`.
- **Blob storage: Vercel Blob** for `.sjs` workbook files.
- **Compute: Vercel serverless functions** (30 s `maxDuration` on execute + batch routes).

---

## Architecture

### Core insight

SpreadJS's DataManager accepts a **custom read function** for remote tables:

```js
dataManager.addTable(name, {
  remote: {
    read: async () => {
      return /* array of row objects */;
    }
  }
});
```

SpreadJS calls this function when data is needed, infers columns/types from the response, and renders the TableSheet. It does not care where the rows come from — as long as the promise resolves to an array.

This single abstraction unifies everything we previously handled by hand:

- No more `sampleRows` stored in `apiConfig` — SpreadJS fetches fresh every time
- No more schema field — SpreadJS infers columns from the response
- No more manual data injection via `setDataSource` in hydration — SpreadJS does it
- No more separate editor-rehydration effect — the read function handles it

The `read` function is injected at load time (both editor and runtime). It cannot be serialized into the `.sjs` blob, so the workbook stores only the TableSheet *structure*; the behavior is re-attached wherever the workbook loads.

### Two modes, same abstraction

| Mode | Editor `read` fn | Runtime `read` fn | Source of truth |
|---|---|---|---|
| **Remote** (default) | POSTs to `/api/datasource/preview` with the source config → returns rows from the upstream via our server-side proxy (CORS-safe) | `fetchDataSource(source)` called server-side, wrapped with `tableSheetCache` (TTL) | Upstream URL |
| **Snapshot** (Pro) | GETs `/api/datasource/:sid/:srcid/rows` → returns rows from Redis | `getDataSourceRows(sid, srcid)` direct Redis read | Redis `service:X:datasource:Y:rows` |

Same `dm.addTable(name, { remote: { read } })` shape. Only the function body differs.

### What's stored where

**`apiConfig.dataSources[i]`** — minimal definition, used by both modes:
```ts
{
  id: string;                    // stable uuid
  tableName: string;             // sheet tab name / formula reference
  storageMode: 'remote' | 'snapshot';
  source: {
    type: 'json' | 'rest' | 'csv';
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    requestBody?: string;
    jsonPath?: string;
    hasHeader?: boolean;        // CSV only
    delimiter?: string;          // CSV only
  };
  columns?: Array<{              // optional — only when user customized display names
    name: string;                // field name as it appears in source data
    displayName?: string;
    dataType?: 'string' | 'number' | 'boolean' | 'date';
    dataPattern?: string;
  }>;
  webhookToken?: string;         // Snapshot only — for external refresh auth
  maxRows?: number;              // Snapshot only — cap on refresh writes (default 5 000)
  createdAt: string;
  updatedAt: string;
}
```

No `sampleRows`, no `totalRowsFetched`, no `previewRows`. Definition only.

**Redis (Snapshot mode only):**
- `service:X:datasource:Y:rows` — JSON array, actual data
- `service:X:datasource:Y:meta` — `{ lastRefreshedAt, rowCount, bytes, lastError?, lastErrorAt? }`
- `service:X:datasource:Y:lock` — 60 s in-flight marker during webhook refresh

**Vercel Blob (`.sjs`):** TableSheet tabs with structure only (tab name, view metadata). No data, no schema.

### End-to-end flows

#### Remote mode — new source

```
USER opens modal, pastes URL, clicks "Add table"
  │
  ▼
modal calls /api/datasource/preview (server-side fetch → returns rows)
  │  ← shows preview table for UX confirmation
  ▼
USER clicks "Add" → onSave(def)
  │
  ▼
ParametersPanel: setDataSources(prev => [...prev, def])
  │
  ▼
ServicePageClient.onApplyDataSource(def)
  │
  ▼
WorkbookViewer.applyDataSource(def)
  │
  ├─ dm.addTable(def.tableName, {
  │    remote: { read: makeReadFn(def, serviceId) }
  │  })
  ├─ await table.fetch()   ← SpreadJS calls read → rows returned
  ├─ table.addView(viewName [+ optional column spec])
  └─ sheet.setDataView(view)
  │
  ▼
USER sees TableSheet with live data, writes formulas
  │
  ▼
USER clicks top-bar Save → apiConfig.dataSources persisted to Redis
USER clicks Publish → service:X:published updated, result cache invalidated
```

#### Remote mode — execute

```
API caller hits POST /api/v1/services/:id/execute
  │
  ▼
calculateDirect:
  1. L1 cache check (as before, unchanged)
  2. Load workbook (L2/L3 cache or blob)
  3. For each dataSource with storageMode='remote':
       dm.removeTable(def.tableName);
       dm.addTable(def.tableName, {
         remote: { read: makeServerReadFn(def, serviceId) }
       });
       await table.fetch(true);   ← SpreadJS calls read fn
                                  ← fn calls fetchDataSource, cached via tableSheetCache
  4. Set input values
  5. Read outputs
  6. Cache result, return
```

#### Snapshot mode — new source

```
USER opens modal, paste URL, SELECT "Snapshot on SpreadAPI"
  │
  ▼
modal does preview fetch (same as Remote) → user confirms → "Add"
  │
  ▼
ParametersPanel: setDataSources, generates id + webhookToken
  │
  ▼
ServicePageClient.onApplyDataSource:
  1. Seed Redis: POST /api/datasource/:sid/:srcid  (Hanko-authed)
        body = { rows: <the preview rows we just fetched> }
     → Redis :rows key populated
  2. workbookRef.applyDataSource(def)
     → dm.addTable with remote.read = makeReadFn (reads /rows endpoint)
     → SpreadJS fetches → reads Redis → renders
  │
  ▼
USER sees TableSheet, writes formulas, save/publish
USER copies webhook URL from the row card → pastes into Zapier
```

#### Snapshot mode — external refresh

```
Zapier / Power Automate / Pipedream fires:
POST /api/datasource/:sid/:srcid/refresh?token=XYZ
  │ optional body = { rows: [...] } for push mode
  │
  ▼
Refresh endpoint:
  1. Validate token (constant-time compare against def.webhookToken)
  2. Acquire Redis refresh lock (60s TTL)
  3. Pull mode: fetchDataSource(def.source)
     Push mode: take body.rows
  4. setRows(sid, srcid, rows)        ← Redis :rows written
  5. recordRefresh(sid, srcid, meta)   ← Redis :meta updated
  6. invalidateResultCache(sid)        ← service:X:cache:results deleted
  7. Release lock
  │
  ▼
Next execute call → fresh result computed against new Redis rows
```

#### Snapshot mode — execute

```
calculateDirect hydration for each snapshot dataSource:
  dm.removeTable(def.tableName);
  dm.addTable(def.tableName, {
    remote: { read: async () => await getDataSourceRows(sid, def.id) ?? [] }
  });
  await table.fetch(true);
  # Redis read is ~1 ms, no upstream call ever at execute time
```

### Non-TableSheet services

The guard stays: `if (userDataSources.length > 0) { hydrate }`. For the 90 %+ of services without any data sources:
- `calculateDirect` does zero extra work
- No Redis reads
- No SpreadJS DataManager calls
- No function attachments
- Byte-identical performance to the execute path that ships without Live Data

### Workbook persistence

The `.sjs` blob holds TableSheet tabs but no data/schema. When the workbook is loaded — either in the editor or in `calculateDirect` — we iterate `apiConfig.dataSources`, remove any placeholder tables from the DataManager, and re-add them with the appropriate `read` function. This is deliberate: functions are not serialisable, and keeping the workbook data-free means the blob stays small and the config is the single source of truth for what data is attached.

### API surface summary

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/datasource/preview` | POST | Hanko | Modal preview fetch + editor Remote `read` proxy |
| `/api/datasource/:sid/:srcid` | GET | Hanko | Read meta (refresh timestamp, row count) |
| `/api/datasource/:sid/:srcid` | POST | Hanko | Editor seed — write rows to Redis on source creation |
| `/api/datasource/:sid/:srcid` | DELETE | Hanko | Cleanup on source deletion |
| `/api/datasource/:sid/:srcid/rows` | GET | Hanko | Editor Snapshot `read` fn — returns Redis rows |
| `/api/datasource/:sid/:srcid/refresh` | POST | Token | External webhook for Snapshot refresh |

### Failure modes

| Failure | What happens |
|---|---|
| Upstream URL down (Remote runtime) | `fetchDataSource` returns error, read fn returns `[]`, formulas see empty rows. `tableSheetCache` continues serving last-known if available. |
| Upstream URL down (Remote editor) | Editor's read fn gets error from `/preview`, returns `[]`. User sees column headers but empty cells. |
| Redis rows missing (Snapshot runtime) | `getDataSourceRows` returns null, read fn returns `[]`. Formulas see empty. User triggers refresh to populate. |
| Redis down | All operations fail gracefully. Webhook returns 500. Execute returns error. Upstream-fetch mode continues working. |
| Webhook token invalid | 401, no Redis write. |
| Concurrent webhook firings | `acquireRefreshLock` returns false for second caller → 409. Only one fetch per 60s window. |
| Upstream schema change (new columns) | SpreadJS picks up new columns on next fetch in auto-view mode. Formulas referencing old columns still work if columns unchanged. |
| Upstream schema breaking change (columns removed) | Formulas referencing removed fields return `#REF!` or blank. Customer responsibility. |

### Customer-facing pitch

> **Paste your data source URL. Pick a mode:**
>
> **Remote (default, free):** We fetch directly from your URL when your service runs, with a short server-side cache. Perfect for static data (daily exports, published spreadsheets, public catalogs). Zero extra setup.
>
> **Snapshot (Pro):** We cache your data on our side. Trigger refreshes via our webhook — connect Zapier, Power Automate, Pipedream, dbt, or any scheduling tool. Your service stays up when your upstream is down. Scales to high-traffic calls without hammering your origin.
>
> **Both modes** use the same formulas, same workbook, same API. Switch between them any time.

---

## Decision log

Design decisions taken during the v1–v4 iteration. Only v4 actually ships; the earlier rows are retained as rationale for *why* the current shape looks the way it does.

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-18 | Config is the source of truth for data sources; workbook is re-materialized from it. | Keeps `.sjs` small, simplifies editing, prepares runtime path cleanly. |
| 2026-04-18 | Ship v1 UI-only. No persistence, no workbook binding. | Each version reversible. Proves authoring flow before touching save/publish pipeline. |
| 2026-04-18 | SSRF protection mandatory from v1. Private-IP blocklist, http(s) only, 20 MB + 15 s limits. | Preview endpoint can be invoked by any authenticated user; fetching arbitrary URLs is OWASP #10. |
| 2026-04-20 | Live Data lives in its own left-panel tab, not a top-bar button. | Professional users expect to find data management next to parameters/areas; dedicated tab gives space to explain. |
| 2026-04-21 | Rows live in dedicated Redis keys, not inside `apiConfig`. | apiConfig is fetched on every cold request; embedding rows bloats it. |
| 2026-04-21 | No cron / scheduler; customer-triggered webhook. | Customers already have schedulers (Zapier, Power Automate, dbt, GitHub Actions). Event-driven is more accurate than time-driven. |
| 2026-04-21 | No per-call "live" mode. | Customer-triggered refresh + warm Redis cache covers the vast majority of real use cases. |
| 2026-04-21 | Both pull and push modes for the webhook. | Pull covers customers who want scheduled fetch against a URL. Push covers customers whose data is constructed in their pipeline. |
| 2026-04-22 | **Two storage modes: Remote (default) + Snapshot (Pro).** | Remote covers the 80 % static-data case with minimal infrastructure. Snapshot is the premium tier with webhooks, uptime guarantees, high-scale serving. |
| 2026-04-22 | **Function-based `remote.read` for both modes.** | SpreadJS natively supports this and auto-infers schema. Eliminates `sampleRows` storage, manual schema handling, explicit hydration code. Single abstraction. |
| 2026-04-22 | Snapshot's "automatic refresh" gap is NOT filled by a cron or lazy on-execute. | Webhook is the canonical trigger; customers who can't set one up should use Remote mode instead. Keeps architecture clean. |

---

## Open questions

1. Should we offer a "Convert Snapshot to Remote" action in the UI (drops Redis rows, switches mode)? — Low priority, only if customers ask.
2. Should the preview endpoint also serve as the client-side fetch proxy for non-Snapshot services that need a one-off fetch (e.g., verifying URL works)? — Already does; documented here for clarity.
3. Do we want a "force re-fetch" control in the editor for Remote sources? — `tableSheetCache` TTL handles this implicitly. Add only if requested.
