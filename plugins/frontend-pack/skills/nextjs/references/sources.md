# Sources

All checked on 2026-10-25 against Next.js 16.4.3 (docs index `@doc-version: 16.4.3`). Every docs page is also
served as Markdown (`<url>.md` or `Accept: text/markdown`); the index is https://nextjs.org/docs/llms.txt.

| Rule / fact | Source |
|---|---|
| Version-matched docs in `node_modules/next/dist/docs`, managed `AGENTS.md`, `agents-md` codemod, official Skills, docs over the network | https://nextjs.org/docs/app/guides/ai-agents |
| `next-devtools-mcp`, `/_next/mcp` runtime tools | https://nextjs.org/docs/app/guides/mcp |
| Server/Client Components, `server-only`, `client-only` | https://nextjs.org/docs/app/getting-started/server-and-client-components |
| Cache Components, `'use cache'`, Suspense for runtime APIs, `connection()`, random values | https://nextjs.org/docs/app/getting-started/caching |
| `cacheLife` profiles, `cacheTag`, `updateTag` vs `revalidateTag` vs `revalidatePath` | https://nextjs.org/docs/app/getting-started/revalidating |
| `'use cache'` cannot read cookies/headers; serialization; runtime cache in memory | https://nextjs.org/docs/app/api-reference/directives/use-cache |
| `'use cache: private'` / `'use cache: remote'` | https://nextjs.org/docs/app/api-reference/directives/use-cache-private , https://nextjs.org/docs/app/api-reference/directives/use-cache-remote |
| `blocking-route` fixes (stream / cache / `instant = false`), `loading.js` as Suspense | https://nextjs.org/docs/messages/blocking-prerender-dynamic |
| Previous caching model | https://nextjs.org/docs/app/guides/caching-without-cache-components |
| TanStack Query with Server Components, pending dehydration, `updateTag` + client cache, prerenderable hydration state | https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query |
| Server Actions: CSRF check, 1 MB limit, encryption, sequential dispatch, auth inside actions, choosing invalidation, deploy skew | https://nextjs.org/docs/app/guides/server-actions |
| `refresh()` only in Server Actions | https://nextjs.org/docs/app/api-reference/functions/refresh |
| Data Access Layer, DTOs, `taint`, only DAL reads `process.env` | https://nextjs.org/docs/app/guides/data-security |
| Proxy: rename from middleware, Node.js runtime, optimistic checks only, fetch cache ignored, codemod | https://nextjs.org/docs/app/getting-started/proxy , https://nextjs.org/docs/app/api-reference/file-conventions/proxy |
| Route handlers, Cache Components prerendering of `GET` | https://nextjs.org/docs/app/getting-started/route-handlers |
| Metadata, streaming metadata, `htmlLimitedBots`, React `cache()` dedupe, OG images | https://nextjs.org/docs/app/getting-started/metadata-and-og-images , https://nextjs.org/docs/app/api-reference/functions/generate-metadata |
| `ensureStatic` | https://nextjs.org/blog/next-16-4 , https://nextjs.org/docs/app/guides/keeping-pages-static |
| `next/image` `preload`/`priority` deprecation, `remotePatterns` with `URL` | https://nextjs.org/docs/app/api-reference/components/image |
| Fonts | https://nextjs.org/docs/app/getting-started/fonts |
| Env vars: server-only by default, `NEXT_PUBLIC_` inlined at build, runtime env after `connection()` | https://nextjs.org/docs/app/guides/environment-variables |
| Self-hosting: nginx in front, buffering off, cache handlers, encryption key, `deploymentId`, graceful shutdown | https://nextjs.org/docs/app/guides/self-hosting |
| `output: 'standalone'`, copying `public` and `.next/static`, `PORT`/`HOSTNAME` | https://nextjs.org/docs/app/api-reference/config/next-config-js/output |
| Official Dockerfile (non-root, standalone) - MIT | https://github.com/vercel/next.js/tree/canary/examples/with-docker |
| `create-next-app` defaults (Cache Components, AGENTS.md, agent feedback) | https://nextjs.org/docs/app/api-reference/cli/create-next-app |
| Upgrade 15 → 16 breaking changes | https://nextjs.org/docs/app/guides/upgrading/version-16 |
| Upgrade 14 → 15 | https://nextjs.org/docs/app/guides/upgrading/version-15 |
| Codemods and `upgrade` options | https://nextjs.org/docs/app/guides/upgrading/codemods |
| `next upgrade --agent`, policies | https://nextjs.org/docs/app/guides/upgrading/agent-upgrade |
| LTS policy (16 Active, 15 Maintenance, two years) | https://nextjs.org/support-policy |
| Cache Components recommended for all apps, default in 17; 16.4 features | https://nextjs.org/blog/next-16-4 |
| 16.3: `catchError`/`retry`, Partial Prefetching, managed AGENTS.md | https://nextjs.org/blog/next-16-3 |
| 16.2: bundled docs, adapters, `unstable_retry` | https://nextjs.org/blog/next-16-2 |
| October 2026 security update (RCE in `use cache` typed arrays, RCE via `sharp`, Server Actions DoS; 16.4.1 / 15.5.28) | https://nextjs.org/blog/nextjs-security-update-october-14-2026 |
| September 2026 security release (image SSRF with `remotePatterns`, ISR cache poisoning, dev MCP endpoint disclosure; 16.3.8 / 15.5.27) | https://nextjs.org/blog/september-2026-security-release |
| Blog feed used by `nextjs-news.mjs` | https://nextjs.org/feed.xml |
| Releases used by `nextjs-news.mjs` | https://api.github.com/repos/vercel/next.js/releases |

## Reused ideas

- Official Next.js Skills (`next-dev-loop`, `next-cache-components-adoption`, `next-bundle-optimizer`, ...) in
  https://github.com/vercel/next.js/tree/canary/skills - MIT (repository license). Referenced, not copied.
- Vercel React best practices are already vendored in `react-brain` (MIT, pinned commit) - not duplicated here.
- Next.js's own research finds always-loaded version-matched docs beat on-demand skills for framework facts
  (https://nextjs.org/docs/app/guides/ai-agents); that is why this skill sends the agent to
  `node_modules/next/dist/docs/` first and keeps only Mdigital decisions and procedures here.
