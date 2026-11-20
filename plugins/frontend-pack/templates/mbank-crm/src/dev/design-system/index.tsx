import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DesignSystemPanel, type Corner } from './DesignSystemPanel'

/**
 * Mounts the design-system widget in its own React root, outside the app tree: the app never depends on it
 * and a crash in it does not touch the app. Dev only (main.tsx imports it behind import.meta.env.DEV).
 */
export function mountDesignSystemPanel({ project = document.title, corner }: { project?: string; corner?: Corner } = {}) {
  const host = document.createElement('div')
  host.id = 'design-system-panel'
  document.body.appendChild(host)
  createRoot(host).render(
    <StrictMode>
      <DesignSystemPanel project={project} corner={corner} />
    </StrictMode>,
  )
}
