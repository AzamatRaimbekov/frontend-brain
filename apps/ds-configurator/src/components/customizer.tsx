// Left panel: the pickers of upstream create/components/customizer.tsx plus Source and Brand.
import { Fragment } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { pickerPatch, pickerSpecs, pickerValue } from "@/lib/options"
import type { ConfiguratorState } from "@/lib/types"

import { OptionPicker } from "./option-picker"

type CustomizerProps = {
  state: ConfiguratorState
  onChange: (patch: Partial<ConfiguratorState>) => void
  onPreview: (patch: Partial<ConfiguratorState> | null) => void
}

export function Customizer({ state, onChange, onPreview }: CustomizerProps) {
  return (
    <Card className="gap-3 self-start py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Дизайн-система</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        {pickerSpecs(state).map((spec) => (
          <Fragment key={spec.key}>
            {spec.separatorBefore ? <hr className="my-1 border-border" /> : null}
            <OptionPicker
              label={spec.label}
              value={pickerValue(state, spec.key)}
              options={spec.options}
              disabled={spec.disabled}
              onChange={(v) => onChange(pickerPatch(spec.key, v))}
              onPreview={(v) => onPreview(v === null ? null : pickerPatch(spec.key, v))}
            />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
