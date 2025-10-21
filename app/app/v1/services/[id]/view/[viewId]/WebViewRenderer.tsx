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

        // Add all query params from URL to API call (exclude interactive, token, theme, and all theme parameters)
        const themeParams = getAllSupportedParameters();
        const excludeFromApi = ['viewId', 'interactive', 'token', 'theme', ...themeParams];

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
            ...output,
            value: formatValue(output)
          }))
        };

        // Render template
        let renderedHtml = renderTemplate(template.html, templateData);

        // Inject theme CSS variables and template CSS
        const themeCss = generateThemeCSS(themeStyles);
        renderedHtml = `<style>${themeCss}\n\n${template.css}</style>\n${renderedHtml}`;

        // Add form handler for interactive mode
        if (isInteractive && template.settings.supportsInteractive) {
          const formScript = `
<script>
(function() {
  const form = document.getElementById('calc-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams(formData);
      params.append('token', '${token}');
      params.append('interactive', 'true');
      window.location.href = window.location.pathname + '?' + params.toString();
    });
  }
})();
</script>
          `;
          renderedHtml += formScript;
        }

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
