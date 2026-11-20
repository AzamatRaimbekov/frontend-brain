import { EmptyState } from '@/shared/components/EmptyState'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { Skeleton } from '@/shared/ui/skeleton'
import { toast, Toaster } from '@/shared/ui/sonner'
import { Spinner } from '@/shared/ui/spinner'
import { Demo, Section } from './Section'

export function FeedbackSection() {
  return (
    <Section id="feedback" title="Обратная связь">
      <div className="grid gap-4 lg:grid-cols-2">
        <Demo title="Alert">
          <Alert>
            <AlertTitle>Заявка передана на андеррайтинг</AlertTitle>
            <AlertDescription>Решение придёт в течение 4 часов.</AlertDescription>
          </Alert>
          <Alert tone="error">
            <AlertTitle>Не удалось сохранить решение</AlertTitle>
            <AlertDescription>Проверьте соединение и попробуйте ещё раз.</AlertDescription>
          </Alert>
        </Demo>
        <Demo title="Progress, Spinner, Skeleton, Toast">
          <Progress value={64} aria-label="Уровень одобрения" />
          <div className="flex items-center gap-3">
            <Spinner />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success('Решение сохранено')}>
              Toast
            </Button>
            <Button variant="outline" onClick={() => toast.error('Не удалось сохранить')}>
              Toast с ошибкой
            </Button>
          </div>
          <Toaster />
        </Demo>
      </div>
      <Demo title="EmptyState">
        <EmptyState title="Заявок за период нет" action={<Button variant="outline">Сменить период</Button>} />
      </Demo>
    </Section>
  )
}
