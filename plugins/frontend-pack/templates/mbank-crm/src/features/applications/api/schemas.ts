import { z } from 'zod'

export const stages = ['new', 'scoring', 'security', 'underwriting', 'decision'] as const
export type Stage = (typeof stages)[number]

export const periods = ['today', 'week', 'month', 'quarter'] as const
export type Period = (typeof periods)[number]

const slaSchema = z.object({
  minutesLeft: z.number().int(),
  /** Server decides when an SLA is at risk; negative minutesLeft = overdue. */
  state: z.enum(['ok', 'risk', 'overdue']),
})

export const applicationCardSchema = z.object({
  id: z.string(),
  submittedAt: z.string(),
  borrowerName: z.string(),
  amount: z.number(),
  currency: z.string(),
  /** "Потребительский" or the outcome on the decision stage ("Одобрено"). */
  product: z.string(),
  termMonths: z.number().int().nullable(),
  sla: slaSchema.nullable(),
  /** Status instead of SLA: "Ждёт ответа бюро", "Закрыта". */
  status: z.string().nullable(),
})
export type ApplicationCard = z.infer<typeof applicationCardSchema>

const kpiSchema = z.object({
  id: z.enum(['newCount', 'approvalRate', 'decisionMinutes', 'slaOverdue']),
  value: z.number(),
  delta: z.number(),
  compareLabel: z.string(),
})
export type Kpi = z.infer<typeof kpiSchema>

export const pipelineSchema = z.object({
  period: z.enum(periods),
  /** "на 12 октября", "за неделю 6–12 октября". */
  periodLabel: z.string(),
  kpis: z.array(kpiSchema),
  columns: z.array(
    z.object({
      stage: z.enum(stages),
      total: z.number().int(),
      slaLabel: z.string(),
      items: z.array(applicationCardSchema),
    }),
  ),
})
export type Pipeline = z.infer<typeof pipelineSchema>

const historySchema = z.object({
  id: z.string(),
  title: z.string(),
  at: z.string(),
  actor: z.string(),
  kind: z.enum(['progress', 'done', 'rejected', 'info']),
})
export type HistoryEntry = z.infer<typeof historySchema>

export const applicationSchema = z.object({
  id: z.string(),
  stage: z.enum(stages),
  outcome: z.enum(['approved', 'rejected']).nullable(),
  amount: z.number(),
  currency: z.string(),
  product: z.string(),
  termMonths: z.number().int().nullable(),
  rate: z.number().nullable(),
  submittedAt: z.string(),
  channel: z.string(),
  steps: z.array(
    z.object({ stage: z.enum(stages), state: z.enum(['done', 'current', 'upcoming', 'failed']), meta: z.string() }),
  ),
  borrower: z.object({ fullName: z.string(), innMasked: z.string(), phone: z.string(), employment: z.string() }),
  loan: z.object({ effectiveRate: z.number().nullable(), monthlyPayment: z.number(), debtToIncome: z.number() }),
  documents: z.array(z.object({ id: z.string(), label: z.string(), value: z.string(), problem: z.boolean() })),
  scoring: z
    .object({
      score: z.number().int(),
      max: z.number().int(),
      model: z.string(),
      risk: z.enum(['low', 'medium', 'high']),
      reasons: z.array(z.string()),
      assignee: z.string(),
      slaUntil: z.string(),
    })
    .nullable(),
  history: z.array(historySchema),
})
export type Application = z.infer<typeof applicationSchema>

export type Decision = 'approve' | 'reject'
