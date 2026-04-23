# Live Data Sources for TableSheets — Implementation Plan

## Problem statement

Users need to pull live data from external sources (JSON URLs, REST APIs, CSV files) into their workbooks so that formulas like `VLOOKUP`, `INDEX/MATCH`, filters, and pivots can operate on data that changes *outside* the workbook. The authoring experience must work without the SpreadJS Designer (no Designer license on this project anymore).

The design splits the problem into two modes:

- **Design time** — user defines a data source in a dialog. We fetch once, infer a schema, and keep a small sample (10 rows) in the saved workbook so formulas can be authored against real column names and values.
- **Runtime** — every execute refreshes the data from the live source, optionally through the existing `lib/tableSheetDataCache.js` TTL cache, and binds it into the TableSheet before `getResults` runs.

This plan delivers the authoring UI first (v1) and then progressively wires the workbook integration, live-fetch, and richer source types.

---

## Architecture

### Data model

Per service (`apiConfig.dataSources`, new field):

```ts
type DataSourceDefinition = {
  id: string;                    // stable uuid, used as cache key
  tableName: string;             // becomes the TableSheet tab/table name
  source: DataSourceConfig;      // union by type
  columns: DataSourceColumn[];   // final schema after user edits
  sampleRows: Record<string, unknown>[]; // first 10 rows, kept for design time
  totalRowsFetched: number;      // recorded at preview time, informational
  cacheTtlSeconds?: number;      // per-table override; falls back to service default
  createdAt: string;
  updatedAt: string;
};

type DataSourceConfig =
  | { type: 'json'; url: string; jsonPath?: string }
  | { type: 'rest'; url: string; method: 'GET'|'POST'|'PUT'|'DELETE';
      headers?: Record<string,string>; requestBody?: string; jsonPath?: string }
  | { type: 'csv';  url: string; hasHeader: boolean; delimiter?: string };

type DataSourceColumn = {
  name: string;                  // source field name (key in JSON / CSV header)
  displayName?: string;          // user-facing name, defaults to name
  dataType: 'string'|'number'|'boolean'|'date';
  dataPattern?: string;          // optional SpreadJS format hint
};
```

This structure maps 1:1 to what `dataManager.addTable({ data, schema })` expects at runtime, so v2/v3 don't need to reshape it.

### Server endpoints

| Endpoint | Method | Purpose | Added in |
|---|---|---|---|
| `/api/datasource/preview` | POST | Server-side fetch + parse + schema infer for the authoring dialog. Avoids CORS. | v1 |
| `/api/datasource/refresh` | POST | Internal: called by execute path to re-fetch a single source, honoring TTL. | v3 |

Both endpoints share a single `fetchDataSource(config)` core module so parsing stays consistent across design- and runtime paths.

### Execute-path integration

At runtime (in `lib/spreadjs-server.js` and `projects/run/app/[id]/calculateDirect.js`), before `getResults`:

1. Read `apiConfig.dataSources` from the loaded config.
2. For each entry, look up cache by `id`; if miss, call `fetchDataSource` and store.
3. Attach the fresh array to the matching TableSheet via `dataManager.getTable(tableName).setData(rows)` (or re-bind a new view).
4. Recalculate and respond.

Cache layer is the existing `lib/tableSheetDataCache.js` — same `(cacheKey, ttl)` shape, so we only add new entries, no new caching primitives.

---

## v1 — Authoring UI (this PR)

**Scope:** user can define a data source in a dialog, preview it, and save the definition. No workbook binding yet — this round proves the end-to-end authoring flow and produces a persistable `DataSourceDefinition`.

### Deliverables

- `app/api/datasource/preview/route.js` — POST endpoint with SSRF protection (no private IPs, http(s) only), 20 MB / 15 s limits, streams into a bounded buffer. Supports JSON, REST, CSV.
- `app/app/service/[id]/DataSourceModal.tsx` — dialog with:
  - Source-type selector (JSON URL / REST API / CSV URL) as a `Segmented` control.
  - Type-specific fields with inline hints and tooltips on non-obvious options.
  - "Fetch preview" button that calls `/api/datasource/preview`.
  - Editable schema table (rename + data type per column).
  - Read-only preview table (10 rows, type badges per column).
  - Table name field, auto-derived from URL and editable.
- "Add data" button in the service-editor top bar, visible only when `activeView === 'Workbook'` (the "Configuration" tab).
- Modal `onSave` returns the full `DataSourceDefinition`. This release stashes it in local state and shows a success notification; persistence + workbook binding land in v2.

### Non-goals for v1

- Writing data sources into the saved service config (`apiConfig.dataSources`). Keep v1 purely additive and UI-only so it ships independently of the save/publish logic.
- Creating a TableSheet in the workbook.
- Live fetch at execute time.
- Authentication (API keys, OAuth).
- Relationships between tables.

### Security

- **SSRF**: preview endpoint rejects private IP ranges (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, fc00::/7) and hostnames ending in `.local` / `.internal`; only `http` and `https`.
- **Response size cap**: 20 MB, enforced while streaming.
- **Timeout**: 15 s via `AbortController`.
- **Header whitelist** (v4): see auth section below. v1 accepts any user-supplied header except `Host`, `Cookie`, and auth is out of scope anyway.
- **No server-side persistence** of previews — the endpoint is stateless.

### Edge cases handled in v1

- Response is an object, not an array → auto-detect common envelope keys (`data`, `results`, `items`, `records`, `rows`) or fall back to user-provided `jsonPath`.
- All columns empty or null → infer `string`.
- Mixed types in a column → fall back to `string`.
- CSV with BOM, CRLF, quoted fields, doubled quotes → minimal hand-rolled parser handles these.
- Invalid JSON / wrong path / upstream 4xx|5xx → structured `{ ok: false, error, stage }` response surfaced as an `Alert` in the modal.

---

## v2 — Workbook binding

**Scope:** connect the saved `DataSourceDefinition` to an actual TableSheet in the workbook.

- Persist `apiConfig.dataSources` through the existing save/publish path (`utils/publishService.js`, `lib/publishService.js`).
- On workbook open, for each definition:
  1. `spread.addSheetTab(index, tableName, GC.Spread.Sheets.SheetType.tableSheet)`
  2. `spread.dataManager().addTable(tableName, { data: sampleRows, schema })`
  3. `table.addView(tableName + '_view')` → `sheet.setDataView(view)`
- Keep sample rows out of the `.sjs` blob (set `saveOptions.includeData = false`, which we already do for TableSheets at `WorkbookViewer.js:381-384`) so workbook files stay small. Sample rows live in the service config, not the workbook.
- Add a "Data sources" list in the service editor (under Settings or a new "Data" sub-view) with edit and delete actions that reuse `DataSourceModal` in edit mode.
- `WorkbookViewer.js` gets an `onDataSourceChanged` action hook so saving the modal re-materializes the TableSheet without a full page refresh.

---

## v3 — Live fetch at runtime

**Scope:** execute path fetches fresh data before calculation.

- Extract v1's preview logic into `lib/fetchDataSource.js` so it is shared by preview and runtime.
- In `app/api/v1/services/[id]/execute/calculateDirect.js` and `projects/run/app/[id]/calculateDirect.js`:
  1. Before `getResults`, iterate `apiConfig.dataSources`.
  2. `getCachedTableSheetData(id, ttl)` → if miss, `fetchDataSource(source)` and `cacheTableSheetData(id, data, url, size)`.
  3. Replace the TableSheet's data via `dataManager.getTable(tableName).setData(freshRows)`.
- Per-service defaults (`cacheTableSheetData`, `tableSheetCacheTTL`) — already sketched in `tablesheet-data-caching-design.md` — plus per-table TTL override on the definition.
- Settings UI: reuse the patterns from that existing design doc; add a "Refresh every" dropdown to `DataSourceModal` (60 s / 5 min / 15 min / 1 h / never).
- Observability: log per-execute fetch latency and cache hit/miss; surface in the Usage view later.
- Error policy: if live fetch fails, fall back to the last cached payload and return a `warnings` entry in the execute response. Do not return stale-and-silent by default; give the caller the signal.

---

## v4 — Richer sources & polish

**Scope:** high-leverage integrations and productization.

1. **Authentication**
   - Per-source credential record stored encrypted (reuse whatever Vercel secret/KMS path we already use for Stripe or similar).
   - UI: "Auth" tab in the modal — None, Bearer, API Key header, Basic.
   - Never serialize secrets into the workbook or the service config blob; reference by id.

2. **Presets**
   - **Another SpreadAPI service as a source.** Highest leverage: our own execute endpoints already return JSON. Dropdown of the user's published services; no URL entry.
   - **Google Sheets** (published CSV link pattern).
   - **Airtable** (`https://api.airtable.com/v0/{base}/{table}` + API key).
   - **Notion** (`https://api.notion.com/v1/databases/{id}/query` + token).

3. **Protocol support**
   - **OData** — `dataManager.addTable` has native OData options; dialog gains an OData type with `$filter`, `$expand`, `$select`.
   - **GraphQL** — query editor + variables JSON.

4. **Relationships**
   - Multi-table: let users add `dataManager.addRelationship(childTable, childField, parentTable, parentField)` so they can reference related data from formulas.

5. **Nice to have**
   - Schema drift detection on runtime fetch — compare live columns to stored schema, surface a clear diff in the UI.
   - "Test the live fetch" button that bypasses the design-time cache.
   - Scheduled pre-warming of hot sources to avoid cold-start latency.

---

## Rollout

- v1 and v2 can ship independently; v1 is UI-only and reversible.
- v3 changes the execute path — gate behind a per-service flag for the first week, compare response times, then flip default.
- v4 items are individually shippable; prioritize "SpreadAPI-as-source" and presets by user signal.

## File touch-list

| File | v1 | v2 | v3 | v4 |
|---|---|---|---|---|
| `app/api/datasource/preview/route.js` | new | | | |
| `app/app/service/[id]/DataSourceModal.tsx` | new | edit | edit | edit |
| `app/app/service/[id]/ServicePageClient.tsx` | edit | edit | | |
| `lib/fetchDataSource.js` | | | new | |
| `lib/tableSheetDataCache.js` | | | edit | |
| `utils/publishService.js`, `lib/publishService.js` | | edit | | |
| `app/app/service/[id]/WorkbookViewer.js` | | edit | | |
| `app/api/v1/services/[id]/execute/calculateDirect.js` | | | edit | |
| `projects/run/app/[id]/calculateDirect.js` | | | edit | |
| `app/app/service/[id]/views/SettingsView.tsx` | | | edit | |

---

## Open questions to resolve before v2

1. Where does the data-source list live? A new tab under Settings or a dedicated left-panel section in the Configuration view?
2. Do we allow the same table name in multiple services? (Yes — scoped per service — but confirm.)
3. Should the saved workbook still carry a 10-row fallback for offline editing, or is it fine to require the live fetch every time the user opens the editor?
4. Should editing a data source invalidate the server-side cache immediately, or wait for TTL?
