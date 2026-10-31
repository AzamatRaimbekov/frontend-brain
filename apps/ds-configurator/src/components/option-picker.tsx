// One customizer picker. Same interaction as the upstream create pickers (radius-picker.tsx,
// theme-picker.tsx ...): a trigger with label + current value, a radio menu, hover preview.
import type { PickerOption } from "@/lib/options"

import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerLabel,
  PickerRadioGroup,
  PickerRadioItem,
  PickerTrigger,
} from "./picker"

type OptionPickerProps = {
  label: string
  value: string
  options: PickerOption[]
  disabled?: boolean
  onChange: (value: string) => void
  onPreview: (value: string | null) => void
}

function Swatch({ color }: { color?: string }) {
  if (!color) return null
  return <span className="size-3.5 shrink-0 rounded-full ring-1 ring-border" style={{ background: color }} aria-hidden />
}

export function OptionPicker({ label, value, options, disabled, onChange, onPreview }: OptionPickerProps) {
  const current = options.find((o) => o.value === value)
  return (
    <Picker onOpenChange={(open) => !open && onPreview(null)}>
      <PickerTrigger disabled={disabled}>
        <span className="block text-caption text-muted-foreground">{label}</span>
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Swatch color={current?.swatch} />
          <span className="truncate">{current?.label ?? value}</span>
        </span>
      </PickerTrigger>
      <PickerContent onMouseLeave={() => onPreview(null)}>
        <PickerRadioGroup value={value} onValueChange={(v) => onChange(v as string)} onItemPreview={onPreview}>
          <PickerGroup>
            <PickerLabel>{label}</PickerLabel>
            {options.map((o) => (
              <PickerRadioItem key={o.value} value={o.value} disabled={o.disabled} closeOnClick>
                <Swatch color={o.swatch} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{o.label}</span>
                  {o.description ? <span className="truncate text-caption text-disabled-foreground">{o.description}</span> : null}
                </span>
              </PickerRadioItem>
            ))}
          </PickerGroup>
        </PickerRadioGroup>
      </PickerContent>
    </Picker>
  )
}
