// Adds one extra token. Validation runs on submit (name, prefix, kind-specific value).
import { useState, type FormEvent } from "react"

import { Button } from "@/generated/kit/ui/button"
import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"
import { validateExtra } from "@/lib/extra-tokens"
import type { ExtraToken, ExtraTokenKind } from "@/lib/types"

const KINDS: { value: ExtraTokenKind; label: string; placeholder: string }[] = [
  { value: "color", label: "Цвет", placeholder: "#16a34a или oklch(…)" },
  { value: "radius", label: "Радиус", placeholder: "12px" },
  { value: "size", label: "Размер", placeholder: "24px или 1.5rem" },
]

type ExtraTokenFormProps = { prefix: string; taken: Set<string>; onAdd: (token: ExtraToken) => void }

export function ExtraTokenForm({ prefix, taken, onAdd }: ExtraTokenFormProps) {
  const [draft, setDraft] = useState<ExtraToken>({ name: `${prefix}-`, kind: "color", light: "", dark: "" })
  const [errors, setErrors] = useState<string[]>([])
  const kind = KINDS.find((k) => k.value === draft.kind) ?? KINDS[0]
  const set = (patch: Partial<ExtraToken>) => setDraft((d) => ({ ...d, ...patch }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const token: ExtraToken = {
      ...draft,
      name: draft.name.trim(),
      light: draft.light.trim(),
      dark: (draft.dark.trim() || draft.light).trim(),
      pairWith: draft.kind === "color" && draft.pairWith?.trim() ? draft.pairWith.trim() : undefined,
    }
    const found = validateExtra(token, prefix, taken)
    setErrors(found)
    if (found.length) return
    onAdd(token)
    setDraft({ name: `${prefix}-`, kind: draft.kind, light: "", dark: "" })
  }

  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="extra-name">Имя (kebab-case, префикс «{prefix}-»)</Label>
        <Input id="extra-name" size="sm" value={draft.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" spellCheck={false} />
      </div>
      <fieldset className="flex gap-1.5" aria-label="Тип токена">
        {KINDS.map((k) => (
          <Button key={k.value} type="button" size="xs" variant={draft.kind === k.value ? "secondary" : "outline"} aria-pressed={draft.kind === k.value} onClick={() => set({ kind: k.value })}>
            {k.label}
          </Button>
        ))}
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor="extra-light">Светлая</Label>
          <Input id="extra-light" size="sm" placeholder={kind.placeholder} value={draft.light} onChange={(e) => set({ light: e.target.value })} spellCheck={false} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="extra-dark">Тёмная</Label>
          <Input id="extra-dark" size="sm" placeholder="= светлая" value={draft.dark} onChange={(e) => set({ dark: e.target.value })} spellCheck={false} />
        </div>
      </div>
      {draft.kind === "color" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="extra-pair">Фон для проверки контраста (необязательно)</Label>
          <Input id="extra-pair" size="sm" placeholder="авто: имя без -foreground" value={draft.pairWith ?? ""} onChange={(e) => set({ pairWith: e.target.value })} spellCheck={false} />
        </div>
      ) : null}
      {errors.length ? (
        <ul role="alert" className="grid gap-1 text-caption text-destructive-text">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      ) : null}
      <Button type="submit" size="sm" variant="brand">
        Добавить токен
      </Button>
    </form>
  )
}
