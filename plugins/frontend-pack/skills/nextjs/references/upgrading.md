# Upgrading Next.js

Verified against Next.js 16.4.3 (2026-10-25). Always re-check the live guide for the target major
(`https://nextjs.org/docs/app/guides/upgrading/version-<major>`) - `scripts/nextjs-news.mjs` prints it.

## Support and urgency

| Line | Status (nextjs.org/support-policy, 2026-10-25) | What to do |
|---|---|---|
| 16.x | Active LTS: features, fixes, security | stay on the latest 16 patch |
| 15.x | Maintenance LTS: critical and security fixes only, two years from 2024-10-21 | move to the latest 15.5.x now, plan 16 |
| ≤ 14.x | unsupported | upgrade is a security task |

Security releases in 2026 came almost monthly (July, August, September, October). Patch releases are low-risk:
apply them within the week. Minor releases: within the sprint after reading the release post. Majors: planned task
with the codemods below. Never run canary in production.

## Procedure

1. `node <plugin-root>/scripts/nextjs-news.mjs --project .` - versions, security posts since the installed one.
2. Branch, clean tree, green `typecheck`/`lint`/`test`/`build` before starting.
3. Codemod for the jump: `npx @next/codemod@latest upgrade patch|minor|major` (or a target like `16`). It
   updates Next.js, React and React DOM and runs the version's codemods (`--yes` in CI/agents;
   `--skip-react-upgrade`, `--skip-eslint-upgrade` when needed).
   Agent-driven alternative: `npx next@canary upgrade --agent=latest` (canary only runs the newest upgrade tooling;
   the target is the latest stable).
4. Grep for what the codemod does not cover (lists below), fix, run the project checks and the e2e smoke.
5. Read the release post's "experimental" section separately: nothing experimental goes in as part of an upgrade.

## 15 → 16 (breaking)

- Node.js ≥ 20.9, TypeScript ≥ 5.1; Turbopack is the default for `dev` and `build` (custom webpack config:
  migrate or build with `--webpack`).
- Sync `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` removed:
  `npx @next/codemod@latest next-async-request-api .`; types via `npx next typegen` (`PageProps<'/route'>`).
- `middleware.ts` → `proxy.ts`, export `proxy`, Node.js runtime only: `npx @next/codemod@latest middleware-to-proxy .`
- `revalidateTag(tag)` needs a second argument (`'max'` or a `cacheLife` profile); new `updateTag`, `refresh`.
- `next lint` removed, `eslint` key in `next.config` removed: `npx @next/codemod@canary next-lint-to-eslint-cli .`
  (`next build` no longer lints - keep lint in CI).
- `serverRuntimeConfig`/`publicRuntimeConfig` removed: env vars.
- `experimental.dynamicIO`/`experimental.useCache` removed: `cacheComponents`. `experimental_ppr` segment config
  removed: `npx @next/codemod@latest remove-experimental-ppr .`
- `next/image`: `qualities` default `[75]`, `minimumCacheTTL` default 4 h, `imageSizes` without 16, local IPs
  blocked, max redirects limited, `priority` deprecated, `images.domains` deprecated, local images with query
  strings need `images.localPatterns.search`.
- Parallel routes: every slot needs `default.tsx`.
- AMP removed. `unstable_rootParams` → `next/root-params`. React 19.2 (16.4 ships React 19.3).
- OG/icon image functions receive `params`/`id` as Promises; sitemap `id` is a Promise.

## 16.x minors worth knowing

| Version | Stable | Experimental / opt-in |
|---|---|---|
| 16.2 (2026-03) | bundled docs in `node_modules/next/dist/docs`, adapters, new error page, Server Function logging | `unstable_catchError`, `unstable_retry` in `error.tsx` |
| 16.3 (2026-08) | `catchError` + `retry` in error boundaries, Partial Prefetching, managed `AGENTS.md`, root params, glob imports | Rust React Compiler, network resilience |
| 16.4 (2026-10) | Cache Components recommended for every app and default in `create-next-app`, `ensureStatic`, React 19.3, smaller bundles | `agentUpgrade` reminders (on, policy `security`), `agentFeedback`, lazy dynamic imports, worker threads, Turbopack GC |

Upgrade within 16.x with `npx @next/codemod@latest upgrade minor`; 16.3 adds codemods `remove-partial-prefetch`
and `cache-components-instant-false` (only when adopting Cache Components).

## 14 → 15 (if a project is still there)

React 19; async request APIs (temporary sync access); `fetch`, `GET` route handlers and the client router cache
are no longer cached by default; `runtime: 'experimental-edge'` → `'edge'`; `geo`/`ip` removed from `NextRequest`.
Go 14 → 15 → 16 with the codemod at each step and a green build between them.

## Adopting Cache Components in an existing app

Not part of a version upgrade. Separate task, feature by feature: official skill
`npx skills add vercel/next.js --skill next-cache-components-adoption` or the "Migrating to Cache Components"
guide. Remove `export const revalidate`/`dynamic`/`fetchCache` as each route moves to `'use cache'` + `Suspense`.
