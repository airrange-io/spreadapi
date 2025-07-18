export const COLORS = {
  primary: '#4F2D7F',
  background: '#f7f7f7',
  border: '#f0f0f0',
  borderDark: '#e3e3e3',
  activeBackground: '#e3e3e3',
  activeBorder: '#d0d0d0',
  textSecondary: '#666',
  textMuted: '#999',
  userAvatar: '#e9e9e9',
} as const;

export const SIZES = {
  sidebarWidth: 300,
  sidebarCollapsedWidth: 52,
  mobileBreakpoint: 768,
} as const;

export const TRANSITIONS = {
  default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;