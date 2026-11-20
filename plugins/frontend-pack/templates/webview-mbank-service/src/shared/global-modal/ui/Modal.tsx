import { useAppSelector } from '@shared/hooks/useRedux'
import { cn } from '@shared/libs/cn'
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from '@shared/ui/base/dialog'

import { useGlobalModal } from '../hooks'
import { useGlobalModalSlice } from '../model/global-modal-slice'
import { GlobalModalPlacement } from '../model/types'

const contentPlacementClass: Record<GlobalModalPlacement, string> = {
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  top: 'left-1/2 top-0 -translate-x-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  left: 'left-0 top-1/2 -translate-y-1/2',
  right: 'right-0 top-1/2 -translate-y-1/2',
  custom: '',
}

const defaultSizeClass = 'w-fit max-w-[calc(100vw-32px)]'

const GlobalModal = () => {
  useGlobalModalSlice()

  const { closeModal } = useGlobalModal()

  const modal = useAppSelector((s) => s?.globalModal)
  const body = modal?.body
  const placement: GlobalModalPlacement = modal?.placement ?? 'center'

  return (
    <Dialog
      open={!!body}
      onOpenChange={(open) => {
        if (!open) {
          closeModal()
        }
      }}
    >
      <DialogPortal>
        <DialogBackdrop className={modal?.backdropClassName} />
        <DialogContent
          className={cn(
            contentPlacementClass[placement],
            modal?.positionClassName,
            modal?.sizeClassName ?? defaultSizeClass,
            modal?.contentClassName,
          )}
          style={modal?.contentStyle}
        >
          <DialogTitle className="sr-only">
            {modal?.title || 'Modal'}
          </DialogTitle>
          {body}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default GlobalModal
