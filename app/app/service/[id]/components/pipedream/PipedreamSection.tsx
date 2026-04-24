'use client';

import React, { useMemo, useState } from 'react';
import { Button, Typography } from 'antd';
import AppBrowser, { colourFor } from './AppBrowser';
import AccountPicker from './AccountPicker';
import ActionPicker from './ActionPicker';
import ConfigurableForm from './ConfigurableForm';
import GoogleSheetsForm, { isGoogleSheetsReady } from './GoogleSheetsForm';
import type {
  PipedreamAccount,
  PipedreamApp,
  PipedreamComponent,
  PipedreamSource,
} from '@/lib/pipedream/types';

const { Text } = Typography;

export interface PipedreamDraft {
  source: PipedreamSource | null;
  component: PipedreamComponent | null;
  account: PipedreamAccount | null;
}

interface Props {
  externalUserId: string;
  draft: PipedreamDraft;
  onDraftChange: (next: PipedreamDraft) => void;
}

// Orchestrates the app → account → config flow. Keeps no local state of its
// own; all composition lives in `draft`, which the parent owns so it survives
// across modal re-renders and can be persisted on save.
//
// All required fields present ⇒ parent's Fetch-preview button becomes active.
const Field: React.FC<{
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, required, children }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
      {required && <span style={{ color: '#ef4444' }}>*</span>}
      <span>{label}</span>
      {hint && (
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
          {hint}
        </Text>
      )}
    </div>
    {children}
  </div>
);

const PipedreamSection: React.FC<Props> = ({ externalUserId, draft, onDraftChange }) => {
  const { source, component, account } = draft;

  const appSlug = source?.appSlug || null;
  const accountId = source?.accountId || null;
  const actionId = source?.actionId || null;

  // Cache the picked-app metadata (logo, name) for the chip display. In edit
  // mode this starts null and we fall back to slug-derived display; once the
  // user re-picks via the browser, we have the full record again.
  const [pickedApp, setPickedApp] = useState<PipedreamApp | null>(null);

  // When the user clears/swaps an earlier field, all later fields are reset —
  // otherwise we'd keep stale account-bound config around when the app changes.
  const setApp = (nextApp: string | null, meta?: PipedreamApp | null) => {
    setPickedApp(meta || null);
    onDraftChange({
      source: nextApp
        ? {
            type: 'pipedream',
            appSlug: nextApp,
            accountId: '',
            actionId: '',
            externalUserId,
            configuredProps: {},
          }
        : null,
      component: null,
      account: null,
    });
  };

  const setAccount = (nextAccountId: string | null, acc: PipedreamAccount | null) => {
    if (!source) return;
    onDraftChange({
      source: {
        ...source,
        accountId: nextAccountId || '',
        actionId: '',
        configuredProps: {},
      },
      component: null,
      account: acc,
    });
  };

  const setAction = (nextActionId: string | null, comp: PipedreamComponent | null) => {
    if (!source) return;
    onDraftChange({
      source: {
        ...source,
        actionId: nextActionId || '',
        configuredProps: {},
      },
      component: comp,
      account,
    });
  };

  const setConfiguredProps = (props: Record<string, unknown>) => {
    if (!source) return;
    onDraftChange({
      ...draft,
      source: { ...source, configuredProps: props },
    });
  };

  // The app-prop carries the authProvisionId which is already set via account
  // id — don't render it again in the ConfigurableForm.
  const hiddenPropNames = useMemo(
    () => new Set(appSlug ? [appSlug] : []),
    [appSlug],
  );

  // No app picked yet → take over the section with the visual app browser.
  // This matches the "click 'Connected apps' → see provider grid right away"
  // mental model.
  if (!appSlug) {
    return <AppBrowser onSelect={(app) => setApp(app.nameSlug, app)} />;
  }

  // Provider-specific streamlined flows. When a custom form is available for
  // the app (e.g. Google Sheets), skip the generic ActionPicker + Configurable
  // Form chain and render the custom one instead. The stable action id is
  // auto-wired from the providers registry so saved configs stay consistent.
  const isGoogleSheets = appSlug === 'google_sheets';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="App">
        <SelectedAppChip
          app={pickedApp}
          appSlug={appSlug}
          onChange={() => setApp(null)}
        />
      </Field>

      <Field label="Account">
        <AccountPicker appSlug={appSlug} value={accountId} onChange={setAccount} />
      </Field>

      {accountId && isGoogleSheets && (
        <GoogleSheetsForm
          accountId={accountId}
          value={source?.configuredProps || {}}
          onChange={(next) => {
            if (!source) return;
            onDraftChange({
              ...draft,
              source: {
                ...source,
                // Saved sources always target the canonical list-sheet-values
                // action id even though our customFetch bypasses Pipedream's
                // action system at runtime. Keeps the persisted shape clean.
                actionId: source.actionId || 'google_sheets-list-sheet-values',
                configuredProps: next,
              },
            });
          }}
        />
      )}

      {accountId && !isGoogleSheets && (
        <Field label="Action">
          <ActionPicker appSlug={appSlug} value={actionId} onChange={setAction} />
        </Field>
      )}

      {accountId && !isGoogleSheets && actionId && component && (
        <ConfigurableForm
          componentId={component.key}
          initialComponent={component}
          value={source?.configuredProps || {}}
          onChange={setConfiguredProps}
          hiddenPropNames={hiddenPropNames}
        />
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Selected-app chip with logo and a "Change" link. Falls back to a slug-
// derived initial-letter avatar when the full app metadata isn't in scope
// (e.g. on edit-mode load before the apps endpoint has resolved).
// ──────────────────────────────────────────────────────────────────────────

const SelectedAppChip: React.FC<{
  app: PipedreamApp | null;
  appSlug: string;
  onChange: () => void;
}> = ({ app, appSlug, onChange }) => {
  const [imgError, setImgError] = useState(false);
  const displayName = app?.name || appSlug;
  const [from, to] = colourFor(displayName);
  const initial = displayName.charAt(0).toUpperCase();
  const showLogo = !!app?.imgSrc && !imgError;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px 6px 6px',
        border: '1px solid #e9e9ef',
        borderRadius: 8,
        background: '#fff',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 4,
          // Coloured initial-letter fallback gets a gradient; real logos
          // sit on the card background (no grey square around them).
          background: showLogo ? 'transparent' : `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 12,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app!.imgSrc as string}
            alt={displayName}
            onError={() => setImgError(true)}
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        ) : (
          initial
        )}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>{displayName}</span>
      <Button type="link" size="small" onClick={onChange} style={{ padding: 0, height: 'auto' }}>
        Change
      </Button>
    </div>
  );
};

export default PipedreamSection;

export function isPipedreamDraftReady(draft: PipedreamDraft): boolean {
  const s = draft.source;
  if (!s) return false;
  if (!s.appSlug || !s.accountId || !s.externalUserId) return false;
  if (s.appSlug === 'google_sheets') {
    return isGoogleSheetsReady(s.configuredProps || {});
  }
  return !!s.actionId;
}
