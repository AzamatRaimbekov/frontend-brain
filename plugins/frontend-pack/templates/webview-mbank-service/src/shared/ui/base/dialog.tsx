import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { cn } from '@shared/libs/cn'

import type { ComponentProps } from 'react'

type DialogBackdropProps = Omit<
  ComponentProps<typeof DialogPrimitive.Backdrop>,
  'className'
> & {
  className?: string
}

type DialogContentProps = Omit<
  ComponentProps<typeof DialogPrimitive.Popup>,
  'className'
> & {
  className?: string
}

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        'fixed inset-0 min-h-dvh bg-overlay transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({ className, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      className={cn(
        'fixed rounded-[20px] bg-card text-foreground shadow-lg transition-[transform,opacity] duration-150 outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

const DialogTitle = DialogPrimitive.Title

const DialogDescription = DialogPrimitive.Description

const DialogClose = DialogPrimitive.Close

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
