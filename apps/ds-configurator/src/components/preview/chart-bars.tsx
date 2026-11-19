// chart-1..5 and the sidebar tokens at a glance (no chart library in this app).
const BARS = [72, 54, 88, 40, 64]

export function ChartBars() {
  return (
    <div className="grid grid-cols-[8rem_1fr] overflow-hidden rounded-lg border">
      <nav aria-label="Пример сайдбара" className="grid content-start gap-1 border-r border-sidebar-border bg-sidebar p-2 text-sm text-sidebar-foreground">
        <span className="rounded-md bg-sidebar-primary px-2 py-1 text-sidebar-primary-foreground">Обзор</span>
        <span className="rounded-md bg-sidebar-accent px-2 py-1 text-sidebar-accent-foreground">Платежи</span>
        <span className="px-2 py-1">Отчёты</span>
      </nav>
      <div className="flex h-28 items-end gap-2 bg-card p-3" role="img" aria-label="Столбцы chart-1…chart-5">
        {BARS.map((h, i) => (
          <span key={h} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `var(--chart-${i + 1})` }} />
        ))}
      </div>
    </div>
  )
}
