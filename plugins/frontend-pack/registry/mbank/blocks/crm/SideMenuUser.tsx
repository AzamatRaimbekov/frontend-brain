import type * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { MoreVerticalIcon } from "./crm-icons"

type SideMenuUserProps = {
  name: string
  role?: string
  avatarSrc?: string
  /** Two letters shown while the photo loads or when there is none. */
  initials: string
  /** DropdownMenuItem elements (Профиль, Выйти). Without them the "⋮" button is hidden. */
  children?: React.ReactNode
}

/** User card at the bottom of the Figma `sideMenu` (role above the short name, "⋮" menu). */
export function SideMenuUser({ name, role, avatarSrc, initials, children }: SideMenuUserProps) {
  return (
    <div data-slot="side-menu-user" className="flex h-11 items-center gap-3 rounded-md bg-surface-2 px-3">
      <Avatar size="xs" className="size-7">
        {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        {role && <span className="truncate text-2xs text-muted-foreground">{role}</span>}
        <span className="truncate text-sm text-foreground">{name}</span>
      </div>
      {children && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Меню пользователя"
            className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <MoreVerticalIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
