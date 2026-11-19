import type { Application, HistoryEntry, Period, Stage } from '../api/schemas'

// Copy in one place (no i18n in the template yet; react-security-i18n when it is added).
export const stageTitles: Record<Stage, string> = {
  new: 'Новые',
  scoring: 'Скоринг',
  security: 'Проверка СБ',
  underwriting: 'Андеррайтинг',
  decision: 'Решение',
}

/** Stepper on the application page names the first step by the event, not the column. */
export const stepTitles: Record<Stage, string> = { ...stageTitles, new: 'Подана' }

export const periodOptions: { value: Period; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
]

type BadgeTone = 'neutral' | 'accent' | 'error' | 'clear'

export function applicationStatus(app: Pick<Application, 'stage' | 'outcome'>): { label: string; tone: BadgeTone } {
  if (app.outcome === 'approved') return { label: 'Одобрена', tone: 'accent' }
  if (app.outcome === 'rejected') return { label: 'Отказ', tone: 'error' }
  if (app.stage === 'underwriting') return { label: 'Андеррайтинг', tone: 'clear' }
  return { label: stageTitles[app.stage], tone: 'neutral' }
}

export const historyTone: Record<HistoryEntry['kind'], BadgeTone> = {
  progress: 'neutral',
  done: 'accent',
  rejected: 'error',
  info: 'clear',
}

export const riskBadge = {
  low: { label: 'Риск: низкий', tone: 'accent' },
  medium: { label: 'Риск: средний', tone: 'clear' },
  high: { label: 'Риск: высокий', tone: 'error' },
} as const

export const pipelineMessages = {
  title: 'Кредитный конвейер',
  heading: (periodLabel: string) => `Конвейер ${periodLabel}`,
  loading: 'Загружаем конвейер',
  emptyTitle: 'Заявок за период нет',
  emptyDescription: 'Выберите другой период или проверьте фильтры.',
  errorTitle: 'Не удалось загрузить конвейер',
  errorDescription: 'Проверьте соединение и попробуйте ещё раз.',
  retry: 'Повторить',
}

export const applicationMessages = {
  title: (id: string) => `Заявка ${id}`,
  loading: 'Загружаем заявку',
  notFound: 'Заявка не найдена',
  notFoundDescription: 'Проверьте номер или вернитесь к конвейеру.',
  back: 'К конвейеру',
  errorTitle: 'Не удалось загрузить заявку',
  errorDescription: 'Проверьте соединение и попробуйте ещё раз.',
  retry: 'Повторить',
  reject: 'Отклонить',
  approve: 'Одобрить кредит',
  requestDocs: 'Запросить документы',
  docsRequested: 'Запрос документов отправлен клиенту',
  docsError: 'Не удалось запросить документы. Попробуйте ещё раз.',
  cancel: 'Отмена',
  decisionError: 'Не удалось сохранить решение. Попробуйте ещё раз.',
  decided: { approve: 'Кредит одобрен', reject: 'Заявка отклонена' },
  confirm: {
    approve: { title: 'Одобрить кредит?', text: 'Клиент получит предложение на подписание.', action: 'Одобрить' },
    reject: { title: 'Отклонить заявку?', text: 'Клиенту уйдёт SMS с отказом. Решение нельзя отменить.', action: 'Отклонить' },
  },
}
