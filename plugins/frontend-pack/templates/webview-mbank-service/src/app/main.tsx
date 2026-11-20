import * as Sentry from '@sentry/react'

import ReactDOM from 'react-dom/client'

import { App } from './App'
import { applyInitialTheme } from './lib/themeInit'

applyInitialTheme()

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.01,
  tracesSampleRate: 0.01,
  sendDefaultPii: true,
  environment: 'dev',
  enabled: window.location.hostname !== 'localhost',
})

const root = document.getElementById('root')
if (!root) {
  throw new Error('Приложение не может найти ROOT')
}

ReactDOM.createRoot(root).render(<App />)
