import type * as React from "react"

/** One link of the CRM side menu (Figma `item-sidemenu-menu-tree-states`, 44px). */
export type SideMenuItemData = {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<React.ComponentProps<"svg">>
  /** Counter or badge after the label, e.g. <Badge size="sm">3</Badge>. */
  badge?: React.ReactNode
}

/** A group with an optional uppercase header (Figma `listMenu` + `header`, 36px). */
export type SideMenuSectionData = {
  id: string
  title?: string
  items: SideMenuItemData[]
  /** Header gets a chevron button that hides/shows the items. */
  collapsible?: boolean
  /** Extra control on the right of the header, e.g. a "+" icon button. */
  action?: React.ReactNode
}

export type SideMenuLinkProps = {
  item: SideMenuItemData
  className: string
  "aria-current"?: "page"
  children: React.ReactNode
}

/** Renders the link element; pass the router's Link here (default: a plain <a href>). */
export type RenderSideMenuLink = (props: SideMenuLinkProps) => React.ReactNode
