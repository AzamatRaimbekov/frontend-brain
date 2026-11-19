// Projects list: every design system on the site, and the form to start a new one.
import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { Badge } from "@/kit/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/kit/ui/card"
import { Skeleton } from "@/kit/ui/skeleton"

import type { ProjectSummary } from "../api"
import { useProjects } from "../queries"
import { hrefOf } from "../router"
import { CreateProjectForm } from "./create-project-form"

const date = (iso: string) => new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })

function ProjectCard({ p }: { p: ProjectSummary }) {
  const sync = p.figma?.lastSync
  return (
    <a href={hrefOf({ page: "project", id: p.id, tab: "tokens" })} className="group rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <CardTitle>{p.name}</CardTitle>
          <CardDescription className="font-mono">{p.id}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          <Badge variant="outline">shadcn</Badge>
          <Badge variant="outline">версия {p.version}</Badge>
          {p.overrides ? <Badge variant="secondary">изменено {p.overrides}</Badge> : null}
          <Badge variant={p.figma?.fileKey ? "default" : "outline"}>
            {p.figma?.fileKey ? `Figma${sync ? ` v${sync.version}` : ""}` : "Figma не привязан"}
          </Badge>
        </CardContent>
        <CardContent className="text-xs text-muted-foreground">Изменён {date(p.updatedAt)}</CardContent>
      </Card>
    </a>
  )
}

export function ProjectsPage() {
  const projects = useProjects()
  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="projects-title" className="grid content-start gap-4">
        <div>
          <h1 id="projects-title" className="text-2xl font-semibold">Проекты</h1>
          <p className="text-sm text-muted-foreground">
            Дизайн-система проекта: значения стандартных токенов shadcn и связь с файлом Figma.
          </p>
        </div>
        {projects.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : projects.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Не загрузились проекты</AlertTitle>
            <AlertDescription>{projects.error.message}</AlertDescription>
          </Alert>
        ) : projects.data.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">Проектов пока нет. Создайте первый справа.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.data.map((p) => <ProjectCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
      <CreateProjectForm />
    </main>
  )
}
