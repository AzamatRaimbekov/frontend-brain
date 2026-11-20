import { DefaultOptionType } from '@shared/ui/Select'

interface PopupSelectItemProps {
  isSelected?: boolean
  item: DefaultOptionType
  onChange?: (value: unknown) => void
}

export function PopupSelectItem({
  isSelected,
  item,
  onChange,
}: PopupSelectItemProps) {
  return (
    <button
      aria-selected={isSelected}
      className="flex py-3 text-left text-base font-medium text-foreground"
      id={`popup-select-option-${item.value}`}
      onClick={() => onChange?.(item.value)}
      role="option"
      tabIndex={-1}
      type="button"
    >
      {item.label}
    </button>
  )
}
