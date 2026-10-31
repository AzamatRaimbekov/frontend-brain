import type * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { ChevronDownIcon } from "@/shared/ui/icons"

type UserMenuProps = {
  name: string
  role?: string
  avatarSrc?: string
  initials: string
  /** Green dot on the avatar (Figma `status` online). */
  online?: boolean
  /** DropdownMenuItem elements: Профиль, Сменить роль, Выйти. */
  children: React.ReactNode
}

/** Figma `avatarCont` in topHeader: soft pill, photo 36 (+ online dot) + name (14 bold) + role (11 muted) + chevron. */
export function UserMenu({ name, role, avatarSrc, initials, online = false, children }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="user-menu"
        aria-label={`Профиль: ${name}${online ? ", в сети" : ""}`}
        className="flex h-9 items-center gap-2 rounded-md text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30 md:bg-muted md:pr-2"
      >
        <span className="relative shrink-0">
          <Avatar size="md" className="size-9 rounded-md">
            {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
            <AvatarFallback className="rounded-md bg-surface-3">{initials}</AvatarFallback>
          </Avatar>
          {online && (
            <span aria-hidden="true" className="absolute -bottom-0.5 left-0.5 size-2 rounded-full bg-status-success ring-2 ring-muted" />
          )}
        </span>
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
