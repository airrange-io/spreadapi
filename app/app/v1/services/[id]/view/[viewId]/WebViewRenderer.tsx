'use client';

import React, { useEffect, useState } from 'react';
import { SYSTEM_TEMPLATES } from '@/lib/systemTemplates';
import { renderTemplate, getInputType, formatValue } from '@/lib/mustacheRenderer';
import { parseThemeFromQuery, applyThemeOverrides, generateThemeCSS, getAllSupportedParameters } from '@/lib/viewThemes';

interface WebViewRendererProps {
  serviceId: string;
  viewId: string;
  queryParams: { [key: string]: string | string[] | undefined };
  isInteractive?: boolean;
  token?: string;
}


const WebViewRenderer: React.FC<WebViewRendererProps> = ({
  serviceId,
  viewId,
  queryParams,
  isInteractive = false,
  token
}) => {
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
        // Note: For embedded views, all parameters should come from the URL
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
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

        // Add all query params from URL to API call (exclude interactive, token, theme, viewMode, and all theme parameters)
        const themeParams = getAllSupportedParameters();
        const excludeFromApi = ['viewId', 'interactive', 'token', 'theme', 'viewMode', '_t', ...themeParams];

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

        // Prepare template data
        const templateData = {
          serviceId,
          serviceName: data.serviceName || 'API Results',
          serviceDescription: data.serviceDescription || '',
          interactive: isInteractive,
          token: token || '',
          inputs: (data.inputs || []).map((input: any) => ({
            ...input,
            value: queryParams[input.name] || input.value || '',
            inputType: getInputType(input.type),
            placeholder: input.placeholder || ''
          })),
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
          console.log('Adding edit link for results mode');
          console.log('Rendered HTML length:', renderedHtml.length);
          console.log('First 500 chars:', renderedHtml.substring(0, 500));

          const editLink = `<a href="#" id="edit-inputs-btn" style="margin-left: 12px; font-size: 0.6em; color: #667eea; text-decoration: none; font-weight: normal; transition: color 0.2s;" onmouseover="this.style.color='#5568d3'" onmouseout="this.style.color='#667eea'">✏️ edit</a>`;

          // Try to inject after h2 first (most common in templates)
          if (renderedHtml.includes('</h2>')) {
            console.log('Found </h2>, injecting edit link');
            renderedHtml = renderedHtml.replace('</h2>', `${editLink}</h2>`);
          } else if (renderedHtml.includes('</h1>')) {
            console.log('Found </h1>, injecting edit link');
            renderedHtml = renderedHtml.replace('</h1>', `${editLink}</h1>`);
          } else {
            console.log('No h1 or h2 found in rendered HTML');
            // Fallback: add as a floating button
            renderedHtml = `<a href="#" id="edit-inputs-btn" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 8px 16px; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">✏️ Edit</a>${renderedHtml}`;
            console.log('Added floating edit button instead');
          }
        }

        // Inject theme CSS variables and template CSS
        const themeCss = generateThemeCSS(themeStyles);

        // Add viewMode-specific CSS to hide sections
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
`;

        // Add debug badge to show current view mode
        const debugBadge = `
<div style="position: fixed; top: 10px; right: 10px; z-index: 9999; font-size: 10px; color: #999; padding: 2px 6px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
  Mode: ${currentViewMode}
</div>`;

        renderedHtml = `<style>${themeCss}\n\n${viewModeCss}\n\n${template.css}</style>\n<div class="view-mode-wrapper view-mode-${currentViewMode}">\n${debugBadge}\n${renderedHtml}\n</div>`;

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

    console.log('Attaching event handlers, viewMode:', viewMode);

    // Attach form submit handler
    const form = document.getElementById('calc-form');
    if (form) {
      console.log('Form found, attaching submit handler');

      const handleSubmit = (e: Event) => {
        e.preventDefault();
        console.log('Form submitted');

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

        // Add form data
        formData.forEach((value, key) => {
          newParams.append(key, value.toString());
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
        console.log('Redirecting to:', newUrl);
        window.location.href = newUrl;
      };

      form.addEventListener('submit', handleSubmit);

      // Attach edit button/link handler
      const editBtn = document.getElementById('edit-inputs-btn');
      if (editBtn) {
        console.log('Edit link found, attaching handler');
        const handleEdit = (e: Event) => {
          e.preventDefault();
          const url = new URL(window.location.href);
          url.searchParams.set('viewMode', 'inputs');
          window.location.href = url.toString();
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
    } else {
      console.log('Form not found');
    }
  }, [html, isInteractive, viewMode, token]);

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
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '0s'
          }} />
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '0.2s'
          }} />
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '0.4s'
          }} />
        </div>
        <style>{`
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
