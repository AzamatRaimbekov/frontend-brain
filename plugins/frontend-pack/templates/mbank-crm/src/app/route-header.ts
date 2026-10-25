import type { BreadcrumbItem } from '@/shared/components/crm/Breadcrumbs'

/** What the layout shows in TopHeader and which menu item is current, per route (staticData). */
export type RouteHeader = {
  navId: string
  title?: string
  /** Breadcrumbs from the route params, e.g. the application id. */
  crumbs?: (params: Record<string, string>) => BreadcrumbItem[]
  /** Back link target for the chevron before the breadcrumbs. */
  backTo?: string
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    header?: RouteHeader
  }
}
