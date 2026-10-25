// Rendered outside all providers (react-error-handling boundaries.md): plain elements, no router.
export function AppFallback() {
  return (
    <main role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-bold text-foreground">Что-то пошло не так</h1>
      <p className="text-muted-foreground">Перезагрузите страницу. Если ошибка повторится, напишите в поддержку.</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Перезагрузить
        </button>
        <a href="/" className="inline-flex h-11 items-center rounded-md bg-soft px-4 text-sm font-medium text-soft-foreground-strong">
          На главную
        </a>
      </div>
    </main>
  )
}
