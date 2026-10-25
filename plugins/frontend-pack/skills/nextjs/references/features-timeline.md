# Next.js: новые возможности и ломающие изменения по версиям

Сводка из постов nextjs.org/blog (13.0 → 16.4.3), проверено 2026-10-25. Статусы указаны на момент поста:
пометка «experimental»/«beta»/*(эксперимент.)* значит, что в прод без отдельного решения не берём; в скобках
указано, что стало с фичей позже. Пошаговое обновление и полный список кодмодов: [upgrading.md](upgrading.md).
Исправления безопасности: [security-advisories.md](security-advisories.md). Свежее (после 2026-10-25) берётся
только из `scripts/nextjs-news.mjs` и самого поста.

## Кодмоды по версиям

| Версия | Кодмод | Что делает |
|---|---|---|
| любая | `npx @next/codemod@latest upgrade patch\|minor\|major` | обновляет Next.js, React, React DOM и запускает кодмоды версии |
| любая | `npx next@canary upgrade --agent=latest` | агентный апгрейд с гайдами и проверкой |
| 16.3 | `remove-partial-prefetch`, `cache-components-instant-false` | при включении Partial Prefetching / Cache Components |
| 16.0 | `middleware-to-proxy`, `next-lint-to-eslint-cli`, `remove-experimental-ppr`, `remove-unstable-prefix` | proxy, ESLint CLI, уборка флагов |
| 15.0 | `next-async-request-api`, `app-dir-runtime-config-experimental-edge` | async `params`/`cookies()`/`headers()` |
| <16.2 | `agents-md` | версия-специфичные docs для агента в `.next-docs/` |

Синтаксис: `npx @next/codemod@latest <transform> <path>` (у части кодмодов в доках указан `@canary`).

## 16.4
Посты: [Next.js 16.4](https://nextjs.org/blog/next-16-4) (2026-10-06), [Improving navigation experience in v0 with Next.js 16.4](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4) (2026-10-16)
**Новое:**
- Partial Prefetching (с 16.3, по умолчанию в create-next-app с 16.4)
- prefetch={true} на Link теперь резолвит динамический маршрут и включает его кэшированный контент
- Skill next-partial-prefetching-optimizer (16.4) и next-partial-prefetching-adoption
- instant() — Playwright-хелпер из @next/playwright для тестов мгновенной навигации
- ensureStatic = 'navigation' | 'prefetch' | 'shell' — stable в 16.4
- navigation() и prefetch() из next/cache — контроль этапов загрузки
- next upgrade --agent — агентный апгрейд
- experimental.agentUpgrade ('security' по умолчанию, 'latest', false) — experimental
- experimental.agentFeedback — experimental, требует телеметрии, не работает в CI
- React 19.3: стабильные View Transitions, Fragment Refs, browser() API
- Turbopack: диск-кэш на 20–25% меньше, lazy server HMR, общий runtime, короче имена CSS Modules и export mangling в проде
- Experimental: Rust React Compiler (reactCompiler + experimental.turbopackRustReactCompiler), turbopackGc, turbopackLazyDynamicImports, turbopackPluginRuntimeStrategy: 'workerThreads' (на Node 24.13.1+ откатывается на child processes), turbopackAdditionalRoots
- Bundle Analyzer: сводка маршрутов, табличный вид, снапшоты и diff; Skill next-bundle-optimizer — experimental
**Ломает / требует действий:**
- Cache Components станут моделью по умолчанию в Next.js 17 — готовить миграцию существующих приложений

## 16.3
Посты: [Next.js 16.3: Instant Navigations](https://nextjs.org/blog/next-16-3-instant-navigations) (2026-06-25), [Next.js 16.3: AI Improvements](https://nextjs.org/blog/next-16-3-ai-improvements) (2026-06-26), [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) (2026-06-29), [Next.js 16.3](https://nextjs.org/blog/next-16-3) (2026-08-03), [Making Navigations Instant in v0](https://nextjs.org/blog/making-v0-navigations-instant) (2026-08-06), [How Turbopack chunks your JavaScript](https://nextjs.org/blog/turbopack-chunking) (2026-09-03)
**Новое:**
- experimental.turbopackChunking.generateComponentChunks — experimental (16.3+)
- experimental.turbopackChunking: firstPageLoadPriority, priorityRoutes, clusters — experimental
- experimental.turbopackCjsTreeShaking — experimental
- Лёгкий runtime без WebAssembly/Web Worker кода по умолчанию
- instant() test helper в @next/playwright: стабильно в 16.3
- Skills next-cache-components-optimizer и next-cache-components-adoption
- Memory eviction и dev FS cache по умолчанию: стабильно
- Поддержка TypeScript 7 для type check в next build: стабильно
- Native Node.js streams в рендеринге App Router: стабильно
- Версионированный блок AGENTS.md, который пишет next dev: стабильно
- Prefetch inlining (объединение мелких prefetch-запросов): стабильно
- Immutable static assets, переиспользуемые между деплоями: опционально
- catchError из 'next/error': стабильно
- import.meta.glob в Turbopack: стабильно
- Root params ('next/root-params'): стабильно в Server Components, route handlers и Server Actions позже
- Instant Navigations (cacheComponents, partialPrefetching, Instant Insights, Navigation Inspector, instant() helper, новый ISR с shell): opt-in
- Rust React Compiler (experimental.turbopackRustReactCompiler): экспериментально
- Network resilience (experimental.useOffline, useOffline из 'next/offline'): экспериментально
- turbopackFileSystemCacheForBuild включён по умолчанию: стабильно
- experimental.turbopackLocalPostcssConfig: экспериментально
- Retry загрузки чанков при ошибке, поддержка module-sync export condition
- agent-browser 0.27 с командами react tree/inspect/renders/suspense (next-browser влит в него)
- Actionable errors с Copy prompt для Instant Insights
- MCP /_next/mcp: новые инструменты диагностики сборки, knowledge-base инструменты убраны
- Docs as Markdown (.md к URL)
- cacheComponents: opt-in, станет дефолтом в следующей мажорной версии
- export const instant = false для блокирующих навигаций
**Ломает / требует действий:**
- Прежние knowledge Skills для Next.js выведены из употребления в пользу bundled docs через AGENTS.md
- Prefetch меняется с per-link на per-route shell при включении partialPrefetching

## 16.2
Посты: [Next.js 16.2](https://nextjs.org/blog/next-16-2) (2026-03-18), [Next.js 16.2: AI Improvements](https://nextjs.org/blog/next-16-2-ai) (2026-03-18), [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) (2026-03-18), [Next.js Across Platforms: Adapters, OpenNext, and Our Commitments](https://nextjs.org/blog/nextjs-across-platforms) (2026-03-25)
**Новое:**
- Adapter API: стабильно с 16.2
- Тестовый набор для адаптеров
- Verified adapters (Vercel, Bun; Netlify/Cloudflare/AWS через OpenNext в разработке)
- Next.js Ecosystem Working Group
- AGENTS.md в create-next-app по умолчанию (stable)
- Документация Next.js в виде Markdown внутри пакета next: node_modules/next/dist/docs/ (16.2+)
- logging.browserToTerminal: браузерные ошибки в терминале по умолчанию (stable)
- Lock-файл .next/dev/lock с PID, портом и URL; блокирует второй next dev и параллельный next build
- @vercel/next-browser: CLI для агентов (дерево React-компонентов, анализ PPR-shell, сеть, скриншоты) — experimental, ставится через npx skills add vercel-labs/next-browser
- Server Fast Refresh: перезагружается только изменённый серверный модуль, включено по умолчанию (proxy и Route Handlers пока на старой системе)
- Web Worker получает корректный location.origin — работают importScripts()/fetch() и WASM в воркерах
- Subresource Integrity: experimental.sri
- Tree shaking деструктурированных import()
- Inline loader config через import attributes: turbopackLoader, turbopackLoaderOptions, turbopackAs, turbopackModuleType
- experimental.lightningCssFeatures (include/exclude) при experimental.useLightningcss — experimental
- turbopack.ignoreIssue — фильтрация логов и оверлея
- Поддержка postcss.config.ts
- ~87% быстрее time-to-URL в next dev (stable)
- До 350% быстрее десериализация RSC payload, 25–60% быстрее рендер HTML
- Новая встроенная 500-страница при отсутствии error.tsx/global-error.tsx
- Логирование Server Functions в терминале dev (имя, аргументы, время, файл)
- Hydration diff с легендой + Client / - Server
- next start --inspect
- transitionTypes prop для next/link
- ImageResponse в 2–20x быстрее, шрифт по умолчанию Geist Sans
- Adapters API — stable
- Несколько форматов иконок с одним именем
- unstable_catchError() — experimental
- unstable_retry() в error.tsx — experimental
- experimental.prefetchInlining — один prefetch-запрос на ссылку
- experimental.cachedNavigations (требует cacheComponents) — experimental
- experimental.appNewScrollHandler — новый scroll/focus после навигации — experimental
**Ломает / требует действий:**
- Breaking changes Adapter API только в мажорных версиях Next.js

## 16.1
Посты: [Next.js 16.1](https://nextjs.org/blog/next-16-1) (2025-12-18), [Inside Turbopack: Building Faster by Building Less](https://nextjs.org/blog/turbopack-incremental-computation) (2026-01-20)
**Новое:**
- Файловый кеш Turbopack для next dev — stable и по умолчанию с 16.1 (описание архитектуры)
- Bundle Analyzer: next experimental-analyze — experimental
- next dev --inspect
- Транзитивные зависимости в serverExternalPackages (Turbopack)
- Команда next upgrade
- MCP tool get_routes в Next.js DevTools MCP
- Логирование времени generateStaticParams и числа воркеров билда
- Относительные пути в серверных source maps

## 16.0
Посты: [Next.js 16 (beta)](https://nextjs.org/blog/next-16-beta) (2025-10-09), [Next.js 16](https://nextjs.org/blog/next-16) (2025-10-21), [Building Next.js for an agentic future](https://nextjs.org/blog/agentic-future) (2026-02-12)
**Новое:**
- next-devtools-mcp: доступ агента к ошибкам, маршрутам, сегментам, подсказки для апгрейда и миграции на Cache Components
- Next.js skills — структурированные workflow для агентов
- Vector (встроенный браузерный агент) — закрыт
- Cache Components (cacheComponents, "use cache", PPR) — stable
- Next.js DevTools MCP
- proxy.ts (Node.js runtime)
- Логи dev/build с разбивкой по времени
- Turbopack — stable, бандлер по умолчанию (--webpack для отката)
- Turbopack File System Caching для dev — beta (experimental.turbopackFileSystemCacheForDev)
- Build Adapters API — alpha (experimental.adapterPath)
- React Compiler (reactCompiler) — stable, выключен по умолчанию
- Layout deduplication и incremental prefetching
- updateTag() (только Server Actions), refresh() (только Server Actions), revalidateTag(tag, profile)
- React 19.2: View Transitions, useEffectEvent, <Activity/>
- --experimental-next-config-strip-types — experimental
- PPR перенесён в Cache Components (experimental.cacheComponents в бете)
**Ломает / требует действий:**
- Node.js 20.9+, TypeScript 5.1+, браузеры Chrome/Edge/Firefox 111+, Safari 16.4+
- Удалены AMP, next lint, serverRuntimeConfig/publicRuntimeConfig, опции devIndicators, experimental.ppr и export const experimental_ppr, unstable_rootParams()
- experimental.turbopack → top-level turbopack; experimental.dynamicIO → cacheComponents
- Синхронный доступ к params/searchParams/cookies/headers/draftMode удалён — только async
- next/image: локальный src с query требует images.localPatterns; minimumCacheTTL 4 часа; qualities по умолчанию [75]; imageSizes без 16; maximumRedirects 3; блокировка локальных IP
- Parallel routes требуют default.js
- revalidateTag с одним аргументом устарел
- Устарели: middleware.ts, next/legacy/image, images.domains
- Убран автоматический scroll-behavior: smooth
- Отдельные выходные директории для next dev и next build, lockfile против параллельных запусков
- @next/eslint-plugin-next по умолчанию Flat Config
- Codemod: npx @next/codemod@canary upgrade latest

## 15.5
Посты: [Next.js 15.5](https://nextjs.org/blog/next-15-5) (2025-08-18)
**Новое:**
- next build --turbopack — beta (в 16 стал stable и по умолчанию)
- Node.js runtime для middleware — stable (в 16 это proxy.ts)
- typedRoutes — stable
- Валидация экспортов маршрутов на Turbopack
- Глобальные PageProps, LayoutProps, RouteContext
- Команда next typegen
**Ломает / требует действий:**
- Депрекейт next lint (удалён в 16), codemod next-lint-to-eslint-cli
- Предупреждения: legacyBehavior у next/link, AMP, images.qualities, images.localPatterns — удалены/обязательны в 16
- Turbopack может иначе упорядочивать CSS, чем webpack

## 15.4
Посты: [Next.js 15.4](https://nextjs.org/blog/next-15-4) (2025-07-14)
**Новое:**
- next build --turbopack: 100% интеграционных тестов (на тот момент ещё не stable)
- Анонс Next.js 16: Cache Components (флаг cacheComponents, бывший dynamicIO), Turbopack builds (beta), оптимизированный клиентский роутинг, Route Info в DevTools, Node.js Middleware (stable), Deployment Adapters (alpha)
- Флаги canary: browserDebugInfoInTerminal, dynamicIO, clientSegmentCache, devtoolSegmentExplorer, globalNotFound, turbopackPersistentCaching (experimental)
- router.prefetch с onInvalidate, Link prefetch="auto"
- Ответ 404 на неизвестные ID Server Actions; проверка cache-busting параметров RSC-запросов
**Ломает / требует действий:**
- Анонсировано для 16: прекращение поддержки Node.js 18, удаление AMP, изменения в отдельных API next/image
- experimental.dynamicIO переименовывается в cacheComponents в Next.js 16

## 15.3
Посты: [Next.js 15.3](https://nextjs.org/blog/next-15-3) (2025-04-09)
**Новое:**
- next build --turbopack (alpha на тот момент) *(эксперимент.)*
- Ключ turbopack в next.config.ts (stable)
- next-rspack — community-адаптер (experimental)
- instrumentation-client.js|ts
- Link onNavigate и хук useLinkStatus
- Viewport отделён от metadata; опция unstable_dynamicOnHover (unstable)
- Строгая консистентность после revalidate в Server Actions
**Ломает / требует действий:**
- experimental.turbo устарел в пользу turbopack (поддержка до следующего мажора)

## 15.2
Посты: [Next.js 15.2](https://nextjs.org/blog/next-15-2) (2025-02-26)
**Новое:**
- Новый error overlay с owner stacks и dev-индикатор (режим рендера static/dynamic)
- Streaming metadata (stable)
- experimental.viewTransition — React View Transitions (experimental)
- experimental.nodeMiddleware + runtime: 'nodejs' в middleware (experimental, только canary)
- images.qualities, create-next-app --api
**Ломает / требует действий:**
- Деприкейт i18n-конфига в App Router (предупреждение)

## 15.1
Посты: [Next.js 15.1](https://nextjs.org/blog/next-15-1) (2024-12-10)
**Новое:**
- after() — stable
- forbidden()/unauthorized() — experimental (флаг experimental.authInterrupts)
- Source maps ignoreList, свёрнутые стек-фреймы сторонних зависимостей

## 15.0
Посты: [Next.js 15 RC](https://nextjs.org/blog/next-15-rc) (2024-05-23), [Next.js 15 RC 2](https://nextjs.org/blog/next-15-rc2) (2024-10-15), [Next.js 15](https://nextjs.org/blog/next-15) (2024-10-21), [Turbopack Dev is Now Stable](https://nextjs.org/blog/turbopack-for-development-stable) (2024-10-21), [Our Journey with Caching](https://nextjs.org/blog/our-journey-with-caching) (2024-10-24), [Composable Caching with Next.js](https://nextjs.org/blog/composable-caching) (2025-01-03)
**Новое:**
- 'use cache' (experimental на момент статьи), cacheLife, cacheTag
- Экспериментальный режим (dynamicIO) — ошибка при доступе к данным вне Suspense/'use cache'; позже стал cacheComponents
- @next/codemod upgrade CLI
- Turbopack dev — stable
- instrumentation.js — stable (onRequestError)
- next/form
- next.config.ts
- Static Route Indicator
- unstable_after — experimental (позже stable)
- React Compiler — experimental
- Непредсказуемые ID Server Actions и удаление неиспользуемых
- serverExternalPackages / bundlePagesRouterDependencies — stable
- ESLint 9
- next dev --turbo — stable
- Advanced tracing для диагностики скорости компиляции
- Всё содержимое перекрывается постом Next.js 15 (stable)
- experimental_ppr для инкрементального PPR (позже заменён Cache Components)
**Ломает / требует действий:**
- cookies, headers, draftMode, params, searchParams стали асинхронными (кодмод next-async-request-api)
- fetch, GET Route Handlers и клиентский Router Cache для Page больше не кэшируются по умолчанию
- Минимум React 19 для App Router
- Нет поддержки части webpack-специфичной конфигурации/плагинов в Turbopack
- fetch по умолчанию no-store (вместо force-cache)

## 14.2
Посты: [Next.js 14.2](https://nextjs.org/blog/next-14-2) (2024-04-11)
**Новое:**
- Turbopack для next dev — Release Candidate (тогда opt-in через --turbo)
- experimental.staleTimes — экспериментально
- Улучшенные сообщения об ошибках гидрации (hydration mismatch) — stable
- Tree-shaking и уменьшение памяти при next build, оптимизация порядка CSS

## 14.1
Посты: [Next.js 14.1](https://nextjs.org/blog/next-14-1) (2024-01-18)
**Новое:**
- Стабильная поддержка cacheHandler и улучшенные гайды по self-hosting (Docker, nginx-прокси)
- window.history.pushState/replaceState в App Router — stable
- Data Cache logging (logging.fetches) — stable
- getImageProps (next/image) — stable
- Улучшения Parallel & Intercepted Routes

## 14.0
Посты: [Next.js 14](https://nextjs.org/blog/next-14) (2023-10-26)
**Новое:**
- Server Actions — stable
- Partial Prerendering — preview/experimental (тогда)
- generateViewport / export viewport — stable
- Turbopack: прохождение 90% тестов dev (beta) *(эксперимент.)*
**Ломает / требует действий:**
- Минимальная версия Node.js 18.17
- Удалён next export CLI — используй output: 'export' в next.config
- next/server ImageResponse перенесён в next/og
- @next/font удалён в пользу встроенного next/font
- viewport/themeColor/colorScheme в metadata устарели (deprecated)

## 13.5
Посты: [Next.js 13.5](https://nextjs.org/blog/next-13-5) (2023-09-19)
**Новое:**
- optimizePackageImports — experimental
- Ускорение next dev и Fast Refresh (до 22% / 29%)
- Улучшения next/image (unoptimized фото, меньше памяти)

## 13.4
Посты: [Next.js 13.4](https://nextjs.org/blog/next-13-4) (2023-05-04), [Next.js App Router Update](https://nextjs.org/blog/june-2023-update) (2023-06-22)
**Новое:**
- App Router — stable (на тот момент)
- Server Actions — alpha (сейчас stable)
- Turbopack — beta (сейчас default)

## 13.3
Посты: [Next.js 13.3](https://nextjs.org/blog/next-13-3) (2023-04-06)
**Новое:**
- File-based Metadata (sitemap, robots, icon, opengraph-image)
- Parallel Routes и Intercepting Routes
- Static export в App Router (output: 'export')

## 13.2
Посты: [Next.js 13.2](https://nextjs.org/blog/next-13-2) (2023-02-23)
**Новое:**
- Metadata API
- Route Handlers (route.ts)
- typedRoutes — experimental (тогда)

## 13.1
Посты: [Next.js 13.1](https://nextjs.org/blog/next-13-1) (2022-12-22)
**Новое:**
- transpilePackages — stable
- Расширенные возможности middleware (установка заголовков, ответы)

## 13.0
Посты: [Layouts RFC](https://nextjs.org/blog/layouts-rfc) (2022-05-23), [Next.js 13](https://nextjs.org/blog/next-13) (2022-10-25)
**Новое:**
- app directory — beta (сейчас основной App Router)
- next/font
- Turbopack — alpha *(эксперимент.)*
- Концепция директории app, layout.js/page.js, вложенных layout — RFC (теперь стабильный App Router)
- Route groups (folder) и Server Components по умолчанию — RFC
**Ломает / требует действий:**
- next/link больше не требует дочернего <a>
- next/image переписан (старый — next/legacy/image)
- Минимум React 18, Node 14.6

## До 13 (устарело, Pages Router)
Pages Router, `getServerSideProps`/`getStaticProps`, AMP, `next export` CLI, Webpack-конфиги и Edge-рецепты этих лет в новых проектах Mdigital не используются. Для поддержки легаси-проекта читай пост его версии и сразу планируй переход на App Router (гайд [App Router migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)).
Посты: [Next.js 5: Universal Webpack, CSS Imports, Plugins and Zones](https://nextjs.org/blog/next-5), [Next.js 5.1](https://nextjs.org/blog/next-5-1), [Next.js 6 and Nextjs.org](https://nextjs.org/blog/next-6), [Next.js 6.1](https://nextjs.org/blog/next-6-1), [Next.js 7](https://nextjs.org/blog/next-7), [Next.js 8](https://nextjs.org/blog/next-8), [Webpack memory improvements](https://nextjs.org/blog/webpack-memory), [Styling Next.js with Styled JSX](https://nextjs.org/blog/styling-next-with-styled-jsx), [Next.js 8.0.4](https://nextjs.org/blog/next-8-0-4), [Next.js 8.1](https://nextjs.org/blog/next-8-1), [Next.js 9](https://nextjs.org/blog/next-9), [Next.js 9.0.7](https://nextjs.org/blog/next-9-0-7), [Next.js 9.1](https://nextjs.org/blog/next-9-1), [Create Next App](https://nextjs.org/blog/create-next-app), [Next.js 9.1.7](https://nextjs.org/blog/next-9-1-7), [Next.js 9.2](https://nextjs.org/blog/next-9-2), [Next.js 9.3](https://nextjs.org/blog/next-9-3), [Next.js 9.4](https://nextjs.org/blog/next-9-4), [Next.js 9.5](https://nextjs.org/blog/next-9-5), [Next.js 10](https://nextjs.org/blog/next-10), [Incrementally Adopting Next.js](https://nextjs.org/blog/incremental-adoption), [Next.js 10.1](https://nextjs.org/blog/next-10-1), [Next.js 10.2](https://nextjs.org/blog/next-10-2), [Next.js 11](https://nextjs.org/blog/next-11), [Next.js 11.1](https://nextjs.org/blog/next-11-1), [Next.js 12](https://nextjs.org/blog/next-12), [Next.js 12.1](https://nextjs.org/blog/next-12-1), [Next.js 12.2](https://nextjs.org/blog/next-12-2), [Next.js 12.3](https://nextjs.org/blog/next-12-3)
