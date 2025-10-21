# Unified Views Architecture - Web Apps & Snippets

## Overview

This document describes the unified architecture for Web Apps and Web Snippets, where both share the same rendering engine and templates, but differ only in their mode (interactive vs. static).

## Current Architecture (Before Unification)

### Web Apps
- **Route**: `/app/v1/services/{id}?token={token}`
- **Component**: `WebAppClient.tsx` (React-based, heavy)
- **Authentication**: Required (webAppToken)
- **Features**: Interactive inputs, real-time calculation
- **Performance**: ~100KB (React + Ant Design)
- **Use Case**: Full web application for end users

### Web Snippets
- **Route**: `/app/v1/services/{id}/view/{viewId}?params`
- **Component**: `WebViewRenderer.tsx` (lightweight)
- **Authentication**: None (uses API tokens if service requires)
- **Features**: Display results only, no interaction
- **Performance**: ~3KB (pure HTML/CSS)
- **Use Case**: Embeddable result display

### Problems with Current Architecture
1. **Code duplication**: Two separate rendering systems
2. **Inconsistent styling**: Different templates for apps vs snippets
3. **Limited flexibility**: Can't have interactive snippets or static apps
4. **Multiple maintenance**: Changes must be made in two places
5. **Token waste**: One service = one web app only

---

## New Unified Architecture

### Core Concept
**One template system, two rendering modes:**
- **Snippet Mode** (default): Lightweight, static HTML display
- **Interactive Mode**: Same template + input editors + calculation logic

### URL Structure

#### Snippet Mode (Static Display)
```
/app/v1/services/{id}/view/{viewId}?param1=value1&param2=value2
```
- No token required (unless service has requireToken=true)
- Renders results immediately
- No JavaScript (pure HTML/CSS)
- Lightning fast (~1-3KB)

#### Interactive Mode (Web App)
```
/app/v1/services/{id}/view/{viewId}?token={token}&interactive=true
```
- Token required (webAppToken)
- Adds input editors
- Adds calculate button
- Minimal JavaScript (~5-10KB)
- Users can change inputs

#### Interactive Mode with Presets
```
/app/v1/services/{id}/view/{viewId}?token={token}&interactive=true&revenue=1000&costs=500
```
- Token required
- Pre-fills inputs with values
- Users can edit and recalculate
- Perfect for demos, documentation, email links

---

## Template Structure

### Unified Template Definition

```typescript
interface UnifiedTemplate {
  id: string;                    // e.g., 'card', 'minimal', 'table'
  name: string;                  // e.g., 'Card Layout'
  description: string;           // Description for UI
  html: string;                  // Mustache template
  isDefault: boolean;            // Is this a default template?

  // Configuration options
  config?: {
    interactive?: boolean;       // Can this template be interactive?
    inputLayout?: 'vertical' | 'horizontal' | 'grid';
    showCalculateButton?: boolean;
    autoCalculate?: boolean;     // Calculate on input change?
    outputLayout?: 'list' | 'grid' | 'table';
  };
}
```

### Example: Card Template (Unified)

```html
<div class="view-card" style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <!-- Header -->
  <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">{{serviceName}}</h2>
  </div>

  <!-- Interactive Input Section (only rendered if interactive=true) -->
  {{#interactive}}
  <div class="inputs" style="background: #f9f9f9; padding: 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
    <form id="calc-form">
      {{#inputs}}
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-weight: 500; margin-bottom: 4px; color: #333;">
          {{title}}:
        </label>
        <input
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;"
        />
      </div>
      {{/inputs}}
      <button type="submit" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: 500;">
        Calculate
      </button>
    </form>
  </div>
  {{/interactive}}

  <!-- Results Section (always rendered) -->
  <div class="results" style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    {{#outputs}}
    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
      <span style="color: #666;">{{title}}</span>
      <strong>{{value}}</strong>
    </div>
    {{/outputs}}
  </div>
</div>

{{#interactive}}
<!-- Minimal JavaScript for form handling -->
<script>
document.getElementById('calc-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const params = new URLSearchParams(formData);
  params.append('token', '{{token}}');

  // Call API
  const response = await fetch('/api/v1/services/{{serviceId}}/execute?' + params.toString());
  const data = await response.json();

  // Update results (simple DOM manipulation)
  // ... reload or update in place
  window.location.href = window.location.pathname + '?' + params.toString() + '&interactive=true';
});
</script>
{{/interactive}}
```

---

## Rendering Engine

### Server-Side Route: `/app/v1/services/[id]/view/[viewId]/page.tsx`

```typescript
export default async function UnifiedViewPage({ params, searchParams }: PageProps) {
  const { id: serviceId, viewId } = await params;
  const queryParams = await searchParams;

  // Determine mode
  const isInteractive = queryParams.interactive === 'true';
  const token = queryParams.token as string;

  // Get template
  const template = UNIFIED_TEMPLATES[viewId];
  if (!template) notFound();

  // Validate authentication
  if (isInteractive) {
    // Interactive mode requires webAppToken
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    if (!serviceData.webAppToken || serviceData.webAppToken !== token) {
      return <ErrorPage message="Invalid or missing token" />;
    }
  } else if (serviceData.requireToken) {
    // Snippet mode may require API token
    if (!token) {
      return <ErrorPage message="This service requires a token" />;
    }
  }

  // Call API to get results (using query params)
  const apiParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (!['interactive', 'token', 'viewId'].includes(key)) {
      apiParams.append(key, String(value));
    }
  });

  const apiResponse = await fetch(
    `https://spreadapi.io/api/v1/services/${serviceId}/execute?${apiParams.toString()}`
  );
  const apiData = await apiResponse.json();

  // Prepare template data
  const templateData = {
    serviceName: apiData.serviceName || 'API Results',
    serviceId,
    token,
    interactive: isInteractive,
    inputs: apiData.inputs || [], // With current values from query params
    outputs: apiData.outputs || []
  };

  // Render template
  const renderedHtml = renderMustacheTemplate(template.html, templateData);

  // Return as HTML (not React component for performance)
  return (
    <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
  );
}
```

---

## Token Management

### Unified Token Model

```typescript
// Redis structure
service:{serviceId}
  ├─ webAppToken: string        // Single token for ALL interactive views
  ├─ webAppConfig: string        // Optional JSON config
  └─ requireToken: boolean       // Does snippet mode require API tokens?

// Multiple "web apps" = Same service, different views/presets
```

### Examples

**Same service, three different "web apps":**

1. **Simple Calculator** (Minimal template, interactive)
   ```
   /view/minimal?token=xxx&interactive=true
   ```

2. **Detailed Report** (Card template, interactive, preset values)
   ```
   /view/card?token=xxx&interactive=true&revenue=50000&costs=30000
   ```

3. **Dashboard** (Table template, interactive)
   ```
   /view/table?token=xxx&interactive=true
   ```

**Same service, embedded snippets (no token):**

1. **Minimal snippet** (static display)
   ```
   /view/minimal?revenue=50000&costs=30000
   ```

2. **Card snippet** (static display)
   ```
   /view/card?revenue=50000&costs=30000
   ```

---

## Migration Path

### Phase 1: Create Unified Templates ✅
1. Move `DEFAULT_TEMPLATES` to unified structure
2. Add `interactive` support to template syntax
3. Add input rendering capability

### Phase 2: Update Rendering Engine
1. Modify `/app/v1/services/[id]/view/[viewId]/page.tsx`
2. Support `?interactive=true` parameter
3. Add token validation for interactive mode
4. Add form handling JavaScript (conditional)

### Phase 3: Update UI
1. Rename "Web Snippets" → "Views" or "Templates"
2. Each view shows both modes:
   - "Snippet Mode" (copy embed URL)
   - "Interactive Mode" (copy web app URL with token)
3. Show preview for both modes

### Phase 4: Deprecate Old Web App
1. Redirect old `/app/v1/services/{id}?token=xxx` → `/view/default?token=xxx&interactive=true`
2. Keep for backward compatibility
3. Eventually remove `WebAppClient.tsx`

---

## Benefits of Unified Architecture

### For Developers
- ✅ **Single source of truth**: One template system
- ✅ **Less code**: Remove duplicate rendering logic
- ✅ **Easier maintenance**: Update templates in one place
- ✅ **Better testing**: Test one system instead of two

### For Users
- ✅ **Unlimited web apps**: Create as many as needed (same token)
- ✅ **Consistent design**: Same template = same look
- ✅ **Faster snippets**: No React overhead (pure HTML)
- ✅ **More flexibility**: Any template can be interactive or static
- ✅ **URL presets**: Share pre-configured calculators

### Performance
- ✅ **Snippet mode**: 1-3KB (HTML only)
- ✅ **Interactive mode**: 5-10KB (HTML + minimal JS)
- ✅ **Current web app**: ~100KB (React + Ant Design)
- **Result**: ~90% size reduction for interactive mode!

---

## Technical Implementation Notes

### Mustache Template Extensions

Add support for conditional sections based on mode:

```html
{{#interactive}}
  <!-- Only rendered when interactive=true -->
  <input type="text" name="{{name}}" value="{{value}}" />
{{/interactive}}

{{^interactive}}
  <!-- Only rendered when interactive=false (snippet mode) -->
  <span>{{value}}</span>
{{/interactive}}
```

### Input Type Mapping

```typescript
const getInputType = (paramType: string): string => {
  switch (paramType) {
    case 'number': return 'number';
    case 'boolean': return 'checkbox';
    case 'date': return 'date';
    default: return 'text';
  }
};
```

### Form Handling (Interactive Mode Only)

Inject minimal JavaScript for form submission:

```javascript
// Only included when interactive=true
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const params = new URLSearchParams(formData);
  params.append('token', '{{token}}');
  params.append('interactive', 'true');

  // Reload with new params
  window.location.href = window.location.pathname + '?' + params.toString();
});
```

### CSS Framework (Optional)

Consider using lightweight CSS like:
- **Water.css** (~2KB): Classless styling
- **MVP.css** (~4KB): Semantic HTML styling
- **Pico.css** (~10KB): Minimal component library

Or stick with inline styles for maximum portability.

---

## URL Examples

### Snippet Mode Examples

```
# Minimal snippet
/app/v1/services/abc123/view/minimal?revenue=1000&costs=500

# Card snippet
/app/v1/services/abc123/view/card?revenue=1000&costs=500

# Table snippet with API token (if service requires it)
/app/v1/services/abc123/view/table?revenue=1000&costs=500&token=api-token-here
```

### Interactive Mode Examples

```
# Interactive minimal (empty inputs)
/app/v1/services/abc123/view/minimal?token=web-app-token&interactive=true

# Interactive card with presets
/app/v1/services/abc123/view/card?token=web-app-token&interactive=true&revenue=1000&costs=500

# Interactive table (empty)
/app/v1/services/abc123/view/table?token=web-app-token&interactive=true
```

### Real-World Use Cases

**Tax Calculator Service:**

1. **Documentation** (snippet mode):
   ```html
   <!-- Embed in docs -->
   <iframe src="/view/card?income=50000&deductions=5000" height="300"></iframe>
   ```

2. **Customer Portal** (interactive mode, preset):
   ```
   Click here for your personalized calculation:
   /view/card?token=xxx&interactive=true&income=75000&deductions=8000
   ```

3. **Marketing Campaign A** (interactive, empty):
   ```
   Calculate your taxes:
   /view/minimal?token=xxx&interactive=true
   ```

4. **Marketing Campaign B** (interactive, different template):
   ```
   Professional tax calculator:
   /view/detailed?token=xxx&interactive=true
   ```

All using **the same service**, **the same token**, just different templates and presets!

---

## File Structure

```
/app/v1/services/[id]/view/[viewId]/
├── page.tsx                    # Main route handler (unified)
├── UnifiedViewRenderer.tsx     # New unified renderer
└── templates.ts                # Template definitions

/app/service/[id]/views/
└── AppsView.tsx                # Updated UI (shows both modes)

/lib/
├── unifiedTemplates.ts         # Template system
└── mustacheRenderer.ts         # Simple Mustache implementation
```

---

## Migration Checklist

- [ ] Create unified template structure
- [ ] Implement Mustache renderer with `{{#interactive}}` support
- [ ] Create UnifiedViewRenderer.tsx
- [ ] Update /view/[viewId]/page.tsx route
- [ ] Update AppsView.tsx UI (show both modes)
- [ ] Add token validation for interactive mode
- [ ] Test snippet mode (static)
- [ ] Test interactive mode (dynamic)
- [ ] Test preset values
- [ ] Performance testing (ensure snippets stay fast)
- [ ] Update documentation
- [ ] Migrate existing web apps
- [ ] Deprecate old web app route

---

## Open Questions

1. **Template Creation**: Should users be able to create custom templates?
   - If yes: Need template editor UI
   - If no: Just provide good default templates

2. **JavaScript Injection**: How much JS should we allow in templates?
   - Minimal: Just form handling (current plan)
   - Full: Allow custom JavaScript
   - None: Server-side only

3. **Caching**: How to cache interactive vs. snippet mode?
   - Snippet mode: Aggressive caching (results don't change)
   - Interactive mode: No caching (user input)

4. **Analytics**: Track usage separately?
   - Track snippet embeds vs. interactive usage
   - Different metrics for each mode

---

## Summary

The unified architecture transforms our current two-system approach into a single, flexible system where:

- **Templates** define the visual layout
- **Mode** determines interactivity (snippet vs. interactive)
- **URL parameters** provide both data and configuration
- **One token** enables unlimited "web apps" (just different views/presets)
- **Performance** stays optimal (snippets remain lightweight)

This is a **major architectural improvement** that simplifies the codebase while adding powerful new capabilities!
