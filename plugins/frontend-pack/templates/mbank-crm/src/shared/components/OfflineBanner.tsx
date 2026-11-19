import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div role="status" className="sticky top-0 z-40 bg-muted px-4 py-2 text-center text-sm text-foreground">
      Нет интернета. Изменения отправим, когда связь вернётся.
    </div>
  )
}
