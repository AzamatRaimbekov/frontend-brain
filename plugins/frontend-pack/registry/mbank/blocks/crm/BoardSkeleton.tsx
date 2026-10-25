import { Skeleton } from "@/shared/ui/skeleton"

type BoardSkeletonProps = { columns?: number; cards?: number; label?: string }

/** Loading state of <Board />: the same column grid with card-sized placeholders. */
export function BoardSkeleton({ columns = 5, cards = 3, label = "Загружаем заявки" }: BoardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-slot="board-skeleton"
      className="grid auto-cols-[minmax(260px,85%)] grid-flow-col gap-3 overflow-hidden md:auto-cols-[minmax(240px,1fr)] xl:auto-cols-[minmax(200px,1fr)]"
    >
      {Array.from({ length: columns }, (_, column) => (
        <div key={column} className="flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mb-1 h-4 w-20" />
          {Array.from({ length: cards }, (_, card) => (
            <Skeleton key={card} className="h-35 rounded-md bg-surface-0" />
          ))}
        </div>
      ))}
    </div>
  )
}
