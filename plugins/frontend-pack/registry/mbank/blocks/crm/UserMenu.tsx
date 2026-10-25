import type * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { ChevronDownIcon } from "@/shared/ui/icons"

type UserMenuProps = {
  name: string
  role?: string
  avatarSrc?: string
  initials: string
  /** DropdownMenuItem elements: Профиль, Сменить роль, Выйти. */
  children: React.ReactNode
}

/** Figma `avatarCont` in topHeader: avatar 36 + name (14 bold) + role (11 muted) + chevron. */
export function UserMenu({ name, role, avatarSrc, initials, children }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="user-menu"
        aria-label={`Профиль: ${name}`}
        className="flex h-9 items-center gap-2 rounded-md text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/30 md:pr-2"
      >
        <Avatar size="md" className="size-9">
          {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-col xl:flex">
          <span className="truncate text-sm font-bold text-foreground">{name}</span>
          {role && <span className="truncate text-2xs text-muted-foreground">{role}</span>}
        </span>
        <ChevronDownIcon className="hidden size-5 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}
