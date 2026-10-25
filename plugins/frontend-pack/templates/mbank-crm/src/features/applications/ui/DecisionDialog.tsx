import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { useDecision } from '../api/mutations'
import type { Decision } from '../api/schemas'
import { applicationMessages as m } from '../lib/messages'

type DecisionDialogProps = {
  applicationId: string
  /** null = closed. */
  decision: Decision | null
  onClose: () => void
  onDone: (message: string) => void
}

/**
 * Confirmation before an irreversible decision. The confirm button is a plain Button (not
 * AlertDialogAction): the dialog stays open while the request runs, closes on success,
 * shows the error inside on failure (react-ux).
 */
export function DecisionDialog({ applicationId, decision, onClose, onDone }: DecisionDialogProps) {
  const mutation = useDecision(applicationId)
  const copy = decision ? m.confirm[decision] : null

  const confirm = () => {
    if (!decision) return
    mutation.mutate(decision, {
      onSuccess: () => {
        onClose()
        onDone(m.decided[decision])
      },
    })
  }

  return (
    <AlertDialog
      open={decision !== null}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) {
          mutation.reset()
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy?.text}</AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive-text">
            {m.decisionError}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>{m.cancel}</AlertDialogCancel>
          <Button
            variant={decision === 'reject' ? 'destructive' : 'primary'}
            loading={mutation.isPending}
            onClick={confirm}
          >
            {copy?.action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
