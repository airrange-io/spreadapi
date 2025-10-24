'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SYSTEM_TEMPLATES, COMMON_INPUT_CSS, COMMON_INPUT_JS } from '@/lib/systemTemplates';
import { renderTemplate, getInputType, formatValue, generateOptimizedInput } from '@/lib/mustacheRenderer';
import { parseThemeFromQuery, applyThemeOverrides, generateThemeCSS, getAllSupportedParameters } from '@/lib/viewThemes';

interface WebViewRendererProps {
  serviceId: string;
  viewId: string;
  queryParams: { [key: string]: string | string[] | undefined };
  isInteractive?: boolean;
  token?: string;
  inputsMetadata?: any[]; // Full input metadata from Redis (includes allowedValues, min, max, etc.)
}


const WebViewRenderer: React.FC<WebViewRendererProps> = ({
  serviceId,
  viewId,
  queryParams,
  isInteractive = false,
  token,
  inputsMetadata = []
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string>('');
  const [viewMode, setViewMode] = useState<string>('all');

  useEffect(() => {
    async function fetchAndRender() {
      try {
        setLoading(true);
        setError(null);

        // Get the template (system templates only for now)
        const template = SYSTEM_TEMPLATES[viewId];
        if (!template) {
          throw new Error(`Template '${viewId}' not found`);
        }

        // Build API URL with query params from URL
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
        // Note: For embedded views, all parameters should come from the URL
        const apiUrl = new URL(`${origin}/api/v1/services/${serviceId}/execute`);

        // Parse theme from query params
        const urlSearchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value) {
            urlSearchParams.append(key, String(value));
          }
        });
        const { theme, overrides } = parseThemeFromQuery(urlSearchParams);
        const themeStyles = applyThemeOverrides(theme, overrides);

        // Extract viewMode from query params
        const currentViewMode = (queryParams.viewMode as string) || 'all'; // 'all' | 'results' | 'inputs'
        setViewMode(currentViewMode);

        // Extract nocaption parameter
        const noCaption = queryParams.nocaption === 'true';

        // Add all query params from URL to API call (exclude interactive, token, theme, viewMode, nocaption, and all theme parameters)
        const themeParams = getAllSupportedParameters();
        const excludeFromApi = ['viewId', 'interactive', 'token', 'theme', 'viewMode', 'nocaption', '_t', ...themeParams];

        Object.entries(queryParams).forEach(([key, value]) => {
          if (value && !excludeFromApi.includes(key)) {
            apiUrl.searchParams.append(key, String(value));
          }
        });

        // Call the API
        const response = await fetch(apiUrl.toString());
        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Use inputsMetadata from props (server-side fetched from Redis)
        const enrichedInputs = (data.inputs || []).map((input: any) => {
          // Find matching metadata for this input
          const metadata = inputsMetadata.find((m: any) => m.name === input.name) || {};

          const inputWithValue = {
            ...metadata, // Include metadata (allowedValues, min, max, format, etc.)
            ...input,    // Override with execution data
            // Use API response value first (already validated/coerced), fallback to URL param
            value: input.value !== undefined && input.value !== null && input.value !== ''
              ? input.value
              : (queryParams[input.name] || ''),
            inputType: getInputType(input.type || metadata.type),
            placeholder: input.placeholder || metadata.placeholder || ''
          };

          return {
            ...inputWithValue,
            optimizedHtml: generateOptimizedInput(inputWithValue)
          };
        });

        // Prepare template data
        const templateData = {
          serviceId,
          serviceName: data.serviceName || 'API Results',
          serviceDescription: data.serviceDescription || '',
          interactive: isInteractive,
          token: token || '',
          inputs: enrichedInputs,
          outputs: (data.outputs || []).map((output: any) => ({
            name: output.name,
            title: output.title || output.name,  // Ensure title is always set
            value: formatValue(output),
            formatString: output.formatString
          }))
        };

        // Render template
        let renderedHtml = renderTemplate(template.html, templateData);

        // Add inline edit link after title in results mode (BEFORE wrapping)
        if (currentViewMode === 'results') {
          const editLink = `<a href="#" id="edit-inputs-btn" style="margin-left: 12px; font-size: 0.6em; color: #667eea; text-decoration: none; font-weight: normal; transition: color 0.2s;" onmouseover="this.style.color='#5568d3'" onmouseout="this.style.color='#667eea'">edit</a>`;

          // Try to inject after h2 first (most common in templates)
          if (renderedHtml.includes('</h2>')) {
            renderedHtml = renderedHtml.replace('</h2>', `${editLink}</h2>`);
          } else if (renderedHtml.includes('</h1>')) {
            renderedHtml = renderedHtml.replace('</h1>', `${editLink}</h1>`);
          } else {
            // Fallback: add as a floating button
            renderedHtml = `<a href="#" id="edit-inputs-btn" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 8px 16px; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">Edit</a>${renderedHtml}`;
          }
        }

        // Inject theme CSS variables and template CSS
        const themeCss = generateThemeCSS(themeStyles);

        // Add viewMode-specific CSS to hide sections
        const noCaptionCss = noCaption ? `
/* No Caption CSS - Hide titles and headings */
h1, h2, h3, h4, h5, h6,
.service-name,
.tool-title,
.focus-header,
.row-header,
.card-header h2,
.view-table h2,
.compact-header h3,
.column-header h2,
.grid-header h2,
.badges-header h2,
.calc-header h2,
.split-header h2,
.form-header h2,
.pricing-header h2,
.analyzer-header h2,
.widget-header h3,
.estimator-container h2,
.builder-header h2 {
  display: none !important;
}

/* Adjust padding/margins for views that had headers */
.view-card .card-header,
.calc-header,
.split-header,
.form-header,
.pricing-header,
.analyzer-header,
.widget-header,
.builder-header {
  display: none !important;
}
` : '';

        const viewModeCss = `
/* ViewMode CSS - Hide sections based on viewMode parameter */
.view-mode-results form,
.view-mode-results .calc-inputs,
.view-mode-results .input-section,
.view-mode-results .input-panel,
.view-mode-results .estimator-inputs,
.view-mode-results .builder-config,
.view-mode-results .widget-controls,
.view-mode-results .column-inputs,
.view-mode-results .split-left,
.view-mode-results .form-body,
.view-mode-results .tool-form,
.view-mode-results .step-content form,
.view-mode-results .pricing-inputs,
.view-mode-results .compact-form,
.view-mode-results #calc-form {
  display: none !important;
}

.view-mode-inputs .results-section,
.view-mode-inputs .card-results,
.view-mode-inputs .calc-results,
.view-mode-inputs .results-panel,
.view-mode-inputs .column-results,
.view-mode-inputs .split-right,
.view-mode-inputs .tool-results,
.view-mode-inputs .wizard-result,
.view-mode-inputs .pricing-breakdown,
.view-mode-inputs .results-table,
.view-mode-inputs .compact-results,
.view-mode-inputs .two-columns,
.view-mode-inputs .results-grid,
.view-mode-inputs .widget-metrics,
.view-mode-inputs .breakdown-list {
  display: none !important;
}

/* Center content in inputs and results modes */
.view-mode-results body,
.view-mode-inputs body {
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
}

/* Make compact view container use full width */
.view-mode-inputs .view-compact,
.view-mode-results .view-compact {
  width: 100% !important;
}

/* Form + Results template - make results standalone larger */
.view-mode-results .view-form-card {
  max-width: 700px !important;
}

/* Quick Converter - increase input width */
.view-mode-inputs .view-quick-tool,
.view-mode-results .view-quick-tool {
  max-width: 600px !important;
}

/* Live Widget - allow inputs to wrap to next line */
.view-mode-inputs .view-widget,
.view-mode-results .view-widget,
.view-mode-all .view-widget {
  overflow: visible !important;
}

.view-mode-inputs .widget-controls,
.view-mode-results .widget-controls,
.view-mode-all .widget-controls {
  flex-wrap: wrap !important;
}

.view-mode-inputs .widget-input,
.view-mode-results .widget-input,
.view-mode-all .widget-input {
  flex: 1 1 140px !important;
  min-width: 140px !important;
}

.view-mode-inputs .btn-update,
.view-mode-results .btn-update,
.view-mode-all .btn-update {
  flex: 0 0 auto !important;
  margin-top: 0 !important;
}

/* Config Builder - hide preview in inputs mode */
.view-mode-inputs .builder-preview {
  display: none !important;
}

.view-mode-inputs .builder-config {
  grid-column: 1 / -1 !important;
}
`;

        renderedHtml = `<style>${themeCss}\n\n${COMMON_INPUT_CSS}\n\n${noCaptionCss}\n\n${viewModeCss}\n\n${template.css}</style>\n<div class="view-mode-wrapper view-mode-${currentViewMode}">\n${renderedHtml}\n</div>\n${COMMON_INPUT_JS}`;

        setHtml(renderedHtml);
      } catch (err: any) {
        console.error('Error rendering web view:', err);
        setError(err.message || 'Failed to load view');
      } finally {
        setLoading(false);
      }
    }

    fetchAndRender();
  }, [serviceId, viewId, queryParams]);

  // Attach form handler and edit button handler after HTML is rendered
  useEffect(() => {
    if (!html || !isInteractive) return;

    // Attach form submit handler
    const form = document.getElementById('calc-form');
    if (form) {
      const handleSubmit = (e: Event) => {
        e.preventDefault();

        // Get list of percentage input names for transformation
        const percentageInputs = form.querySelectorAll('input.percentage-input[data-is-percentage="true"]');
        const percentageInputNames = new Set(
          Array.from(percentageInputs).map((input: any) => input.name)
        );

        // Get current URL params (to preserve theme, etc.)
        const currentUrl = new URL(window.location.href);
        const existingParams = new URLSearchParams(currentUrl.search);

        // Build new params from form data
        const formData = new FormData(form as HTMLFormElement);
        const newParams = new URLSearchParams();

        // Add all existing params EXCEPT form field names and special params
        const formFieldNames = Array.from(formData.keys());
        existingParams.forEach((value, key) => {
          if (!formFieldNames.includes(key) && key !== 'viewMode' && key !== '_t') {
            newParams.append(key, value);
          }
        });

        // Add form data with percentage transformation: display (0-100) -> storage (0-1)
        formData.forEach((value, key) => {
          let finalValue = value.toString();

          // Transform percentage values: 42 -> 0.42
          if (percentageInputNames.has(key)) {
            const numValue = parseFloat(finalValue);
            if (!isNaN(numValue)) {
              finalValue = (numValue / 100).toString();
            }
          }

          newParams.append(key, finalValue);
        });

        // Add/update special params
        newParams.set('token', token || '');
        newParams.set('interactive', 'true');

        // Set target viewMode: inputs -> results, results -> results, all -> all
        if (viewMode === 'inputs') {
          newParams.set('viewMode', 'results');
        } else if (viewMode === 'results') {
          newParams.set('viewMode', 'results');
        }

        const newUrl = window.location.pathname + '?' + newParams.toString();
        router.push(newUrl);
      };

      form.addEventListener('submit', handleSubmit);

      // Attach edit button/link handler
      const editBtn = document.getElementById('edit-inputs-btn');
      if (editBtn) {
        const handleEdit = (e: Event) => {
          e.preventDefault();
          const url = new URL(window.location.href);
          url.searchParams.set('viewMode', 'inputs');
          router.push(url.pathname + url.search);
        };
        editBtn.addEventListener('click', handleEdit);

        // Cleanup
        return () => {
          form.removeEventListener('submit', handleSubmit);
          editBtn.removeEventListener('click', handleEdit);
        };
      }

      // Cleanup (if no edit button)
      return () => {
        form.removeEventListener('submit', handleSubmit);
      };
    }
  }, [html, isInteractive, viewMode, token, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center'
        }}>
          <div className="loading-dot" style={{
            animationDelay: '0s'
          }} />
          <div className="loading-dot" style={{
            animationDelay: '0.2s'
          }} />
          <div className="loading-dot" style={{
            animationDelay: '0.4s'
          }} />
        </div>
        <style>{`
          .loading-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--primary-color, #667eea);
            animation: bounce 1.4s infinite ease-in-out both;
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff2f0',
        border: '1px solid #ffccc7',
        borderRadius: '4px',
        margin: '20px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#cf1322',
          marginBottom: '8px'
        }}>
          Error Loading View
        </div>
        <div style={{
          fontSize: '14px',
          color: '#595959'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto'
      }}
    />
  );
};

export default WebViewRenderer;
