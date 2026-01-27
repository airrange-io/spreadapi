'use client';

import { useState, useEffect, useCallback } from 'react';

const ENTERPRISE_MODE_KEY = 'spreadapi-enterprise-mode';

export function useEnterpriseMode() {
  const [isEnterpriseMode, setEnterpriseModeState] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(ENTERPRISE_MODE_KEY);
    setEnterpriseModeState(stored === 'true');
  }, []);

  const setEnterpriseMode = useCallback((enabled: boolean) => {
    localStorage.setItem(ENTERPRISE_MODE_KEY, String(enabled));
    setEnterpriseModeState(enabled);
  }, []);

  return { isEnterpriseMode, setEnterpriseMode };
}
