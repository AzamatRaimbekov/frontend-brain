import { stages, type Application, type Stage } from '@/features/applications'
import type { SeedCard } from './cards'

const at = (hhmm: string) => `2026-10-12T${hhmm}:00+06:00`

// CL-240118 reproduces the Figma frame "CRM / Заявка на кредит / Андеррайтинг".
const figmaApplication: Partial<Application> = {
  rate: 21.5,
  channel: 'приложение',
  steps: [
    { stage: 'new', state: 'done', meta: '09:14 · приложение' },
    { stage: 'scoring', state: 'done', meta: '09:16 · 712 баллов' },
    { stage: 'security', state: 'done', meta: '10:01 · без замечаний' },
    { stage: 'underwriting', state: 'current', meta: 'Сейчас · SLA до 14:00' },
    { stage: 'decision', state: 'upcoming', meta: 'Ожидает' },
  ],
  borrower: {
    fullName: 'Асанов Нурлан Бекович',
    innMasked: '2120519 •••• •••7',
    phone: '+996 700 48 21 15',
    employment: 'ОсОО «Бишкек Логистик», водитель, 6 лет',
  },
  loan: { effectiveRate: 23.9, monthlyPayment: 23_180, debtToIncome: 31 },
  documents: [
    { id: 'passport', label: 'Паспорт', value: 'Проверен · 12.10.2026, 09:15', problem: false },
    { id: 'bureau', label: 'Кредитная история', value: 'ИКБ: 2 кредита, без просрочек', problem: false },
    { id: 'consent', label: 'Согласие на бюро', value: 'Подписано ЭЦП', problem: false },
    { id: 'income', label: 'Справка о доходах', value: 'Не загружена — нужна за 6 мес', problem: true },
  ],
  scoring: {
    score: 712,
    max: 900,
    model: 'v3.2',
    risk: 'medium',
    reasons: ['Долговая нагрузка 31% — ниже лимита 40%', 'Стаж на последнем месте 6 лет', 'Нет справки о доходах за 6 мес'],
    assignee: 'Токтосунов Б.',
    slaUntil: '14:00',
  },
  history: [
    { id: 'h4', title: 'Передана на андеррайтинг', at: at('10:02'), actor: 'Система', kind: 'progress' },
    { id: 'h3', title: 'Проверка СБ пройдена', at: at('10:01'), actor: 'Керимов Р.', kind: 'done' },
    { id: 'h2', title: 'Скоринг: 712 баллов', at: at('09:16'), actor: 'Система', kind: 'done' },
    { id: 'h1', title: 'Заявка подана', at: at('09:14'), actor: 'Мобильное приложение', kind: 'done' },
  ],
}

/** Every other card gets a plausible application built from its board data. */
export function buildApplication(card: SeedCard): Application {
  const current = stages.indexOf(card.stage)
  const outcome = card.product === 'Одобрено' ? 'approved' : card.product.startsWith('Отказ') ? 'rejected' : null
  const base: Application = {
    id: card.id,
    stage: card.stage,
    outcome,
    amount: card.amount,
    currency: card.currency,
    product: outcome ? 'Потребительский' : card.product,
    termMonths: card.termMonths,
    rate: 22,
    submittedAt: card.submittedAt,
    channel: 'отделение',
    steps: stages.map((stage: Stage, i) => ({
      stage,
      state: i < current ? 'done' : i === current ? (outcome === 'rejected' ? 'failed' : 'current') : 'upcoming',
      meta: i < current ? 'Пройден' : i === current ? 'Сейчас' : 'Ожидает',
    })),
    borrower: { fullName: card.borrowerName, innMasked: '2010190 •••• •••3', phone: '+996 555 10 20 30', employment: 'Нет данных' },
    loan: { effectiveRate: 24.1, monthlyPayment: Math.round(card.amount / (card.termMonths ?? 12) * 1.12), debtToIncome: 28 },
    documents: [{ id: 'passport', label: 'Паспорт', value: 'Проверен', problem: false }],
    scoring: current > 1 ? { score: 680, max: 900, model: 'v3.2', risk: 'low', reasons: ['Без просрочек'], assignee: 'Не назначен', slaUntil: '18:00' } : null,
    history: [{ id: 'h1', title: 'Заявка подана', at: card.submittedAt, actor: 'Система', kind: 'done' }],
  }
  return card.id === 'CL-240118' ? { ...base, ...figmaApplication } : base
}
