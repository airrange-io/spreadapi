// Helper functions for managing view preferences

export interface ViewPreference {
  serviceId: string;
  view: 'Settings' | 'Workbook' | 'API' | 'Apps' | 'Usage';
  lastAccessed: string;
}

// Get saved view preference for a service
export const getSavedView = (serviceId: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`service-view-${serviceId}`);
};

// Save view preference for a service
export const saveViewPreference = (serviceId: string, view: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`service-view-${serviceId}`, view);
  
  // Also track in a global list for analytics/cleanup
  updateViewPreferencesList(serviceId, view);
};

// Update global list of view preferences
const updateViewPreferencesList = (serviceId: string, view: string): void => {
  try {
    const allPrefs = localStorage.getItem('all-view-preferences');
    const prefs: ViewPreference[] = allPrefs ? JSON.parse(allPrefs) : [];
    
    // Update or add preference
    const existingIndex = prefs.findIndex(p => p.serviceId === serviceId);
    const newPref: ViewPreference = {
      serviceId,
      view: view as 'Settings' | 'Workbook' | 'API' | 'Apps' | 'Usage',
      lastAccessed: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      prefs[existingIndex] = newPref;
    } else {
      prefs.push(newPref);
    }
    
    // Keep only last 100 preferences to avoid localStorage bloat
    if (prefs.length > 100) {
      prefs.sort((a, b) => b.lastAccessed.localeCompare(a.lastAccessed));
      prefs.splice(100);
    }
    
    localStorage.setItem('all-view-preferences', JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to update view preferences list:', error);
  }
};

// Clear view preference for a specific service
export const clearViewPreference = (serviceId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`service-view-${serviceId}`);
};

// Clear all view preferences (useful for testing)
export const clearAllViewPreferences = (): void => {
  if (typeof window === 'undefined') return;
  
  // Get all keys
  const keys = Object.keys(localStorage);
  
  // Remove all service-view-* keys
  keys.forEach(key => {
    if (key.startsWith('service-view-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Also clear the global list
  localStorage.removeItem('all-view-preferences');
};

// Get smart default view based on service status
export const getSmartDefaultView = (isPublished: boolean, hasWorkbook: boolean): 'Settings' | 'Workbook' | 'API' | 'Apps' | 'Usage' => {
  // Published services default to API
  if (isPublished) {
    return 'API';
  }

  // Draft services without workbook default to Workbook (to create one)
  if (!hasWorkbook) {
    return 'Workbook';
  }

  // Draft services with workbook default to Workbook (for editing)
  return 'Workbook';
};

// Get view usage statistics
export const getViewUsageStats = (): { [key: string]: number } => {
  if (typeof window === 'undefined') return {};
  
  try {
    const allPrefs = localStorage.getItem('all-view-preferences');
    if (!allPrefs) return {};
    
    const prefs: ViewPreference[] = JSON.parse(allPrefs);
    const stats: { [key: string]: number } = {
      'Settings': 0,
      'Workbook': 0,
      'API': 0,
      'Apps': 0,
      'Usage': 0
    };
    
    prefs.forEach(pref => {
      if (stats[pref.view] !== undefined) {
        stats[pref.view]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Failed to get view usage stats:', error);
    return {};
  }
};