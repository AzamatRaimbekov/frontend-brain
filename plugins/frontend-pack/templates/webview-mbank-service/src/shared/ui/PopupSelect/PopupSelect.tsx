import { useGlobalDrawer } from '@shared/global-drawer'
import {
  DefaultOptionType,
  Select,
  SelectProps,
  SelectValue,
} from '@shared/ui/Select'

import { type MouseEvent, ReactNode } from 'react'

import { PopupSelectBody } from './PopupSelectBody'

export type PopupSelectProps = Omit<SelectProps, 'onChange'> & {
  emptyState?: ReactNode
  onChange?: (value: SelectValue | null) => void
  title: string
}

export function PopupSelect({
  disabled,
  emptyState,
  onChange,
  options,
  title,
  value,
  ...props
}: PopupSelectProps) {
  const { closeDrawer, openDrawer } = useGlobalDrawer()

  const handleSelect = (nextValue: unknown) => {
    onChange?.(nextValue as SelectValue | null)
    closeDrawer()
  }

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    openDrawer({
      body: (
        <PopupSelectBody
          emptyState={emptyState}
          onChange={handleSelect}
          options={options ?? []}
          title={title}
          value={value}
        />
      ),
    })
  }

  return (
    <Select
      {...props}
      disabled={disabled}
      onChange={handleSelect}
      onClick={disabled ? undefined : handleOpen}
      open={false}
      options={options}
      value={value}
    />
  )
}

export type { DefaultOptionType }
