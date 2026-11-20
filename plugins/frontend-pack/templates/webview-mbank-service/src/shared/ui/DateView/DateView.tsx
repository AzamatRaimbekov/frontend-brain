import { formatItem } from './libs/formatItem'
import { DateViewItem, DateViewTypes } from './model'

export interface DateViewProps {
  title?: string
  items: DateViewItem[]
  column?: number
  type?: DateViewTypes
}

export function DateView({
  title,
  items,
  column = 1,
  type = 'default',
}: DateViewProps) {
  // ""TODO сделать через cva
  return (
    <div className={type === 'callout' ? 'rounded-md bg-info-muted p-2' : ''}>
      {title && <h3 className="mb-6 text-[20px] font-semibold">{title}</h3>}
      <div className={`grid grid-cols-${column} gap-4`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <div className="text-light-gray-1 w-1/3 text-[16px]">
              {item.label}
            </div>
            <div className="w-2/3 text-[16px]">{formatItem(item)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
