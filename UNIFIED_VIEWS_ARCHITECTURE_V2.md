# Unified Views Architecture V2 - Editable & Extensible

## Core Philosophy

**Templates are DATA, not CODE**

Templates must be:
- ✅ Editable by users
- ✅ Stored in database (Redis)
- ✅ Versioned (track changes)
- ✅ Shareable (duplicate, fork)
- ✅ Extensible (add CSS, HTML, settings)

---

## Data Structure

### Template Storage (Redis)

**Consistent Key Pattern:** `service:{serviceId}:*`

```typescript
// System Templates (Read-only, provided by us)
// Stored in code, not Redis (for performance and immutability)
const SYSTEM_TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple output display',
    html: '<div>{{#outputs}}...</div>',
    css: 'body { font-family: Arial; }',
    isSystem: true,
    isDefault: true,
    settings: { ... }
  },
  card: { ... },
  table: { ... }
}

// User Templates (Editable, stored in Redis)
service:{serviceId}:template:{templateId}
{
  id: 'my-custom-card',
  name: 'My Custom Card',
  description: 'Custom card with my branding',
  html: '<div class="custom">{{#outputs}}...</div>',
  css: '.custom { background: #FF5733; }',
  isSystem: false,
  createdBy: userId,
  createdAt: timestamp,
  updatedAt: timestamp,
  basedOn: 'card',  // Forked from system template
  settings: {
    supportsInteractive: true,
    inputLayout: 'horizontal',
    outputLayout: 'grid',
    custom: {
      brandColor: '#FF5733',
      showLogo: true
    }
  }
}

// List of user template IDs for a service
service:{serviceId}:templates
['my-custom-card', 'my-invoice', 'my-dashboard']

// Complete Service Data Structure (for reference)
service:{serviceId}                    // Main service data
service:{serviceId}:published          // Published version
service:{serviceId}:workbook          // Workbook data
service:{serviceId}:templates         // List of template IDs
service:{serviceId}:template:{id}     // Individual template data
service:{serviceId}:tokens            // List of API token IDs (future)
service:{serviceId}:token:{id}        // Individual token data (future)
```

**Benefits:**
- ✅ All service data under one prefix
- ✅ Easy to find: `SCAN service:abc123:*`
- ✅ Easy to cleanup: Delete all `service:abc123:*` keys
- ✅ Consistent pattern across entire app

---

## Template Definition (TypeScript)

```typescript
interface Template {
  // Identity
  id: string;
  name: string;
  description: string;  // Plain text or rich text (HTML)

  // Content (User Editable)
  html: string;         // Mustache template with placeholders
  css: string;          // Custom CSS
  javascript?: string;  // Optional: Custom JS (sandboxed)

  // Metadata
  isSystem: boolean;    // System template (read-only) vs user template
  isDefault?: boolean;  // Is this a default starter template?
  createdBy?: string;   // User ID who created it
  createdAt?: string;
  updatedAt?: string;
  basedOn?: string;     // ID of template this was duplicated from

  // Settings
  settings: {
    // Interactivity
    supportsInteractive: boolean;
    inputLayout: 'vertical' | 'horizontal' | 'grid' | 'custom';
    outputLayout: 'list' | 'grid' | 'table' | 'custom';

    // Behavior
    autoCalculate?: boolean;
    showCalculateButton?: boolean;

    // Styling
    theme?: 'light' | 'dark' | 'custom';
    maxWidth?: number;
    padding?: number;

    // Custom settings (user-defined)
    custom?: Record<string, any>;
  };

  // Usage tracking
  stats?: {
    embedCount: number;
    interactiveCount: number;
    lastUsed?: string;
  };
}
```

---

## Template Editor UI

### Create/Edit Flow

```
1. User clicks "Create View" or "Edit View"
   ↓
2. Show Template Editor Modal/Page:
   ┌─────────────────────────────────────────┐
   │ Template Editor                         │
   ├─────────────────────────────────────────┤
   │ Name: [My Custom Card              ]    │
   │ Description: [Rich text editor...  ]    │
   │                                          │
   │ ┌──────────┬──────────┬──────────┐     │
   │ │   HTML   │   CSS    │ Settings │     │
   │ └──────────┴──────────┴──────────┘     │
   │                                          │
   │ [Code Editor with syntax highlighting]  │
   │ <div class="card">                      │
   │   {{#outputs}}                          │
   │     <div>{{title}}: {{value}}</div>     │
   │   {{/outputs}}                          │
   │ </div>                                  │
   │                                          │
   │ ┌──────────────────────────────────┐   │
   │ │ Live Preview                      │   │
   │ │ [Rendered output with test data]  │   │
   │ └──────────────────────────────────┘   │
   │                                          │
   │ [Cancel]  [Save as Draft]  [Publish]   │
   └─────────────────────────────────────────┘
```

### Template Gallery

```
┌─────────────────────────────────────────────┐
│ View Templates                              │
├─────────────────────────────────────────────┤
│                                              │
│ System Templates (Read-only)                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Minimal│ │ Card  │ │Table │ │Detail│       │
│ │[Use] │ │[Dupli-│ │[Use] │ │[Use] │       │
│ │      │ │ cate] │ │      │ │      │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│ Your Custom Templates                        │
│ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │My Card│ │Brand │ │Invoice│ [+ Create]    │
│ │[Edit] │ │[Edit]│ │[Edit]│               │
│ │[Del]  │ │[Del] │ │[Del] │               │
│ └──────┘ └──────┘ └──────┘                │
└─────────────────────────────────────────────┘
```

---

## HTML Template Structure (Editable Parts)

### Mustache Variables Available

```html
<!-- User can use these in their HTML -->

<!-- Service Info -->
{{serviceId}}
{{serviceName}}
{{serviceDescription}}

<!-- Interactive Mode -->
{{#interactive}}
  <!-- Only rendered in interactive mode -->
  {{token}}

  {{#inputs}}
    {{name}}         <!-- Parameter name -->
    {{title}}        <!-- Display title -->
    {{value}}        <!-- Current value -->
    {{type}}         <!-- Data type -->
    {{inputType}}    <!-- HTML input type -->
    {{placeholder}}
    {{required}}
  {{/inputs}}
{{/interactive}}

<!-- Results (Always Available) -->
{{#outputs}}
  {{name}}           <!-- Output parameter name -->
  {{title}}          <!-- Display title -->
  {{value}}          <!-- Formatted value -->
  {{rawValue}}       <!-- Unformatted value -->
  {{formatString}}   <!-- Format pattern -->
  {{description}}
{{/outputs}}

<!-- Custom Data (from settings.custom) -->
{{#custom}}
  {{brandColor}}
  {{logoUrl}}
  {{companyName}}
{{/custom}}
```

### Example: Editable HTML Template

```html
<!-- User edits this entire block -->
<div class="view-container">
  <!-- User can add their own header -->
  <div class="custom-header">
    <img src="{{custom.logoUrl}}" alt="Logo" />
    <h1>{{serviceName}}</h1>
    <p>{{serviceDescription}}</p>
  </div>

  <!-- Interactive inputs (only if interactive=true) -->
  {{#interactive}}
  <div class="input-section">
    <h2>Calculate Your Results</h2>
    <form id="calc-form">
      {{#inputs}}
      <div class="input-group">
        <label for="{{name}}">{{title}}</label>
        <input
          id="{{name}}"
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          {{#required}}required{{/required}}
        />
      </div>
      {{/inputs}}
      <button type="submit" class="btn-calculate">Calculate</button>
    </form>
  </div>
  {{/interactive}}

  <!-- Results -->
  <div class="results-section">
    <h2>Results</h2>
    {{#outputs}}
    <div class="result-item">
      <span class="result-label">{{title}}</span>
      <span class="result-value">{{value}}</span>
    </div>
    {{/outputs}}
  </div>

  <!-- User can add footer -->
  <div class="custom-footer">
    <p>Powered by {{custom.companyName}}</p>
  </div>
</div>
```

### Example: Editable CSS

```css
/* User edits this entire block */
.view-container {
  max-width: {{settings.maxWidth}}px;
  margin: 0 auto;
  padding: {{settings.padding}}px;
  font-family: Arial, sans-serif;
  background: {{custom.brandColor}};
}

.custom-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.custom-header img {
  max-width: 150px;
  height: auto;
}

.input-section {
  background: #f9f9f9;
  padding: 20px;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.btn-calculate {
  width: 100%;
  padding: 12px;
  background: {{custom.brandColor}};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-calculate:hover {
  opacity: 0.9;
}

.results-section {
  background: white;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-label {
  color: #666;
}

.result-value {
  font-weight: bold;
  color: #333;
}

.custom-footer {
  text-align: center;
  padding: 15px;
  color: #999;
  font-size: 12px;
}
```

---

## Settings Structure (Editable)

### Settings Editor UI

```typescript
interface TemplateSettings {
  // Interactivity
  supportsInteractive: boolean;
  inputLayout: 'vertical' | 'horizontal' | 'grid';
  outputLayout: 'list' | 'grid' | 'table';

  // Behavior
  autoCalculate: boolean;
  showCalculateButton: boolean;

  // Styling
  theme: 'light' | 'dark';
  maxWidth: number;        // px
  padding: number;         // px
  borderRadius: number;    // px

  // Custom Settings (user-defined key-value pairs)
  custom: {
    brandColor: string;    // '#FF5733'
    logoUrl: string;       // 'https://...'
    companyName: string;   // 'My Company'
    showPoweredBy: boolean;
    // ... any other custom fields
  };
}
```

### Settings Editor Component

```tsx
<Form>
  <Form.Item label="Max Width">
    <InputNumber value={settings.maxWidth} />
  </Form.Item>

  <Form.Item label="Brand Color">
    <ColorPicker value={settings.custom.brandColor} />
  </Form.Item>

  <Form.Item label="Logo URL">
    <Input value={settings.custom.logoUrl} />
  </Form.Item>

  <Divider />

  <h4>Custom Fields</h4>
  {/* Dynamic key-value editor */}
  {Object.entries(settings.custom).map(([key, value]) => (
    <Form.Item label={key} key={key}>
      <Input value={value} />
      <Button icon={<DeleteOutlined />} />
    </Form.Item>
  ))}

  <Button icon={<PlusOutlined />}>Add Custom Field</Button>
</Form>
```

---

## Template Operations (CRUD)

### Create Template

```typescript
// Duplicate a system template
POST /api/services/{serviceId}/templates
{
  basedOn: 'card',  // System template ID
  name: 'My Custom Card',
  description: 'Custom branding'
}

Response:
{
  id: 'tpl_abc123',
  // ... template data with copied HTML/CSS
}

// Create from scratch
POST /api/services/{serviceId}/templates
{
  name: 'Brand New Template',
  html: '<div>...</div>',
  css: '.my-class {...}',
  settings: { ... }
}
```

### Read Templates

```typescript
// Get all templates (system + user)
GET /api/services/{serviceId}/templates

Response:
{
  system: [
    { id: 'minimal', name: 'Minimal', ... },
    { id: 'card', name: 'Card', ... }
  ],
  user: [
    { id: 'my-custom-card', name: 'My Custom Card', ... },
    { id: 'my-invoice', name: 'Invoice Template', ... }
  ]
}

// Implementation
async function getTemplates(serviceId: string) {
  // Get system templates from code
  const system = Object.values(SYSTEM_TEMPLATES);

  // Get user templates from Redis
  const templateIds = await redis.sMembers(`service:${serviceId}:templates`);
  const user = await Promise.all(
    templateIds.map(id => redis.hGetAll(`service:${serviceId}:template:${id}`))
  );

  return { system, user };
}

// Get single template
GET /api/services/{serviceId}/templates/{templateId}

// Implementation
async function getTemplate(serviceId: string, templateId: string) {
  // Check system templates first
  if (SYSTEM_TEMPLATES[templateId]) {
    return SYSTEM_TEMPLATES[templateId];
  }
  // Then check user templates
  return redis.hGetAll(`service:${serviceId}:template:${templateId}`);
}
```

### Update Template

```typescript
PUT /api/services/{serviceId}/templates/{templateId}
{
  name: 'Updated Name',
  html: '<div class="updated">...</div>',
  css: '.updated { ... }',
  settings: { ... }
}
```

### Delete Template

```typescript
DELETE /api/services/{serviceId}/templates/{templateId}

// Can only delete user templates, not system templates
async function deleteTemplate(serviceId: string, templateId: string) {
  // Prevent deletion of system templates
  if (SYSTEM_TEMPLATES[templateId]) {
    throw new Error('Cannot delete system templates');
  }

  // Delete template data
  await redis.del(`service:${serviceId}:template:${templateId}`);

  // Remove from template list
  await redis.sRem(`service:${serviceId}:templates`, templateId);
}
```

---

## Rendering Pipeline

### Step 1: Fetch Template

```typescript
// System template (from code)
if (SYSTEM_TEMPLATES[templateId]) {
  template = SYSTEM_TEMPLATES[templateId];
}
// OR User template (from Redis)
else {
  template = await redis.hGetAll(`service:${serviceId}:template:${templateId}`);
}
```

### Step 2: Prepare Data

```typescript
const templateData = {
  serviceId,
  serviceName: service.name,
  serviceDescription: service.description,
  interactive: queryParams.interactive === 'true',
  token: queryParams.token,
  inputs: service.inputs.map(input => ({
    ...input,
    value: queryParams[input.name] || input.value || '',
    inputType: getInputType(input.type)
  })),
  outputs: apiResponse.outputs,
  custom: template.settings.custom || {}
};
```

### Step 3: Render HTML

```typescript
// Use Mustache to render HTML
const renderedHtml = Mustache.render(template.html, templateData);
```

### Step 4: Inject CSS

```typescript
const finalHtml = `
  <style>${template.css}</style>
  ${renderedHtml}
  ${template.settings.supportsInteractive && templateData.interactive
    ? `<script>${generateFormHandler(serviceId, token)}</script>`
    : ''}
`;
```

### Step 5: Return HTML

```typescript
return new Response(finalHtml, {
  headers: {
    'Content-Type': 'text/html',
    'Cache-Control': templateData.interactive ? 'no-cache' : 'public, max-age=3600'
  }
});
```

---

## Security Considerations

### HTML Sanitization

```typescript
// When saving user HTML
import DOMPurify from 'isomorphic-dompurify';

async function saveTemplate(serviceId: string, templateId: string, html: string, css: string) {
  // Sanitize HTML (remove dangerous tags/attributes)
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'h1', 'h2', 'h3', 'p', 'img', 'a', 'form', 'input', 'button', 'label'],
    ALLOWED_ATTR: ['class', 'id', 'style', 'src', 'href', 'type', 'name', 'value', 'placeholder']
  });

  // Sanitize CSS (remove dangerous properties)
  const sanitizedCss = sanitizeCSS(css);

  // Save to Redis with consistent key pattern
  await redis.hSet(`service:${serviceId}:template:${templateId}`, {
    html: sanitizedHtml,
    css: sanitizedCss
  });

  // Add to template list if not already there
  await redis.sAdd(`service:${serviceId}:templates`, templateId);
}
```

### JavaScript Execution (Optional)

If we allow custom JavaScript:

```typescript
// Sandbox custom JS using iframe with restricted permissions
<iframe
  sandbox="allow-scripts allow-forms"
  srcdoc="<script>${sanitizedUserJs}</script>"
/>

// OR: Use Web Workers for safer execution
const worker = new Worker('data:text/javascript,' + encodeURIComponent(userJs));
```

**Recommendation**: Start without custom JS, add later if needed.

---

## Migration Strategy

### Phase 1: Template Storage ✅
1. Create template data structure
2. Move DEFAULT_TEMPLATES to Redis as system templates
3. Create template CRUD APIs

### Phase 2: Template Editor UI
1. Create TemplateEditor component
   - Code editor for HTML (with Mustache syntax highlighting)
   - Code editor for CSS
   - Settings form
   - Live preview panel
2. Add "Create Template" and "Edit Template" buttons
3. Template gallery with system + user templates

### Phase 3: Rendering Engine
1. Update UnifiedViewRenderer to fetch templates from Redis
2. Support both system and user templates
3. Implement HTML sanitization
4. Test rendering with user-created templates

### Phase 4: Enhanced Features
1. Rich text editor for descriptions
2. Template versioning (track history)
3. Template sharing (export/import)
4. Template marketplace (optional)

---

## UI Components

### Template List (AppsView)

```tsx
<Menu mode="inline">
  {/* Intro */}
  <Menu.Item key="intro">Intro & Token Management</Menu.Item>

  {/* Web App */}
  <SubMenu key="webapp" title="Web App">
    {webAppToken && <Menu.Item key="webapp">My Web App</Menu.Item>}
  </SubMenu>

  {/* System Templates */}
  <SubMenu key="system-templates" title="System Templates">
    {systemTemplates.map(t => (
      <Menu.Item key={t.id}>{t.name}</Menu.Item>
    ))}
  </SubMenu>

  {/* User Templates */}
  <SubMenu key="user-templates" title="My Templates">
    {userTemplates.map(t => (
      <Menu.Item key={t.id}>
        {t.name}
        <Button size="small" icon={<EditOutlined />} />
      </Menu.Item>
    ))}
    <Menu.Item key="create-template">
      <PlusOutlined /> Create New Template
    </Menu.Item>
  </SubMenu>
</Menu>
```

### Template Content View

```tsx
// When template is selected
const renderTemplateContent = (template) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with actions */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <h3>{template.name}</h3>
          {!template.isSystem && (
            <>
              <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button icon={<CopyOutlined />} onClick={() => duplicateTemplate(template)}>
                Duplicate
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={() => deleteTemplate(template)}>
                Delete
              </Button>
            </>
          )}
          {template.isSystem && (
            <Button icon={<CopyOutlined />} onClick={() => duplicateTemplate(template)}>
              Duplicate & Customize
            </Button>
          )}
        </Space>
      </div>

      {/* Embed codes */}
      <div style={{ marginBottom: 16 }}>
        <Tabs>
          <TabPane tab="Snippet Mode" key="snippet">
            <Input.TextArea value={getSnippetEmbedCode(template)} />
          </TabPane>
          <TabPane tab="Interactive Mode" key="interactive">
            <Input.TextArea value={getInteractiveEmbedCode(template)} />
          </TabPane>
        </Tabs>
      </div>

      {/* Preview */}
      <div style={{ flex: 1 }}>
        <h4>Preview</h4>
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden', height: '100%' }}>
          <iframe src={getPreviewUrl(template)} style={{ width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  );
};
```

---

## Example: Complete Editable Template

```typescript
{
  id: 'custom-invoice',
  name: 'Invoice Template',
  description: 'Professional invoice layout with company branding',

  html: `
    <div class="invoice">
      <header class="invoice-header">
        <img src="{{custom.logoUrl}}" alt="Company Logo" class="logo" />
        <div class="company-info">
          <h1>{{custom.companyName}}</h1>
          <p>{{custom.companyAddress}}</p>
        </div>
      </header>

      {{#interactive}}
      <section class="input-section">
        <h2>Invoice Details</h2>
        <form id="invoice-form">
          {{#inputs}}
          <div class="form-group">
            <label>{{title}}</label>
            <input type="{{inputType}}" name="{{name}}" value="{{value}}" />
          </div>
          {{/inputs}}
          <button type="submit" class="btn-calculate">Calculate Invoice</button>
        </form>
      </section>
      {{/interactive}}

      <section class="results-section">
        <h2>Invoice Summary</h2>
        <table class="invoice-table">
          {{#outputs}}
          <tr>
            <td>{{title}}</td>
            <td class="amount">{{value}}</td>
          </tr>
          {{/outputs}}
        </table>
      </section>

      <footer class="invoice-footer">
        <p>{{custom.footerText}}</p>
      </footer>
    </div>
  `,

  css: `
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      padding-bottom: 30px;
      border-bottom: 3px solid {{custom.brandColor}};
      margin-bottom: 30px;
    }

    .logo {
      max-width: 200px;
      height: auto;
    }

    .company-info {
      text-align: right;
    }

    .company-info h1 {
      margin: 0;
      color: {{custom.brandColor}};
      font-size: 24px;
    }

    .input-section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn-calculate {
      width: 100%;
      padding: 12px;
      background: {{custom.brandColor}};
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .results-section h2 {
      color: {{custom.brandColor}};
      margin-bottom: 20px;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
    }

    .invoice-table tr {
      border-bottom: 1px solid #eee;
    }

    .invoice-table td {
      padding: 15px 0;
    }

    .invoice-table .amount {
      text-align: right;
      font-weight: bold;
      font-size: 18px;
    }

    .invoice-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  `,

  isSystem: false,
  createdBy: 'user-123',
  createdAt: '2025-01-20T10:00:00Z',
  basedOn: 'card',

  settings: {
    supportsInteractive: true,
    inputLayout: 'vertical',
    outputLayout: 'table',
    maxWidth: 800,
    padding: 40,
    custom: {
      brandColor: '#2C3E50',
      logoUrl: 'https://example.com/logo.png',
      companyName: 'Acme Corporation',
      companyAddress: '123 Business St, Suite 100, City, State 12345',
      footerText: 'Thank you for your business!'
    }
  }
}
```

---

## Summary

The V2 architecture treats templates as **editable data** instead of hardcoded constants:

✅ **User-Editable**: HTML, CSS, settings all editable
✅ **Database-Stored**: Redis stores user templates
✅ **System Templates**: Read-only starter templates
✅ **Duplicate & Customize**: Fork system templates
✅ **Rich Customization**: Custom CSS, settings, branding
✅ **Future-Proof**: Ready for template marketplace, sharing, versioning

**Next Steps:**
1. Implement template CRUD APIs
2. Build template editor UI (HTML/CSS editors + live preview)
3. Update rendering engine to support user templates
4. Add security (HTML sanitization)

This architecture is **fully extensible** and ready for whatever features you want to add next! 🚀
