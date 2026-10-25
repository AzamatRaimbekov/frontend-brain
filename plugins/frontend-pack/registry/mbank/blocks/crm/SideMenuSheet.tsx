import { useState } from "react"
import type * as React from "react"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { MenuIcon } from "./crm-icons"

type SideMenuSheetProps = {
  /** The same <SideMenu /> the desktop layout shows. */
  children: React.ReactNode
  label?: string
}

/**
 * Below 1024px the side menu moves into a left drawer opened by a menu button (put this in
 * TopHeader `leading`). Clicking a link inside closes it. Built on the kit Dialog: focus trap,
 * Esc, scroll lock come from Radix.
 */
export function SideMenuSheet({ children, label = "Главное меню" }: SideMenuSheetProps) {
  const [open, setOpen] = useState(false)
  const closeOnLink = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} className="lg:hidden">
          <MenuIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        onClick={closeOnLink}
        className="top-0 left-0 h-dvh max-h-dvh w-70 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none bg-surface-1 p-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
