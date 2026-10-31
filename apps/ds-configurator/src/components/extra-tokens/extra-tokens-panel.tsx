import { useMemo } from "react"

import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"
import { baseTokenNames } from "@/lib/design-system"
import { contrastChecks } from "@/lib/extra-tokens"
import type { ConfiguratorState, DesignSystem } from "@/lib/types"

import { ExtraTokenForm } from "./extra-token-form"
import { ExtraTokenList } from "./extra-token-list"

type ExtraTokensPanelProps = {
  state: ConfiguratorState
  designSystem: DesignSystem
  onChange: (patch: Partial<ConfiguratorState>) => void
}

export function ExtraTokensPanel({ state, designSystem, onChange }: ExtraTokensPanelProps) {
  const taken = useMemo(() => {
    const names = baseTokenNames(state)
    for (const t of state.extras) names.add(t.name)
    return names
  }, [state])
  const checks = contrastChecks(state.extras, designSystem.light, designSystem.dark)

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="project-prefix">Префикс проекта</Label>
        <Input
          id="project-prefix"
          size="sm"
          value={state.prefix}
          disabled={state.extras.length > 0}
          onChange={(e) => onChange({ prefix: e.target.value.trim() })}
          spellCheck={false}
        />
        {state.extras.length > 0 ? (
          <p className="text-caption text-muted-foreground">Префикс меняется, когда список пуст.</p>
        ) : null}
      </div>
      <ExtraTokenForm key={state.prefix} prefix={state.prefix} taken={taken} onAdd={(t) => onChange({ extras: [...state.extras, t] })} />
      <ExtraTokenList extras={state.extras} checks={checks} onRemove={(name) => onChange({ extras: state.extras.filter((t) => t.name !== name) })} />
    </div>
  )
}
