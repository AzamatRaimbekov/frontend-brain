import { i18n } from '@/shared/i18n'

// Rendered outside all providers (react-error-handling boundaries.md): plain elements, i18n instance directly.
export function AppFallback() {
  return (
    <main role="alert" className="webview-screen flex flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">{i18n.t('crash.title')}</h1>
        <p className="max-w-xs text-muted-foreground">{i18n.t('crash.text')}</p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="h-14 rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
      >
        {i18n.t('common.reload')}
      </button>
    </main>
  )
}
