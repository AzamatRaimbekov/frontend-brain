import { useRef, useState } from 'react'
import { ScoreCard } from '@/shared/components/crm/ScoreCard'
import { StageStepper } from '@/shared/components/crm/StageStepper'
import { SummaryHeader } from '@/shared/components/crm/SummaryHeader'
import { Timeline } from '@/shared/components/crm/Timeline'
import { TimelineItem } from '@/shared/components/crm/TimelineItem'
import type { Application } from '../api/schemas'
import { formatDateTime, formatMoney, formatPercent, formatTerm } from '../lib/format'
import { applicationMessages as m, applicationStatus, historyTone, riskBadge, stepTitles } from '../lib/messages'
import { ApplicationActions } from './ApplicationActions'
import { ApplicationSections } from './ApplicationSections'

/** Figma "CRM / Заявка на кредит / Андеррайтинг": summary, stages, two columns. */
export function ApplicationDetails({ application: a }: { application: Application }) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [announcement, setAnnouncement] = useState('')
  const context = [
    a.product,
    formatTerm(a.termMonths),
    a.rate !== null && `${formatPercent(a.rate)} годовых`,
    `подана ${formatDateTime(a.submittedAt)}`,
    a.channel,
  ].filter(Boolean).join(' · ')
  const canDecide = a.stage === 'underwriting' && a.outcome === null

  return (
    <div className="flex flex-col gap-4">
      <title>{`${m.title(a.id)} — Mbank CRM`}</title>
      <SummaryHeader
        title={m.title(a.id)}
        titleRef={titleRef}
        status={applicationStatus(a)}
        amount={formatMoney(a.amount, a.currency)}
        context={context}
        actions={
          <ApplicationActions
              applicationId={a.id}
              canDecide={canDecide}
              onDone={(message) => {
                setAnnouncement(message)
                titleRef.current?.focus()
              }}
              onMessage={setAnnouncement}
            />
        }
      />
      <p role="status" className="sr-only">{announcement}</p>
      <StageStepper stages={a.steps.map((s) => ({ id: s.stage, title: stepTitles[s.stage], state: s.state, meta: s.meta }))} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <ApplicationSections application={a} />
        </div>
        <div className="flex flex-col gap-4">
          {a.scoring && (
            <ScoreCard
              score={a.scoring.score}
              scoreTone={a.scoring.risk === 'low' ? 'success' : a.scoring.risk === 'high' ? 'error' : 'warning'}
              scale={`из ${a.scoring.max} · модель ${a.scoring.model}`}
              risk={riskBadge[a.scoring.risk]}
              reasons={a.scoring.reasons.map((text, i) => ({ id: String(i), text, tone: riskBadge[a.scoring!.risk].tone }))}
              meta={`Назначен: ${a.scoring.assignee} · SLA до ${a.scoring.slaUntil}`}
            />
          )}
          <Timeline title="История заявки" empty={<p className="text-sm text-muted-foreground">Событий пока нет</p>}>
            {a.history.map((entry) => (
              <TimelineItem
                key={entry.id}
                title={entry.title}
                meta={`${formatDateTime(entry.at)} · ${entry.actor}`}
                dateTime={entry.at}
                tone={historyTone[entry.kind]}
              />
            ))}
          </Timeline>
        </div>
      </div>
    </div>
  )
}
