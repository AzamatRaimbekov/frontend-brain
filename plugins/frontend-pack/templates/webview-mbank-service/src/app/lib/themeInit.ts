import { applyTheme, getTheme } from '@shared/theme'

export const applyInitialTheme = () => {
  applyTheme(getTheme())
}
