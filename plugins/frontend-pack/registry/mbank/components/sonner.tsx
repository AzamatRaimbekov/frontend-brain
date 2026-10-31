import { Toaster as Sonner, toast, type ToasterProps } from "sonner"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `toast` (state default / error / info / success / warning, Type Light / Dark). sonner is the
 * only toast channel (rules/libraries.json). Unstyled sonner + kit tokens, so Light / Dark follows the
 * `.dark` class on <html> without next-themes. Mount one <Toaster /> in the app root, call toast().
 */
const toastClassNames = {
  toast:
    "group/toast flex w-full items-start gap-3 rounded-md border border-border bg-card p-4 text-sm text-card-foreground shadow-modal [&_[data-icon]]:mt-0.5 [&_[data-icon]]:size-5 [&_[data-icon]]:shrink-0",
  content: "flex flex-1 flex-col gap-1",
  title: "font-medium",
  description: "text-muted-foreground",
  actionButton:
    "inline-flex h-8 shrink-0 items-center rounded-sm bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary-hover",
  cancelButton:
    "inline-flex h-8 shrink-0 items-center rounded-sm bg-soft px-3 text-xs font-medium text-soft-foreground-strong transition-colors hover:bg-soft-hover",
  closeButton: "border-border bg-card text-muted-foreground hover:text-foreground",
  success: "[&_[data-icon]]:text-status-success",
  error: "[&_[data-icon]]:text-status-error",
  warning: "[&_[data-icon]]:text-status-warning",
  info: "[&_[data-icon]]:text-status-info",
  loading: "[&_[data-icon]]:text-muted-foreground",
} satisfies NonNullable<ToasterProps["toastOptions"]>["classNames"]

function Toaster({ className, toastOptions, position = "top-right", ...props }: ToasterProps) {
  return (
    <Sonner
      position={position}
      className={cn("toaster group", className)}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: { ...toastClassNames, ...toastOptions?.classNames },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
export type { ToasterProps }
