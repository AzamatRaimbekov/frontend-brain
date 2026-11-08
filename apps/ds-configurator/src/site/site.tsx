// Root of the design-system site: top navigation and the page of the current hash route.
import { App as Configurator } from "@/App"
import { cn } from "@/generated/kit/lib/utils"

import { ProjectPage } from "./project/project-page"
import { ProjectsPage } from "./projects/projects-page"
import { hrefOf, useRoute, type Route } from "./router"

function NavLink({ to, active, children }: { to: Route; active: boolean; children: string }) {
  return (
    <a
      href={hrefOf(to)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-brand-ghost text-brand-ghost-foreground hover:bg-brand-ghost-hover"
      )}
    >
      {children}
    </a>
  )
}

export function Site() {
  const route = useRoute()
  return (
    <div className="min-h-svh bg-surface-1 text-foreground">
      <nav aria-label="Разделы" className="flex items-center gap-2 border-b border-border bg-background px-4 py-2 md:px-6">
        <a href="#/" className="mr-3 flex items-center gap-2 font-semibold">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-brand text-sm text-brand-foreground">DS</span>
          Дизайн-системы
        </a>
        <NavLink to={{ page: "projects" }} active={route.page !== "configurator"}>Проекты</NavLink>
        <NavLink to={{ page: "configurator" }} active={route.page === "configurator"}>Конфигуратор</NavLink>
      </nav>
      {route.page === "configurator" ? <Configurator /> : null}
      {route.page === "projects" ? <ProjectsPage /> : null}
      {route.page === "project" ? <ProjectPage id={route.id} tab={route.tab} /> : null}
    </div>
  )
}
