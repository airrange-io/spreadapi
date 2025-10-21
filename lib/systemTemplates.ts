// System Templates for Unified Views
// These are hardcoded, immutable templates available to all services
// Users can duplicate and customize these, but originals cannot be edited

export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  isSystem: true;
  isDefault?: boolean;
  settings: {
    supportsInteractive: boolean;
    inputLayout: 'vertical' | 'horizontal' | 'grid';
    outputLayout: 'list' | 'grid' | 'table';
  };
}

export const SYSTEM_TEMPLATES: Record<string, SystemTemplate> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple output display',
    isSystem: true,
    isDefault: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-minimal">
  {{#interactive}}
  <div class="input-section">
    <h2>{{serviceName}}</h2>
    <form id="calc-form">
      {{#inputs}}
      <div class="input-group">
        <label for="{{name}}">{{title}}</label>
        <input
          id="{{name}}"
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          placeholder="{{placeholder}}"
        />
      </div>
      {{/inputs}}
      <button type="submit" class="btn-calculate">Calculate</button>
    </form>
  </div>
  {{/interactive}}

  <div class="results-section">
    {{^interactive}}<h2>{{serviceName}}</h2>{{/interactive}}
    {{#outputs}}
    <div class="result-item">
      <strong>{{title}}:</strong> <span>{{value}}</span>
    </div>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
.view-minimal {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.view-minimal h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-size: 20px;
}

.input-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-calculate {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: #096dd9;
}

.results-section {
  background: white;
}

.result-item {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item strong {
  color: #666;
  margin-right: 8px;
}

.result-item span {
  color: #333;
  font-weight: 500;
}
    `.trim()
  },

  card: {
    id: 'card',
    name: 'Card',
    description: 'Card-style layout with header',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-card">
  <div class="card-header">
    <h2>{{serviceName}}</h2>
  </div>

  {{#interactive}}
  <div class="card-inputs">
    <form id="calc-form">
      {{#inputs}}
      <div class="input-group">
        <label for="{{name}}">{{title}}</label>
        <input
          id="{{name}}"
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          placeholder="{{placeholder}}"
        />
      </div>
      {{/inputs}}
      <button type="submit" class="btn-calculate">Calculate</button>
    </form>
  </div>
  {{/interactive}}

  <div class="card-results">
    {{#outputs}}
    <div class="result-row">
      <span class="result-label">{{title}}</span>
      <strong class="result-value">{{value}}</strong>
    </div>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.view-card {
  font-family: Arial, sans-serif;
  width: 100%;
  min-width: 280px;
  margin: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.card-inputs {
  background: #f9f9f9;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-of-type {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-calculate {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: #5568d3;
}

.card-results {
  padding: 24px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  color: #666;
  font-size: 14px;
}

.result-value {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}
    `.trim()
  },

  table: {
    id: 'table',
    name: 'Table',
    description: 'Traditional table format',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'table'
    },
    html: `
<div class="view-table">
  <h2>{{serviceName}}</h2>

  {{#interactive}}
  <div class="input-section">
    <form id="calc-form">
      {{#inputs}}
      <div class="input-group">
        <label for="{{name}}">{{title}}</label>
        <input
          id="{{name}}"
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          placeholder="{{placeholder}}"
        />
      </div>
      {{/inputs}}
      <button type="submit" class="btn-calculate">Calculate</button>
    </form>
  </div>
  {{/interactive}}

  <table class="results-table">
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {{#outputs}}
      <tr>
        <td>{{title}}</td>
        <td><strong>{{value}}</strong></td>
      </tr>
      {{/outputs}}
    </tbody>
  </table>
</div>
    `.trim(),
    css: `
.view-table {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.view-table h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 22px;
}

.input-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-of-type {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-calculate {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: #096dd9;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.results-table thead {
  background: #f5f5f5;
}

.results-table th {
  padding: 14px 16px;
  text-align: left;
  border: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.results-table td {
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

.results-table td strong {
  color: #333;
  font-size: 15px;
}
    `.trim()
  },

  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient horizontal layout',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'horizontal',
      outputLayout: 'list'
    },
    html: `
<div class="view-compact">
  {{#interactive}}
  <div class="compact-header">
    <h3>{{serviceName}}</h3>
  </div>
  <form id="calc-form" class="compact-form">
    {{#inputs}}
    <div class="compact-input">
      <label for="{{name}}">{{title}}</label>
      <input
        id="{{name}}"
        type="{{inputType}}"
        name="{{name}}"
        value="{{value}}"
        placeholder="{{placeholder}}"
      />
    </div>
    {{/inputs}}
    <button type="submit" class="btn-calculate">Calculate</button>
  </form>
  {{/interactive}}

  <div class="compact-results">
    {{^interactive}}<strong>{{serviceName}}:</strong>{{/interactive}}
    {{#outputs}}
    <span class="compact-result">
      <span class="label">{{title}}:</span>
      <strong>{{value}}</strong>
    </span>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
.view-compact {
  font-family: Arial, sans-serif;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  max-width: 900px;
  margin: 0 auto;
}

.compact-header h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.compact-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.compact-input {
  flex: 1;
  min-width: 120px;
}

.compact-input label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.compact-input input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-calculate {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: #096dd9;
}

.compact-results {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.compact-result {
  display: inline-block;
}

.compact-result .label {
  color: #888;
  font-size: 12px;
  margin-right: 4px;
}

.compact-result strong {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}
    `.trim()
  },

  detailed: {
    id: 'detailed',
    name: 'Detailed',
    description: 'Full information with descriptions',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-detailed">
  <h2>{{serviceName}}</h2>

  {{#interactive}}
  <div class="input-section">
    <h3>Input Parameters</h3>
    <form id="calc-form">
      {{#inputs}}
      <div class="input-group">
        <label for="{{name}}">{{title}}</label>
        <input
          id="{{name}}"
          type="{{inputType}}"
          name="{{name}}"
          value="{{value}}"
          placeholder="{{placeholder}}"
        />
      </div>
      {{/inputs}}
      <button type="submit" class="btn-calculate">Calculate Results</button>
    </form>
  </div>
  {{/interactive}}

  <div class="results-section">
    <h3>Results</h3>
    {{#outputs}}
    <div class="result-card">
      <div class="result-title">{{title}}</div>
      <div class="result-value">{{value}}</div>
      {{#description}}
      <div class="result-description">{{description}}</div>
      {{/description}}
    </div>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
.view-detailed {
  font-family: Arial, sans-serif;
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.view-detailed h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
  font-size: 26px;
  font-weight: 600;
}

.view-detailed h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #667eea;
  font-size: 18px;
  font-weight: 600;
}

.input-section {
  background: white;
  padding: 24px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.input-group {
  margin-bottom: 20px;
}

.input-group:last-of-type {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-calculate {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: #5568d3;
}

.results-section {
  background: white;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.result-card {
  background: white;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

.result-card:last-child {
  margin-bottom: 0;
}

.result-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 6px;
  font-weight: 500;
}

.result-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.result-description {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  line-height: 1.5;
}
    `.trim()
  }
};
