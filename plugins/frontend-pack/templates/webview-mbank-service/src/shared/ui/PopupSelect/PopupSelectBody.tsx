import { DefaultOptionType } from '@shared/ui/Select'

import { ReactNode } from 'react'

import { PopupSelectItem } from './PopupSelectItem'

interface PopupSelectBodyProps {
  emptyState?: ReactNode
  onChange?: (value: unknown) => void
  options: DefaultOptionType[]
  title: string
  value?: unknown
}

export function PopupSelectBody({
  emptyState,
  onChange,
  options,
  title,
  value,
}: PopupSelectBodyProps) {
  const selectedItem = options.find((item) => item.value === value)

  return (
    <div className="relative max-h-[calc(100dvh-54px)] rounded-t-[20px] bg-card p-4 pt-10 pb-6">
      <div
        className="mb-4 text-[22px] leading-7 font-bold text-foreground"
        id="popup-select-title"
      >
        {title}
      </div>
      <div
        aria-labelledby="popup-select-title"
        className="flex h-[50vh] flex-col overflow-auto"
        role="listbox"
      >
        {options.length
          ? options.map((item) => (
              <PopupSelectItem
                isSelected={selectedItem?.value === item.value}
                item={item}
                key={item.value}
                onChange={onChange}
              />
            ))
          : (emptyState ?? <PopupSelectEmptyState />)}
      </div>
    </div>
  )
}

function PopupSelectEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
      <span className="text-base font-semibold text-foreground">
        Нет доступных вариантов
      </span>
      <span className="text-sm text-muted-foreground">Попробуйте позже</span>
    </div>
  )
}
