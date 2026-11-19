import type { ReactNode } from 'react'

type StatusScreenProps = { title: string; text?: string; actions?: ReactNode; role?: 'alert' | 'status' }

/** A whole-screen message (no session, no app, 404): title, one line and the actions at the bottom. */
export function StatusScreen({ title, text, actions, role = 'status' }: StatusScreenProps) {
  return (
    <main role={role} className="webview-screen flex flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {text && <p className="max-w-xs text-muted-foreground">{text}</p>}
      </div>
      {actions && <div className="flex flex-col gap-3">{actions}</div>}
    </main>
  )
}
