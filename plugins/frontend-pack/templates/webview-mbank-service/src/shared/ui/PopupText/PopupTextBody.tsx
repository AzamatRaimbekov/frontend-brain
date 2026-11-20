import { Cross } from 'md-glyphs'

import { ReactNode } from 'react'

import { PopupTextOption } from './PopupText'
import { PopupTextItem } from './PopupTextItem'

interface PopupTextBodyProps {
  closeDrawer?: () => void
  emptyState?: ReactNode
  onChange: (value: string | number) => void
  options: PopupTextOption[]
  title: string
  value?: string | number
}

export function PopupTextBody({
  closeDrawer,
  emptyState,
  onChange,
  options,
  title,
  value,
}: PopupTextBodyProps) {
  return (
    <div className="relative max-h-[calc(100dvh-54px)] rounded-t-2xl bg-card p-4 py-6">
      <div className="relative mb-4 flex items-center justify-center">
        <Cross
          className="absolute left-0"
          color="var(--color-primary)"
          onClick={closeDrawer}
          size={20}
        />
        <div
          className="text-center text-[22px] leading-7 font-bold text-foreground"
          id="popup-text-title"
        >
          {title}
        </div>
      </div>
      <div
        aria-labelledby="popup-text-title"
        className="flex h-[60vh] flex-col overflow-auto rounded-2xl bg-card px-4"
        role="listbox"
      >
        {options.length
          ? options.map((item) => (
              <PopupTextItem
                isSelected={item.value === value}
                item={item}
                key={item.value}
                onChange={onChange}
              />
            ))
          : (emptyState ?? <PopupTextEmptyState />)}
      </div>
    </div>
  )
}

function PopupTextEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
      <span className="text-base font-semibold text-foreground">
        Пока ничего нет
      </span>
      <span className="text-sm text-muted-foreground">Попробуйте позже</span>
    </div>
  )
}
