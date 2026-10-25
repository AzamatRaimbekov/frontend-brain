import { Link } from '@tanstack/react-router'
import { ApplicationCard } from '@/shared/components/crm/ApplicationCard'
import { Board } from '@/shared/components/crm/Board'
import { BoardColumn } from '@/shared/components/crm/BoardColumn'
import { ShowMore } from '@/shared/components/crm/ShowMore'
import type { Pipeline, Stage } from '../api/schemas'
import { cardBadge, cardMeta, formatMoney, formatTime } from '../lib/format'
import { stageTitles } from '../lib/messages'

/** Kanban of the credit pipeline: one column per stage, cards link to the application page. */
type PipelineBoardProps = {
  columns: Pipeline['columns']
  /** "Показать ещё N": the page decides where the full list of a stage lives. */
  onShowMore: (stage: Stage) => void
}

export function PipelineBoard({ columns, onShowMore }: PipelineBoardProps) {
  return (
    <Board label="Этапы конвейера">
      {columns.map((column) => (
        <BoardColumn
          key={column.stage}
          title={stageTitles[column.stage]}
          count={column.total}
          sla={column.slaLabel}
          footer={
            <ShowMore
              count={column.total - column.items.length}
              onClick={() => onShowMore(column.stage)}
            />
          }
        >
          {column.items.map((card) => (
            <ApplicationCard
              key={card.id}
              id={card.id}
              time={formatTime(card.submittedAt)}
              title={card.borrowerName}
              amount={formatMoney(card.amount, card.currency)}
              meta={cardMeta(card)}
              status={cardBadge(card)}
              href={`/applications/${card.id}`}
              renderLink={({ className, children }) => (
                <Link to="/applications/$applicationId" params={{ applicationId: card.id }} className={className}>
                  {children}
                </Link>
              )}
            />
          ))}
        </BoardColumn>
      ))}
    </Board>
  )
}
