import { useState } from 'react'
import { Input } from '@/shared/ui/input'
import { isColorToken, isValid, toHex } from './tokens'

type TokenRowProps = {
  name: string
  value: string
  changed: boolean
  onChange: (value: string) => void
  onReset: () => void
}

/** One token: colour picker (colours only) + text value; an invalid value is kept in the field, not applied. */
export function TokenRow({ name, value, changed, onChange, onReset }: TokenRowProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const isColor = isColorToken(name)
  const hex = isColor ? toHex(value) : null
  const text = draft ?? value
  const invalid = draft !== null && !isValid(name, draft)

  const commit = (next: string) => {
    setDraft(next)
    if (isValid(name, next)) {
      onChange(next.trim())
      setDraft(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isColor ? (
        <input
          type="color"
          aria-label={`Цвет ${name}`}
          value={hex ?? '#000000'}
          onChange={(e) => commit(e.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <label htmlFor={`ds-${name}`} className="block truncate text-xs text-muted-foreground">
          {changed ? '● ' : ''}
          {name}
        </label>
        <Input
          id={`ds-${name}`}
          value={text}
          aria-invalid={invalid}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setDraft(null)}
          className="h-8 font-mono text-xs"
        />
      </div>
      {changed ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={`Вернуть ${name}`}
          className="shrink-0 rounded-md px-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          ↺
        </button>
      ) : null}
    </div>
  )
}
