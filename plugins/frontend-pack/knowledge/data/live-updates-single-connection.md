---
title: Живые обновления (WebSocket/SSE) — одно соединение на приложение, события инвалидируют кэш Query
type: recipe
stack: [react, vite, next]
tags: [websocket, sse, eventsource, realtime, invalidate, reconnect, ticket]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Что встретилось в двух проектах:

- четыре хука открывают свой `new EventSource('/api/stream')` на один и тот же поток; данные лежат в
  `useState`, ответ приводится через `as T`. По HTTP/1.1 у браузера 6 соединений на origin на все вкладки:
  две вкладки портала съедают лимит, и обычные запросы начинают висеть;
- WebSocket не переподключается после обрыва, события пишутся в zustand, а рядом шапка всё равно
  опрашивает уведомления через `setInterval`.

Удачные находки: перед WebSocket берётся одноразовый короткоживущий тикет (`POST /ws-ticket`), потому что
cookie в cross-site WS не уходит; в `onopen` данные перечитываются, чтобы догнать пропущенное.

## Решение

Один хук в корне приложения. Сокет — только сигнал «данные устарели», данные приходят из кэша Query.

```ts
export function useLiveEvents() {
  const queryClient = useQueryClient()
  useEffect(() => {
    let ws: WebSocket | null = null
    let stopped = false
    let attempt = 0
    const retry = () => { if (!stopped) setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempt++)) }
    async function connect() {
      try {
        const { ticket } = await http('/ws-ticket', { method: 'POST', schema: ticketSchema })
        ws = new WebSocket(`${wsBase()}/ws/me?ticket=${encodeURIComponent(ticket)}`)
        ws.onopen = () => { attempt = 0; void queryClient.invalidateQueries() }   // догоняем пропущенное
        ws.onmessage = (m) => {
          const ev = liveEventSchema.safeParse(JSON.parse(m.data))
          if (!ev.success) return
          if (ev.data.type === 'notification') void queryClient.invalidateQueries({ queryKey: notificationQueries.all() })
          if (ev.data.type === 'task') queryClient.setQueryData(taskQueries.list().queryKey, (old = []) => upsert(old, ev.data.task))
        }
        ws.onclose = retry
      } catch { retry() }
    }
    void connect()
    return () => { stopped = true; ws?.close() }
  }, [queryClient])
}
```

- SSE — то же самое: `EventSource` сам переподключается, нужен только `onopen` + `onmessage`.
- Страховка на время обрыва — `refetchInterval: 60_000` в запросе уведомлений, не `setInterval`.
- Экраны читают данные через обычный `useQuery`; для подсветки нового элемента хранят только id.

## Почему

Одно соединение вместо N, один кэш, события валидируются Zod на границе. Экраны не знают про транспорт,
SSE можно заменить на WebSocket без правки UI. Тикет вместо токена в URL не утекает в логи прокси.

## Источник

Найдено во внутреннем портале (Vite, SSE, `modules/*/use*.ts`) и SPA онбординга (`src/api/liveSocket.ts`),
октябрь 2026. https://tkdodo.eu/blog/using-web-sockets-with-react-query
