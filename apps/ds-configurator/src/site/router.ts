// Hash routes of the site (the server serves one index.html): #/ projects, #/p/<id>/<tab>,
// #/configurator the original shadcn /create fork.
import { useSyncExternalStore } from "react"

export type ProjectTab = "tokens" | "figma" | "code"
export type Route = { page: "projects" } | { page: "configurator" } | { page: "project"; id: string; tab: ProjectTab }

const TABS: ProjectTab[] = ["tokens", "figma", "code"]

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent)
  if (parts[0] === "configurator") return { page: "configurator" }
  if (parts[0] === "p" && parts[1]) {
    const tab = TABS.includes(parts[2] as ProjectTab) ? (parts[2] as ProjectTab) : "tokens"
    return { page: "project", id: parts[1], tab }
  }
  return { page: "projects" }
}

export const hrefOf = (route: Route) =>
  route.page === "project" ? `#/p/${encodeURIComponent(route.id)}/${route.tab}` : route.page === "configurator" ? "#/configurator" : "#/"

// The configurator keeps its preset in ?query, so the route lives in the hash only.
const subscribe = (fn: () => void) => {
  window.addEventListener("hashchange", fn)
  return () => window.removeEventListener("hashchange", fn)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "")
  return parseHash(hash)
}
