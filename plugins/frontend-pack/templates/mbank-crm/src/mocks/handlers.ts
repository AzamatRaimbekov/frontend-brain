import { delay, http, HttpResponse } from 'msw'
import { periods, stages, type Application, type ApplicationCard, type Period, type Pipeline } from '@/features/applications'
import { stageSla, stageTotals, type SeedCard } from './data/cards'
import { db } from './data/db'

// Dev API. ?mock=empty | error | action-error in the page URL opens the other states.
const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 600)
const mockOf = (request: Request) => new URL(request.url).searchParams.get('mock')
const serverError = () => HttpResponse.json({ message: 'boom' }, { status: 500 })
const notFound = () => HttpResponse.json({ message: 'not found' }, { status: 404 })

const periodLabel: Record<Period, string> = {
  today: 'на 12 октября',
  week: 'за неделю 6–12 октября',
  month: 'за октябрь',
  quarter: 'за IV квартал',
}
const scale: Record<Period, number> = { today: 1, week: 6, month: 22, quarter: 61 }

const toCard = (card: SeedCard): ApplicationCard => ({
  id: card.id, submittedAt: card.submittedAt, borrowerName: card.borrowerName, amount: card.amount,
  currency: card.currency, product: card.product, termMonths: card.termMonths, sla: card.sla, status: card.status,
})

function pipeline(period: Period, empty: boolean): Pipeline {
  const k = scale[period]
  const compare = period === 'today' ? 'к вчера' : 'к прошлому периоду'
  return {
    period,
    periodLabel: periodLabel[period],
    kpis: [
      { id: 'newCount', value: empty ? 0 : 86 * k, delta: 14, compareLabel: compare },
      { id: 'approvalRate', value: 64, delta: 3, compareLabel: 'к прошлой неделе' },
      { id: 'decisionMinutes', value: 134, delta: -18, compareLabel: compare },
      { id: 'slaOverdue', value: empty ? 0 : 9 * k, delta: 4, compareLabel: compare },
    ],
    columns: stages.map((stage) => ({
      stage,
      total: empty ? 0 : stageTotals[stage] * k,
      slaLabel: stageSla[stage],
      items: empty ? [] : db.cards.filter((c) => c.stage === stage).map(toCard),
    })),
  }
}

const findApplication = (id: unknown) => db.applications.get(String(id))
const now = () => new Date().toISOString()

function save(app: Application) {
  db.applications.set(app.id, app)
  return HttpResponse.json(app)
}

export const handlers = [
  http.get('/api/pipeline', async ({ request }) => {
    await latency()
    if (mockOf(request) === 'error') return serverError()
    const raw = new URL(request.url).searchParams.get('period')
    const period = periods.find((p) => p === raw) ?? 'today'
    return HttpResponse.json(pipeline(period, mockOf(request) === 'empty'))
  }),

  http.get('/api/applications/:id', async ({ request, params }) => {
    await latency()
    if (mockOf(request) === 'error') return serverError()
    const app = findApplication(params.id)
    return app ? HttpResponse.json(app) : notFound()
  }),

  http.post('/api/applications/:id/decision', async ({ request, params }) => {
    await latency()
    if (mockOf(request) === 'action-error') return serverError()
    const app = findApplication(params.id)
    if (!app) return notFound()
    if (app.stage !== 'underwriting' || app.outcome) return HttpResponse.json({ message: 'already decided' }, { status: 409 })
    const { decision } = (await request.json()) as { decision: 'approve' | 'reject' }
    const approved = decision === 'approve'
    return save({
      ...app,
      stage: 'decision',
      outcome: approved ? 'approved' : 'rejected',
      steps: app.steps.map((s) =>
        s.stage === 'underwriting' ? { ...s, state: approved ? 'done' : 'failed', meta: 'Решение принято' }
          : s.stage === 'decision' ? { ...s, state: approved ? 'current' : 'upcoming', meta: approved ? 'Ждёт подписи' : 'Отказ' } : s),
      history: [
        { id: `h${app.history.length + 1}`, title: approved ? 'Кредит одобрен' : 'Заявка отклонена', at: now(), actor: 'Токтосунов Б.', kind: approved ? 'done' : 'rejected' },
        ...app.history,
      ],
    })
  }),

  http.post('/api/applications/:id/documents-request', async ({ request, params }) => {
    await latency()
    if (mockOf(request) === 'action-error') return serverError()
    const app = findApplication(params.id)
    if (!app) return notFound()
    return save({
      ...app,
      history: [{ id: `h${app.history.length + 1}`, title: 'Запрошены документы у клиента', at: now(), actor: 'Токтосунов Б.', kind: 'info' }, ...app.history],
    })
  }),
]
