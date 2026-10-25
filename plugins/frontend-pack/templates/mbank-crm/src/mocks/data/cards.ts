import type { ApplicationCard, Stage } from '@/features/applications'

// Board seed = the Figma frame "CRM / Конвейер заявок" (12.10.2026). Times are Bishkek (+06:00).
type Row = [string, string, string, number, string, number | null, number | null, 'ok' | 'risk' | 'overdue' | null, string | null]

const rows: Record<Stage, Row[]> = {
  new: [
    ['CL-240131', '10:41', 'Абдыкадыров Эрлан', 120_000, 'Потребительский', 12, 12, 'ok', null],
    ['CL-240130', '10:38', 'Мамытова Айпери', 1_200_000, 'Ипотека', 120, 9, 'risk', null],
    ['CL-240127', '10:22', 'Осмонов Тилек', 60_000, 'Кредитная карта', null, -7, 'overdue', null],
  ],
  scoring: [
    ['CL-240126', '10:20', 'Жумабекова Нургуль', 300_000, 'Автокредит', 36, 4, 'risk', null],
    ['CL-240124', '10:12', 'Исаков Данияр', 85_000, 'Потребительский', 18, null, null, 'Ждёт ответа бюро'],
    ['CL-240121', '10:05', 'Турдубаева Гулзат', 45_000, 'Рассрочка', 6, 3, 'risk', null],
  ],
  security: [
    ['CL-240119', '09:31', 'Керимбеков Азамат', 2_500_000, 'Ипотека', 180, 65, 'ok', null],
    ['CL-240115', '09:02', 'Сыдыкова Жылдыз', 150_000, 'Потребительский', 24, 34, 'ok', null],
    ['CL-240109', '08:40', 'Алиев Руслан', 700_000, 'Автокредит', 48, -12, 'overdue', null],
  ],
  underwriting: [
    ['CL-240118', '09:14', 'Асанов Нурлан', 450_000, 'Потребительский', 24, 166, 'ok', null],
    ['CL-240104', '08:15', 'Бекова Асель', 90_000, 'Кредитная карта', null, 70, 'ok', null],
    ['CL-240097', '07:58', 'Эшматов Улан', 1_800_000, 'Бизнес', 36, 11, 'risk', null],
  ],
  decision: [
    ['CL-240088', '10:30', 'Назарова Элеонора', 250_000, 'Одобрено', 24, null, null, 'Ждёт подписи'],
    ['CL-240081', '10:12', 'Кадыров Мирлан', 600_000, 'Одобрено', 36, 42, 'ok', null],
    ['CL-240076', '09:47', 'Шаршенова Бермет', 75_000, 'Отказ · отправлено SMS', null, null, null, 'Закрыта'],
  ],
}

export type SeedCard = ApplicationCard & { stage: Stage }

export const seedCards = (): SeedCard[] =>
  (Object.entries(rows) as [Stage, Row[]][]).flatMap(([stage, list]) =>
    list.map(([id, hhmm, borrowerName, amount, product, termMonths, minutes, state, status]) => ({
      stage,
      id,
      submittedAt: `2026-10-12T${hhmm}:00+06:00`,
      borrowerName,
      amount,
      currency: 'KGS',
      product,
      termMonths,
      sla: minutes === null || state === null ? null : { minutesLeft: minutes, state },
      status,
    })),
  )

/** Totals per stage shown in the column badges (more than the 3 cards on the board). */
export const stageTotals: Record<Stage, number> = { new: 24, scoring: 11, security: 7, underwriting: 12, decision: 5 }

export const stageSla: Record<Stage, string> = {
  new: 'SLA этапа 15 мин',
  scoring: 'Автоматически, до 5 мин',
  security: 'SLA этапа 2 ч',
  underwriting: 'SLA этапа 4 ч',
  decision: 'Подписание, SLA 1 ч',
}
