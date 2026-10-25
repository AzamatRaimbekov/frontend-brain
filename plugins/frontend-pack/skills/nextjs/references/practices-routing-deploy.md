# Практики Next.js: роутинг, деплой и self-host

Сводка практик с nextjs.org (блог и App Router guides), проверено 2026-10-25 для Next.js 16.4.3. Источник указан у каждого пункта; при расхождении взят более новый.

## Роутинг (routing)

### Instant navigation и Partial Prefetching
- Включай `cacheComponents: true` и `partialPrefetching: true` в `next.config.ts`; сначала внедряй Cache Components, потом Partial Prefetching. Без явного значения Next.js выводит предупреждение; `false` ставь только на время миграции. — [1](https://nextjs.org/docs/app/guides/adopting-partial-prefetching), [2](https://nextjs.org/docs/app/guides/instant-navigation), [3](https://nextjs.org/blog/next-16-3-instant-navigations)
- Перед включением найди все `<Link prefetch>` / `prefetch={true}` (включая обёртки, где значение получается `true`) и реши, какую часть страницы назначения нужно продолжать префетчить. — [источник](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)
- Данные, зависящие от URL (`params`, `searchParams`), оборачивай в `<Suspense>`, чтобы они не блокировали App Shell (`cookies()`/`headers()` к URL не привязаны). Чтение некэшированных данных и runtime API оборачивай в `<Suspense>` ниже общего layout, иначе клиентская навигация блокируется. — [1](https://nextjs.org/docs/app/guides/adopting-partial-prefetching), [2](https://nextjs.org/docs/app/guides/instant-navigation)
- Кэшируй async-данные через `'use cache'`; для данных из `cookies()`/`headers()` используй `'use cache: private'` (кэширует только в браузере). — [источник](https://nextjs.org/docs/app/guides/instant-navigation)
- Для ключевых ссылок (например Checkout) и контента по `params`/`searchParams`, который должен появиться сразу, ставь `<Link prefetch={true}>` вместе с `'use cache'`. Сначала сделай маршрут мгновенным за счёт App Shell: prefetch не исправляет блокирующий маршрут; некэшированный динамический контент не префетчится. — [1](https://nextjs.org/docs/app/guides/instant-navigation), [2](https://nextjs.org/docs/app/guides/adopting-partial-prefetching), [3](https://nextjs.org/blog/next-16-3-instant-navigations)
- Для каждого серверного `await` выбирай: `<Suspense>` (Stream), `'use cache'` (Cache) или `export const instant = false` в page/layout (Block). Неготовые маршруты исключай через `instant = false`. — [1](https://nextjs.org/blog/next-16-3-instant-navigations), [2](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)
- Не отключай dev-валидацию (`validationLevel: 'warning'`): исправляй найденные проблемы или сознательно ставь `instant = false`. Dev-оверлей с подсказками (`instant-link-prefetch-partial`, `instant-shell-url-data`) работает только в dev и не ломает сборку. — [1](https://nextjs.org/docs/app/guides/instant-navigation), [2](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)
- Закрепляй мгновенность тестами `instant()` из `@next/playwright` на production-сборке (в `next dev` автоматический префетч не работает). — [1](https://nextjs.org/docs/app/guides/adopting-partial-prefetching), [2](https://nextjs.org/docs/app/guides/instant-navigation), [3](https://nextjs.org/blog/next-16-3-instant-navigations) **Mdigital:** `@next/playwright` проверь по whitelist, при отсутствии нужен approval.
- Проверяй instant shell маршрута через Navigation Inspector в Next.js DevTools вместе с панелью Suspense в React DevTools. — [1](https://nextjs.org/docs/app/guides/instant-navigation), [2](https://nextjs.org/blog/next-16-3-instant-navigations)
- Для страниц, которые обязаны быть статическими (маркетинг, лендинги), ставь `export const ensureStatic = 'navigation'` (или `'prefetch'`/`'shell'`) в page или layout: сборка упадёт при появлении динамики. — [источник](https://nextjs.org/blog/next-16-4)

### Link и префетч
- Используй `<Link>` для навигации: префетч автоматический, только в production. `prefetch="auto"` это явный алиас поведения по умолчанию. — [1](https://nextjs.org/docs/app/guides/prefetching), [2](https://nextjs.org/blog/next-15-4)
- Прогревай маршруты вне viewport через `router.prefetch()` из `useRouter` (`next/navigation`), например на `onMouseEnter`; `router.prefetch(href, { onInvalidate })` позволяет повторить префетч после инвалидации. — [источник](https://nextjs.org/docs/app/guides/prefetching)
- Для больших списков ссылок префетчи по наведению: `prefetch={active ? null : false}`; при Partial Prefetching `prefetch={active ? true : 'auto'}`. — [источник](https://nextjs.org/docs/app/guides/prefetching)
- Отключай префетч `prefetch={false}` для ссылок, чей рендер вызывает побочные эффекты (logout, трекинг), и не делай сайд-эффекты в рендере страниц. — [источник](https://nextjs.org/docs/app/guides/prefetching)
- Расширяй/заменяй `Link` только если дефолтов мало: придётся самим отвечать за префетч, инвалидацию и a11y; для `<a>` используй `onClick` + `router.push`. — [источник](https://nextjs.org/docs/app/guides/prefetching)
- Для разных анимаций навигации передавай `<Link transitionTypes={['slide']}>` (только App Router). — [источник](https://nextjs.org/blog/next-16-2)
- Для гардов навигации и аналитики переходов используй `onNavigate` у `Link` с `e.preventDefault()` для отмены. — [источник](https://nextjs.org/blog/next-15-3)
- Локальный индикатор загрузки перехода делай через `useLinkStatus()` (pending) в дочернем компоненте `Link`, особенно если нет `loading.tsx`. — [источник](https://nextjs.org/blog/next-15-3)

### Сохранение UI-состояния (Activity)
- С `cacheComponents: true` состояние форм, диалогов, дропдаунов сохраняется при возврате назад: решай явно, что сбрасывать. Локальный state переживает logout/login: сбрасывай через `key` или явно (важно для банковских данных). — [источник](https://nextjs.org/docs/app/guides/preserving-ui-state)
- Для сброса при скрытии используй cleanup в `useLayoutEffect` (закрыть дропдаун, сбросить сообщение об успехе); формы после сабмита сбрасывай callback ref с `form.reset()`; для полного сброса страницы используй `useRouter().bfcacheId` как React `key`. — [источник](https://nextjs.org/docs/app/guides/preserving-ui-state)
- Глобальные стили скрытого компонента отключай (`media="not all"` в cleanup), осторожно с `:has` селекторами; медиа и таймеры останавливай в cleanup эффектов; `<Activity>` используй сами для табов и панелей. — [источник](https://nextjs.org/docs/app/guides/preserving-ui-state)
- В тестах используй visibility-aware селекторы (`getByRole`): скрытый контент остаётся в DOM с `display: none`. — [источник](https://nextjs.org/docs/app/guides/preserving-ui-state)

### Редиректы, proxy, ошибки
- Вызывай `redirect`/`permanentRedirect` вне `try/catch` (они бросают ошибку). После мутации в Server Action используй `redirect` (303 без JS); для постоянной смены URL `permanentRedirect` (308); в обработчиках событий клиента `useRouter().push`. — [источник](https://nextjs.org/docs/app/guides/redirecting)
- Статические редиректы до рендера задавай в `redirects` из next.config (`permanent` даёт 308/307), условные (auth) через `NextResponse.redirect` в `proxy.ts`; порядок: redirects, Proxy, рендер. Для 1000+ редиректов храни карту и проверяй наличие через Bloom filter в Proxy. — [источник](https://nextjs.org/docs/app/guides/redirecting)
- Валидируй абсолютные URL в `redirect`, чтобы не было open redirect. — [источник](https://nextjs.org/docs/app/guides/redirecting)
- Переименуй `middleware.ts` в `proxy.ts` и функцию в `proxy` (Node.js runtime): edge-middleware не переименовывай вслепую. Кодмод: `middleware-to-proxy`. — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16), [3](https://nextjs.org/docs/app/guides/upgrading/codemods)
- Вместо самописных error boundary используй `catchError` из `next/error` (`'use client'`): не ломает `notFound`/`redirect` и даёт `retry()` для перезапроса Server Components. Для локальных границ на уровне компонента есть `unstable_catchError()` (только Client Components, не перехватывает `redirect()`/`notFound()`). — [1](https://nextjs.org/blog/next-16-3), [2](https://nextjs.org/blog/next-16-2)
- Настраивай `redirects`/`rewrites`/`headers` в `next.config`; для банковских приложений задавай security-заголовки централизованно через `headers()`. — [источник](https://nextjs.org/blog/next-9-5)
- Для поэтапного переноса используй `rewrites().fallback`, чтобы несуществующие в Next.js маршруты уходили на старый сервис; новые разделы можно отдавать через `basePath`, остальное проксировать на legacy (rewrites с fallback или nginx). — [источник](https://nextjs.org/blog/incremental-adoption)

### Next 15/16: async API, типы, слоты
- Всегда `await` для `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams`; в синхронных Client Components разворачивай через `React.use()`; мигрируй кодмодом `npx @next/codemod@canary next-async-request-api .`. В `opengraph-image`/`icon`/`sitemap` тоже делай `await` для `params` и `id`. — [1](https://nextjs.org/docs/app/guides/upgrading/version-15), [2](https://nextjs.org/docs/app/guides/upgrading/version-16), [3](https://nextjs.org/blog/next-15)
- Типизируй страницы через `npx next typegen` и хелперы `PageProps`, `LayoutProps`, `RouteContext`. — [источник](https://nextjs.org/docs/app/guides/upgrading/version-16)
- Для каждого слота parallel routes создай `default.js` (`notFound()` или `null`). — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16)
- Кодмоды для 16: `middleware-to-proxy`, `next-lint-to-eslint-cli`, `remove-unstable-prefix`, `remove-experimental-ppr`. — [источник](https://nextjs.org/docs/app/guides/upgrading/codemods)
- Для i18n бери параметр корневого сегмента через `import { lang } from 'next/root-params'` (`await lang()`) вместо прокидывания props; пока только в Server Components. — [источник](https://nextjs.org/blog/next-16-3)
- Анализируй размер клиентских и серверных бандлов командой `next experimental-analyze` (фильтр по маршрутам, цепочки импортов через границу server/client). — [источник](https://nextjs.org/blog/next-16-1)
- Клади `icon.png` и `icon.svg` рядом в `app/`: Next сгенерирует оба `<link>`. — [источник](https://nextjs.org/blog/next-16-2)

### Миграция с Pages Router
- Pages и App Router могут сосуществовать: мигрируй постранично, используй codemods для устаревших API. `_app.js`/`_document.js` заменяй на `app/layout.tsx`, `next/head` на Metadata API. — [источник](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- В `app/` используй хуки из `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) вместо `next/router`; `getServerSideProps`/`getStaticProps` заменяй fetch в Server Components, `getStaticPaths` на `generateStaticParams`, API Routes переноси в Route Handlers (`route.ts`). — [источник](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- i18n-конфиг из `next.config` в App Router не используй (deprecated): делай локализацию через сегменты маршрута. — [источник](https://nextjs.org/blog/next-15-2)

### MDX
- Создай `mdx-components.tsx` с `useMDXComponents`: без него `@next/mdx` в App Router не работает. Для динамических MDX-страниц используй dynamic import и `generateStaticParams`. — [источник](https://nextjs.org/docs/app/guides/mdx)

### PWA и заголовки
- Манифест создавай через `app/manifest.ts` (`MetadataRoute.Manifest`). — [источник](https://nextjs.org/docs/app/guides/progressive-web-apps)
- Для всех маршрутов ставь `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`. — [источник](https://nextjs.org/docs/app/guides/progressive-web-apps)

## Деплой и self-host (deploy-self-host)

### Минимальная схема: next start + nginx
- Для self-host достаточно одного процесса `next start` (или `output: 'standalone'`) за nginx: он корректно обслуживает Server Components, ISR, PPR, Cache Components, Server Actions, Proxy и `after()`. При одном инстансе это поддерживается без ограничений. — [1](https://nextjs.org/docs/app/guides/deploying-to-platforms), [2](https://nextjs.org/blog/nextjs-across-platforms), [3](https://nextjs.org/docs/app/guides/custom-server)
- Ставь reverse proxy (nginx) перед `next start`, не выставляй Next.js сервер напрямую в интернет: proxy берёт на себя malformed requests, slow-connection атаки, лимиты payload и rate limiting. — [источник](https://nextjs.org/docs/app/guides/self-hosting)
- Не буферизуй ответы в nginx (`proxy_buffering off` / заголовок `X-Accel-Buffering: no` через `headers()` в next.config) и проверь, что LB/прокси не буферизуют chunked-ответы: иначе PPR и Server Components теряют выигрыш от стриминга. — [1](https://nextjs.org/docs/app/guides/self-hosting), [2](https://nextjs.org/docs/app/guides/deploying-to-platforms)
- Установи `sharp` в образ для Image Optimization. — [источник](https://nextjs.org/docs/app/guides/deploying-to-platforms)
- Требования Next.js 16: Node.js 20.9+, TypeScript 5.1+, браузеры Chrome/Edge/Firefox 111+, Safari 16.4+; обнови базовый Docker-образ Node. — [источник](https://nextjs.org/docs/app/guides/upgrading/version-16)
- При self-host не полагайся на `geo`/`ip` у `NextRequest`: бери IP и гео из заголовков своего прокси (nginx). — [источник](https://nextjs.org/docs/app/guides/upgrading/version-15)
- Для отладки и профилирования CPU и памяти прод-сервера в Docker используй `next start --inspect` (порт инспектора не открывай наружу). — [источник](https://nextjs.org/blog/next-16-2)
- Логирование, аналитику и синхронизацию после ответа выполняй в `after()` из `next/server`, не блокируя ответ (работает в self-hosted). — [источник](https://nextjs.org/blog/next-15-1)
- Для больших проектов отслеживай память сборки; в Docker-сборке выделяй builder-контейнеру достаточно памяти. — [источник](https://nextjs.org/blog/next-14-2)

### Один образ на все окружения
- Делай один Docker-образ на все окружения: серверные env читай во время динамического рендеринга; `NEXT_PUBLIC_*` вшиваются в бандл на этапе build. Если пересобираешь образ на каждое окружение, задай стабильный `generateBuildId` в `next.config`. — [источник](https://nextjs.org/docs/app/guides/self-hosting)
- Для отдачи статики с CDN или другого домена используй `assetPrefix`. — [источник](https://nextjs.org/docs/app/guides/self-hosting)
- Под подпутём за nginx используй `basePath` в `next.config`, а не ручные префиксы ссылок. — [источник](https://nextjs.org/blog/next-9-5)

### Несколько инстансов и кэш
- При нескольких инстансах задай одинаковый `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (base64, 16/24/32 байт) на build и runtime, иначе ошибки `Failed to find Server Action`. — [источник](https://nextjs.org/docs/app/guides/self-hosting)
- Задавай `deploymentId` (например `process.env.DEPLOYMENT_VERSION`) для защиты от version skew при rolling-деплоях: при несовпадении будет hard navigation. — [источник](https://nextjs.org/docs/app/guides/self-hosting)
- Для нескольких контейнеров вынеси кэш ISR/страниц в общее хранилище (Redis/S3) через `cacheHandler` с TTL/eviction, сериализацией Buffer/Map, индексом по тегам и обработкой ошибок хранилища; при необходимости `cacheMaxMemorySize: 0`. Без общего кэша ISR/кэш расходятся между репликами. — [1](https://nextjs.org/docs/app/guides/self-hosting), [2](https://nextjs.org/blog/next-14-1)
- Для бэкендов директивы `'use cache'` используй `cacheHandlers`; для координации инвалидации тегов между инстансами реализуй `refreshTags()`. Обеспечь распространение on-demand revalidation между инстансами. — [1](https://nextjs.org/docs/app/guides/self-hosting), [2](https://nextjs.org/blog/nextjs-across-platforms)
- Перед масштабированием прочитай доки Deploying to Platforms, How Revalidation Works и CDN Caching. Если нужен свой таргет деплоя, пиши адаптер на публичном Adapter API и гоняй официальный тестовый набор. — [источник](https://nextjs.org/blog/nextjs-across-platforms)

### CDN/nginx кэширование
- Учитывай дефолтные заголовки: static `s-maxage=31536000`; ISR `s-maxage={revalidate}, stale-while-revalidate`; dynamic `private, no-cache, no-store`. Статические ассеты `/_next/static` кэшируй долго (immutable). — [источник](https://nextjs.org/docs/app/guides/cdn-caching)
- Включай параметр `_rsc` в ключ кэша CDN/nginx (не отрезай query string) и не игнорируй `next-url` в ключе: он входит в хэш `_rsc`. — [источник](https://nextjs.org/docs/app/guides/cdn-caching)
- `proxy.js` должен выполняться до CDN-кэша, чтобы оставаться источником правды для auth, редиректов, rewrite. — [источник](https://nextjs.org/docs/app/guides/cdn-caching)

### CI-сборки
- В GitLab CI добавляй cache с путями `node_modules/` и `.next/cache/`; в Docker-сборке монтируй/сохраняй `.next/cache` между билдами. Следи за предупреждением `No Cache Detected` в логах сборки. — [источник](https://nextjs.org/docs/app/guides/ci-build-caching)

### Custom server
- Используй `next start` / `output: 'standalone'` за nginx, а не custom server: он нужен только если встроенный роутер не справляется. Не совмещай custom server с `output: 'standalone'` (standalone не трассирует его файлы). — [источник](https://nextjs.org/docs/app/guides/custom-server)
- Свои заголовки (`Set-Cookie` и т.п.) выставляй через `res.setHeader` до вызова `handle(req, res)`: после него вызов молча игнорируется (то же для Express/Fastify `reply.raw`). `server.js` не проходит через компилятор Next.js: пиши в синтаксисе, совместимом с текущей версией Node.js. — [источник](https://nextjs.org/docs/app/guides/custom-server)

### Instrumentation и OpenTelemetry
- Создай `instrumentation.ts` в корне проекта или в `src/`, но не внутри `app/`; экспортируй `async register()` (вызывается один раз до приёма запросов). Импорты с побочными эффектами делай через `await import()` внутри `register`, код под runtime подключай по `process.env.NEXT_RUNTIME === 'nodejs'`. При кастомных `pageExtensions` переименуй и файл instrumentation. — [1](https://nextjs.org/docs/app/guides/instrumentation), [2](https://nextjs.org/docs/app/guides/open-telemetry)
- OpenTelemetry проще всего подключать через `registerOTel({ serviceName })` из `@vercel/otel`. — [1](https://nextjs.org/docs/app/guides/instrumentation), [2](https://nextjs.org/docs/app/guides/open-telemetry) **Mdigital:** `@vercel/otel` не в whitelist, нужен approval; без него используй ручную настройку `NodeSDK`.
- При ручной настройке `NodeSDK` выноси её в `instrumentation.node.ts` и импортируй только при `process.env.NEXT_RUNTIME === 'nodejs'`. При self-host (Docker) поднимай свой OpenTelemetry Collector и экспортируй через OTLP. — [источник](https://nextjs.org/docs/app/guides/open-telemetry)
- Для отладки включай `NEXT_OTEL_VERBOSE=1`; кастомные спаны через `@opentelemetry/api` добавляй для ключевых бизнес-операций. — [источник](https://nextjs.org/docs/app/guides/open-telemetry)

### Multi-zones
- Каждой не-дефолтной зоне задавай уникальный `assetPrefix` (например `/blog-static`); с Next.js 15 дополнительный rewrite для `_next` не нужен. Пути должны быть уникальны для зоны. — [источник](https://nextjs.org/docs/app/guides/multi-zones)
- Маршрутизируй пути к зонам через `rewrites` (меньше задержка) или любой HTTP-прокси (у нас nginx); `proxy.js` только при динамическом решении. — [источник](https://nextjs.org/docs/app/guides/multi-zones)
- Ссылки между зонами делай через `<a>`, а не `<Link>` (иначе prefetch/soft navigation сломаются); часто посещаемые вместе страницы держи в одной зоне (переход между зонами это hard navigation). — [источник](https://nextjs.org/docs/app/guides/multi-zones)
- Для Server Actions явно задавай `experimental.serverActions.allowedOrigins` с пользовательским доменом; релизы зон синхронизируй через feature flags, общий код держи в монорепозитории. — [источник](https://nextjs.org/docs/app/guides/multi-zones)

### PPR на уровне платформы
- При self-host без CDN-интеграции достаточно origin-only режима: Next.js сам отдаёт shell и стримит динамику. `postponedState` считай непрозрачным: не парсить и не модифицировать. — [источник](https://nextjs.org/docs/app/guides/ppr-platform-guide)
- Для схемы CDN+origin: отправляй POST на маршрут с заголовком `next-resume: 1` и `postponedState` в теле; в nginx не ломай этот заголовок и стриминг. В адаптере (`adapterPath`, `onBuildComplete`) находи пререндеры с `renderingMode: 'PARTIALLY_STATIC'`, храни shell и `postponedState` вместе, обновляй кэш атомарно через `requestMeta.onCacheEntryV2`, при отсутствии `postponedState` делай фолбэк на полный серверный рендер. — [источник](https://nextjs.org/docs/app/guides/ppr-platform-guide)

### Static export
- `output: 'export'` включай только для приложений без серверной логики: динамические cookies/headers, Server Actions, rewrites/redirects, proxy, ISR не поддерживаются. В нашем self-host с Docker обычно не нужен. — [1](https://nextjs.org/docs/app/guides/static-exports), [2](https://nextjs.org/docs/app/guides/migrating/from-create-react-app)
- Для `next/image` при экспорте задавай custom loader; Route Handlers в экспорте только GET со статическим ответом на build. — [источник](https://nextjs.org/docs/app/guides/static-exports)
- Обращайся к `window`/`localStorage`/`navigator` только в `useEffect` или после проверки окружения: Client Components пререндерятся на build. — [источник](https://nextjs.org/docs/app/guides/static-exports) **Mdigital:** токены авторизации в `localStorage` не храним.
- При раздаче через nginx настрой rewrites входящих запросов на соответствующие `.html` файлы в `out`. — [источник](https://nextjs.org/docs/app/guides/static-exports)

### Прочее
- Включай `logging.fetches.fullUrl` в `next.config` для отладки кэширования `fetch` в dev. — [источник](https://nextjs.org/blog/next-14-1)
- Для art direction (разные картинки для mobile/desktop) используй `getImageProps` из `next/image` с элементом `<picture>`. — [источник](https://nextjs.org/blog/next-14-1)
- Для синхронизации URL без навигации (фильтры, сортировка) используй нативные `window.history.pushState`/`replaceState`: они интегрированы с `usePathname`/`useSearchParams`. — [источник](https://nextjs.org/blog/next-14-1) **Mdigital:** для состояния в URL предпочтителен `nuqs` (в whitelist).

## Интернационализация (i18n)

- Определяй локаль в `proxy.js` через `Negotiator` и `@formatjs/intl-localematcher` и редиректь на `/{locale}/...`; исключи `_next` в `matcher`. — [источник](https://nextjs.org/docs/app/guides/internationalization) **Mdigital:** `negotiator` и `@formatjs/intl-localematcher` не в whitelist, нужен approval.
- Вложи все специальные файлы в `app/[lang]` (root layout можно положить туда же). — [источник](https://nextjs.org/docs/app/guides/internationalization)
- Загружай словари динамически: `import('./dictionaries/xx.json')` в модуле с `server-only`; проверяй локаль через `hasLocale` и при неверной вызывай `notFound()`. — [источник](https://nextjs.org/docs/app/guides/internationalization)
- Вместо prop drilling читай локаль через `import { lang } from 'next/root-params'` в серверном коде. — [1](https://nextjs.org/docs/app/guides/internationalization), [2](https://nextjs.org/blog/next-16-3)
- Предгенерируй локали через `generateStaticParams` в `app/[lang]/layout`; типизируй `params` хелперами `PageProps` и `LayoutProps`. — [источник](https://nextjs.org/docs/app/guides/internationalization)
