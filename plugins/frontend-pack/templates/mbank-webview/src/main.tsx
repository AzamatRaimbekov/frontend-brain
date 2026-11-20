import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { host } from '@/shared/bridge'
import { initI18n } from '@/shared/i18n'
import './index.css'

// Dev: the API lives in MSW (src/mocks) until the backend exists (VITE_API_MOCKS=off → real API), and
// the app is a fake one in the page (dev panel) unless a real bridge or #token=… launch params are there.
async function boot() {
  if (import.meta.env.DEV && import.meta.env.VITE_API_MOCKS !== 'off') {
    const { worker } = await import('./mocks/browser')
    // MSW 3: onUnhandledFrame (onUnhandledRequest is ignored). bypass = pages and assets go to Vite.
    await worker.start({ quiet: true, onUnhandledFrame: 'bypass' })
  }
  const mock = import.meta.env.DEV && import.meta.env.VITE_BRIDGE !== 'native' ? await import('@/dev/devHost') : null
  void host.start(mock?.devHost())
  initI18n()
}

// Dev: the design-system widget (src/dev/design-system) edits token values live and exports design-system.md.
if (import.meta.env.DEV && import.meta.env.VITE_DS_PANEL !== 'off') {
  void import('./dev/design-system').then((m) => m.mountDesignSystemPanel({ corner: 'left-raised' }))
}

boot().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
