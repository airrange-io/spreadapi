# SpreadAPI — SEO Keyword Strategy

> **Source:** DataForSEO (Google Ads search volume + Labs keyword_suggestions / bulk_keyword_difficulty / ranked_keywords).
> **Locale:** US / English (`location_code: 2840`, `language_code: en`). **Last updated:** 2026-07-01.
> **Focus:** primary targets are **≥1,000 vol/mo**; a short "high-value exceptions" list keeps a few <1,000 gems with perfect fit.
> **Refresh:** credentials in `.env` (`DATAFORSEO_AUTH_B64`) — commands at the bottom.

Legend: **vol** = avg monthly US searches · **KD** = organic difficulty 0–100 (lower = easier) · **CPC** = advertiser bid (buyer intent) · **Pos** = current spreadapi.io rank.

---

## Positioning — the reframe that drives everything
SpreadAPI lets teams **escape manually-operated Excel while keeping the proven business logic** — the spreadsheet becomes a **headless, deterministic calculation/rules engine** that APIs and AI agents call for **reproducible, auditable results**.

Two category stories map onto two keyword angles:
- **A) "Excel is your business rules / pricing engine"** — for teams productizing complex spreadsheet logic (escape manual Excel).
- **B) "Connect Claude/ChatGPT to your Excel logic"** — for the AI-workflow buyer.

### Category to OWN in messaging (not SEO)
**"Business rules engine for AI" / "deterministic AI for Excel logic"** = **0 search volume** (nobody searches it yet). This is a **brand/content play to define a category**, not a keyword to rank for. Use these phrases in the hero, USP copy, and thought-leadership content. SEO *traffic* comes from the adjacent real-volume terms below.

> **USP words** (`deterministic`, `reproducible`, `headless`, `auditable`) currently barely appear on the site (`deterministic` = 0 pages). Add them to on-page copy/CTAs — they convert AI/automation buyers even where they have little search volume.

---

## ⭐ Priority targets (≥1,000 vol/mo)

| keyword | vol | KD | CPC | angle | fit / note | target page |
|---|---:|---:|---:|---|---|---|
| **business rules engine** | 27,100 | 10 | $22.70 | A | Huge + easy KD, but **dev intent** (Drools/Java/Salesforce). Win via **content/comparison** ("Excel as a business rules engine — no Drools"), not head-on. | **NEW: /excel-business-rules-engine** (guide) |
| **ai calculations** | 6,600 | low | $1.83 | B | AI-accuracy fit ("AI that calculates reliably"). | /why-ai-fails-at-math |
| **claude for excel** | 6,600 | 5 | — | B | Exact use case, **KD 5**, we rank #—. | **NEW: /claude-for-excel** |
| **claude excel** | 4,400 | 9 | — | B | | /claude-for-excel |
| **claude in excel** | 2,900 | 11 | — | B | | /claude-for-excel |
| **claude excel plugin** | 1,900 | 8 | — | B | searcher wants add-in; position MCP connection | /claude-for-excel |
| **chatgpt for excel** | 1,600 | 26 | — | B | | **NEW: /chatgpt-for-excel** |
| **excel replacement** | 1,600 | 0 | $13.33 | A | ⚠️ "replace excel" volume is polluted by **"find & replace in excel"** feature-intent — target carefully / long-form only. | /stop-rewriting-excel-in-code |
| **excel alternative** | 1,300 | 6 | $10.45 | A | Clean-ish intent, easy. Frame: "don't switch tools — turn Excel into an API." | /excel-to-api |
| **ai for excel** | 1,300 | 20 | $14.34 | B | Direct fit. | /excel-ai-integration |
| **pricing software** | 1,300 | 5 | $2.94 | A | Strong concrete use case (pricing engine). | **NEW: /excel-pricing-engine** |
| **chatgpt excel** | 1,000 | 24 | — | B | | /chatgpt-for-excel |
| **rules engine** | 1,000 | 41 | $19.36 | A | Harder + dev intent — deprioritize vs "business rules engine". | — |

**Avoid (high vol, but wrong/crowded):** `spreadsheet to app` (22,200, **KD 53**), `no code app builder` (14,800, **KD 67**), `excel to web app` (260, **KD 80**), `ai math` (165,000, **KD 57**, consumer/homework intent).

---

## 💎 High-value exceptions (<1,000, keep for fit)
Perfect product fit or the USP itself — worth targeted pages/sections despite lower volume.

| keyword | vol | KD | CPC | why keep |
|---|---:|---:|---:|---|
| **ai quote generator** | 880 | **1** | $5.52 | Exact match to the quotation use case; trivial KD. |
| **quoting software** | 720 | 0 | $61.63 | Pricing/quote-engine buyer; very high CPC. |
| **deterministic ai** | 480 | 7 | $18.91 | **The USP keyword** — owns the differentiation, low KD, high value. |
| **excel logic** | 480 | 2 | $42.27 | On-brand; very high CPC. |
| **excel mcp server** | 260 | 2 | $10.71 | Emerging + high commercial intent; own it early → /mcp-server. |
| **excel to api** | 260 | 0 | — | Core term; currently **#18** → optimize to page 1 → /excel-to-api. |
| **excel api** | 260 | 0 | — | Currently **#50** → /excel-to-api. |
| **business rules management** | 390 | 0 | $45.43 | Enterprise rules buyer, KD 0. |

---

## Integrations cluster (n8n / Zapier / Make) — low volume → **distribution play, not SEO**
All verified <300 vol/mo. These are NOT traffic drivers vs. the big clusters. Best ROI is **getting listed in each platform's integration directory / template gallery** (where these users actually discover integrations) + using "Run your Excel logic inside n8n/Zapier/Make" as **copy**.

| keyword | vol | note |
|---|---:|---|
| make excel | 210 | highest of the set |
| zapier google sheets | 140 | ⚠️ within these platforms "google sheets" outsearches "excel" |
| n8n google sheets | 110 | |
| zapier excel / excel zapier | 50 | |
| n8n excel | 30 | |
| `excel logic in n8n` / `excel logic in ai` / `excel in n8n` | **0** | phrasing nobody searches → positioning only |

---

## Current state (gap analysis)
spreadapi.io ranks for only **~16 keywords**, mostly page 2–8:
`excel to api` #18 · `excel api` #50 · `formula api` #56 · several `google sheets api pricing/cost` long-tails #24–56 · `how to use api in excel` #70.
**We rank for NOTHING** in the Claude/ChatGPT cluster (≥18k/mo) or the rules-engine cluster (≥27k/mo).

---

## Priority order (impact × ease)
1. **`/claude-for-excel` + `/chatgpt-for-excel`** — biggest clean-fit volume, KD 5–26, zero coverage.
2. **`/excel-business-rules-engine`** (guide/comparison) — ride the 27,100 "business rules engine" term with the differentiated "Excel = your rules engine, deterministic for AI" angle. Category-defining content.
3. **`/excel-pricing-engine`** — target `pricing software` (1,300, KD 5) + `ai quote generator` (880, KD 1) + `quoting software` — a very concrete, high-CPC buyer.
4. **Optimize `/excel-to-api`** for `excel to api`/`excel api` (KD 0, page 2 → page 1) and `excel alternative`.
5. **Optimize `/mcp-server`** for `excel mcp server` (KD 2, emerging).
6. **Weave USP words** (`deterministic`, `reproducible`, `headless`, `auditable`) + target `deterministic ai` and `ai calculations` on the AI pages.

## Localization — when to translate (blog + pages)
**Rule: translate only when the *local-language phrasing* has its own search volume.** Tech/B2B loanword terms (`business rules engine`, `claude for excel`, `mcp`, `api`) are searched **in English** even on google.de / .fr / .es — the **English article already ranks there**, so a translation adds nothing. The blog serves English articles on all locales regardless, so leaving de/fr/es empty breaks nothing.

**Verified — Germany (google.de), 2026-07-01:**
| keyword | DE vol | note |
|---|---:|---|
| business rules engine | **8,100** | searched **in English** → English article ranks in DE; do NOT translate |
| excel alternative | 1,900 | word identical in DE |
| pricing software | 210 | English |
| chatgpt for excel | 140 | English |
| claude for excel | **0** | no German demand yet |

→ **The 4 new English articles stay English-only.** Correct: their keywords are English-dominated.

**German-phrased pool (English articles do NOT capture these — worth separate DE articles later, not translations):**
| keyword (DE) | DE vol | KD/CPC | meaning |
|---|---:|---|---|
| excel ki | 390 | — | "excel AI" |
| angebotssoftware | 140 | CPC **$37** | "quoting software" |
| excel automatisieren | 70 | — | "automate excel" |

These are **new German-targeted pieces** (different keyword set), only worth it after the English clusters are live.

---

## How to refresh
```bash
# volume + CPC + competition for a seed list
curl -s -X POST https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live \
  -H "Authorization: Basic $DATAFORSEO_AUTH_B64" -H "Content-Type: application/json" \
  -d '[{"location_code":2840,"language_code":"en","keywords":["business rules engine","ai for excel"]}]'

# organic difficulty (KD) — LOW ad-competition ≠ easy organic!
curl -s -X POST https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live \
  -H "Authorization: Basic $DATAFORSEO_AUTH_B64" -H "Content-Type: application/json" \
  -d '[{"location_code":2840,"language_code":"en","keywords":["business rules engine","excel alternative"]}]'

# long-tail variations that CONTAIN a seed phrase
curl -s -X POST https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live \
  -H "Authorization: Basic $DATAFORSEO_AUTH_B64" -H "Content-Type: application/json" \
  -d '[{"keyword":"business rules engine","location_code":2840,"language_code":"en","limit":40,"filters":[["keyword_info.search_volume",">",300]],"order_by":["keyword_info.search_volume,desc"]}]'

# what spreadapi.io already ranks for (gaps)
curl -s -X POST https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live \
  -H "Authorization: Basic $DATAFORSEO_AUTH_B64" -H "Content-Type: application/json" \
  -d '[{"target":"spreadapi.io","location_code":2840,"language_code":"en","limit":60}]'
```
