# Практики Next.js: производительность, SEO и стили

Сводка практик с nextjs.org (блог и App Router guides), проверено 2026-10-25 для Next.js 16.4.3. Источник указан у каждого пункта; при расхождении взят более новый.

## Производительность (performance)

### Метрики и аналитика
- Глобальную аналитику и трекинг ошибок (`window.addEventListener('error')`) инициализируй в `instrumentation-client.ts` в корне проекта: он выполняется до кода приложения. — [источник](https://nextjs.org/docs/app/guides/analytics)
- `useReportWebVitals` из `next/web-vitals` используй в отдельном Client Component (`'use client'`) и подключай в root layout, чтобы клиентская граница была минимальной. Разбирай метрики по `metric.name` (TTFB, FCP, LCP, CLS, INP), `metric.id` используй для распределений и перцентилей; CLS перед отправкой в GA умножай на 1000 и округляй. — [источник](https://nextjs.org/docs/app/guides/analytics)
- Отправляй метрики через `navigator.sendBeacon`, а при его отсутствии через `fetch(..., { keepalive: true })` на свой endpoint (self-host вместо Vercel Analytics). — [источник](https://nextjs.org/docs/app/guides/analytics)
- Перед релизом: Lighthouse в инкогнито, `useReportWebVitals` для отправки CWV в аналитику, анализ бандла. — [источник](https://nextjs.org/docs/app/guides/production-checklist)

### Бандл и lazy loading
- Тяжёлые Client Components (модалки, графики) загружай через `next/dynamic` с опцией `loading`; `ssr: false` используй только внутри Client Component (в Server Component это ошибка). При динамическом импорте Client Component из Server Component автоматический code splitting не работает. — [источник](https://nextjs.org/docs/app/guides/lazy-loading)
- Тяжёлые библиотеки (например `fuse.js`) подгружай через `await import()` в обработчике события; для named export делай `import('./x').then(m => m.Hello)`. — [источник](https://nextjs.org/docs/app/guides/lazy-loading)
- Запускай встроенный анализатор `next analyze` (Turbopack) перед релизом и смотри import chains тяжёлых модулей; сохраняй анализ `next analyze --output` и делай снапшоты `--snapshot before`/after для сравнения размеров в PR. Для Webpack используй `@next/bundle-analyzer` через `ANALYZE=true`. — [1](https://nextjs.org/docs/app/guides/package-bundling), [2](https://nextjs.org/docs/app/guides/memory-usage) **Mdigital:** `@next/bundle-analyzer` не в whitelist, нужен approval.
- Анализировать бандл можно также через Turbopack Bundle Analyzer и skill `next-bundle-optimizer` (`npx skills add vercel/next.js --skill next-bundle-optimizer`). — [источник](https://nextjs.org/blog/next-16-4) **Mdigital:** внешний skill ставь только после approval.
- Удаляй крупные зависимости, найденные Bundle Analyzer. Тяжёлые клиентские вычисления выноси в Server Components/на сервер, чтобы не тянуть зависимости в клиентский бандл. — [1](https://nextjs.org/docs/app/guides/memory-usage), [2](https://nextjs.org/docs/app/guides/package-bundling)
- Для библиотек с сотнями экспортов и большими barrel-файлами (иконки, утилиты) добавляй их в `experimental.optimizePackageImports`, сверившись со списком автоматически оптимизируемых пакетов. — [1](https://nextjs.org/docs/app/guides/package-bundling), [2](https://nextjs.org/blog/next-13-5)
- Пакеты, которые не должны бандлиться на сервере (нативные модули и т.п.), указывай в `serverExternalPackages`. — [источник](https://nextjs.org/docs/app/guides/package-bundling)
- Сторонние скрипты подключай через `Script` из `next/script`, а не голый `<script>`: Next.js гарантирует однократную загрузку при навигации. Размещай `Script` в layout сегмента, если скрипт нужен только там; `strategy` (`beforeInteractive` / `afterInteractive` / `lazyOnload` / `worker`) выбирай осознанно. — [источник](https://nextjs.org/docs/app/guides/scripts)
- Для inline-скриптов задавай `id`; обработчики `onLoad`/`onReady`/`onError` используй только в Client Component; `nonce` (для CSP) и `data-*` передавай прямо в `Script`. — [источник](https://nextjs.org/docs/app/guides/scripts)

### Turbopack и сборка
- Оставляй стандартный чанкинг Turbopack, если нет данных аналитики: он сократил запросы более чем вдвое без роста кода. С аналитикой настраивай `experimental.turbopackChunking`: `firstPageLoadPriority` (стартово ~bounce rate, по умолчанию 0.67), `priorityRoutes`, `clusters`; `generateComponentChunks` даёт меньшую загрузку кода при soft-навигации. — [источник](https://nextjs.org/blog/turbopack-chunking)
- `experimental.turbopackCjsTreeShaking` и `experimental.turbopackSharedRuntime` (оба станут дефолтом позже) включай, измеряя результат. — [источник](https://nextjs.org/blog/turbopack-chunking)
- Сохраняй кэш Turbopack между перезапусками `next dev` (не удаляй `.next` без нужды): файловый кэш стабилен и включён по умолчанию с 16.1. — [источник](https://nextjs.org/blog/turbopack-incremental-computation)
- Конфиг Turbopack держи в верхнеуровневом ключе `turbopack` (например `turbopack.rules` для SVGR), а не в `experimental.turbo`. Убери флаги `--turbopack` из скриптов; при кастомном `webpack` конфиге мигрируй на `turbopack` или собирай с `--webpack`. — [1](https://nextjs.org/blog/next-15-3), [2](https://nextjs.org/docs/app/guides/upgrading/version-16)
- Для Node-модулей в клиенте рефактори импорты; `turbopack.resolveAlias` только как крайняя мера; Sass-импорты без `~`. Для Vite-импортов `?raw`/`?url` добавь правило Turbopack в `next.config.ts` (встроенной поддержки нет). В Turbopack плагины remark и rehype указывай строками (имена пакетов). — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/docs/app/guides/migrating/from-vite), [3](https://nextjs.org/docs/app/guides/mdx)
- Для загрузки набора локальных файлов используй `import.meta.glob` (только Turbopack, не работает с `--webpack`). — [источник](https://nextjs.org/blog/next-16-3)
- Обновись: `npm install next@latest`; улучшения dev-памяти, SSR и сборки работают без изменений кода. Для быстрой проверки типов в `next build` доступен `pnpm add -D typescript@^7`. — [источник](https://nextjs.org/blog/next-16-3) **Mdigital:** смена мажорной версии TypeScript только по согласованию.
- Rust React Compiler (`reactCompiler: true` + `experimental.turbopackRustReactCompiler`) включай только для экспериментов. — [источник](https://nextjs.org/blog/next-16-3)
- Для поисковых форм используй `<Form>` из `next/form` (клиентская навигация, prefetch). — [источник](https://nextjs.org/blog/next-15)

### Память и OOM
- При OOM на сборке запусти `next build --experimental-debug-memory-usage`. Heap-профиль снимай через `node --heap-prof`, снапшоты через `NODE_OPTIONS=--inspect` и `SIGUSR2`. — [источник](https://nextjs.org/docs/app/guides/memory-usage)
- Для экономии памяти отключи `productionBrowserSourceMaps` и `experimental.serverSourceMaps`; при OOM во время prerender добавь `enablePrerenderSourceMaps: false`. — [источник](https://nextjs.org/docs/app/guides/memory-usage)
- Если проверка типов уже идёт в CI и сборка падает по памяти на шаге TypeScript, можно поставить `typescript.ignoreBuildErrors: true`. — [источник](https://nextjs.org/docs/app/guides/memory-usage)
- Если в Docker-контейнере мало памяти, поставь `experimental.preloadEntriesOnStart: false`: стартовый объём памяти снизится ценой более медленных первых ответов. — [источник](https://nextjs.org/docs/app/guides/memory-usage)

### Prefetch и instant navigation
- Включи `cacheComponents` и `partialPrefetching` в `next.config` перед оптимизацией prefetch. — [1](https://nextjs.org/docs/app/guides/optimizing-prefetching), [2](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4)
- `<Link prefetch={true}>` ставь только на ссылки, где нужны результаты по URL-данным (`searchParams`/`params`) до клика: это стоит серверного вызова на каждую видимую ссылку. По умолчанию оставляй `'auto'`; `prefetch={false}` только для отключения. Не ставь `prefetch={true}` на каждую карточку большого списка: включай полный префетч по намерению (`onMouseEnter`/`onFocus`/`onTouchStart` -> `prefetch={intent ? true : 'auto'}`). — [1](https://nextjs.org/docs/app/guides/optimizing-prefetching), [2](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4)
- Оборачивай доступ к `params`/`searchParams` в `<Suspense>`, даже при `generateStaticParams`. — [источник](https://nextjs.org/docs/app/guides/optimizing-prefetching)
- Данные из cookie, общие для многих сессий: читай `cookies()` снаружи и передавай значение аргументом в `'use cache'` функцию. Данные одной сессии: `'use cache: private'` (кэш в браузере), директиву размещай максимально близко к чтению runtime-данных. — [источник](https://nextjs.org/docs/app/guides/optimizing-prefetching)
- Разделяй публичные данные и персональное состояние пользователя; общие для всех данные кэшируй через `'use cache: remote'` + `cacheLife()` + `cacheTag()` и инвалидируй через `revalidateTag()`. При self-hosted `next start` `'use cache: remote'` и обычный `'use cache'` по умолчанию хранят кэш в памяти процесса: для нескольких инстансов в Docker настрой `cacheHandlers.remote`. — [источник](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4)
- Дорогую работу откладывай: `await prefetch()` из `next/cache` до per-link prefetch, `await navigation()` до фактической навигации; внутри cache-scope `await` нельзя. Холодный кэш даёт спиннер на первой навигации. — [источник](https://nextjs.org/docs/app/guides/optimizing-prefetching)
- Типовой фикс блокирующей навигации: выноси динамический доступ к данным (сессия, fetch) из page в дочерний async-компонент под `<Suspense fallback={<Skeleton/>}>`, чтобы остальная страница попала в shell; убирай блокирующие зависимости из root layout в компоненты, которые их используют. — [источник](https://nextjs.org/blog/making-v0-navigations-instant)
- Для каждой критичной навигации пиши Playwright-тест `instant(page, ...)` из `@next/playwright`, убедись, что он сначала падает, и держи его в CI как регрессию вместе с рефакторингом. — [1](https://nextjs.org/blog/making-v0-navigations-instant), [2](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4) **Mdigital:** `@next/playwright` проверь по whitelist.
- Начинай с критичных пользовательских путей и Instant Insights в dev. Для приложений на Cache Components есть skills `next-cache-components-optimizer`, для миграции `next-cache-components-adoption` (`npx skills add vercel/next.js --skill ...`). — [источник](https://nextjs.org/blog/making-v0-navigations-instant) **Mdigital:** внешние skills ставь только после approval.
- После включения префетча мерь объём запросов (включая prefetch), CPU, data transfer и расходы на кэш по затронутым маршрутам. — [источник](https://nextjs.org/blog/improving-navigation-experience-in-v0-with-nextjs-16-4)
- После включения `partialPrefetching` глобально запусти кодмод `remove-partial-prefetch`. — [источник](https://nextjs.org/docs/app/guides/upgrading/codemods)

### Офлайн (experimental)
- `experimental.useOffline` включай вместе с `cacheComponents` и `partialPrefetching` и только для экспериментов, не в продакшене; без Cache Components схожее поведение даёт `loading.tsx` на уровне сегмента. — [1](https://nextjs.org/docs/app/guides/offline-support), [2](https://nextjs.org/blog/next-16-3)
- `useOffline()` используй в fallback `<Suspense>` и в баннере root layout, чтобы отличать «нет сети» от «медленный сервер»; не полагайся на `navigator.onLine`. Хук возвращает `false` при SSR и гидрации. — [источник](https://nextjs.org/docs/app/guides/offline-support)
- Для Server Actions комбинируй `useTransition` + `useOffline` для offline-aware подписи кнопки; `try/catch` на сетевую ошибку не нужен. Запросы TanStack Query/fetch из Client Components не покрываются: настраивай `retry`/`networkMode` в TanStack Query. — [источник](https://nextjs.org/docs/app/guides/offline-support)
- Для банковских мутаций учитывай, что Server Action повторится автоматически после восстановления сети: обеспечь идемпотентность. Работает только для soft-навигаций в prefetched маршруты; полная перезагрузка офлайн требует service worker. — [источник](https://nextjs.org/docs/app/guides/offline-support)

### Production checklist
- Используй layouts, `<Link>`, `error.tsx`, `not-found`, `app/global-error.tsx`; `next/font`, `<Image>`, `<Script>`, `eslint-plugin-jsx-a11y`, TypeScript plugin. — [источник](https://nextjs.org/docs/app/guides/production-checklist)
- Не вызывай Route Handlers из Server Components: обращайся к данным напрямую. Фетчи данные параллельно и проверяй кэширование запросов. `cookies`/`searchParams` делают маршрут динамическим: оборачивай в Suspense/loading. — [источник](https://nextjs.org/docs/app/guides/production-checklist)
- Проверяй authN/authZ внутри каждого Server Action, не полагайся только на Proxy/layout; используй taint API, держи `.env*` в `.gitignore`, префикс `NEXT_PUBLIC_` только для публичных переменных, настрой Content Security Policy. — [источник](https://nextjs.org/docs/app/guides/production-checklist)

### Изображения
- Используй `next/image` вместо `<img>`; для нестандартных случаев `getImageProps`. — [источник](https://nextjs.org/blog/next-13-5)
- Используй `images.remotePatterns` вместо `images.domains` (можно задавать `new URL(...)` и ограничивать конкретными хостами); для локальных картинок с query `images.localPatterns.search`. — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-15-3), [3](https://nextjs.org/blog/next-16)
- Не включай `images.dangerouslyAllowLocalIP` без понимания SSRF-риска (только для приватных сетей). — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16)
- Добавляй нужные значения в `images.qualities` (по умолчанию только 75) и проверяй прямые запросы к `/_next/image` (неподдержанный `q` даёт 400). — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-15-2)

### Видео и embeds
- Всегда задавай `width`/`height` или CSS `aspect-ratio` для `<video>` и `<iframe>`, чтобы избежать CLS. Используй `poster`, особенно с `preload="none"`; при `autoPlay` добавляй `muted` и `playsInline`. — [источник](https://nextjs.org/docs/app/guides/videos)
- Добавляй субтитры через `<track>` и fallback-контент внутри `<video>`; используй нативные `controls` для доступности; у `<iframe>` задавай `title`, `loading="lazy"`, при необходимости `sandbox`. — [источник](https://nextjs.org/docs/app/guides/videos)
- Внешние embed рендери в Server Component и оборачивай в `<Suspense>` со скелетоном; видео сжимай (FFmpeg), выбирай MP4/WebM, отдавай через CDN. — [источник](https://nextjs.org/docs/app/guides/videos)

### Сторонние библиотеки (GTM, GA, embeds)
- GTM подключай через `<GoogleTagManager gtmId>` из `@next/third-parties/google` в корневом layout (для всех роутов) или в page (для одного роута); скрипт грузится после гидрации. События отправляй через `sendGTMEvent` / `sendGAEvent`: компонент должен быть в родительском layout/page или в том же файле. — [источник](https://nextjs.org/docs/app/guides/third-party-libraries) **Mdigital:** `@next/third-parties` не в whitelist, нужен approval.
- Если уже есть GTM, настраивай GA4 через GTM, а не отдельным `<GoogleAnalytics>`; для CSP передавай `nonce` в `<GoogleAnalytics>`; для серверного тегирования указывай `gtmScriptUrl`; при ручной отправке pageview отключай встроенное измерение pageview в GA, чтобы не было дублей. — [источник](https://nextjs.org/docs/app/guides/third-party-libraries)
- Для YouTube используй `<YouTubeEmbed videoid>` (lite-youtube-embed), для карт `<GoogleMapsEmbed>` с lazy-загрузкой; для embed выше сгиба меняй `loading`. — [источник](https://nextjs.org/docs/app/guides/third-party-libraries)

## SEO (seo)

- JSON-LD рендери нативным `<script type="application/ld+json">` в `page.tsx` или `layout.tsx`, а не через `next/script`. Экранируй payload от XSS: `JSON.stringify(jsonLd).replace(/</g, '\\u003c')` или `serialize-javascript`. — [источник](https://nextjs.org/docs/app/guides/json-ld)
- Типизируй разметку через `schema-dts`; проверяй в Rich Results Test и Schema Markup Validator. — [источник](https://nextjs.org/docs/app/guides/json-ld) **Mdigital:** `schema-dts` и `serialize-javascript` не в whitelist, нужен approval.
- Для глобальной 404 используй `global-not-found` (поддерживает metadata) вместо обходных решений. — [источник](https://nextjs.org/blog/next-15-4)
- Async `generateMetadata` больше не блокирует первый UI; управляй тем, каким ботам отдавать HTML с полным head, через `htmlLimitedBots` в `next.config`. — [источник](https://nextjs.org/blog/next-15-2)
- Выноси `viewport`, `themeColor`, `colorScheme` из metadata в отдельный `export viewport` / `generateViewport`. — [источник](https://nextjs.org/blog/next-14)

## Стили (styling)

- Для новых проектов используй Tailwind 4 по основному гайду CSS; v3 (`content` с путями `app/**/*` и `components/**/*` в `tailwind.config.js`) только для легаси. — [источник](https://nextjs.org/docs/app/guides/tailwind-v3-css) **Mdigital:** только Tailwind v4, v3 не используем.
- CSS-in-JS библиотеки (styled-components, styled-jsx и др.) работают только в Client Components (`'use client'`) и требуют registry-компонента (`useState(() => createStyleRegistry())` + `useServerInsertedHTML`) вокруг root layout. Emotion в списке «в процессе поддержки»: для новых App Router проектов предпочитай zero-runtime решения или CSS Modules/Tailwind. — [источник](https://nextjs.org/docs/app/guides/css-in-js) **Mdigital:** CSS-in-JS запрещён, стили только на Tailwind v4.
- Для компонентных стилей Next.js предлагает `sass` и `.module.scss`, общие переменные через `sassOptions.additionalData`, быстрый компилятор `sassOptions.implementation: 'sass-embedded'`, экспорт переменных в JS через `:export`. — [источник](https://nextjs.org/docs/app/guides/sass) **Mdigital:** Sass не используем, стили только на Tailwind v4.
