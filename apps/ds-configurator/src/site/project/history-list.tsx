// Last versions of the project's tokens: who wrote them (site or Figma) and what changed.
import { Badge } from "@/generated/kit/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { Skeleton } from "@/generated/kit/ui/skeleton"

import { ErrorAlert } from "../error-alert"
import { useHistory } from "../queries"

const when = (iso: string) => new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
const list = (label: string, names: string[]) => (names.length ? `${label}: ${names.slice(0, 6).join(", ")}${names.length > 6 ? ` +${names.length - 6}` : ""}` : null)

export function HistoryList({ id }: { id: string }) {
  const history = useHistory(id)
  return (
    <Card className="py-4 lg:col-span-2">
      <CardHeader className="px-4">
        <CardTitle>История версий</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {history.isPending ? <Skeleton className="h-16" /> : history.isError ? <ErrorAlert error={history.error} /> : (
          <ul className="grid gap-2 text-sm">
            {history.data.map((h) => {
              const parts = [list("изменены", h.changed), list("добавлены", h.added), list("удалены", h.removed)].filter(Boolean)
              return (
                <li key={h.version} className="flex flex-wrap items-baseline gap-2">
                  <Badge size="sm">v{h.version}</Badge>
                  <Badge size="sm" tone={h.by === "figma" ? "accent" : "info"}>{h.by === "figma" ? "из Figma" : "сайт"}</Badge>
                  <span className="text-muted-foreground">{when(h.at)}</span>
                  <span className="min-w-0">{parts.length ? parts.join(" · ") : h.version === 1 ? "проект создан" : "без изменений токенов"}</span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
