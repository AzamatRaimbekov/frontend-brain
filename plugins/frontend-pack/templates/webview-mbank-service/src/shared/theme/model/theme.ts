import { TokenStorage } from '@shared/libs/storage'

import { useEffect, useState } from 'react'

export type AppTheme = 'light' | 'dark'

const themeStorageKey = 'theme'
const themes: AppTheme[] = ['light', 'dark']

const isAppTheme = (theme: unknown): theme is AppTheme =>
  typeof theme === 'string' && themes.includes(theme as AppTheme)

export const applyTheme = (theme: AppTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme
}

export const getTheme = (): AppTheme => {
  if (typeof window === 'undefined') return 'light'

  const urlParams = new URLSearchParams(window.location.search)
  const themeParam = urlParams.get(themeStorageKey)
  const themeFromStorage = TokenStorage.getFromStorage(themeStorageKey)

  const normalizedTheme = isAppTheme(themeParam)
    ? themeParam
    : isAppTheme(themeFromStorage)
      ? themeFromStorage
      : 'light'

  if (isAppTheme(themeParam) && themeFromStorage !== themeParam) {
    TokenStorage.saveToStorage({
      saveLocal: false,
      value: themeParam,
      key: themeStorageKey,
    })
  }

  return normalizedTheme
}

export const useTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(getTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
