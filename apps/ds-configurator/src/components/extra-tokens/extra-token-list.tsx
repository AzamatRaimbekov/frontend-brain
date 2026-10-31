// Added tokens with their light/dark value and the AA contrast result per mode.
import { Badge } from "@/generated/kit/ui/badge"
import { Button } from "@/generated/kit/ui/button"
import { CloseIcon } from "@/generated/kit/ui/icons"
import { MIN_TEXT_CONTRAST, type ContrastResult } from "@/lib/extra-tokens"
import type { ExtraToken } from "@/lib/types"

type ExtraTokenListProps = { extras: ExtraToken[]; checks: ContrastResult[]; onRemove: (name: string) => void }

function Value({ token, mode }: { token: ExtraToken; mode: "light" | "dark" }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
      {token.kind === "color" ? (
        <span className="size-3.5 shrink-0 rounded-xs ring-1 ring-border" style={{ background: token[mode] }} aria-hidden />
      ) : null}
      <span className="truncate font-mono">{token[mode]}</span>
    </span>
  )
}

export function ExtraTokenList({ extras, checks, onRemove }: ExtraTokenListProps) {
  if (!extras.length) {
    return <p className="text-sm text-muted-foreground">Пока нет своих токенов. Они попадут во все три экспорта.</p>
  }
  return (
    <ul className="grid gap-2">
      {extras.map((t) => (
        <li key={t.name} className="grid gap-1.5 rounded-md border border-border p-2.5">
          <div className="flex items-center justify-between gap-2">
            <code className="truncate text-sm font-medium">--{t.name}</code>
            <Button variant="ghost" size="xs" aria-label={`Удалить ${t.name}`} onClick={() => onRemove(t.name)}>
              <CloseIcon />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Value token={t} mode="light" />
            <Value token={t} mode="dark" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="clear" size="sm">{t.kind}</Badge>
            {checks
              .filter((c) => c.name === t.name)
              .map((c) => (
                <Badge key={c.mode} tone={c.ok ? "success" : "error"} size="sm" title={`на --${c.pair}, нужно ≥ ${MIN_TEXT_CONTRAST}`}>
                  {c.mode}: {c.ratio === null ? "нет пары" : `${c.ratio}:1`}
                </Badge>
              ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
