import { PropsWithChildren, useEffect } from 'react'

import { useTheme } from '../model'

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme()

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return children
}
