// Project page: header and the three tabs (tokens, Figma, code). The tab lives in the hash.
import { Badge } from "@/generated/kit/ui/badge"
import { Skeleton } from "@/generated/kit/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/generated/kit/ui/tabs"

import { ErrorAlert } from "../error-alert"
import { useProject } from "../queries"
import { hrefOf, type ProjectTab } from "../router"
import { CodeTab } from "./code-tab"
import { FigmaTab } from "./figma-tab"
import { TokensTab } from "./tokens-tab"

export function ProjectPage({ id, tab }: { id: string; tab: ProjectTab }) {
  const query = useProject(id)
  const go = (next: string) => {
    window.location.hash = hrefOf({ page: "project", id, tab: next as ProjectTab })
  }

  if (query.isPending) {
    return (
      <main className="mx-auto grid max-w-7xl gap-4 p-4 md:p-6" aria-busy>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96" />
      </main>
    )
  }
  if (query.isError) {
    return (
      <main className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorAlert error={query.error} title="Проект не открылся" />
        <a href="#/" className="mt-3 inline-block text-sm text-link underline-offset-4 hover:underline">← К проектам</a>
      </main>
    )
  }
  const { project, tokens, rows } = query.data
  const changed = rows.filter((r) => r.overridden.light || r.overridden.dark).length

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <a href="#/" className="text-caption text-muted-foreground hover:text-foreground">← Проекты</a>
          <h1 className="truncate text-2xl font-semibold">{project.name}</h1>
          <p className="font-mono text-caption text-muted-foreground">{project.id}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="accent">Mbank · {tokens.brand}</Badge>
          <Badge>версия {tokens.version}</Badge>
          <Badge tone={changed ? "warning" : "clear"}>изменено {changed}</Badge>
          <Badge tone={tokens.custom.length ? "info" : "clear"}>своих {tokens.custom.length}</Badge>
        </div>
      </header>
      <Tabs value={tab} onValueChange={go}>
        <TabsList>
          <TabsTrigger value="tokens">Токены</TabsTrigger>
          <TabsTrigger value="figma">Figma</TabsTrigger>
          <TabsTrigger value="code">Код</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className="pt-4">
          <TokensTab detail={query.data} />
        </TabsContent>
        <TabsContent value="figma" className="pt-4">
          <FigmaTab detail={query.data} />
        </TabsContent>
        <TabsContent value="code" className="pt-4">
          <CodeTab detail={query.data} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
