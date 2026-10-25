import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { useRequestDocuments } from '../api/mutations'
import type { Decision } from '../api/schemas'
import { applicationMessages as m } from '../lib/messages'
import { DecisionDialog } from './DecisionDialog'

type ApplicationActionsProps = {
  applicationId: string
  /** Buttons only while a decision is possible; the dialog stays mounted so its callbacks run. */
  canDecide: boolean
  /** After a decision: announce and move focus to the h1. */
  onDone: (message: string) => void
  /** Status text for screen readers (documents request result). */
  onMessage: (message: string) => void
}

/** Figma Summary actions: Отклонить (destructive) / Запросить документы / Одобрить кредит (primary). */
export function ApplicationActions({ applicationId, canDecide, onDone, onMessage }: ApplicationActionsProps) {
  const [decision, setDecision] = useState<Decision | null>(null)
  const requestDocs = useRequestDocuments(applicationId)

  const dialog = (
    <DecisionDialog applicationId={applicationId} decision={decision} onClose={() => setDecision(null)} onDone={onDone} />
  )
  if (!canDecide) return dialog
  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setDecision('reject')}>
        {m.reject}
      </Button>
      <Button
        variant="soft"
        size="sm"
        className="bg-secondary-muted text-link hover:bg-accent"
        loading={requestDocs.isPending}
        onClick={() =>
          requestDocs.mutate(undefined, {
            onSuccess: () => onMessage(m.docsRequested),
            onError: () => onMessage(m.docsError),
          })
        }
      >
        {m.requestDocs}
      </Button>
      <Button size="sm" onClick={() => setDecision('approve')}>
        {m.approve}
      </Button>
      {requestDocs.isError && (
        <p role="alert" className="basis-full text-sm text-destructive-text sm:order-last">
          {m.docsError}
        </p>
      )}
      {dialog}
    </>
  )
}
