import { Button } from '@/shared/ui/button'

type ErrorStateProps = { title: string; description: string; retryLabel: string; onRetry: () => void }

export function ErrorState({ title, description, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
    </div>
  )
}
