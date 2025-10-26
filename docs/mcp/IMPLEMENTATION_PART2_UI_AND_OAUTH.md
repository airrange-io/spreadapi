# Implementation Part 2: UI Components & OAuth Flow

**Related:** IMPLEMENTATION_URL_BASED_SINGLE_SERVICE.md
**Created:** 2025-10-26
**Focus:** Service MCP Settings UI, Simplified OAuth, Claude Desktop Config

---

## Table of Contents

1. [Service Detail Page - MCP Settings Section](#service-detail-page---mcp-settings-section)
2. [Simplified ChatGPT OAuth Flow](#simplified-chatgpt-oauth-flow)
3. [Claude Desktop Configuration](#claude-desktop-configuration)
4. [Service Token Management UI](#service-token-management-ui)
5. [Testing the Complete Flow](#testing-the-complete-flow)

---

## Service Detail Page - MCP Settings Section

### Location in UI

**Page:** `/app/services/[id]/page.tsx` (or wherever service detail is shown)

**Placement:** After "API Tokens" section, before "Analytics"

```
Service Detail Page:
├── Overview
├── Inputs/Outputs
├── API Tokens ← Existing
├── MCP Settings ← NEW SECTION
├── Analytics
└── Danger Zone
```

### UI Component

**File:** `/app/components/ServiceMCPSettings.tsx`

```tsx
'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ServiceMCPSettingsProps {
  serviceId: string;
  serviceName: string;
  needsToken: boolean;
}

export default function ServiceMCPSettings({
  serviceId,
  serviceName,
  needsToken
}: ServiceMCPSettingsProps) {
  const [copiedChatGPT, setCopiedChatGPT] = useState(false);
  const [copiedClaude, setCopiedClaude] = useState(false);

  const mcpUrl = `https://spreadapi.io/api/mcp/service/${serviceId}`;

  const copyToClipboard = async (text: string, type: 'chatgpt' | 'claude') => {
    await navigator.clipboard.writeText(text);
    if (type === 'chatgpt') {
      setCopiedChatGPT(true);
      setTimeout(() => setCopiedChatGPT(false), 2000);
    } else {
      setCopiedClaude(true);
      setTimeout(() => setCopiedClaude(false), 2000);
    }
  };

  const claudeConfig = `{
  "mcpServers": {
    "${serviceId}": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "${mcpUrl}"${needsToken ? ',\n        "SPREADAPI_TOKEN": "your_service_token_here"' : ''}
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">MCP Integration</h2>
        <p className="mt-2 text-sm text-gray-600">
          Connect this service to AI assistants like ChatGPT and Claude Desktop using the Model Context Protocol.
        </p>
      </div>

      {/* MCP URL Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">MCP Server URL</h3>
            <p className="mt-1 text-xs text-blue-700">
              Use this URL to connect {serviceName} to your AI assistant
            </p>
            <code className="mt-3 block bg-white px-3 py-2 rounded border border-blue-300 text-sm font-mono text-gray-900 break-all">
              {mcpUrl}
            </code>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      {needsToken && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Authentication Required
          </h3>
          <p className="mt-2 text-sm text-yellow-800">
            This service requires a service token for access. Manage your tokens in the "API Tokens" section above.
          </p>
        </div>
      )}

      {/* ChatGPT Instructions */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
            </svg>
            ChatGPT
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            <li>
              Open <strong>ChatGPT</strong> → Settings → <strong>Add MCP Server</strong>
            </li>
            <li>
              Enter the MCP Server URL:
              <div className="mt-2 relative">
                <code className="block bg-gray-100 px-3 py-2 rounded border border-gray-300 text-xs font-mono pr-12">
                  {mcpUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(mcpUrl, 'chatgpt')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                  title="Copy URL"
                >
                  {copiedChatGPT ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </li>
            <li>
              ChatGPT will redirect you to authorize the connection
            </li>
            {needsToken && (
              <li>
                <strong>Enter your service token</strong> when prompted
                <p className="mt-1 text-xs text-gray-600">
                  Get a token from the "API Tokens" section above
                </p>
              </li>
            )}
            <li>
              Click <strong>Authorize</strong>
            </li>
            <li>
              ✅ Connected! Start using {serviceName} in your conversations
            </li>
          </ol>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> ChatGPT will automatically know what this calculator does. Just ask questions naturally!
            </p>
          </div>
        </div>
      </div>

      {/* Claude Desktop Instructions */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.2796 14.2101C21.9092 13.5093 21.1078 12.6055 19.2648 11.2001L18.9944 10.9813C18.8088 10.8409 18.7016 10.6301 18.6972 10.4001C18.6928 10.1701 18.7916 9.95526 18.9728 9.80806L19.2648 9.59846C21.1078 8.19286 21.9092 7.28906 22.2796 6.58826C22.9284 5.26586 22.6436 3.67826 21.5768 2.61146C20.51 1.54466 18.9224 1.25986 17.6 1.90866C16.8992 2.27906 15.9954 3.08046 14.5898 4.92346L14.371 5.19386C14.2306 5.37946 14.0198 5.48666 13.7898 5.49106C13.5598 5.49546 13.345 5.39666 13.1978 5.21546L12.9882 4.92346C11.5826 3.08046 10.6788 2.27906 9.978 1.90866C8.6556 1.25986 7.068 1.54466 6.0012 2.61146C4.9344 3.67826 4.6496 5.26586 5.2984 6.58826C5.6688 7.28906 6.4702 8.19286 8.3132 9.59846L8.5836 9.81726C8.7692 9.95766 8.8764 10.1685 8.8808 10.3985C8.8852 10.6285 8.7864 10.8433 8.6052 10.9905L8.3132 11.2001C6.4702 12.6057 5.6688 13.5095 5.2984 14.2103C4.6496 15.5327 4.9344 17.1203 6.0012 18.1871C7.068 19.2539 8.6556 19.5387 9.978 18.8899C10.6788 18.5195 11.5826 17.7181 12.9882 15.8751L13.207 15.6047C13.3474 15.4191 13.5582 15.3119 13.7882 15.3075C14.0182 15.3031 14.233 15.4019 14.3802 15.5831L14.5898 15.8751C15.9954 17.7181 16.8992 18.5195 17.6 18.8899C18.9224 19.5387 20.51 19.2539 21.5768 18.1871C22.6436 17.1203 22.9284 15.5327 22.2796 14.2101Z"/>
            </svg>
            Claude Desktop
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            <li>
              Install the SpreadAPI MCP bridge:
              <code className="block mt-2 bg-gray-100 px-3 py-2 rounded border border-gray-300 text-xs font-mono">
                npm install -g spreadapi-mcp
              </code>
            </li>
            <li>
              Open your Claude Desktop config file:
              <ul className="ml-6 mt-2 space-y-1 text-xs text-gray-600">
                <li>macOS: <code className="bg-gray-100 px-2 py-0.5 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                <li>Windows: <code className="bg-gray-100 px-2 py-0.5 rounded">%APPDATA%\Claude\claude_desktop_config.json</code></li>
              </ul>
            </li>
            <li>
              Add this configuration:
              <div className="mt-2 relative">
                <pre className="bg-gray-900 text-gray-100 px-3 py-3 rounded text-xs font-mono overflow-x-auto pr-12">
                  {claudeConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(claudeConfig, 'claude')}
                  className="absolute right-2 top-2 p-1 hover:bg-gray-700 rounded"
                  title="Copy config"
                >
                  {copiedClaude ? (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {needsToken && (
                <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                  <strong>⚠️  Don't forget:</strong> Replace <code className="bg-yellow-100 px-1 rounded">your_service_token_here</code> with your actual service token from the "API Tokens" section above.
                </p>
              )}
            </li>
            <li>
              Save the file and <strong>restart Claude Desktop</strong>
            </li>
            <li>
              ✅ {serviceName} is now available in Claude Desktop!
            </li>
          </ol>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Claude will automatically understand what this calculator does. Just describe what you need!
            </p>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-3">Example Prompts</h3>
        <div className="space-y-2">
          <div className="bg-white rounded border border-purple-200 p-3">
            <p className="text-sm text-gray-700">
              "Calculate {serviceName.toLowerCase()} for..."
            </p>
          </div>
          <div className="bg-white rounded border border-purple-200 p-3">
            <p className="text-sm text-gray-700">
              "Compare three scenarios using {serviceName.toLowerCase()}..."
            </p>
          </div>
          <div className="bg-white rounded border border-purple-200 p-3">
            <p className="text-sm text-gray-700">
              "What parameters does {serviceName.toLowerCase()} need?"
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <details className="border border-gray-200 rounded-lg">
        <summary className="px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-900">
          Advanced Features
        </summary>
        <div className="p-4 space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900">Batch Calculations</h4>
            <p className="text-xs text-gray-600 mt-1">
              Compare multiple scenarios side-by-side. AI can automatically use <code className="bg-gray-100 px-1 rounded">batch_calculate</code> to compare options.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Save & Load Calculations</h4>
            <p className="text-xs text-gray-600 mt-1">
              Save calculations for later comparison. AI can use <code className="bg-gray-100 px-1 rounded">save_calculation</code> and <code className="bg-gray-100 px-1 rounded">load_calculation</code> to remember scenarios.
            </p>
          </div>
          {serviceHasAreas && (
            <div>
              <h4 className="font-semibold text-gray-900">Editable Data Areas</h4>
              <p className="text-xs text-gray-600 mt-1">
                This service has editable data tables. AI can read and update them using area-specific tools.
              </p>
            </div>
          )}
        </div>
      </details>

      {/* Documentation Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <a
          href="https://docs.spreadapi.io/mcp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          📚 Read full MCP integration documentation →
        </a>
      </div>
    </div>
  );
}
```

### Integration into Service Detail Page

**File:** `/app/services/[id]/page.tsx` (or similar)

```tsx
import ServiceMCPSettings from '@/components/ServiceMCPSettings';

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch service data
  const serviceData = await getServiceData(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Existing sections... */}

      {/* Overview */}
      <section>...</section>

      {/* Inputs/Outputs */}
      <section>...</section>

      {/* API Tokens */}
      <section id="api-tokens">
        <h2>API Tokens</h2>
        {/* Existing API token management */}
      </section>

      {/* MCP Settings - NEW */}
      <section id="mcp-settings" className="mt-12">
        <ServiceMCPSettings
          serviceId={id}
          serviceName={serviceData.title}
          needsToken={serviceData.needsToken}
        />
      </section>

      {/* Analytics */}
      <section>...</section>
    </div>
  );
}
```

---

## Simplified ChatGPT OAuth Flow

### Step 2: Update OAuth Authorization Page

**File:** `/app/oauth/authorize/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OAuthAuthorizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceId = searchParams.get('service');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const state = searchParams.get('state');

  const [serviceData, setServiceData] = useState(null);
  const [serviceToken, setServiceToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadServiceData() {
      if (!serviceId) {
        setError('Missing service parameter');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/services/${serviceId}/metadata`);
        if (!response.ok) {
          throw new Error('Service not found');
        }

        const data = await response.json();
        setServiceData(data);
      } catch (err) {
        setError('Failed to load service information');
      } finally {
        setLoading(false);
      }
    }

    loadServiceData();
  }, [serviceId]);

  async function handleAuthorize() {
    if (serviceData?.needsToken && !serviceToken) {
      setError('Service token is required for this service');
      return;
    }

    setAuthorizing(true);
    setError('');

    try {
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          serviceToken: serviceData?.needsToken ? serviceToken : null,
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          state
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Authorization failed');
      }

      const data = await response.json();

      // Redirect back to ChatGPT with authorization code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', data.code);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      window.location.href = redirectUrl.toString();
    } catch (err) {
      setError(err.message);
      setAuthorizing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service information...</p>
        </div>
      </div>
    );
  }

  if (error && !serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Connect to SpreadAPI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ChatGPT wants to access this service
          </p>
        </div>

        {/* Service Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-blue-900">
                {serviceData?.title}
              </h3>
              <p className="mt-1 text-xs text-blue-700">
                {serviceData?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900">
            ChatGPT will be able to:
          </h3>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start text-sm text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Execute {serviceData?.title} calculations
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Save and load calculation scenarios
            </li>
            {serviceData?.areas?.length > 0 && (
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Read and update editable data areas
              </li>
            )}
          </ul>
        </div>

        {/* Service Token Input (if required) */}
        {serviceData?.needsToken && (
          <div className="mt-6">
            <label htmlFor="serviceToken" className="block text-sm font-medium text-gray-700">
              Service Token <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              This service requires authentication. Enter your service token below.
            </p>
            <input
              id="serviceToken"
              type="password"
              value={serviceToken}
              onChange={(e) => setServiceToken(e.target.value)}
              placeholder="service_abc123..."
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Don't have a token? Get one from the service creator.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleAuthorize}
            disabled={authorizing}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authorizing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authorizing...
              </>
            ) : (
              'Authorize'
            )}
          </button>

          <button
            onClick={() => window.close()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-900">Privacy & Security</h4>
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">🔒</span>
              <span>Your data is never stored on our servers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">⚡</span>
              <span>Calculations are stateless and immediate</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔑</span>
              <span>You can revoke access anytime from the service page</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Update OAuth Authorization Backend

**File:** `/app/api/oauth/authorize/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createAuthorizationCode } from '@/lib/oauth-codes';
import redis from '@/lib/redis';
import { rateLimitByIP, createRateLimitResponse } from '@/lib/rate-limiter';

/**
 * Simplified OAuth Authorization for Single Service
 *
 * User provides:
 * - serviceId (from URL parameter)
 * - serviceToken (optional - only if service.needsToken: true)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      serviceId,
      serviceToken,  // Optional - only if service requires it
      client_id,
      redirect_uri,
      code_challenge,
      code_challenge_method,
      state
    } = body;

    // Rate limiting
    const rateCheck = await rateLimitByIP(request, 'oauth_authorize', 10, 60);
    if (rateCheck.limited) {
      return NextResponse.json(
        createRateLimitResponse(rateCheck.retryAfter),
        { status: 429 }
      );
    }

    // Validate required parameters
    if (!serviceId) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'serviceId is required' },
        { status: 400 }
      );
    }

    if (!client_id || !redirect_uri || !code_challenge) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing OAuth parameters' },
        { status: 400 }
      );
    }

    if (code_challenge_method !== 'S256') {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code_challenge_method must be S256' },
        { status: 400 }
      );
    }

    // Load service metadata
    const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Service not found or not published' },
        { status: 400 }
      );
    }

    // Validate service token (if service requires it)
    if (serviceData.needsToken === 'true') {
      if (!serviceToken) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Service token required' },
          { status: 400 }
        );
      }

      // Validate service token
      const tokenData = await redis.hGetAll(`service:${serviceId}:token:${serviceToken}`);

      if (!tokenData || Object.keys(tokenData).length === 0 || tokenData.isActive !== 'true') {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Invalid or inactive service token' },
          { status: 400 }
        );
      }
    }

    // Validate redirect_uri
    const allowedRedirectUris = [
      'https://chatgpt.com/oauth/callback',
      'https://chat.openai.com/oauth/callback',
      'https://chatgpt.com/connector_platform_oauth_redirect',
      'https://chatgpt.com/aip/g-oauth-callback',
      'https://chatgpt.com/g/oauth/callback',
    ];

    if (!allowedRedirectUris.includes(redirect_uri)) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const authorizationCode = await createAuthorizationCode({
      serviceId: serviceId,
      clientId: client_id,
      redirectUri: redirect_uri,
      scope: 'mcp:read mcp:write',
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method
    });

    // Store service token (if provided) - will be used during token exchange
    if (serviceToken) {
      await redis.set(
        `oauth:service_token:${authorizationCode}`,
        serviceToken,
        { EX: 600 }  // 10 minutes
      );
    }

    console.log('[OAuth] Authorization code issued:', {
      code: authorizationCode.substring(0, 16) + '...',
      service: serviceId,
      client_id,
      has_token: !!serviceToken
    });

    return NextResponse.json({
      code: authorizationCode,
      state: state  // Echo state back
    });
  } catch (error) {
    console.error('[OAuth] Error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 4: Update OAuth Token Exchange

**File:** `/app/api/oauth/token/route.js`

```javascript
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getAuthorizationCode,
  deleteAuthorizationCode,
  verifyPKCE,
} from '@/lib/oauth-codes';
import redis from '@/lib/redis';

/**
 * OAuth Token Exchange - Simplified for Single Service
 */
export async function POST(request) {
  try {
    // Parse request
    const contentType = request.headers.get('content-type');
    let body;

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    const {
      grant_type,
      code,
      client_id,
      redirect_uri,
      code_verifier,
    } = body;

    // Validate parameters
    if (grant_type !== 'authorization_code') {
      return NextResponse.json(
        { error: 'unsupported_grant_type' },
        { status: 400 }
      );
    }

    if (!code || !client_id || !redirect_uri || !code_verifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Retrieve authorization code
    const codeData = await getAuthorizationCode(code);

    if (!codeData) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Verify client_id and redirect_uri
    if (codeData.clientId !== client_id || codeData.redirectUri !== redirect_uri) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Parameter mismatch' },
        { status: 400 }
      );
    }

    // Verify PKCE
    if (!verifyPKCE(code_verifier, codeData.codeChallenge, codeData.codeChallengeMethod)) {
      await deleteAuthorizationCode(code);
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'PKCE verification failed' },
        { status: 400 }
      );
    }

    // Retrieve service token (if it was provided during authorization)
    const serviceToken = await redis.get(`oauth:service_token:${code}`);

    // Generate OAuth access token
    const oauthAccessToken = `oat_${crypto.randomBytes(32).toString('hex')}`;

    // Store OAuth token metadata
    const expiresIn = 43200;  // 12 hours

    await redis.hSet(`oauth:token:${oauthAccessToken}`, {
      service_id: codeData.serviceId,
      service_token: serviceToken || '',  // May be empty if service is public
      client_id: client_id,
      scope: codeData.scope,
      authorized_at: Date.now().toString()
    });

    await redis.expire(`oauth:token:${oauthAccessToken}`, expiresIn);

    // Cleanup
    await deleteAuthorizationCode(code);
    await redis.del(`oauth:service_token:${code}`);

    console.log('[OAuth Token] Access token issued:', {
      client_id,
      service_id: codeData.serviceId,
      expires_in: expiresIn,
      has_service_token: !!serviceToken
    });

    return NextResponse.json(
      {
        access_token: oauthAccessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: codeData.scope,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[OAuth Token] Error:', error);
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    );
  }
}
```

---

## Claude Desktop Configuration

### NPM Bridge Package Update

**File:** `/packages/spreadapi-mcp/index.js`

**Add URL-based mode support:**

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Support both modes:
// 1. Legacy: SPREADAPI_TOKEN (multi-service)
// 2. New: SPREADAPI_URL (single-service with URL)
const SPREADAPI_URL = process.env.SPREADAPI_URL;
const SPREADAPI_TOKEN = process.env.SPREADAPI_TOKEN;

// Determine mode
const isUrlBased = !!SPREADAPI_URL;

if (!SPREADAPI_URL && !SPREADAPI_TOKEN) {
  console.error('Error: Either SPREADAPI_URL or SPREADAPI_TOKEN must be set');
  process.exit(1);
}

// Create MCP server
const server = new Server({
  name: 'spreadapi-mcp',
  version: '1.2.0'
}, {
  capabilities: {
    tools: {},
    resources: { subscribe: false }
  }
});

async function callSpreadAPI(method, params = {}) {
  const url = isUrlBased
    ? SPREADAPI_URL
    : (process.env.SPREADAPI_BRIDGE_URL || 'https://spreadapi.io/api/mcp/bridge');

  const headers = {
    'Content-Type': 'application/json'
  };

  // Add authorization
  if (SPREADAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${SPREADAPI_TOKEN}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'MCP request failed');
  }

  return data.result;
}

// Forward MCP methods to SpreadAPI endpoint
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  return await callSpreadAPI('initialize', request.params);
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return await callSpreadAPI('tools/list');
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await callSpreadAPI('tools/call', request.params);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('SpreadAPI MCP bridge started');
if (isUrlBased) {
  console.error(`Mode: URL-based (${SPREADAPI_URL})`);
} else {
  console.error('Mode: Token-based (legacy)');
}
```

### User Configuration Example

**For public service:**
```json
{
  "mcpServers": {
    "mortgage": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/mortgage-calc"
      }
    }
  }
}
```

**For private service:**
```json
{
  "mcpServers": {
    "tax-calc": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/tax-calc",
        "SPREADAPI_TOKEN": "service_abc123..."
      }
    }
  }
}
```

---

## Service Token Management UI

If you don't already have it, add a simple service token management UI in the "API Tokens" section.

**Quick Addition:**

```tsx
// In service detail page, API Tokens section

<div className="mt-6">
  <h3 className="text-lg font-semibold">Service Tokens</h3>
  <p className="text-sm text-gray-600 mt-1">
    Create tokens to allow authenticated access to this service via API or MCP.
  </p>

  <button
    onClick={handleCreateServiceToken}
    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Generate Service Token
  </button>

  {/* List existing tokens */}
  <div className="mt-4 space-y-2">
    {serviceTokens.map(token => (
      <div key={token.id} className="flex items-center justify-between p-3 border rounded">
        <div>
          <code className="text-sm font-mono">{token.id}</code>
          <p className="text-xs text-gray-500 mt-1">
            Created: {token.created} • Last used: {token.lastUsed}
          </p>
        </div>
        <button
          onClick={() => handleRevokeToken(token.id)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Revoke
        </button>
      </div>
    ))}
  </div>
</div>
```

---

## Testing the Complete Flow

### Test 1: Public Service + ChatGPT

```
1. Create a public service (needsToken: false)
2. Navigate to service detail page
3. See MCP Settings section
4. Copy ChatGPT URL
5. Open ChatGPT → Add MCP server
6. Paste URL
7. OAuth redirect → No token input shown
8. Click Authorize
9. Redirect back to ChatGPT
10. ✅ Connected
11. Test: "Calculate..."
```

### Test 2: Private Service + ChatGPT

```
1. Create a private service (needsToken: true)
2. Generate a service token
3. Navigate to service detail page
4. Copy ChatGPT URL
5. Open ChatGPT → Add MCP server
6. Paste URL
7. OAuth redirect → Token input shown
8. Enter service token
9. Click Authorize
10. Redirect back to ChatGPT
11. ✅ Connected
12. Test: "Calculate..."
```

### Test 3: Public Service + Claude Desktop

```
1. Create a public service
2. Copy Claude Desktop config from UI
3. Paste into claude_desktop_config.json
4. Restart Claude Desktop
5. Test: "Calculate..."
```

### Test 4: Private Service + Claude Desktop

```
1. Create a private service
2. Generate a service token
3. Copy Claude Desktop config (includes SPREADAPI_TOKEN)
4. Replace placeholder with actual token
5. Paste into claude_desktop_config.json
6. Restart Claude Desktop
7. Test: "Calculate..."
```

---

**Next:** See main implementation document for complete backend code and migration strategy.
