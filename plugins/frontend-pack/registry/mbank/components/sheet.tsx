import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { CloseIcon } from "./icons"

/*
 * Side panel on Radix Dialog: record details, filters, edit forms next to a CRM table.
 * Same overlay, surface, shadow and z-index as Dialog (misc/overlay/default, onsurface/0,
 * shadow/modal, z-modal). On phones the bottom side is the web stand-in for Bottom sheet.
 */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

const sheetVariants = cva(
  "fixed z-(--z-modal) flex flex-col gap-4 overflow-y-auto bg-card text-card-foreground shadow-modal outline-none transition ease-in-out data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:duration-200 motion-reduce:animate-none",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-full border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:max-w-md",
        left: "inset-y-0 left-0 h-full w-full border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-md",
        top: "inset-x-0 top-0 max-h-dvh border-b border-border data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        bottom: "inset-x-0 bottom-0 max-h-dvh rounded-t-lg border-t border-border data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
      },
      size: {
        md: "",
        lg: "sm:max-w-2xl",
      },
    },
    defaultVariants: { side: "right", size: "md" },
  },
)

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    showCloseButton?: boolean
  }

function SheetContent({ className, children, side = "right", size = "md", showCloseButton = true, ...props }: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-(--z-overlay) bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetVariants({ side, size }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Закрыть</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-6 pr-14 pb-0", className)} {...props} />
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("flex-1 px-6", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 border-t border-border p-6 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-xl font-bold", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription, sheetVariants }
