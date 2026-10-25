# Практики Next.js: данные, кэширование и рендеринг

Сводка практик с nextjs.org (блог и App Router guides), проверено 2026-10-25 для Next.js 16.4.3. Источник указан у каждого пункта; при расхождении взят более новый.

## Кэширование (caching)

### Cache Components: включение и миграция
- Для новых проектов включай `cacheComponents: true` и `partialPrefetching: true` в `next.config.ts` (требует Next.js 16); кэширование делай явно через `'use cache'` + `cacheLife()`, а не неявно. Убери `experimental.dynamicIO`/`experimental.useCache`: флаг их заменяет. Не включай React Compiler и Cache Components только ради завершения апгрейда. — [1](https://nextjs.org/blog/next-16-4), [2](https://nextjs.org/docs/app/guides/migrating-to-cache-components), [3](https://nextjs.org/docs/app/guides/upgrading/version-16)
- Кэшируй функции и компоненты директивой `'use cache'`, а не ручным `unstable_cache` с ключами; время жизни задавай через `cacheLife('hours')` или свой профиль, теги через `cacheTag(...)` (можно после фетча, например по `authorId`) и инвалидируй `revalidateTag()`. Импортируй `cacheLife`/`cacheTag` без `unstable_`. — [1](https://nextjs.org/blog/composable-caching), [2](https://nextjs.org/blog/our-journey-with-caching), [3](https://nextjs.org/docs/app/guides/upgrading/version-16)
- Для каждого динамического компонента выбирай: Stream (`<Suspense>`), Cache (`'use cache'`, часть пререндера) или Block (`export const instant = false`). Динамические части оборачивай в `<Suspense>`, статические помечай `'use cache'`: так статика и динамика стримятся в одном ответе. — [1](https://nextjs.org/docs/app/guides/public-static-pages), [2](https://nextjs.org/blog/next-16-3), [3](https://nextjs.org/blog/next-16-4)
- Кэш можно ставить на layout, page или отдельную async-функцию; персонализированные блоки (баннер по cookie) оборачивай в `<Suspense>` с fallback, чтобы остальная страница оставалась статической оболочкой. — [1](https://nextjs.org/blog/our-journey-with-caching), [2](https://nextjs.org/docs/app/guides/public-static-pages)
- Передавай динамические части в кэшированный компонент как `children` (donut-паттерн): они не попадают в ключ и не ломают кэш. — [источник](https://nextjs.org/blog/composable-caching)
- Для вариантов страниц используй `generateStaticParams`, для обновлений ревалидацию кэша. — [источник](https://nextjs.org/docs/app/guides/public-static-pages)
- Для постепенной миграции ставь `export const instant = false` на неготовые сегменты (массово: `npx @next/codemod@canary cache-components-instant-false ./src/app`, проверяй число файлов: неверный путь даёт `0 ok`), затем снимай opt-out по одному маршруту. — [1](https://nextjs.org/docs/app/guides/migrating-to-cache-components), [2](https://nextjs.org/docs/app/guides/upgrading/codemods)
- Синхронный IO при пререндере (`new Date()`, `Date.now()`, `Math.random()`, `crypto.randomUUID()`) исправляй сразу: `instant = false` эту ошибку сборки не снимает. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- Миграция конфигов сегмента: удаляй `dynamic = 'force-dynamic'` (без `'use cache'` данные и так не кэшируются); `dynamic = 'force-static'` и `revalidate > 0` заменяй на `'use cache'` + `cacheLife(...)` вокруг конкретных данных; помни, что `cookies()`/`headers()` теперь возвращают реальные значения. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- Удаляй `fetchCache` и опции `fetch` (`cache: 'force-cache'`, `next: { revalidate, tags }`): кэш задавай через `'use cache'`, теги через `cacheTag`. В новом коде не полагайся на segment-конфиги `dynamic`, `fetchCache`, `revalidate`. — [1](https://nextjs.org/docs/app/guides/migrating-to-cache-components), [2](https://nextjs.org/blog/our-journey-with-caching)
- Удали `export const dynamicParams` (ломает сборку); `generateStaticParams` должен вернуть минимум один параметр; `params` читай внутри `<Suspense>`. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- Удали `unstable_noStore`; `unstable_cache` можно оставить и мигрировать позже (в отличие от `'use cache'` он переживает деплои). GET Route Handlers: вместо `dynamic = 'force-static'` используй `'use cache'`. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- `React.cache` не разделяется между разными cache-функциями: не полагайся на него для preload между ними. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- Insights не видны в HTTP-ответе (маршрут отдаёт 200): смотри dev overlay, лог dev-сервера или MCP `get_errors`. — [источник](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- Для `await params` с Partial Prefetching делай `await params` внутри `<Suspense>`; без него `await params` вне Suspense (включая `loading.tsx`), иначе ISR-запись для URL не создаётся. Ключевые параметры перечисляй в `generateStaticParams` для полного пререндера. — [источник](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components)
- Тяжёлый контент, не нужный до клика, исключай из префетча: `await navigation()` из `next/cache` внутри компонента под Suspense; `await prefetch()` убирает контент из shell до явного префетча. — [источник](https://nextjs.org/blog/next-16-4)

### Банковские и пользовательские данные
- Не кэшируй через `'use cache'` пользовательские, сессионные и банковские данные без явного решения: замыкания и аргументы входят в ключ, ключ должен включать пользователя, секреты не должны попадать в кэш. — [1](https://nextjs.org/blog/composable-caching), [2](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- Данные чтений помечай `'use cache'` + `cacheLife('minutes')` + `cacheTag("entity", "entity-" + id)`; аргументы функции становятся частью ключа. В Server Action сначала проверь авторизацию (`verifyAuth`), затем мутируй и вызывай `updateTag` для каждого затронутого тега. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)

### Без Cache Components (legacy-режим)
- Эти практики применяй только если `cacheComponents` не включён; иначе используй `'use cache'` и гайд ISR with Cache Components. — [1](https://nextjs.org/docs/app/guides/caching-without-cache-components), [2](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- Для не-fetch функций (БД) используй `unstable_cache` с `revalidate` и `tags`. — [источник](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- `fetch` не кэшируется по умолчанию: кэшируй явно через `cache: 'force-cache'`. GET Route Handlers тоже не кэшируются по умолчанию. — [1](https://nextjs.org/docs/app/guides/upgrading/version-15), [2](https://nextjs.org/blog/next-16), [3](https://nextjs.org/blog/next-15)
- Значение `export const revalidate` должно быть статически анализируемым (`600`, а не `60*10`). Для проектов без `cacheComponents` используй `export const revalidate = N` и `generateStaticParams` для пререндера динамических роутов, а `dynamicParams` управляет генерацией неизвестных путей. — [1](https://nextjs.org/docs/app/guides/caching-without-cache-components), [2](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- Для пользовательских/банковских страниц ставь `dynamic = 'force-dynamic'` или `revalidate = 0`. — [источник](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- После мутаций используй `revalidateTag`/`revalidatePath`. — [1](https://nextjs.org/docs/app/guides/caching-without-cache-components), [2](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- Не используй `runtime = 'edge'` (deprecated). — [источник](https://nextjs.org/docs/app/guides/caching-without-cache-components)

### Ревалидация и инвалидация
- Для SWR-инвалидации используй `revalidateTag(tag, 'max')` (или `'hours'`/`'days'`/`{ expire }`): однoаргументная форма устарела. Названия из беты (`experimental.cacheComponents`, `{ revalidate }`) заменены на стабильные `cacheComponents` и `{ expire }`. — [источник](https://nextjs.org/blog/next-16)
- Клиентский Router Cache: у Page-сегментов `staleTime` равен 0; при устаревших данных настраивай `experimental.staleTimes` (dynamic/static) в `next.config`, а не обходи кэш хаками. — [1](https://nextjs.org/blog/next-15), [2](https://nextjs.org/blog/next-14-2)

### Draft Mode
- Включай Draft Mode в Route Handler (`app/api/draft/route.ts`), проверяя shared secret и slug из CMS перед `draftMode().enable()` и redirect. Выход делай через POST (Server Action или POST Route Handler), не GET. — [источник](https://nextjs.org/docs/app/guides/draft-mode)
- В Draft Mode страницы отдаются с `Cache-Control: private, no-cache, no-store`: nginx не должен их кэшировать. Если у CMS отдельный draft-эндпоинт, ветвь URL `fetch` по `draftMode().isEnabled`. — [источник](https://nextjs.org/docs/app/guides/draft-mode)

### Self-host: кэш в Docker/nginx
- Кэшируй HTML и RSC-ответы в nginx/CDN с одинаковым TTL и политикой инвалидации и учитывай заголовок `Vary` от Next.js. — [источник](https://nextjs.org/docs/app/guides/how-revalidation-works)
- Задавай `deploymentId` при rolling-деплоях в Docker, чтобы клиент делал hard navigation при смене версии сервера. — [источник](https://nextjs.org/docs/app/guides/how-revalidation-works)
- Для `'use cache'` настраивай `cacheHandlers` (мн. ч.), для ISR/Pages `cacheHandler` (ед. ч.); при нескольких инстансах нужен общий кэш-хендлер, а HTML и RSC payload должны ревалидироваться согласованно. — [1](https://nextjs.org/docs/app/guides/how-revalidation-works), [2](https://nextjs.org/docs/app/guides/rendering-philosophy)
- Сохраняй `.next/cache` между CI-сборками (в Docker cache mount), чтобы работал файловый кэш `next build`. — [источник](https://nextjs.org/blog/next-16-3)

## Данные (data)

### Клиентская загрузка данных
- Выбирай паттерн: `useQuery` (inline loading), `useSuspenseQuery` (Suspense), `<HydrationBoundary>` (начальные данные от Server Component). — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching) **Mdigital:** единственный клиентский слой данных TanStack Query v5, SWR запрещён.
- Для автокомплита и интерактивных данных достаточно клиентского запроса после гидратации; если сервер знает, что нужно для первого рендера, передавай данные из Server Component. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching)
- Различай три слоя кэша: серверный (`cacheLife` revalidate/expire), клиентский роутер (`cacheLife` stale), кэш библиотеки (query key). Длительности могут отличаться, но ключи и инвалидация должны быть согласованы. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching)
- После мутации обновляй клиентский кэш и инвалидируй серверный (`updateTag`), в том числе после Server Action, меняющего кэшированное чтение. — [1](https://nextjs.org/docs/app/guides/client-side-data-fetching), [2](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query)
- Ключ fallback и ключ запроса должны совпадать точно, иначе клиент перезапросит данные. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching/swr)
- В Providers (`'use client'`) создавай новый `QueryClient` на каждый серверный рендер и один переиспользуемый в браузере (`typeof window === 'undefined'`); Providers рендери в ближайшем общем layout, не обязательно в корне. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query)
- Независимые `useSuspenseQuery` ставь в соседних компонентах или используй `useSuspenseQueries`: внутри одного компонента они идут последовательно (водопад). — [1](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query), [2](https://nextjs.org/docs/app/guides/client-side-data-fetching/swr)
- Для начальных данных в Server Component вызывай `void queryClient.prefetchQuery(...)` без `await` и передавай `dehydrate(queryClient, { shouldDehydrateQuery: q => ... || q.state.status === 'pending' })` в `<HydrationBoundary>` (TanStack Query >= 5.40.0). — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query)
- На сервере переопределяй `queryFn`: относительный URL Route Handler резолвится только в браузере. Задавай `staleTime` (например `30_000`), чтобы не перезапрашивать сразу после гидратации. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query)
- С Cache Components не вызывай стандартный `dehydrate()` в prerender (читает `Date.now()`): используй helper с кэшированным timestamp через `'use cache'` + `cacheTag` теми же тегами, что и данные. — [источник](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query)

### Route Handlers как API
- API пиши в `app/**/route.ts`, экспортируя `GET`/`POST`/`DELETE` на Web `Request`/`Response`; query-параметры читай через `request.nextUrl.searchParams` (`NextRequest`); `params` в Route Handler это Promise: `const { id } = await params`. — [источник](https://nextjs.org/blog/building-apis-with-nextjs)
- Route Handler как BFF-прокси к бэкенду: токен (`process.env.API_TOKEN`) добавляй на сервере, клиенту не отдавай. Общую логику (аутентификация, логирование) выноси в переиспользуемые обёртки. — [источник](https://nextjs.org/blog/building-apis-with-nextjs)
- Если данные нужны только своему приложению, фетчи их в Server Components, не создавая лишний API-эндпоинт. — [источник](https://nextjs.org/blog/building-apis-with-nextjs)
- При static export (`output: 'export'`) Route Handlers на сервере не работают; для Docker используй Node.js сервер. — [источник](https://nextjs.org/blog/building-apis-with-nextjs)

## Рендеринг (rendering)

### Статичная оболочка и Suspense
- Выноси заголовки, навигацию и стабильный UI из `<Suspense>`; границу ставь вокруг минимального региона, который может приостановиться. — [источник](https://nextjs.org/docs/app/guides/optimizing-the-static-shell)
- Не делай `await cookies()`/`headers()`/`params`/`searchParams` в начале layout/page: переноси чтение в отдельный Server Component за `<Suspense>` или передавай promise вниз. — [1](https://nextjs.org/docs/app/guides/optimizing-the-static-shell), [2](https://nextjs.org/docs/app/guides/streaming)
- Для интерактивных Client Components начинай запрос без `await` и передавай promise, разворачивая через `use()`; для URL-данных в клиенте `useParams`/`useSearchParams`. — [источник](https://nextjs.org/docs/app/guides/optimizing-the-static-shell)
- Используй вложенные/соседние Suspense-границы с fallback, резервирующими размер (против CLS); пустой fallback только для компонентов без визуального следа (auth-гейт, возвращающий `null`). Держи skeleton рядом с компонентом (в том же файле), а контейнер раскладки вне границы. — [1](https://nextjs.org/docs/app/guides/optimizing-the-static-shell), [2](https://nextjs.org/docs/app/guides/streaming)
- Кэшируй данные LCP-элемента через `'use cache'`, чтобы он попал в shell; используй параллельный fetch и preload. — [1](https://nextjs.org/docs/app/guides/optimizing-the-static-shell), [2](https://nextjs.org/docs/app/guides/streaming)
- Проверяй instant UI тестом `instant()`; против `next start` включай `experimental.exposeTestingApiInProductionBuild` (не в проде). — [источник](https://nextjs.org/docs/app/guides/optimizing-the-static-shell)
- Для layout с персональными данными (корзина из cookie внутри Suspense) ставь `export const ensureStatic = 'shell'`, чтобы обычный `<Link>` не рендерил персональные данные на сервере. Для страниц со статическим префетчем по `prefetch={true}` ставь `ensureStatic = 'prefetch'` и кэшируй общие данные через `'use cache'`; полностью статичный контент (гайды) помечай `ensureStatic = 'navigation'` с `generateStaticParams`. Если откладывать нужно только поддерево, вызови `await prefetch()` внутри него. — [источник](https://nextjs.org/docs/app/guides/keeping-pages-static)
- Ставь `<Link prefetch={true}>` только на ссылки, где нужен контент по params/searchParams до клика: при появлении во viewport такая ссылка обращается к серверу. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- Вкладывай зависимые Suspense-границы (ответы внутри границы поста), чтобы контент раскрывался сверху вниз и не давал CLS. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)

### Стриминг
- Добавляй `loading.js` для стриминга на уровне страницы и отдельные `<Suspense>` вокруг каждого медленного async-компонента, чтобы они стримились независимо. `<Suspense>` ставь близко к динамическому доступу: без boundary сборка упадёт с blocking route error (Cache Components). — [источник](https://nextjs.org/docs/app/guides/streaming)
- Добавляй `error.js`: ошибка после старта стрима ловится ближайшей границей, но статус 200 уже отправлен; `notFound`/`redirect` вызывай до начала стрима. — [источник](https://nextjs.org/docs/app/guides/streaming)
- Для стриминга из Route Handlers возвращай `ReadableStream`. — [источник](https://nextjs.org/docs/app/guides/streaming)
- В nginx не буферизуй ответы (`X-Accel-Buffering: no`), иначе стриминг и статическая оболочка не работают; gzip/brotli могут задерживать первый чанк. Проверяй стриминг через `curl --no-buffer`. — [1](https://nextjs.org/docs/app/guides/rendering-philosophy), [2](https://nextjs.org/docs/app/guides/streaming)
- Ревалидируй по тегу (`revalidateTag`), а не целые маршруты/деплой. — [источник](https://nextjs.org/docs/app/guides/rendering-philosophy)

### Server и Client Components
- Ставь `'use client'` только на модулях-точках входа интерактивности: всё, что импортирует Client Component, попадает в клиентский бандл. Передавай из Server в Client только сериализуемые props. — [источник](https://nextjs.org/docs/app/guides/server-and-client-boundary)
- Читай БД, секреты и внутренние сервисы прямо в Server Components, без API-роута, открывающего данные клиенту. — [источник](https://nextjs.org/docs/app/guides/server-and-client-boundary)
- Для стриминга данных в клиент начинай запрос в Server Component (в том числе в layout) без `await` и передавай Promise как prop или в Context Provider; в клиенте читай через `use()` внутри `<Suspense>`. — [1](https://nextjs.org/docs/app/guides/server-and-client-boundary), [2](https://nextjs.org/docs/app/guides/single-page-applications)
- Не делай Client Component ради кнопки или формы, если хватает нативного HTML; клиент нужен для изменяющегося во времени состояния (controlled input, живой фильтр, drag). — [источник](https://nextjs.org/docs/app/guides/server-and-client-boundary)
- Запускай fetch в браузере (TanStack Query) только когда данные зависят от клиентского состояния или действий пользователя. Для focus-ревалидации, polling, мутаций и дедупликации на клиенте используй TanStack Query. — [1](https://nextjs.org/docs/app/guides/server-and-client-boundary), [2](https://nextjs.org/docs/app/guides/single-page-applications) **Mdigital:** nextjs.org упоминает также SWR, у нас он запрещён.
- Оборачивай общие функции загрузки в React `cache`, чтобы несколько компонентов в одном запросе делили один вызов. — [источник](https://nextjs.org/docs/app/guides/single-page-applications)
- Для библиотек, зависящих от `window`/`document`, используй `next/dynamic` с `ssr: false` или проверку в `useEffect`. `use(browser())` применяй только когда первый браузерный рендер не может совпасть с серверным HTML; индексируемый контент держи вне такого компонента. — [источник](https://nextjs.org/docs/app/guides/single-page-applications)
- Для shallow routing используй `window.history.pushState`/`replaceState`: они синхронизируются с `useSearchParams`/`usePathname`. — [источник](https://nextjs.org/docs/app/guides/single-page-applications)
- Провайдеры общего клиентского состояния (`'use client'` context) клади в общий layout, чтобы они не размонтировались при навигации, а `children` оставались Server Components. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- Миграция с CRA/Vite: сначала подними приложение как SPA (`app/[[...slug]]/` + client-only entrypoint), затем переводи роуты и data fetching на Server Components. — [1](https://nextjs.org/docs/app/guides/migrating/from-create-react-app), [2](https://nextjs.org/docs/app/guides/migrating/from-vite)

### Гидратация и flash
- Для локализованных дат: рендери на сервере, сразу после элемента вставляй inline `<script>` (`dangerouslySetInnerHTML`), правящий текст, и ставь `suppressHydrationWarning` на элемент; используй `<time dateTime>` с ISO-строкой. Вынеси это в переиспользуемый компонент с `type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}`, чтобы при клиентской навигации скрипт не выполнялся. — [источник](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration)
- Тему применяй inline-скриптом в `<html data-theme suppressHydrationWarning>` с try/catch. — [источник](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration) **Mdigital:** в localStorage/cookie допустимо хранить только настройку темы, токены авторизации там держать нельзя.
- Тестируй гидрацию, запуская dev-сервер с другими `TZ` и `LANG`, чем у браузера. Не прячь мигание через `useEffect` и не читай cookies/headers только ради форматирования, если это делает маршрут динамическим без нужды. — [источник](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration)
- Inline-скрипты блокируются строгой CSP без `'unsafe-inline'`: используй nonce/hash (банковские продукты). — [источник](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration)

### Мутации и оптимистичный UI
- Мутации делай через `startTransition` + `useOptimistic`; при ошибке Action React откатывается, показывай toast. Серию последовательных мутаций сериализуй через `useActionState`, а ожидающие изменения держи в `useOptimistic`. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- Для TanStack Query начинай запрос в Server Component и передавай данные через `HydrationBoundary`; на клиенте `useQuery`/`useSuspenseQuery` для polling и on-demand запросов, чтобы не было клиентского водопада. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- `experimental.useOffline` не включай в продакшене: статья прямо его не рекомендует. — [источник](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)

### View Transitions
- Для морфинга общего элемента оборачивай миниатюру и hero в `<ViewTransition name="...">` с одинаковым `name`; на именованные ставь `default="none"`, чтобы они не анимировались при каждом постороннем переходе; кастомизируй через `share="morph"` + CSS псевдоэлементы. — [источник](https://nextjs.org/docs/app/guides/view-transitions)
- Анимируй загрузку: fallback `<Suspense>` в `<ViewTransition exit>`, контент в `<ViewTransition enter>`; выход быстрее (около 150ms), вход мягче. Для списков и стриминга используй `enter="auto" default="none"` и `key` на элементах. — [1](https://nextjs.org/docs/app/guides/view-transitions), [2](https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3)
- Навигацию помечай через `transitionTypes` на `<Link>` (или в `router.push/replace`) типами `nav-forward`/`nav-back` и маппь их в `enter`/`exit` объектом; обёртку с направленной анимацией ставь в каждый `page.tsx`, а не в layout (layout не размонтируется). — [источник](https://nextjs.org/docs/app/guides/view-transitions)
- Фиксируй хедер через `viewTransitionName` и подавляй его анимацию в CSS; разрешай клики во время перехода, отключив `pointer-events` у оверлея `::view-transition`; держи переходы короткими; уважай `prefers-reduced-motion`. — [источник](https://nextjs.org/docs/app/guides/view-transitions)
- Для смены контента в одном роуте используй `<ViewTransition key={slug} name share="auto" enter="auto">`. Обычный `setState` не триггерит переходы, только Transitions, `<Suspense>`, `useDeferredValue`; кнопка «назад» браузера не несёт transition type. — [источник](https://nextjs.org/docs/app/guides/view-transitions)
