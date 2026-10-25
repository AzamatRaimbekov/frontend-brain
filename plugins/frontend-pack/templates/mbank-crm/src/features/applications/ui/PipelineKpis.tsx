import { KpiCard } from '@/shared/components/crm/KpiCard'
import type { Kpi } from '../api/schemas'
import { kpiView } from '../lib/format'

const grid = 'grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'

/** Figma `KPI` row: 4 cards, 16px gaps; 2×2 below 1280px. */
export function PipelineKpis({ kpis }: { kpis?: Kpi[] }) {
  if (!kpis) {
    return (
      <div className={grid}>
        {['a', 'b', 'c', 'd'].map((key) => (
          <KpiCard key={key} label="Загрузка…" loading />
        ))}
      </div>
    )
  }
  return (
    <ul className={grid} aria-label="Показатели">
      {kpis.map((kpi) => (
        <li key={kpi.id}>
          <KpiCard {...kpiView(kpi)} className="h-full" />
        </li>
      ))}
    </ul>
  )
}
