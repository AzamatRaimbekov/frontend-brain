---
name: nextjs
description: Current Next.js App Router practices from nextjs.org plus live news and upgrade advice for Mdigital projects. Use for any Next.js project or decision - new app, App Router feature, Server and Client Components, Cache Components ('use cache', cacheLife, cacheTag), revalidation, Server Actions and their security, route handlers, proxy (ex middleware), metadata and SEO pages, next/image and next/font, streaming and loading/error files, env vars, self-hosting with Docker standalone and nginx, upgrades and codemods, and "what is new in Next.js / should we upgrade". Triggers - "next.js", "nextjs", "некст", "app router", "server components", "server actions", "кэш в next", "обнови next", "что нового в next", "next 16", "SSR", "SEO страница", "use cache", "proxy.ts", "middleware", "standalone", "upgrade next".
---

# Next.js (App Router)

When running in Codex, first read [Codex integration](../../references/codex.md).

**Verified against Next.js 16.4.3, 2026-10-25** (docs index `@doc-version: 16.4.3`). Facts that change between
versions are marked with the version that introduced them. Every rule has a source in
[references/sources.md](references/sources.md).

## Order of truth

1. **The project's own Next.js docs.** Next.js 16.2+ ships version-matched docs in `node_modules/next/dist/docs/`;
   16.3+ also writes a managed block into `AGENTS.md` (between `<!-- BEGIN:nextjs-agent-rules -->` markers - never
   delete it, commit it). Read the relevant page there before writing code: it matches the installed version, this
   skill may not. Older projects: `npx @next/codemod@canary agents-md` downloads a matching copy to `.next-docs/`.
2. **Mdigital rules** win for libraries, folders and limits: `rules/libraries.json`, `react-architecture`
   (`src/` layout, thin `app/`, 150-line files), `react-data-fetching` (TanStack Query is the client data layer,
   SWR forbidden even though nextjs.org documents it), `react-error-handling`, `react-security-i18n`.
3. **This skill** for how the two fit together. If nextjs.org now says something different, follow nextjs.org for
   framework behaviour, keep the Mdigital rule for team choices, and tell the user about the difference.

## 0. Before touching code

- Read `package.json` (`next`, `react`), `next.config.*` (`cacheComponents`, `partialPrefetching`, `output`,
  `images`, `experimental`), and look for `app/` vs `pages/`, `proxy.ts` vs `middleware.ts`, `AGENTS.md`.
- **Which caching model?** `cacheComponents: true` → Cache Components ([references/caching.md](references/caching.md)).
  No flag → the previous model (`fetch` options, `revalidate` segment config, `unstable_cache`). Never mix the two
  vocabularies in one project; `create-next-app` 16.4+ turns Cache Components on by default.
- Next.js 16 needs Node.js ≥ 20.9 and TypeScript ≥ 5.1; Turbopack is the default bundler for `dev` and `build`.

## 1. Rendering model and the server/client boundary

- Every file in `app/` is a Server Component until `'use client'`. Put `'use client'` on the **leaves** that need
  state, effects, browser APIs or event handlers; keep pages and layouts server-side and thin (they compose
  `features/*` per `react-architecture`).
- Props crossing the boundary must be serializable. Pass Server Actions and promises, not class instances or
  functions. A Client Component can receive Server Components as `children`.
- Server-only modules (DB, secrets, Data Access Layer) start with `import 'server-only'` so an accidental client
  import fails the build. Client-only modules use `import 'client-only'`.
- Providers (`QueryClientProvider`, theme, i18n) live in one `'use client'` `src/app/providers.tsx` rendered by
  the root layout.

## 2. Data: fetch on the server, cache explicitly, TanStack Query on the client

- **Server-only data** (rendered by Server Components, never refetched on the client): call the feature fetcher
  (`http()` + Zod) directly in a Server Component. With Cache Components cache it with `'use cache'` +
  `cacheLife(...)` (+ `cacheTag(...)` for on-demand invalidation); without it, the read runs on every request.
- **Runtime APIs** (`cookies()`, `headers()`, `params`, `searchParams`, uncached `fetch`) must sit under a
  `<Suspense>` boundary or a segment `loading.tsx`, otherwise the dev overlay and `next build` report
  `blocking-route`. Prefer streaming a small dynamic hole over making the whole route dynamic.
- **Client data** (refetch, pagination, optimistic UI, live updates): TanStack Query, exactly as
  [react-data-fetching references/nextjs.md](../react-data-fetching/references/nextjs.md) - per-request
  `QueryClient` on the server, `void prefetchQuery` + `<HydrationBoundary>` with pending dehydration, consume with
  `useSuspenseQuery` under `<Suspense>`. Never render the same data both from a Server Component and a client
  `useQuery`.
- Never put user-specific data into a shared `'use cache'` entry unless the user id is an argument (part of the
  key); for cookie-bound reads use `'use cache: private'` or pass the extracted value as an argument.
- Parallelize independent awaits (`Promise.all` or sibling Suspense boundaries); avoid waterfalls across layouts.

## 3. Mutations: Server Actions done safely

Every Server Action is a public POST endpoint. Render-time gating is not security. Full code:
[references/server-actions.md](references/server-actions.md).

1. **Authenticate and authorize inside the action** (session from the DAL; check ownership by querying with the
   user id, never trust ids/owners/prices from the client).
2. **Validate input with Zod** (`safeParse`), return `ActionResult` for expected errors (shape owned by
   `react-error-handling`); throw only for unexpected failures.
3. **Return minimal DTOs**, never raw DB rows or `error.message`.
4. **Invalidate**: `updateTag(tag)` for read-your-own-writes (Server Actions only), `revalidateTag(tag, 'max')` for
   background refresh (the one-argument form is deprecated in 16), `revalidatePath` when tags are overkill,
   `refresh()` when only uncached UI changed. Call them before `redirect()` (it throws).
5. Client side: call the action from `useMutation({ mutationFn: action })` and invalidate Query keys in
   `onSuccess`, or use `useActionState` for simple forms. Actions are dispatched **one at a time per client** -
   no `Promise.all` of actions.
6. Self-hosted with more than one instance: set the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` at build for all
   instances and set `deploymentId` (see section 9).

## 4. Route handlers vs Server Actions

- **Server Action**: a mutation triggered by this app's UI.
- **Route handler** (`app/api/**/route.ts`): anything called by something other than our React tree (webhooks,
  mobile app, third parties, file downloads, streaming responses, CMS revalidation webhook calling
  `revalidateTag`). Return Problem Details JSON (`react-error-handling`). With Cache Components, `GET` handlers
  are prerendered like pages unless they read runtime data.
- Reads for Client Components with TanStack Query: either the external backend directly through `http()` or a
  thin route handler/BFF when secrets or cookies must stay server-side ([references/routing-and-proxy.md](references/routing-and-proxy.md)).

## 5. Proxy (formerly middleware)

- Next.js 16 renamed `middleware.ts` → `proxy.ts` (export `proxy`); it runs on the Node.js runtime and `runtime`
  config is not allowed there. Codemod: `npx @next/codemod@latest middleware-to-proxy .`
- Use it for redirects/rewrites that need the request, headers (CSP nonce, see `react-security-i18n`), and
  **optimistic** auth redirects (cookie present?). Never as the only authorization check: verify the session again
  in the DAL, Server Actions and route handlers. No slow data fetching in proxy; `fetch` cache options are ignored.
- Static redirects belong in `next.config` `redirects()`, not in proxy.

## 6. Metadata and SEO pages

- Static `export const metadata` or `generateMetadata` in `page.tsx`/`layout.tsx`; set `metadataBase` once in the
  root layout; `title.template` for the site suffix. File conventions: `sitemap.ts`, `robots.ts`,
  `opengraph-image.tsx`, `icon.*`. Share the data request between `generateMetadata` and the page with React
  `cache()`. Details: [references/seo-metadata.md](references/seo-metadata.md).
- Public SEO pages should be prerendered (static shell or `'use cache'` data) and can lock that in with
  `export const ensureStatic = 'navigation'` (16.4) so a dynamic component cannot slip in.

## 7. Images, fonts, scripts

- `next/image` with explicit `width`/`height` (or `fill` + `sizes`); for the LCP image `loading="eager"` or
  `fetchPriority="high"` (`priority` is deprecated in 16, `preload` only for special cases).
  Remote images: `images.remotePatterns` (`images.domains` is deprecated). Next.js 16 defaults: `qualities: [75]`,
  `minimumCacheTTL` 4 h, local IP targets blocked. Self-hosted on glibc Linux keep `sharp` current (security).
- `next/font` (`next/font/google` or `next/font/local`) in the root layout with `display: 'swap'` and a CSS
  variable consumed by Tailwind `@theme`; no `<link>` to Google Fonts.
- Third-party scripts via `next/script` with the lightest `strategy` (`lazyOnload` for chat widgets/analytics).

## 8. Streaming, loading and errors

- `loading.tsx` = one Suspense boundary for the whole segment; prefer explicit `<Suspense>` around the slow part
  with a skeleton that matches the final layout (`react-page-ux` states).
- `error.tsx`, `global-error.tsx`, `not-found.tsx`, `catchError`: follow
  [react-error-handling references/nextjs.md](../react-error-handling/references/nextjs.md) (prop is `retry` on
  16.3+, `reset` before).

## 9. Env vars, secrets, deployment

- `NEXT_PUBLIC_*` is **inlined at `next build`**: public values only, and they are frozen into the image. For one
  Docker image across dev/stage/prod, read runtime config on the server (after `await connection()` or in a
  dynamic segment) and pass it down, or route the browser to a relative `/api` that nginx proxies.
- Validate env with Zod in `src/shared/config/env.ts` (server) - only server code and the DAL read `process.env`.
- Self-hosting (Mdigital default: Docker + nginx): `output: 'standalone'`, copy `public/` and `.next/static`, run
  `node server.js` as a non-root user, nginx in front with buffering off for streaming, one cache handler shared by
  all instances, stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `deploymentId`, graceful `SIGTERM`.
  Full Dockerfile and nginx config: [references/self-hosting.md](references/self-hosting.md).
- Security headers and CSP (nonce via `proxy.ts` or SRI): `react-security-i18n`
  [references/security.md](../react-security-i18n/references/security.md).

## 10. Upgrading

Stay on the latest patch of a supported major (16.x Active LTS; 15.x Maintenance LTS until two years after its
2024-10-21 release). Security patches land as patch releases: apply them the same week. Minimum safe
versions and every advisory: [references/security-advisories.md](references/security-advisories.md). Steps, breaking changes per
major and codemods: [references/upgrading.md](references/upgrading.md).

## Что нового и советы

Use when the user asks "что нового в Next.js", "стоит ли обновляться", "обнови next", or before any upgrade.

1. Run `node <plugin-root>/scripts/nextjs-news.mjs --project <project-dir>` (add `--json` to parse, `--limit N`
   for more posts). It prints the installed and latest stable/canary versions, how far behind the project is, the
   latest patch on its own major, security releases and blog posts since its version, the upgrade guide and codemod.
2. Open with WebFetch the posts that matter (release posts and every security release since the installed
   version) and the upgrade guide it printed; nextjs.org serves Markdown for `Accept: text/markdown`.
3. Check the project against them: grep for each breaking change (e.g. `middleware.ts`, sync `cookies()`,
   one-argument `revalidateTag`, `images.domains`, `next lint`, `serverRuntimeConfig`) and each advisory's
   precondition (Server Actions used? `images.remotePatterns`? `'use cache'`? Pages Router ISR?).
4. Answer in Russian with: current vs latest version; **security first** - which advisories apply to this project
   and the minimum patched version; breaking changes that hit files that actually exist (with paths); the exact
   codemods (`npx @next/codemod@latest upgrade patch|minor|major`, or `npx next@canary upgrade --agent=latest`:
   canary runs the newest upgrade tooling, the target stays stable); new
   features worth adopting, each marked stable or experimental; a recommendation - upgrade now / plan / wait - with
   the reason. Experimental flags are never "must adopt".
5. **Never claim news you did not fetch in this session.** If the script reports no network, say so, use the
   verified-against version above and the project's `node_modules/next/dist/docs/`, and mark the advice as offline.

## Official Next.js agent tools: when to use them

Verified in `vercel/next.js/skills` (MIT) and `vercel/next-devtools-mcp` on 2026-10-25. They are optional, installed
per project with the user's consent (`npx skills add vercel/next.js --skill <name>`), and never replace Mdigital
rules: when one suggests SWR, CSS-in-JS or an unlisted package, our rules win.

| Tool | Recommend or use when | Do not use when |
|---|---|---|
| `next upgrade --agent` (`npx next@canary upgrade --agent=latest`) | any minor/major upgrade; it gathers the version's guides and codemods | the project has uncommitted work or no green build to compare with |
| `next-devtools-mcp` (`npx add-mcp next-devtools-mcp@latest`) | debugging a running `next dev`: routes, errors, compile issues, Server Action lookup | production/stage; unpatched Next.js older than 16.3.8 (dev MCP disclosure) |
| `next-dev-loop` | after each edit of a page, to verify it in a browser (needs `agent-browser` ≥ 0.27) | CI or headless servers without a browser |
| `next-cache-components-adoption` | moving an existing app to Cache Components, feature by feature, with checkpoints | as part of a version bump; apps that are not on 16.x |
| `next-cache-components-optimizer` | an app already on Cache Components needs a bigger static shell for a named route | before adoption is finished |
| `next-partial-prefetching-adoption` / `-optimizer` | adopting Partial Prefetching, then making chosen navigations instant with `instant()` tests | without Cache Components |
| `next-bundle-optimizer` (experimental) | audit of initial JS per route (audit-only mode first) | as an automatic fixer without review |

- `create-next-app` 16.4 turns `agentFeedback` on and the managed `AGENTS.md` block on. Client and banking projects:
  `--no-agent-feedback` (it needs Next.js telemetry); keep and commit the `AGENTS.md` block.
- Next.js recommends removing old "knowledge" skills for Next.js (`npx skills update`). That targets third-party
  copies of the docs, not this skill: here framework facts defer to `node_modules/next/dist/docs/`.

## Full references

- [references/practices-by-topic.md](references/practices-by-topic.md) - every current practice from nextjs.org by
  topic (security, caching, rendering, routing, deploy, performance, SEO, tooling, testing), with sources.
- [references/features-timeline.md](references/features-timeline.md) - new features and breaking changes per
  version (16.4 → 13), stable/experimental, codemods.
- [references/security-advisories.md](references/security-advisories.md) - every security release with affected
  and fixed versions; minimum safe version today.

## Anti-patterns

- `'use client'` at the top of a page or layout to "make it work"; a Context provider wrapping the whole app
  for server data.
- `fetch` in `useEffect`, SWR, or server data copied into Zustand (`react-data-fetching`).
- A Server Action without auth, ownership check and Zod; returning DB rows or `error.message`.
- Auth only in `proxy.ts`; data fetching in proxy.
- Secrets or per-stand URLs in `NEXT_PUBLIC_*`; one image per stand rebuilt because of them.
- Previous-model APIs (`export const revalidate`, `fetchCache`, `unstable_cache`) in a Cache Components app, or
  `'use cache'` on a function that reads cookies.
- Runtime APIs at the page top level with no `Suspense`/`loading.tsx` (blocking route).
- Several self-hosted instances with per-instance cache, random action encryption keys and no `deploymentId`.
- Upgrading majors by hand without the codemods; ignoring security releases; canary in production.

## Checklist

- [ ] Version and caching model identified; bundled docs consulted for anything version-specific.
- [ ] `'use client'` only on interactive leaves; server-only modules import `server-only`.
- [ ] Every runtime API read is under `<Suspense>`/`loading.tsx`; cached reads have `cacheLife` (+ `cacheTag`).
- [ ] Client server-state through TanStack Query with server prefetch + `HydrationBoundary`.
- [ ] Each Server Action: auth, ownership, Zod, `ActionResult`, DTO return, correct invalidation.
- [ ] Proxy only for redirects/headers/optimistic checks; matcher excludes static assets.
- [ ] Metadata: `metadataBase`, title template, sitemap/robots for public sites, OG image.
- [ ] `next/image` sizes, `remotePatterns`, `next/font`; LCP image prioritized.
- [ ] No secrets in `NEXT_PUBLIC_*`; env validated with Zod on the server.
- [ ] Docker: standalone, non-root, nginx without buffering, shared cache/encryption key/`deploymentId` if >1 pod.
- [ ] `next` on the latest patch of its major; news checked with `nextjs-news.mjs` before any upgrade advice.
