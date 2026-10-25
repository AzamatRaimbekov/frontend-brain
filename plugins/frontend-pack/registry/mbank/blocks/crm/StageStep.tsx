import { cn } from "@/shared/lib/utils"
import { StatusDot, type StatusDotTone } from "./StatusDot"

export type StageState = "done" | "current" | "upcoming" | "failed"

const dotTone: Record<StageState, StatusDotTone> = {
  done: "success",
  current: "warning",
  upcoming: "neutral",
  failed: "error",
}

const stateText: Record<StageState, string> = {
  done: "пройден",
  current: "текущий этап",
  upcoming: "впереди",
  failed: "не пройден",
}

type StageStepProps = { title: string; state: StageState; meta?: string }

/** One step of the Figma `Stages` row: 12px dot + name 14 (bold when current), meta caption. */
export function StageStep({ title, state, meta }: StageStepProps) {
  return (
    <li
      data-slot="stage-step"
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
      className="flex min-w-0 flex-col gap-1"
    >
      <span className="flex items-center gap-2">
        <StatusDot tone={dotTone[state]} />
        <span
          className={cn(
            "truncate text-sm text-foreground",
            state === "current" && "font-bold",
            state === "upcoming" && "text-muted-foreground",
          )}
        >
          {title}
        </span>
        <span className="sr-only">, {stateText[state]}</span>
      </span>
      {meta && <span className="truncate pl-5 text-caption text-muted-foreground sm:pl-0">{meta}</span>}
    </li>
  )
}
