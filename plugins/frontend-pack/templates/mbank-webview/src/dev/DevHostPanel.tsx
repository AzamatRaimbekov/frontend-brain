import { useState } from 'react'
import { useHost } from '@/shared/bridge'
import { Button } from '@/shared/ui/button'
import { getDevHost } from './devHost'

// Dev tool, not product UI: plays the Mbank app (language, theme, token, back, resume). Not in production builds.
export default function DevHostPanel() {
  const [open, setOpen] = useState(false)
  const state = useHost()
  const mock = getDevHost()
  if (!mock) return null

  return (
    <div className="fixed right-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex flex-col items-end gap-2 text-sm">
      {open && (
        <div className="grid w-64 gap-2 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <p className="font-medium">Mock app · {state.status}</p>
          <div className="flex gap-1">
            {(['ru', 'ky', 'en'] as const).map((lang) => (
              <Button key={lang} size="xs" variant={state.lang === lang ? 'primary' : 'outline'} onClick={() => mock.setLang(lang)}>
                {lang}
              </Button>
            ))}
            <Button size="xs" variant="outline" onClick={() => mock.setTheme(state.theme === 'dark' ? 'light' : 'dark')}>
              {state.theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={mock.expireToken}>Expire token</Button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={mock.state.refreshFails}
              onChange={(e) => mock.setRefreshFails(e.target.checked)}
            />
            Refresh fails
          </label>
          <Button size="sm" variant="outline" onClick={() => mock.emit({ event: 'back' })}>Back</Button>
          <Button size="sm" variant="outline" onClick={() => mock.emit({ event: 'resume' })}>Resume</Button>
          {mock.state.closed && <p className="text-muted-foreground">The app closed the WebView</p>}
        </div>
      )}
      <Button size="icon-sm" variant="outline" aria-label="Mock app" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span aria-hidden="true">⚙</span>
      </Button>
    </div>
  )
}
