export const THEME_STORAGE_KEY = 'trazo:theme'

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export type ResolvedTheme = 'light' | 'dark'

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#252824',
  dark: '#191c19',
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === 'string' &&
    THEME_PREFERENCES.includes(value as ThemePreference)
  )
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(SYSTEM_THEME_QUERY).matches
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

export function applyThemeToDocument(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.style.colorScheme = resolvedTheme

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', THEME_COLORS[resolvedTheme])
}
