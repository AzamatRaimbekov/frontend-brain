import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'

// Router defaultErrorComponent: a page crashed, the side menu and header stay usable.
export function RouteErrorFallback() {
  return (
    <div role="alert" className="mx-auto flex min-h-[50dvh] max-w-md flex-col justify-center gap-3">
      <h1 className="text-xl font-bold text-foreground">Что-то пошло не так</h1>
      <p className="text-muted-foreground">Перезагрузите страницу. Если ошибка повторится, напишите в поддержку.</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => window.location.reload()}>Перезагрузить</Button>
        <Button asChild variant="soft">
          <Link to="/">К конвейеру</Link>
        </Button>
      </div>
    </div>
  )
}
