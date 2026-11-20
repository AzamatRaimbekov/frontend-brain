import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { buildMarkdown, downloadMarkdown } from './export-md'
import { TokenRow } from './TokenRow'
import { GROUPS, SCALE_GROUPS, SINGLE, valueOf, type Mode } from './tokens'
import { useDesignTokens } from './use-design-tokens'

const OPEN_KEY = 'design-system-open'

/** Where the collapsed button sits: CRM — bottom right; WebView — left, above the tab bar (⚙ is on the right). */
export type Corner = 'bottom-right' | 'left-raised'
const CORNER: Record<Corner, string> = {
  'bottom-right': 'right-4 bottom-4',
  'left-raised': 'left-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)]',
}

function initialOpen() {
  try {
    return localStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

/** Dev widget: edit the project's shadcn token values live, then download design-system.md. */
export function DesignSystemPanel({ project, corner = 'bottom-right' }: { project: string; corner?: Corner }) {
  const { defaults, overrides, setValue, resetValue, resetAll } = useDesignTokens()
  const [open, setOpen] = useState(initialOpen)
  const [mode, setMode] = useState<Mode>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  const changedCount = Object.keys(overrides).length

  const toggle = (next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(OPEN_KEY, next ? '1' : '0')
    } catch {
      // Storage blocked: the panel starts collapsed after reload.
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const download = () => downloadMarkdown('design-system.md', buildMarkdown(project, defaults, overrides))

  const row = (name: string) => {
    const m: Mode = SINGLE.includes(name) ? 'light' : mode
    return (
      <TokenRow
        key={`${name}-${m}`}
        name={name}
        value={valueOf(defaults, overrides, name, m)}
        changed={Boolean(overrides[name])}
        onChange={(v) => setValue(name, m, v)}
        onReset={() => resetValue(name)}
      />
    )
  }

  if (!open) {
    return (
      <Button size="sm" className={`fixed ${CORNER[corner]} z-[2147483000] shadow-lg`} onClick={() => toggle(true)}>
        Дизайн-система{changedCount ? ` · ${changedCount}` : ''}
      </Button>
    )
  }

  return (
    <aside
      aria-label="Дизайн-система"
      className="fixed top-0 right-0 z-[2147483000] flex h-dvh w-full max-w-sm flex-col border-l border-border bg-background text-foreground shadow-2xl"
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 className="flex-1 text-sm font-semibold">Дизайн-система</h2>
        <div role="group" aria-label="Тема" className="flex rounded-md border border-border p-0.5">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              className="rounded px-2 py-1 text-xs aria-pressed:bg-secondary aria-pressed:text-secondary-foreground"
            >
              {m === 'light' ? 'Светлая' : 'Тёмная'}
            </button>
          ))}
        </div>
        <Button size="xs" variant="ghost" aria-label="Свернуть" onClick={() => toggle(false)}>
          ✕
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {[...SCALE_GROUPS.slice(0, 1), ...GROUPS, ...SCALE_GROUPS.slice(1)].map((g) => (
          <section key={g.title} className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{g.title}</h3>
            {g.names.map(row)}
          </section>
        ))}
      </div>

      <footer className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Button size="sm" variant="outline" disabled={!changedCount} onClick={resetAll}>
          Сбросить
        </Button>
        <span className="flex-1 text-xs text-muted-foreground">{changedCount ? `Изменено: ${changedCount}` : ''}</span>
        <Button size="sm" onClick={download}>
          Скачать MD
        </Button>
      </footer>
    </aside>
  )
}
