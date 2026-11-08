// WCAG AA of text tokens on their fill, light and dark: failures first, a count of the rest.
import { Badge } from "@/generated/kit/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/generated/kit/ui/card"

import type { ContrastCheck } from "../api"

export function ContrastPanel({ checks }: { checks: ContrastCheck[] }) {
  const failed = checks.filter((c) => !c.ok)
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle>Контраст AA</CardTitle>
        <CardDescription>
          Текст на своей подложке (X-foreground на X), 4.5:1. Пройдено {checks.length - failed.length} из {checks.length}.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {failed.length ? (
          <ul className="grid gap-1.5 text-sm">
            {failed.map((c) => (
              <li key={`${c.fg}-${c.mode}`} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-mono text-xs" title={`--${c.fg} на --${c.bg}`}>
                  --{c.fg} на --{c.bg}
                </span>
                <Badge size="sm" tone="error">{c.mode} {c.ratio ?? "?"}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <Badge tone="success">Все пары проходят</Badge>
        )}
      </CardContent>
    </Card>
  )
}
