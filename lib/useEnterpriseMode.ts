'use client';

import { useState, useCallback } from 'react';

const ENTERPRISE_MODE_KEY = 'spreadapi-enterprise-mode';

export function useEnterpriseMode() {
  const [isEnterpriseMode, setEnterpriseModeState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ENTERPRISE_MODE_KEY) === 'true';
  });

  const setEnterpriseMode = useCallback((enabled: boolean) => {
    localStorage.setItem(ENTERPRISE_MODE_KEY, String(enabled));
    setEnterpriseModeState(enabled);
  }, []);

  return { isEnterpriseMode, setEnterpriseMode };
}
