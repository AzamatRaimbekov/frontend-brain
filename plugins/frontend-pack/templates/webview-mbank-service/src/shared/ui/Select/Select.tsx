import { Select as SelectPrimitive } from '@base-ui/react/select'
import { cn } from '@shared/libs/cn'
import { Check, ChevronDown, LoaderCircle, X } from 'lucide-react'

import { FocusEvent, MouseEvent, ReactNode } from 'react'

export type SelectValue = string | number

export interface DefaultOptionType<Value extends SelectValue = SelectValue> {
  disabled?: boolean
  label?: ReactNode
  value?: Value
}

type SelectOption<Value extends SelectValue> = Required<
  Pick<DefaultOptionType<Value>, 'label' | 'value'>
> &
  Pick<DefaultOptionType<Value>, 'disabled'>

export type SelectSize = 'default' | 'compact'

export type SelectProps<Value extends SelectValue = SelectValue> = Omit<
  SelectPrimitive.Root.Props<Value>,
  'children' | 'items' | 'onValueChange'
> & {
  allowClear?: boolean
  className?: string
  error?: boolean
  floatingLabel?: boolean
  loading?: boolean
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void
  onChange?: (value: Value | null, option?: DefaultOptionType<Value>) => void
  onClear?: () => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void
  options?: DefaultOptionType<Value>[]
  placeholder?: ReactNode
  size?: SelectSize
  status?: 'error'
  suffixIcon?: ReactNode
}

export function Select<Value extends SelectValue = SelectValue>({
  allowClear = false,
  className,
  disabled,
  error = false,
  floatingLabel,
  loading = false,
  onChange,
  onBlur,
  onClear,
  onClick,
  onFocus,
  options = [],
  placeholder,
  size = 'default',
  status,
  suffixIcon,
  value,
  ...props
}: SelectProps<Value>) {
  const selectableOptions = options.filter(
    (option): option is SelectOption<Value> => option.value !== undefined,
  )
  const isError = error || status === 'error'
  const selectedValue = value ?? null

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onChange?.(null)
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <SelectPrimitive.Root
        items={selectableOptions}
        disabled={disabled || loading}
        onValueChange={(nextValue) => {
          const option = selectableOptions.find(
            (item) => item.value === nextValue,
          )
          onChange?.(nextValue, option)
        }}
        value={selectedValue}
        {...props}
      >
        <SelectPrimitive.Trigger
          aria-invalid={isError || undefined}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-[20px] border border-transparent bg-card px-4 text-left text-base text-foreground transition-colors outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:border-destructive data-[floating-label=true]:pt-5 data-[floating-label=true]:pb-1 data-[size=compact]:h-12 data-[size=default]:h-[58px]',
            className,
          )}
          data-size={size}
          data-floating-label={floatingLabel || undefined}
          onBlur={onBlur}
          onClick={onClick}
          onFocus={onFocus}
        >
          <SelectPrimitive.Value
            className="min-w-0 flex-1 truncate data-placeholder:text-input"
            placeholder={placeholder}
          />
          {loading ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-5 shrink-0 animate-spin text-primary"
            />
          ) : (
            (suffixIcon ?? (
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
            ))
          )}
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            align="start"
            className="z-50"
            sideOffset={8}
          >
            <SelectPrimitive.Popup className="max-h-72 min-w-[var(--anchor-width)] overflow-auto rounded-2xl bg-card p-1 shadow-lg outline-none">
              <SelectPrimitive.List>
                {selectableOptions.map((option) => (
                  <SelectPrimitive.Item
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-base text-foreground outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-muted data-selected:text-primary"
                    disabled={option.disabled}
                    key={option.value}
                    value={option.value}
                  >
                    <SelectPrimitive.ItemText className="min-w-0 flex-1">
                      {option.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check
                        aria-hidden="true"
                        className="size-5 text-primary"
                      />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {allowClear && selectedValue !== null && !disabled && !loading && (
        <button
          aria-label="Очистить выбор"
          className="absolute top-1/2 right-11 -translate-y-1/2 rounded-full p-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={handleClear}
          type="button"
        >
          <X
            aria-hidden="true"
            className="size-4"
          />
        </button>
      )}
    </div>
  )
}
