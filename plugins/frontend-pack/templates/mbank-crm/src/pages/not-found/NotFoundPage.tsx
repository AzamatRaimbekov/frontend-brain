import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50dvh] max-w-md flex-col justify-center gap-3">
      <title>Страница не найдена — Mbank CRM</title>
      <h1 className="text-xl font-bold text-foreground">Страница не найдена</h1>
      <p className="text-muted-foreground">Проверьте адрес или вернитесь к конвейеру заявок.</p>
      <Button asChild variant="secondary" className="w-fit">
        <Link to="/">К конвейеру</Link>
      </Button>
    </div>
  )
}
