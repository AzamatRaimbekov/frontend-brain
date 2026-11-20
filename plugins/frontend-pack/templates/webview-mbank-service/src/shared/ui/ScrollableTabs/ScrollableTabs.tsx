import { cn } from '@shared/libs/cn'
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/base/toggle-group'

interface Tab {
  key: string | number | null
  label: string
}

interface ScrollableTabsProps {
  tabs: Tab[]
  activeTab: string | number | null
  onTabChange: (tabKey: string | number | null) => void
  className?: string
  btnClassName?: string
}

const ScrollableTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  btnClassName,
}: ScrollableTabsProps) => {
  // Toggle values are strings; tab keys may be numbers or null, so the index is the value.
  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab)

  const handleValueChange = (values: unknown[]) => {
    const next = tabs[Number(values[0])]
    if (next) onTabChange(next.key)
  }

  return (
    <div className={cn('relative -mr-4', className)}>
      <div className="scrollbar-hide relative overflow-x-auto py-2">
        <ToggleGroup
          aria-label="tabs"
          className="w-max pr-6"
          onValueChange={handleValueChange}
          size="chip"
          value={activeIndex === -1 ? [] : [String(activeIndex)]}
          variant="chip"
        >
          {tabs.map((tab, index) => (
            <ToggleGroupItem
              key={tab.key ?? `null-${index}`}
              className={btnClassName}
              value={String(index)}
            >
              {tab.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-background)] via-[var(--color-background)]" />
    </div>
  )
}

export default ScrollableTabs
