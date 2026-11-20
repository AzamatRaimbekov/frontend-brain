import { StyleProvider } from '@shared/config/styles'
import { GlobalDrawerLazy } from '@shared/global-drawer'
import { GlobalModalLazy } from '@shared/global-modal/ui'
import TranslationProvider from '@shared/i18n/TranslationProvider'
import { GlobalNotificationLazy } from '@shared/notification'
import { ThemeProvider } from '@shared/theme'
import { ErrorHoc } from '@shared/ui/ErrorBoundary'

import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { StoreProvider } from './providers/StoreProvider'
import { TokenProvider } from './providers/TokenProvider'

const GlobalLayout = () => (
  <ErrorHoc>
    <StyleProvider>
      <StoreProvider>
        <ThemeProvider>
          <TranslationProvider>
            <TokenProvider>
              <Outlet />
              <ScrollRestoration />
              <Suspense fallback={null}>
                <GlobalModalLazy />
              </Suspense>
              <Suspense fallback={null}>
                <GlobalDrawerLazy />
              </Suspense>
              <Suspense fallback={null}>
                <GlobalNotificationLazy />
              </Suspense>
            </TokenProvider>
          </TranslationProvider>
        </ThemeProvider>
      </StoreProvider>
    </StyleProvider>
  </ErrorHoc>
)

export default GlobalLayout
