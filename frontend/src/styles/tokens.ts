/** Design tokens as JS constants for use in components */

export const colors = {
  navy: '#0f1c2e',
  royal: '#1D5AA7',
  pool: '#8FC5D9',
  cream: '#f0efeb',
  white: '#ffffff',
  brick: '#a82039',

  textPrimary: '#0a1528',
  textSecondary: '#4a5568',
  textTertiary: '#8a8a8a',
  textOnDark: '#ffffff',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.55)',

  rule: 'rgba(0, 0, 0, 0.12)',
  ruleLight: 'rgba(0, 0, 0, 0.06)',
  ruleOnDark: 'rgba(255, 255, 255, 0.08)',

  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
} as const;

export const categoryColors: Record<string, string> = {
  advising: colors.royal,
  admin: colors.brick,
  training: colors.green,
  marketing: colors.pool,
} as const;

export const layout = {
  sidebarWidth: 280,
  chatMaxWidth: 768,
  headerHeight: 56,
} as const;
