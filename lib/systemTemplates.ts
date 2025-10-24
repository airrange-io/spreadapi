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
  // ============================================
  // DISPLAY-ONLY / RESULTS TEMPLATES
  // ============================================

  card: {
    id: 'card',
    name: 'Card',
    description: 'Classic card with header - clean and professional',
    isSystem: true,
    isDefault: true,
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
  padding: var(--container-padding);
  background: var(--container-bg);
  box-sizing: border-box;
}

.view-card {
  font-family: var(--font-family);
  width: 100%;
  max-width: 600px;
  min-width: 320px;
  margin: 0;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.card-header {
  background: var(--primary-color);
  color: var(--button-color);
  padding: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.card-inputs {
  background: var(--input-section-bg);
  padding: 24px;
  border-bottom: var(--content-border);
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-of-type {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.card-results {
  padding: 24px 32px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: var(--result-row-padding);
  border-bottom: 1px solid var(--result-divider-color);
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.result-value {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
  white-space: nowrap;
  flex-shrink: 0;
}
    `.trim()
  },

  table: {
    id: 'table',
    name: 'Table',
    description: 'Traditional table format - great for multiple results',
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
body {
  background: var(--container-bg);
  margin: 0;
  padding: var(--container-padding);
}

.view-table {
  font-family: var(--font-family);
  padding: var(--content-padding);
  max-width: 700px;
  margin: 0 auto;
  background: var(--content-bg);
  border: var(--content-border);
  border-radius: var(--content-border-radius);
  box-shadow: var(--content-shadow);
}

.view-table h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.input-section {
  background: var(--input-section-bg);
  padding: 20px;
  border-radius: var(--input-border-radius);
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
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.results-table thead {
  background: var(--table-header-bg);
}

.results-table th {
  padding: 14px 16px;
  text-align: left;
  border: var(--table-border-color) solid 1px;
  font-weight: 600;
  color: var(--table-header-color);
  font-size: 14px;
}

.results-table td {
  padding: 14px 16px;
  border: var(--table-border-color) solid 1px;
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
}

.results-table tbody tr:hover {
  background: var(--table-row-hover-bg);
}

.results-table td strong {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}
    `.trim()
  },

  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient horizontal layout - fits anywhere',
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
    <button type="submit" class="btn-calculate">Go</button>
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
body {
  background: var(--container-bg);
  margin: 0;
  padding: var(--container-padding);
}

.view-compact {
  font-family: var(--font-family);
  padding: 16px;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  max-width: 900px;
  margin: 0 auto;
}

.compact-header h3 {
  margin: 0 0 12px 0;
  color: var(--heading-color);
  font-size: 16px;
  font-weight: var(--heading-font-weight);
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
  font-size: var(--input-label-font-size);
  color: var(--input-label-color);
  margin-bottom: 4px;
  font-weight: var(--input-label-font-weight);
}

.compact-input input {
  width: 100%;
  padding: 8px 10px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  box-sizing: border-box;
  color: var(--text-color);
}

.compact-input input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  padding: 8px 20px;
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
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
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  margin-right: 4px;
}

.compact-result strong {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}
    `.trim()
  },

  twoColumn: {
    id: 'twoColumn',
    name: 'Two Column',
    description: 'Split panel layout - organized and balanced',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'grid'
    },
    html: `
<div class="view-two-column">
  <div class="column-header">
    <h2>{{serviceName}}</h2>
  </div>

  {{#interactive}}
  <div class="two-column-interactive">
    <div class="column-inputs">
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
    <div class="column-results">
      <div class="results-grid">
        {{#outputs}}
        <div class="column-item">
          <div class="item-label">{{title}}</div>
          <div class="item-value">{{value}}</div>
        </div>
        {{/outputs}}
      </div>
    </div>
  </div>
  {{/interactive}}

  {{^interactive}}
  <div class="two-columns">
    {{#outputs}}
    <div class="column-item">
      <div class="item-label">{{title}}</div>
      <div class="item-value">{{value}}</div>
    </div>
    {{/outputs}}
  </div>
  {{/interactive}}
</div>
    `.trim(),
    css: `
body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-two-column {
  font-family: var(--font-family);
  max-width: 800px;
  width: 100%;
  background: var(--content-bg);
  padding: var(--content-padding);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.column-header h2 {
  margin: 0 0 24px 0;
  text-align: center;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

/* Interactive mode - inputs on left, results on right */
.two-column-interactive {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.column-inputs {
  background: var(--input-section-bg);
  padding: 24px;
  border-radius: var(--content-border-radius);
}

.column-results {
  padding: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Non-interactive mode - results in two columns */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.column-item {
  padding: 16px;
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
}

.item-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
  margin-bottom: 8px;
}

.item-value {
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
  color: var(--result-value-color);
}

@media (max-width: 768px) {
  .two-column-interactive {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
  }
}
    `.trim()
  },

  bigNumber: {
    id: 'bigNumber',
    name: 'Big Number',
    description: 'Hero-style single metric display - perfect for KPIs',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-big-number">
  <div class="service-name">{{serviceName}}</div>
  {{#outputs}}
  <div class="big-number-item">
    <div class="big-value">{{value}}</div>
    <div class="big-label">{{title}}</div>
  </div>
  {{/outputs}}
</div>
    `.trim(),
    css: `
body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-big-number {
  font-family: var(--font-family);
  text-align: center;
  padding: var(--content-padding);
  background: var(--content-bg);
  border: var(--content-border);
  border-radius: var(--content-border-radius);
  box-shadow: var(--content-shadow);
  min-width: 300px;
}

.service-name {
  font-size: 14px;
  color: var(--label-color);
  margin-bottom: 32px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.big-number-item {
  margin: 32px 0;
}

.big-number-item:first-child {
  margin-top: 0;
}

.big-number-item:last-child {
  margin-bottom: 0;
}

.big-value {
  font-size: 56px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  margin-bottom: 8px;
}

.big-label {
  font-size: 16px;
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
}
    `.trim()
  },

  metricGrid: {
    id: 'metricGrid',
    name: 'Metric Grid',
    description: '2x2 grid of metrics - dashboard-style display',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'grid'
    },
    html: `
<div class="view-metric-grid">
  <div class="grid-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="metric-grid">
    {{#outputs}}
    <div class="metric-box">
      <div class="metric-value">{{value}}</div>
      <div class="metric-label">{{title}}</div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-metric-grid {
  font-family: var(--font-family);
  max-width: 600px;
  width: 100%;
}

.grid-header {
  text-align: center;
  margin-bottom: 32px;
}

.grid-header h2 {
  margin: 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-box {
  background: var(--content-bg);
  padding: 32px 24px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--result-value-color);
  margin-bottom: 8px;
  line-height: 1.2;
}

.metric-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
}
    `.trim()
  },

  statsRow: {
    id: 'statsRow',
    name: 'Stats Row',
    description: 'Horizontal row of statistics - great for headers',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-stats-row">
  <div class="row-header">{{serviceName}}</div>
  <div class="stats-container">
    {{#outputs}}
    <div class="stat-item">
      <div class="stat-value">{{value}}</div>
      <div class="stat-label">{{title}}</div>
    </div>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-stats-row {
  font-family: var(--font-family);
  max-width: 1200px;
  margin: 0 auto;
}

.row-header {
  text-align: center;
  font-size: 14px;
  color: var(--label-color);
  margin-bottom: 24px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats-container {
  display: flex;
  gap: 2px;
  background: var(--container-bg);
  border-radius: var(--content-border-radius);
  overflow: hidden;
}

.stat-item {
  flex: 1;
  background: var(--content-bg);
  padding: 32px 20px;
  text-align: center;
  border-right: 1px solid var(--result-divider-color);
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--result-value-color);
  margin-bottom: 6px;
}

.stat-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
}
    `.trim()
  },

  comparison: {
    id: 'comparison',
    name: 'Comparison View',
    description: 'Side-by-side comparison - perfect for A/B scenarios',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'grid'
    },
    html: `
<div class="view-comparison">
  <h2>{{serviceName}}</h2>
  <div class="comparison-grid">
    {{#outputs}}
    <div class="comparison-column">
      <div class="column-label">{{title}}</div>
      <div class="column-value">{{value}}</div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-comparison {
  font-family: var(--font-family);
  max-width: 700px;
  width: 100%;
  background: var(--content-bg);
  padding: var(--content-padding);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.view-comparison h2 {
  margin: 0 0 32px 0;
  text-align: center;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.comparison-column {
  text-align: center;
  padding: 24px;
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.comparison-column:hover {
  border-color: var(--primary-color);
}

.column-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
  margin-bottom: 12px;
}

.column-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--result-value-color);
}
    `.trim()
  },

  statusBadges: {
    id: 'statusBadges',
    name: 'Status Badges',
    description: 'Badge/pill style results - modern and clean',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-badges">
  <div class="badges-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="badges-container">
    {{#outputs}}
    <div class="badge-item">
      <span class="badge-label">{{title}}</span>
      <span class="badge-value">{{value}}</span>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-badges {
  font-family: var(--font-family);
  max-width: 600px;
  width: 100%;
  background: var(--content-bg);
  padding: var(--content-padding);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.badges-header h2 {
  margin: 0 0 24px 0;
  text-align: center;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.badges-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--input-section-bg);
  border-radius: 50px;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: translateX(4px);
}

.badge-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
}

.badge-value {
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
  color: var(--primary-color);
  background: var(--content-bg);
  padding: 6px 16px;
  border-radius: 50px;
}
    `.trim()
  },

  // ============================================
  // INTERACTIVE TEMPLATES
  // ============================================

  calculator: {
    id: 'calculator',
    name: 'Calculator Panel',
    description: 'Classic calculator layout - inputs left, results right',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-calculator">
  <div class="calc-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="calc-layout">
    <div class="calc-inputs">
      <h3>Input</h3>
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
    <div class="calc-results">
      <h3>Results</h3>
      <div class="results-list">
        {{#outputs}}
        <div class="result-row">
          <span class="result-label">{{title}}</span>
          <strong class="result-value">{{value}}</strong>
        </div>
        {{/outputs}}
      </div>
    </div>
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-calculator {
  font-family: var(--font-family);
  max-width: 900px;
  margin: 0 auto;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.calc-header {
  background: var(--primary-color);
  color: var(--button-color);
  padding: 24px;
  text-align: center;
}

.calc-header h2 {
  margin: 0;
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.calc-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.calc-inputs {
  padding: 32px;
  background: var(--input-section-bg);
  border-right: 1px solid var(--result-divider-color);
}

.calc-results {
  padding: 32px;
  background: var(--content-bg);
}

.calc-inputs h3,
.calc-results h3 {
  margin: 0 0 20px 0;
  color: var(--heading-color);
  font-size: 18px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
}

.result-label {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.result-value {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}

@media (max-width: 700px) {
  .calc-layout {
    grid-template-columns: 1fr;
  }
  .calc-inputs {
    border-right: none;
    border-bottom: 1px solid var(--result-divider-color);
  }
}
    `.trim()
  },

  splitView: {
    id: 'splitView',
    name: 'Split View',
    description: '50/50 split - inputs and outputs side-by-side',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-split">
  <div class="split-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="split-container">
    <div class="split-left">
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
    <div class="split-divider"></div>
    <div class="split-right">
      {{#outputs}}
      <div class="output-item">
        <span class="output-label">{{title}}</span>
        <strong class="output-value">{{value}}</strong>
      </div>
      {{/outputs}}
    </div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-split {
  font-family: var(--font-family);
  max-width: 900px;
  width: 100%;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.split-header {
  background: var(--input-section-bg);
  padding: 20px;
  text-align: center;
  border-bottom: var(--content-border);
}

.split-header h2 {
  margin: 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.split-container {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  min-height: 400px;
}

.split-left {
  padding: 32px;
}

.split-divider {
  background: var(--result-divider-color);
}

.split-right {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.output-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--result-divider-color);
}

.output-item:last-child {
  border-bottom: none;
}

.output-label {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.output-value {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}

@media (max-width: 700px) {
  .split-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
  }
  .split-divider {
    height: 1px;
    width: 100%;
  }
}
    `.trim()
  },

  formCard: {
    id: 'formCard',
    name: 'Form + Results',
    description: 'Vertical form with results below - traditional and clear',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-form-card">
  <div class="form-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="form-body">
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
  <div class="results-section">
    {{#outputs}}
    <div class="result-item">
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-form-card {
  font-family: var(--font-family);
  max-width: 500px;
  width: 100%;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.form-header {
  padding: 24px;
  background: var(--input-section-bg);
  border-bottom: var(--content-border);
}

.form-header h2 {
  margin: 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
  text-align: center;
}

.form-body {
  padding: 32px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: 14px;
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.results-section {
  padding: 24px 32px;
  background: var(--input-section-bg);
  border-top: 2px solid var(--result-divider-color);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--result-row-padding);
  border-bottom: 1px solid var(--result-divider-color);
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.result-value {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}
    `.trim()
  },

  quickTool: {
    id: 'quickTool',
    name: 'Quick Converter',
    description: 'Minimal converter - fast and efficient',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'horizontal',
      outputLayout: 'list'
    },
    html: `
<div class="view-quick-tool">
  <div class="tool-title">{{serviceName}}</div>
  <form id="calc-form" class="tool-form">
    {{#inputs}}
    <div class="tool-input">
      <input
        id="{{name}}"
        type="{{inputType}}"
        name="{{name}}"
        value="{{value}}"
        placeholder="{{title}}"
      />
    </div>
    {{/inputs}}
    <button type="submit" class="btn-convert">→</button>
  </form>
  <div class="tool-results">
    {{#outputs}}
    <div class="tool-result">
      <span class="result-label">{{title}}:</span>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-quick-tool {
  font-family: var(--font-family);
  max-width: 400px;
  width: 100%;
  background: var(--content-bg);
  padding: 32px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.tool-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 24px;
}

.tool-form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tool-input {
  flex: 1;
}

.tool-input input {
  width: 100%;
  padding: 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.tool-input input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-convert {
  padding: 12px 20px;
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-convert:hover {
  background: var(--button-hover-bg);
}

.tool-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-result {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
}

.result-label {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.result-value {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}
    `.trim()
  },

  wizard: {
    id: 'wizard',
    name: 'Step Calculator',
    description: 'Wizard-style with prominent result - guided experience',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-wizard">
  <div class="wizard-step">
    <div class="step-number">1</div>
    <div class="step-content">
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
        <button type="submit" class="btn-calculate">Get Results</button>
      </form>
    </div>
  </div>
  <div class="wizard-result">
    <div class="result-header">Your Results</div>
    {{#outputs}}
    <div class="result-box">
      <div class="result-label">{{title}}</div>
      <div class="result-value">{{value}}</div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-wizard {
  font-family: var(--font-family);
  max-width: 600px;
  width: 100%;
}

.wizard-step {
  display: flex;
  gap: 24px;
  background: var(--content-bg);
  padding: 32px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  margin-bottom: 24px;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: var(--button-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h2 {
  margin: 0 0 20px 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.wizard-result {
  background: var(--content-bg);
  padding: 32px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.result-header {
  font-size: 20px;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 20px;
  text-align: center;
}

.result-box {
  background: var(--input-section-bg);
  padding: 20px;
  border-radius: var(--content-border-radius);
  margin-bottom: 12px;
  text-align: center;
}

.result-box:last-child {
  margin-bottom: 0;
}

.result-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
  margin-bottom: 8px;
}

.result-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--result-value-color);
}
    `.trim()
  },

  pricing: {
    id: 'pricing',
    name: 'Pricing Calculator',
    description: 'Pricing display - perfect for quotes and estimates',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-pricing">
  <div class="pricing-card">
    <div class="pricing-header">
      <h2>{{serviceName}}</h2>
    </div>
    <div class="pricing-inputs">
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
        <button type="submit" class="btn-calculate">Calculate Price</button>
      </form>
    </div>
    <div class="pricing-breakdown">
      {{#outputs}}
      <div class="breakdown-row">
        <span>{{title}}</span>
        <strong>{{value}}</strong>
      </div>
      {{/outputs}}
    </div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-pricing {
  font-family: var(--font-family);
  max-width: 500px;
  width: 100%;
}

.pricing-card {
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.pricing-header {
  background: var(--primary-color);
  color: var(--button-color);
  padding: 32px;
  text-align: center;
}

.pricing-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.pricing-inputs {
  padding: 32px;
  background: var(--input-section-bg);
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.pricing-breakdown {
  padding: 32px;
  background: var(--content-bg);
  border-top: 2px solid var(--result-divider-color);
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--result-divider-color);
}

.breakdown-row:last-child {
  border-bottom: none;
  padding-top: 20px;
  font-size: 18px;
}

.breakdown-row span {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.breakdown-row strong {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}

.breakdown-row:last-child strong {
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 700;
}
    `.trim()
  },

  analyzer: {
    id: 'analyzer',
    name: 'Data Analyzer',
    description: 'Analysis tool layout - input area with detailed results',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-analyzer">
  <div class="analyzer-header">
    <h2>{{serviceName}}</h2>
  </div>
  <div class="analyzer-body">
    <div class="input-panel">
      <div class="panel-title">Input Data</div>
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
        <button type="submit" class="btn-calculate">Analyze</button>
      </form>
    </div>
    <div class="results-panel">
      <div class="panel-title">Analysis Results</div>
      <div class="results-grid">
        {{#outputs}}
        <div class="analysis-item">
          <div class="analysis-label">{{title}}</div>
          <div class="analysis-value">{{value}}</div>
        </div>
        {{/outputs}}
      </div>
    </div>
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-analyzer {
  font-family: var(--font-family);
  max-width: 900px;
  margin: 0 auto;
}

.analyzer-header {
  background: var(--content-bg);
  padding: 24px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  margin-bottom: 20px;
  text-align: center;
}

.analyzer-header h2 {
  margin: 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.analyzer-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-panel,
.results-panel {
  background: var(--content-bg);
  padding: 24px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-item {
  padding: 16px;
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
  border-left: 3px solid var(--primary-color);
}

.analysis-label {
  font-size: var(--result-label-font-size);
  color: var(--result-label-color);
  font-weight: var(--result-label-font-weight);
  margin-bottom: 6px;
}

.analysis-value {
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
  color: var(--result-value-color);
}

@media (max-width: 700px) {
  .analyzer-body {
    grid-template-columns: 1fr;
  }
}
    `.trim()
  },

  liveWidget: {
    id: 'liveWidget',
    name: 'Live Widget',
    description: 'Dashboard widget - compact and interactive',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'horizontal',
      outputLayout: 'grid'
    },
    html: `
<div class="view-widget">
  <div class="widget-header">
    <h3>{{serviceName}}</h3>
  </div>
  <form id="calc-form" class="widget-controls">
    {{#inputs}}
    <input
      id="{{name}}"
      type="{{inputType}}"
      name="{{name}}"
      value="{{value}}"
      placeholder="{{title}}"
      class="widget-input"
    />
    {{/inputs}}
    <button type="submit" class="btn-update">Update</button>
  </form>
  <div class="widget-metrics">
    {{#outputs}}
    <div class="widget-metric">
      <div class="metric-value">{{value}}</div>
      <div class="metric-name">{{title}}</div>
    </div>
    {{/outputs}}
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-widget {
  font-family: var(--font-family);
  max-width: 400px;
  margin: 0 auto;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  overflow: hidden;
}

.widget-header {
  background: var(--primary-color);
  color: var(--button-color);
  padding: 16px 20px;
}

.widget-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: var(--heading-font-weight);
}

.widget-controls {
  padding: 16px 20px;
  background: var(--input-section-bg);
  display: flex;
  gap: 8px;
}

.widget-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
}

.widget-input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-update {
  padding: 8px 16px;
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: 13px;
  font-weight: var(--button-font-weight);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-update:hover {
  background: var(--button-hover-bg);
}

.widget-metrics {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.widget-metric {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--result-value-color);
  margin-bottom: 4px;
}

.metric-name {
  font-size: 11px;
  color: var(--result-label-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
    `.trim()
  },

  estimator: {
    id: 'estimator',
    name: 'Cost Estimator',
    description: 'Breakdown estimator - detailed cost analysis',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-estimator">
  <div class="estimator-container">
    <h2>{{serviceName}}</h2>
    <div class="estimator-content">
      <div class="estimator-inputs">
        <h3>Configuration</h3>
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
          <button type="submit" class="btn-calculate">Calculate Estimate</button>
        </form>
      </div>
      <div class="estimator-summary">
        <h3>Estimate Breakdown</h3>
        <div class="breakdown-list">
          {{#outputs}}
          <div class="breakdown-item">
            <span class="item-name">{{title}}</span>
            <span class="item-amount">{{value}}</span>
          </div>
          {{/outputs}}
        </div>
      </div>
    </div>
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-estimator {
  font-family: var(--font-family);
  max-width: 900px;
  margin: 0 auto;
}

.estimator-container {
  background: var(--content-bg);
  padding: 32px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.estimator-container h2 {
  margin: 0 0 24px 0;
  text-align: center;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.estimator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.estimator-inputs h3,
.estimator-summary h3 {
  margin: 0 0 16px 0;
  color: var(--heading-color);
  font-size: 18px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: var(--input-label-font-weight);
  margin-bottom: 6px;
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  box-sizing: border-box;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.breakdown-list {
  background: var(--input-section-bg);
  border-radius: var(--content-border-radius);
  padding: 20px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--result-divider-color);
}

.breakdown-item:last-child {
  border-bottom: none;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 2px solid var(--primary-color);
}

.item-name {
  color: var(--result-label-color);
  font-size: var(--result-label-font-size);
  font-weight: var(--result-label-font-weight);
}

.item-amount {
  color: var(--result-value-color);
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
}

.breakdown-item:last-child .item-amount {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 700;
}

@media (max-width: 700px) {
  .estimator-content {
    grid-template-columns: 1fr;
  }
}
    `.trim()
  },

  valueFocus: {
    id: 'valueFocus',
    name: 'Value Focus',
    description: 'Minimal labels, maximum values - typography emphasis',
    isSystem: true,
    settings: {
      supportsInteractive: false,
      inputLayout: 'vertical',
      outputLayout: 'grid'
    },
    html: `
<div class="view-value-focus">
  <div class="focus-header">{{serviceName}}</div>
  <div class="values-grid">
    {{#outputs}}
    <div class="value-card">
      <div class="card-value">{{value}}</div>
      <div class="card-label">{{title}}</div>
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
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-value-focus {
  font-family: var(--font-family);
  max-width: 900px;
  width: 100%;
}

.focus-header {
  text-align: center;
  font-size: 11px;
  color: var(--label-color);
  margin-bottom: 40px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.6;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.value-card {
  background: var(--content-bg);
  padding: 40px 24px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.value-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--result-value-color);
  line-height: 1.1;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.card-label {
  font-size: 10px;
  color: var(--result-label-color);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  opacity: 0.7;
}
    `.trim()
  },

  builder: {
    id: 'builder',
    name: 'Config Builder',
    description: 'Configuration interface - build and preview',
    isSystem: true,
    settings: {
      supportsInteractive: true,
      inputLayout: 'vertical',
      outputLayout: 'list'
    },
    html: `
<div class="view-builder">
  <div class="builder-header">
    <h2>{{serviceName}}</h2>
    <p>Build your configuration</p>
  </div>
  <div class="builder-main">
    <div class="builder-config">
      <form id="calc-form">
        {{#inputs}}
        <div class="config-row">
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
        <button type="submit" class="btn-calculate">Build</button>
      </form>
    </div>
    <div class="builder-preview">
      <div class="preview-title">Configuration</div>
      {{#outputs}}
      <div class="preview-item">
        <div class="preview-label">{{title}}</div>
        <div class="preview-value">{{value}}</div>
      </div>
      {{/outputs}}
    </div>
  </div>
</div>
    `.trim(),
    css: `
body {
  margin: 0;
  padding: var(--container-padding);
  background: var(--container-bg);
}

.view-builder {
  font-family: var(--font-family);
  max-width: 900px;
  margin: 0 auto;
}

.builder-header {
  background: var(--content-bg);
  padding: 32px;
  text-align: center;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
  margin-bottom: 20px;
}

.builder-header h2 {
  margin: 0 0 8px 0;
  color: var(--heading-color);
  font-size: var(--heading-font-size);
  font-weight: var(--heading-font-weight);
  font-family: var(--heading-font-family);
}

.builder-header p {
  margin: 0;
  color: var(--label-color);
  font-size: 14px;
}

.builder-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.builder-config {
  background: var(--content-bg);
  padding: 24px;
  border-radius: var(--content-border-radius);
  border: var(--content-border);
  box-shadow: var(--content-shadow);
}

.config-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.config-row label {
  font-weight: var(--input-label-font-weight);
  color: var(--input-label-color);
  font-size: var(--input-label-font-size);
  text-align: right;
}

.config-row input {
  padding: 8px 12px;
  background: var(--input-bg);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  color: var(--text-color);
  transition: border 0.2s;
}

.config-row input:focus {
  outline: none;
  border: var(--input-focus-border);
}

.btn-calculate {
  width: 100%;
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-calculate:hover {
  background: var(--button-hover-bg);
}

.builder-preview {
  background: var(--input-section-bg);
  padding: 24px;
  border-radius: var(--content-border-radius);
  border: 2px dashed var(--result-divider-color);
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 20px;
  text-align: center;
}

.preview-item {
  padding: 12px 16px;
  background: var(--content-bg);
  border-radius: var(--content-border-radius);
  margin-bottom: 12px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  font-size: 11px;
  color: var(--result-label-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.preview-value {
  font-size: var(--result-value-font-size);
  font-weight: var(--result-value-font-weight);
  color: var(--result-value-color);
}

@media (max-width: 700px) {
  .builder-main {
    grid-template-columns: 1fr;
  }
  .config-row {
    grid-template-columns: 1fr;
  }
  .config-row label {
    text-align: left;
  }
}
    `.trim()
  }
};
