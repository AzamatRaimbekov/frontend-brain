import type { ApplicationCard, Kpi } from '../api/schemas'

// Bank time zone: the same text for every user and in tests.
const TZ = 'Asia/Bishkek'
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
const dateTime = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: TZ,
})

export const formatMoney = (amount: number, currency: string) => `${number.format(amount)} ${currency}`
export const formatTime = (iso: string) => time.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatPercent = (value: number) => `${number.format(value)}%`
const minus = (value: number) => (value < 0 ? `−${Math.abs(value)}` : `+${value}`)

/** 134 -> "2 ч 14 мин", 65 -> "1 ч 05 мин", 34 -> "34 мин". */
export function formatDuration(minutes: number) {
  const m = Math.abs(minutes)
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (!h) return `${rest} мин`
  return `${h} ч ${String(rest).padStart(2, '0')} мин`.replace(/ 00 мин$/, '')
}

export const formatTerm = (months: number | null) => (months === null ? null : `${months} мес`)

export const cardMeta = (card: Pick<ApplicationCard, 'product' | 'termMonths'>) =>
  [card.product, formatTerm(card.termMonths)].filter(Boolean).join(' · ')

type Tone = 'info' | 'warning' | 'error' | 'neutral'

/** SLA or status badge of a board card (Figma: blue SLA, orange at risk, red overdue, grey status). */
export function cardBadge(card: Pick<ApplicationCard, 'sla' | 'status'>): { label: string; tone: Tone } | undefined {
  if (card.status) return { label: card.status, tone: 'neutral' }
  if (!card.sla) return undefined
  if (card.sla.state === 'overdue') return { label: `Просрочено ${formatDuration(card.sla.minutesLeft)}`, tone: 'error' }
  return { label: `SLA ${formatDuration(card.sla.minutesLeft)}`, tone: card.sla.state === 'risk' ? 'warning' : 'info' }
}

const kpiConfig: Record<Kpi['id'], { label: string; value: (v: number) => string; delta: (d: number) => string; goodWhen: 'up' | 'down' }> = {
  newCount: { label: 'Новых заявок', value: String, delta: (d) => `${minus(d)}%`, goodWhen: 'up' },
  approvalRate: { label: 'Уровень одобрения', value: formatPercent, delta: (d) => `${minus(d)} п.п.`, goodWhen: 'up' },
  decisionMinutes: {
    label: 'Время до решения',
    value: formatDuration,
    delta: (d) => `${d < 0 ? '−' : '+'}${formatDuration(d)}`,
    goodWhen: 'down',
  },
  slaOverdue: { label: 'Просрочен SLA', value: String, delta: minus, goodWhen: 'down' },
}

export function kpiView(kpi: Kpi) {
  const config = kpiConfig[kpi.id]
  const better = config.goodWhen === 'up' ? kpi.delta > 0 : kpi.delta < 0
  return {
    label: config.label,
    value: config.value(kpi.value),
    delta: config.delta(kpi.delta),
    deltaLabel: kpi.compareLabel,
    deltaTone: kpi.delta === 0 ? ('neutral' as const) : better ? ('positive' as const) : ('negative' as const),
  }
}
