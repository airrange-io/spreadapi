# ChatGPT Desktop ↔ SpreadAPI: MCP OAuth Flow

Vollständige Dokumentation des OAuth-2.1-Flows, mit dem **ChatGPT Desktop** einen
publizierten SpreadAPI-Service als MCP-Server anbindet.

> **Stand der Dokumentation:** Beschreibt den _intendierten_ Flow. Stellen, an denen
> der Code aktuell abweicht (Bugs), sind mit ⚠️ markiert und in
> [Bekannte Probleme](#bekannte-probleme) gelistet.

---

## 1. Überblick

SpreadAPI kennt **zwei** Authentifizierungsmodelle für MCP:

| Client | Modell | Credential | Pfad |
|---|---|---|---|
| **ChatGPT Desktop** | OAuth 2.1 (Auth Code + PKCE) | `oat_…` Access-Token | dieser Doc |
| **Claude Desktop / direkte Clients** | Direkter Service-Token | `svc_tk_…` | Bearer direkt an `/api/mcp/service/{id}` |

Beim OAuth-Modell ist der **Service-Token das eigentliche Credential**. OAuth ist nur
eine Hülle: Der Nutzer „autorisiert" durch Eingabe seines Service-Tokens (oder gar
nichts bei öffentlichen Services), und erhält im Gegenzug einen kurzlebigen
`oat_`-Bearer, den ChatGPT für MCP-Calls verwendet.

Es findet **kein Hanko-Login** im OAuth-Flow statt. Die OAuth-„Identität" ist der
Service-Owner (`service:{id}:published.tenantId`).

---

## 2. Beteiligte Endpoints

| Zweck | Methode & Pfad | RFC |
|---|---|---|
| Protected-Resource-Metadata | `GET /.well-known/oauth-protected-resource` | RFC 9728 |
| Authorization-Server-Metadata | `GET /.well-known/oauth-authorization-server` | RFC 8414 |
| (service-spezifische Varianten) | `…/.well-known/*/api/mcp/service/{serviceId}` | — |
| Dynamic Client Registration | `POST /oauth/register` | RFC 7591 |
| Authorization (UI) | `GET /oauth/authorize` | RFC 6749 |
| Authorization (Backend) | `POST /api/oauth/authorize` | — |
| Token-Exchange | `POST /api/oauth/token` | RFC 6749 / 7636 |
| MCP-Endpoint | `POST /api/mcp/service/{serviceId}` | MCP |

---

## 3. Sequenz (Happy Path)

```
ChatGPT Desktop                SpreadAPI                         Redis
     │                            │                                │
     │ 1. GET /.well-known/oauth-protected-resource               │
     │───────────────────────────►│                                │
     │ ◄── {authorization_servers:[baseUrl], resource}            │
     │                            │                                │
     │ 2. GET /.well-known/oauth-authorization-server             │
     │───────────────────────────►│                                │
     │ ◄── {authorization_endpoint, token_endpoint, registration} │
     │                            │                                │
     │ 3. POST /oauth/register {redirect_uris,…}                  │
     │───────────────────────────►│  hSet oauth:client:{dcr_id}    │
     │ ◄── {client_id: dcr_…}     │  (TTL 30d)                     │
     │                            │                                │
     │ 4. Browser → GET /oauth/authorize?client_id&redirect_uri   │
     │    &code_challenge&resource=…/service/{id}                 │
     │    (User gibt Service-Token ein, klickt „Authorize")       │
     │                            │                                │
     │ 5. POST /api/oauth/authorize {service_token, service_id,…} │
     │───────────────────────────►│  validate token (hashed)       │
     │                            │  hSet oauth:code:{ac_} TTL 600  │
     │                            │  set  oauth:tokens:{ac_} TTL600 │
     │ ◄── {code: ac_…}           │                                │
     │                            │                                │
     │ 6. Browser-Redirect → redirect_uri?code=ac_…&state         │
     │                            │                                │
     │ 7. POST /api/oauth/token {grant_type=authorization_code,    │
     │    code, client_id, redirect_uri, code_verifier}          │
     │───────────────────────────►│  verify PKCE, client, redirect │
     │                            │  hSet oauth:token:{oat_} TTL12h │
     │                            │  del  oauth:code + oauth:tokens │
     │ ◄── {access_token: oat_…, expires_in:43200}                │
     │                            │                                │
     │ 8. POST /api/mcp/service/{id}  Authorization: Bearer oat_…  │
     │───────────────────────────►│  validateOAuthToken + scope    │
     │ ◄── JSON-RPC result        │  → calculateDirect()           │
```

---

## 4. Schritt für Schritt

### Schritt 1–2: Discovery (RFC 9728 / 8414)

ChatGPT liest zuerst die Well-Known-Metadata an der **Domain-Root** (nicht unter
`/api/…`).

`GET /.well-known/oauth-protected-resource`:
```json
{
  "resource": "https://spreadapi.io/api/mcp",
  "authorization_servers": ["https://spreadapi.io"],
  "bearer_methods_supported": ["header"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

`GET /.well-known/oauth-authorization-server`:
```json
{
  "issuer": "https://spreadapi.io",
  "authorization_endpoint": "https://spreadapi.io/oauth/authorize",
  "token_endpoint": "https://spreadapi.io/api/oauth/token",
  "registration_endpoint": "https://spreadapi.io/oauth/register",
  "grant_types_supported": ["authorization_code", "refresh_token"],  // ⚠️ refresh_token nicht implementiert
  "response_types_supported": ["code"],
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["mcp:read", "mcp:write"],
  "token_endpoint_auth_methods_supported": ["none"]
}
```

### Schritt 3: Dynamic Client Registration (RFC 7591)

`POST /oauth/register`:
```jsonc
// Request
{ "client_name": "ChatGPT", "redirect_uris": ["https://chatgpt.com/…/callback"], "token_endpoint_auth_method": "none" }
```
- Redirect-URIs werden gegen `^https://chatgpt\.com/` bzw. `^https://chat\.openai\.com/` gefiltert. Alles andere → `400 invalid_redirect_uri`.
- `client_id` = `dcr_{16-byte-hex}`, gespeichert in `oauth:client:{client_id}` (Hash, **TTL 30 Tage**).
- Public Client: **kein** Client-Secret (`token_endpoint_auth_method: none`).

### Schritt 4: Authorization-UI

`GET /oauth/authorize` (React-Page, `app/oauth/authorize/page.tsx`). Erwartete Query-Params:

| Param | Pflicht | Hinweis |
|---|---|---|
| `client_id` | ✅ | aus Registration (`dcr_…`) |
| `redirect_uri` | ✅ | muss zur Registration passen |
| `code_challenge` | ✅ | PKCE (base64url(SHA-256(verifier))) |
| `code_challenge_method` | ✅ | muss `S256` sein |
| `response_type` | ✅ | muss `code` sein |
| `resource` | ✅* | RFC 8707, enthält `…/api/mcp/service/{serviceId}` |
| `service_id` | ✅* | Legacy-Alternative zu `resource` |
| `state`, `scope` | – | durchgereicht / Default `mcp:read mcp:write` |

\* Die `serviceId` wird aus `resource` per Regex `/\/api\/mcp\/service\/([^/?#]+)/` extrahiert.

Der Nutzer gibt seinen **Service-Token** ein (leer lassen bei öffentlichen Services) und
klickt „Authorize". Die Page ruft den Backend-Endpoint (Schritt 5).

### Schritt 5: Authorization-Backend

`POST /api/oauth/authorize`:
```jsonc
{ "client_id", "redirect_uri", "scope", "code_challenge", "code_challenge_method", "service_token", "service_id" }
```
Validierung in Reihenfolge:
1. Rate-Limit: 10 req/min/IP.
2. Pflichtfelder; `code_challenge_method === 'S256'`.
3. `redirect_uri`: bei `dcr_`-Clients gegen registrierte URIs, sonst gegen eine Legacy-Allowlist von ChatGPT-Callback-URLs.
4. Service existiert & publiziert (`service:{id}:published`).
5. **Wenn `needsToken === 'true'`:** Service-Token validieren. ⚠️ _Siehe F2 — derzeit gegen das nicht-befüllte Klartextfeld `published.tokens` statt gegen den Hash-Store._
6. `userId = published.tenantId`; Scope = angefragte Scopes **+** `spapi:service:{serviceId}:execute`.
7. `createAuthorizationCode(...)` → `ac_{32-byte-hex}` in `oauth:code:{code}` (Hash, **TTL 600 s**).
8. Service-Token temporär in `oauth:tokens:{code}` (String-JSON `{service_token, service_id}`, TTL 600 s).

Antwort: `{ "code": "ac_…" }`. Die Page redirected dann zu `redirect_uri?code=ac_…&state=…`.

### Schritt 7: Token-Exchange (RFC 6749 + PKCE)

`POST /api/oauth/token` (akzeptiert JSON **und** `application/x-www-form-urlencoded`):
```
grant_type=authorization_code
code=ac_…
client_id=dcr_…
redirect_uri=https://chatgpt.com/…/callback
code_verifier=<PKCE verifier>
```
Validierung:
1. Rate-Limit: 10 req/min/IP.
2. `grant_type === 'authorization_code'`.
3. Code existiert (`getAuthorizationCode`), `client_id` & `redirect_uri` stimmen überein.
4. **PKCE:** `base64url(sha256(code_verifier)) === code_challenge` (nur S256).
5. Service-Token aus `oauth:tokens:{code}` holen.
6. `oat_{32-byte-hex}` erzeugen, in `oauth:token:{oat}` (Hash, **TTL 43200 s = 12 h**) mit Metadata:
   ```json
   { "client_id", "user_id", "scope", "service_ids", "service_token", "service_id", "authorized_at" }
   ```
7. Code (`oauth:code:{code}`) und Temp (`oauth:tokens:{code}`) löschen (Einmalnutzung). ⚠️ _Siehe F5 — nicht atomar._

Antwort:
```json
{ "access_token": "oat_…", "token_type": "Bearer", "expires_in": 43200, "scope": "mcp:read mcp:write spapi:service:{id}:execute" }
```
**Kein** `refresh_token` (⚠️ F3).

### Schritt 8: MCP-Calls

`POST /api/mcp/service/{serviceId}` mit `Authorization: Bearer oat_…` (JSON-RPC).
`authenticateRequest()`:
1. `needsToken` aus `service:{id}:published` lesen.
2. `needsToken === false` → öffentlicher Zugriff erlaubt.
3. Token `oat_…` → `validateOAuthToken`: prüft, ob `oauth:token:{oat}` existiert **und** der Scope `spapi:service:{serviceId}:execute` enthält.
4. Token `svc_tk_…` → `validateServiceTokenString` (gehashter Store — direkter Pfad, z. B. Claude Desktop).
5. Erfolg → Ausführung via `calculateDirect()`.

---

## 5. Redis-Datenmodell

| Key | Typ | TTL | Inhalt |
|---|---|---|---|
| `oauth:client:{dcr_id}` | Hash | 30 d | Registrierter Client (redirect_uris, scope, …) |
| `oauth:code:{ac_code}` | Hash | 600 s | Auth-Code-Daten (user_id, client_id, redirect_uri, code_challenge, service_ids) |
| `oauth:tokens:{ac_code}` | String(JSON) | 600 s | Temp `{service_token, service_id}` für den Exchange |
| `oauth:token:{oat}` | Hash | 12 h | Ausgestellter Access-Token + Mapping auf service_token |
| `service:{id}:published` | Hash | – | u. a. `needsToken`, `tenantId` |
| `token:hash:{sha256}` → `token:{id}` | String/Hash | – | Gehashter Service-Token-Store (für `validateServiceTokenString`) |

---

## 6. Token-Typen & Lebensdauer

| Token | Format | Lebensdauer | Einmalnutzung |
|---|---|---|---|
| Client-ID | `dcr_{16B hex}` | 30 d | nein |
| Authorization-Code | `ac_{32B hex}` | 10 min | ✅ ja |
| OAuth-Access-Token | `oat_{32B hex}` | 12 h | nein |
| Service-Token | `svc_tk_{32B hex}` | persistent (gehasht) | nein |

---

## 7. Sicherheitseigenschaften

- **PKCE S256 erzwungen** — sowohl bei Authorize (Code-Challenge) als auch beim Token-Exchange (Verifier). Plain wird abgelehnt.
- **Redirect-URI-Bindung** — Registration filtert auf ChatGPT-Domains; Authorize prüft gegen registrierte/Legacy-URIs; Token-Exchange prüft Gleichheit zum Authorize-`redirect_uri`.
- **Service-Token nie an ChatGPT** — ChatGPT erhält nur den `oat_`-Wrapper; der echte Service-Token bleibt serverseitig in der OAuth-Metadata.
- **Rate-Limiting** — 10 req/min/IP auf Authorize **und** Token.
- **Kurzlebige Codes** (10 min), **mittellange Access-Tokens** (12 h).
- **Service-Token gehasht** gespeichert (SHA-256), Klartext nur einmalig bei Erstellung sichtbar.

---

## 8. Bekannte Probleme

> Diese müssen vor einem funktionierenden ChatGPT-Connect adressiert werden. Reihenfolge = Priorität.

| # | Schwere | Problem | Fix |
|---|---|---|---|
| **F1** | 🔴 Blocker | `app/api/oauth/authorize/route.js:214` referenziert undefinierte Variable `actualScope` → `ReferenceError` **nach** Code-Erzeugung → Endpoint liefert immer `500`. | `actualScope` → `allScopes` (oder Log-Zeile entfernen). |
| **F2** | 🔴 Blocker | Authorize validiert den Service-Token gegen das **nie befüllte** Klartextfeld `published.tokens` → token-geschützte Services werden immer abgelehnt. | Im `needsToken`-Zweig `validateServiceTokenString(service_token, service_id)` (Hash-Store) verwenden. |
| **F3** | 🟠 | Metadata bewirbt `refresh_token`, aber der Token-Endpoint implementiert keinen Refresh → nach 12 h harte Neu-Autorisierung. | Default: `refresh_token` aus `grant_types_supported` entfernen. Optional: echte Refresh-Tokens für dauerhafte Verbindungen. |
| **F4** | 🟠 | Ein `oat_`-Token überlebt das Löschen/Rotieren des zugrunde liegenden Service-Tokens bis zu 12 h (kein Re-Check). | Erwartetes OAuth-Verhalten (TTL = Revocation-Bound). Falls schnellere Revocation gewünscht: TTL verkürzen — **nicht** per Request re-validieren. |
| **F5** | 🟡 | Auth-Code wird nicht atomar konsumiert (Read … später Delete) → Replay-Fenster. PKCE entschärft das praktisch. | Optional: Code atomar verbrauchen (Delete-Ergebnis prüfen, bevor Token ausgestellt wird). |

---

## 9. Bezug zum Service-Token-System

`needsToken` (live auf `service:{id}:published`) wird sowohl im Authorize-Backend
(„braucht dieser Service einen Token?") als auch in der MCP-Runtime
(`authenticateRequest`) gelesen. Die automatische, sofort-live wirksame
Token-Pflicht-Verwaltung (erster Token → an, letzter → aus) ist daher direkt relevant:
Sie stellt sicher, dass `needsToken` korrekt ist — und macht damit den
`needsToken`-Zweig der Authorize-Route überhaupt erst korrekt erreichbar (siehe F2).

Der **direkte** MCP-Pfad (`svc_tk_…` via `validateServiceTokenString`) nutzt denselben
gehashten Store wie REST v1 — ein konsistentes, einziges Source-of-Truth für
Service-Token-Validierung.
