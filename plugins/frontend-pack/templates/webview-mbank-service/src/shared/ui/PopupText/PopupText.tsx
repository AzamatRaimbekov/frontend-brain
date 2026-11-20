import { useGlobalDrawer } from '@shared/global-drawer'
import { Button, ButtonProps } from '@shared/ui/Button'

import { type MouseEvent, ReactNode } from 'react'

import { PopupTextBody } from './PopupTextBody'

export interface PopupTextOption {
  label: ReactNode
  value: string | number
}

export type PopupTextProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value'
> & {
  emptyState?: ReactNode
  onChange: (value: string | number) => void
  options: PopupTextOption[]
  title: string
  value?: string | number
}

export function PopupText({
  disabled,
  emptyState,
  onChange,
  options,
  title,
  value,
  ...props
}: PopupTextProps) {
  const { closeDrawer, openDrawer } = useGlobalDrawer()

  const handleSelect = (nextValue: string | number) => {
    onChange(nextValue)
    closeDrawer()
  }

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    openDrawer({
      body: (
        <PopupTextBody
          closeDrawer={closeDrawer}
          emptyState={emptyState}
          onChange={handleSelect}
          options={options}
          title={title}
          value={value}
        />
      ),
    })
  }

  return (
    <Button
      {...props}
      disabled={disabled}
      onClick={handleOpen}
      variant="text"
    />
  )
}
