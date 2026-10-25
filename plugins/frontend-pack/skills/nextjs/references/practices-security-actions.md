# Практики Next.js: безопасность и Server Actions

Сводка практик с nextjs.org (блог и App Router guides), проверено 2026-10-25 для Next.js 16.4.3. Источник указан у каждого пункта; при расхождении взят более новый.

## Безопасность (security)

### Аутентификация и сессии
- Валидируй поля форм входа и регистрации на сервере (Server Action + схема, например Zod), а не только на клиенте. — [источник](https://nextjs.org/docs/app/guides/authentication)
- Не пиши свою криптографию: используй библиотеку сессий (`iron-session` или `jose`) или готовую auth-библиотеку. — [источник](https://nextjs.org/docs/app/guides/authentication) **Mdigital:** `iron-session` и `jose` не в whitelist, нужен approval; по правилам команды токены не хранятся в `localStorage`.
- В payload сессии держи минимум (`id`, `role`), без PII вроде телефона или email. — [источник](https://nextjs.org/docs/app/guides/authentication)
- Cookie сессии ставь только на сервере с опциями `HttpOnly`, `Secure`, `SameSite`, `Max-Age`/`Expires`, `Path`. — [источник](https://nextjs.org/docs/app/guides/authentication)
- Централизуй проверку сессии в Data Access Layer (DAL) и проверяй авторизацию перед каждой мутацией; поддержи refresh сессии и её удаление при logout. — [источник](https://nextjs.org/docs/app/guides/authentication)
- Ошибки доступа отдавай через `forbidden()` (403) и `unauthorized()` (401) из `next/navigation` с UI в `app/forbidden.tsx` / `app/unauthorized.tsx` (нужен `experimental.authInterrupts`). Если вызов произошёл после отправки заголовков (стриминг), статус останется 200. — [источник](https://nextjs.org/blog/next-15-1)
- Не полагайся на middleware/proxy как на единственную проверку авторизации: проверяй доступ и в страницах, данных и Server Actions (обход CVE-2026-64642 при одной локали в `i18n.locales`). — [1](https://nextjs.org/blog/july-2026-security-release), [2](https://nextjs.org/blog/security-nextjs-server-components-actions)

### Сессии и Cache Components
- Компонент, читающий сессию через `cookies()`, оборачивай в `<Suspense>`: с Cache Components иначе будет ошибка сборки. Не делай top-level `await` сессии в layout, он блокирует весь сегмент вместе с `children`. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- Внутри обычного `'use cache'` нельзя вызывать `cookies()`/`headers()`: читай запрос снаружи и передавай значение аргументом либо используй `'use cache: private'` (он не принимает `connection()`). — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- Чтобы шарить пользователя в Client Components: создай промис в Server Component без `await`, передай через `createContext`, разверни через `use()` под `Suspense`. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- `getCurrentUser` возвращает узкий объект `{ id, name }`; для защиты чувствительных полей используй `taintUniqueValue`. Оборачивай такие хелперы в `cache()` из `react`, чтобы не передавать пользователя пропсами. — [1](https://nextjs.org/docs/app/guides/authentication-with-cache-components), [2](https://nextjs.org/docs/app/guides/data-security)
- Кэшированную функцию по `userId` не экспортируй: экспортируемый геттер сам резолвит пользователя, чтобы нельзя было запросить чужие данные. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- Не клади секреты и PII в аргументы кэшируемых функций и в `cacheTag`: ключи и теги хранятся в открытом виде. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- После мутации в Server Action повторно проверь сессию и вызови `updateTag` с тем же тегом. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- В `cacheLife` держи `stale` не меньше 30 секунд, иначе scope выпадает из prefetch. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- Для данных, которые должны переживать инстансы (Docker с несколькими репликами), используй `'use cache: remote'`; обычный `'use cache'` держится в памяти по принципу best-effort. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)
- Повторно проверяй сессию в каждом Server Action и Route Handler: проверки в UI не защищают данные. — [источник](https://nextjs.org/docs/app/guides/authentication-with-cache-components)

### Route Handlers и BFF
- Route Handler публично доступен: проверяй аутентификацию и авторизацию в каждом. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Валидируй тип и размер тела запроса, санитизируй от XSS перед передачей в другие системы. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Чувствительные данные (геолокацию и т.п.) передавай POST-ом, а не в URL GET: GET кэшируется и логируется. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Внутренние заголовки к апстриму передавай через `NextResponse.next({ request: { headers } })` в proxy: они не уходят клиенту. Не клади секреты в response headers. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Добавляй rate limiting в коде (`checkRateLimit` в POST) и дополнительно на уровне хоста/nginx; ставь таймауты на запросы к апстриму. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Верифицируй подписи вебхуков; preflight (`OPTIONS`) для CORS обрабатывай явно. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Для content negotiation используй rewrites или proxy; прямой доступ к внутреннему маршруту при необходимости блокируй в proxy. — [источник](https://nextjs.org/docs/app/guides/backend-for-frontend)

### Content Security Policy
- Генерируй nonce в proxy на каждый запрос, ставь заголовок `Content-Security-Policy` и передавай nonce через request headers: Next.js сам проставит его в скрипты. В Server Component nonce читается через `headers()`. — [источник](https://nextjs.org/docs/app/guides/content-security-policy)
- Nonce требует динамического рендеринга: нет CDN-кэша, выше нагрузка, PPR несовместим с nonce CSP. — [источник](https://nextjs.org/docs/app/guides/content-security-policy)
- `'unsafe-eval'` разрешай только в development. — [источник](https://nextjs.org/docs/app/guides/content-security-policy)
- Для статических страниц со строгой CSP можно рассмотреть `experimental.sri` (`{ algorithm: 'sha256' }`, экспериментально). — [источник](https://nextjs.org/docs/app/guides/content-security-policy)
- В `matcher` proxy исключай статические файлы и prefetch-запросы. — [источник](https://nextjs.org/docs/app/guides/content-security-policy)
- Для `/sw.js` ставь `Cache-Control: no-cache, no-store, must-revalidate` и строгий CSP `default-src 'self'; script-src 'self'` (можно продублировать в nginx). — [источник](https://nextjs.org/docs/app/guides/progressive-web-apps)

### Доступ к данным и Server Components
- Выбери один подход к получению данных (HTTP API / DAL / component-level) и не смешивай их. — [источник](https://nextjs.org/docs/app/guides/data-security)
- Для существующих бэкендов (банк, отдельные команды) вызывай REST/GraphQL из Server Components через `fetch`, пробрасывая токен из `cookies()` по модели Zero Trust. — [источник](https://nextjs.org/docs/app/guides/data-security)
- В новых проектах делай Data Access Layer: единый серверный модуль, только `server-only` код, проверки авторизации внутри, возврат минимальных DTO вместо сырых записей БД. Помечай такие модули `import 'server-only'`. — [1](https://nextjs.org/docs/app/guides/data-security), [2](https://nextjs.org/blog/security-nextjs-server-components-actions)
- Не передавай в Client Components целые объекты пользователя/БД, только нужные поля; при необходимости используй `experimental_taintObjectReference` / `experimental_taintUniqueValue`. — [источник](https://nextjs.org/blog/security-nextjs-server-components-actions)
- При аудите ищи: файлы `'use client'` с чрезмерными props, файлы и экспорты `'use server'`, `middleware.ts`, `route.ts`, отсутствие `server-only` в data-модулях. — [источник](https://nextjs.org/blog/security-nextjs-server-components-actions)
- В production не показывай клиенту детали ошибок; используй `error.js` и `digest` для логов. — [источник](https://nextjs.org/blog/security-nextjs-server-components-actions)

### Server Actions как публичные эндпоинты
- Проверяй аутентификацию и авторизацию внутри каждой Server Action, а не полагайся на защищённость страницы. Считай ID Server Actions и `'use cache'` публичными. — [1](https://nextjs.org/docs/app/guides/data-security), [2](https://nextjs.org/blog/july-2026-security-release)
- Валидируй аргументы action (например Zod) как входящий HTTP-запрос и перепроверяй права внутри. — [источник](https://nextjs.org/blog/security-nextjs-server-components-actions)
- Не полагайся на замыкания в Server Actions для секретов: захваченные значения шифруются, но передаются клиенту и обратно. — [источник](https://nextjs.org/blog/security-nextjs-server-components-actions)
- Не отключай встроенную CSRF-защиту Server Actions (POST + сверка Origin/Host); за nginx настраивай `serverActions.allowedOrigins` и корректную передачу `Host`/`X-Forwarded-Host`. — [1](https://nextjs.org/blog/security-nextjs-server-components-actions), [2](https://nextjs.org/blog/july-2026-security-release)
- Не экспортируй неиспользуемые actions: ID непредсказуемы, но эндпоинты публичны. — [источник](https://nextjs.org/blog/next-15)
- Ограничивай размер тела запроса и rate-limit на POST к Server Actions на уровне nginx. — [источник](https://nextjs.org/blog/july-2026-security-release)

### Переменные окружения и секреты
- Никогда не коммить `.env*` файлы: держи их в `.gitignore`; секреты храни в `.env.local`, а `.env.production`/`.env.development` оставь для несекретных дефолтов. — [1](https://nextjs.org/docs/app/guides/environment-variables), [2](https://nextjs.org/blog/next-9-4)
- Секреты (ключи, пароли БД) не должны иметь префикс `NEXT_PUBLIC_`: он встраивается в клиентский бандл на этапе сборки. Секреты читай только на сервере через `process.env`. — [1](https://nextjs.org/docs/app/guides/environment-variables), [2](https://nextjs.org/blog/security-nextjs-server-components-actions)
- Храни `.env` в корне проекта, а не в `/src`: оттуда они не загружаются. — [источник](https://nextjs.org/docs/app/guides/environment-variables)
- Для конфигов ORM и тест-раннеров вне Next.js используй `loadEnvConfig` из `@next/env`. — [источник](https://nextjs.org/docs/app/guides/environment-variables)
- Не хардкодь секреты в коде Server Functions, читай их из переменных окружения в рантайме: иначе они могут оказаться встроенными в скомпилированный код. — [источник](https://nextjs.org/blog/security-update-2025-12-11)
- `serverRuntimeConfig`/`publicRuntimeConfig` замени env-переменными; для чтения env в рантайме вызывай `connection()` перед `process.env`; серверные секреты читай только в Server Components и защищай taint API. — [источник](https://nextjs.org/docs/app/guides/upgrading/version-16)

### Обновления и security-релизы
- Живи на актуальном патче: на 2026-10-25 это не ниже `next@16.4.1` (или 15.5.28 для ветки 15.x). Для RCE в `'use cache'` (октябрь 2026) обходного пути нет, обновляйся даже без использования этих функций; предыдущие минимумы (16.3.x, 16.2.11, 16.0.x) уже устарели. — [1](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [2](https://nextjs.org/blog/september-2026-security-release), [3](https://nextjs.org/blog/july-2026-security-release)
- Обновляйся через `npx next@canary upgrade --agent=latest`; оставь `experimental.agentUpgrade = 'security'` для напоминаний о security-патчах. — [источник](https://nextjs.org/blog/next-16-4)
- Проверяй, что в Docker-образе (glibc-based Linux) `sharp` версии 0.35.5 или новее; после обновления сверяй lock-файл. — [источник](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- Любое приложение App Router хотя бы с одним Server Action было уязвимо к DoS по CPU до патча: добавь лимиты запросов и таймауты в nginx как дополнительную защиту. — [источник](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- Если используешь `ImageResponse` из `next/og` в Node.js runtime, версия должна быть не ниже 16.3.6 (лучше актуальная); не передавай непроверенный пользовательский ввод в генерацию OG-картинок. — [источник](https://nextjs.org/blog/nextjs-security-update-september-22-2026)
- Не рассчитывай на AVIF-оптимизацию изображений, пока она отключена в патче 16.3.3+. — [источник](https://nextjs.org/blog/august-2026-security-release)
- Держи `images.remotePatterns` максимально узкими: разрешённый remote URL может использоваться для SSRF во внутренние IP. На self-host не включай оптимизацию удалённых изображений без необходимости, ограничь `remotePatterns` и rate-limit на `/_next/image`. — [1](https://nextjs.org/blog/september-2026-security-release), [2](https://nextjs.org/blog/july-2026-security-release)
- При self-hosting с root-level catch-all и SSG/ISR обязательно используй патченную версию: один запрос может отравить общий кэш ответов. — [источник](https://nextjs.org/blog/september-2026-security-release)
- Не вкладывай `'use cache'` функцию, читающую root param, в другую `'use cache'` функцию без патча; не используй Draft Mode с `'use cache'` функциями, возвращающими черновой контент, на непатченных версиях. — [источник](https://nextjs.org/blog/september-2026-security-release)
- Не открывай `next dev` (и его MCP-эндпоинт) в сеть. — [источник](https://nextjs.org/blog/september-2026-security-release)
- Хостить приложения, смешивающие Pages и App Router, лучше на Linux в Docker, а не на Windows-серверах. — [источник](https://nextjs.org/blog/august-2026-security-release)
- Не строй hostname назначения в `rewrites()`/`redirects()` из данных запроса: это SSRF/open redirect (CVE-2026-64645). — [источник](https://nextjs.org/blog/july-2026-security-release)
- За nginx не доверяй клиентским `Host`/`X-Forwarded-Host`: перезаписывай их, особенно если Server Actions делают redirect/forward (CVE-2026-64649). — [источник](https://nextjs.org/blog/july-2026-security-release)
- Не вызывай `fetch(new Request(init), anotherInit)` в серверном коде из-за cache confusion. — [источник](https://nextjs.org/blog/july-2026-security-release)
- Процесс: следи за анонсами security-релизов в блоге nextjs.org (дата может сдвинуться), заранее резервируй окно обновления, держи быстрый путь экстренного апдейта и поддерживаемые LTS-линии (Active LTS 16.x / Maintenance LTS 15.5). — [1](https://nextjs.org/blog/next-security-release-program), [2](https://nextjs.org/blog/upcoming-nextjs-security-release-august-2026), [3](https://nextjs.org/blog/nextjs-security-release-august-2026-update)
- Для исторического инцидента React2Shell (декабрь 2025): `npx fix-react2shell-next` проверяет и обновляет версии; если приложение было онлайн без патча на 4 декабря 2025 13:00 PT, после обновления и редеплоя ротируй все секреты, начиная с самых критичных; не сиди на canary 14.3.0-canary.77+. — [1](https://nextjs.org/blog/security-update-2025-12-11), [2](https://nextjs.org/blog/CVE-2025-66478) **Mdigital:** `fix-react2shell-next` запускай только после approval.
- Pages Router-приложения тоже стоит обновить, хотя они не затронуты уязвимостью React2Shell. — [источник](https://nextjs.org/blog/security-update-2025-12-11)

## Server Actions (server-actions)

- Формы строй на `useActionState` (вместо устаревшего `useFormState`). — [1](https://nextjs.org/docs/app/guides/interactive-apps), [2](https://nextjs.org/docs/app/guides/upgrading/version-15)
- При `Object.fromEntries(formData)` учитывай лишние поля с префиксом `$ACTION_`: валидируй схемой (Zod) на сервере. — [источник](https://nextjs.org/docs/app/guides/forms)
- Валидируй `FormData`, query-параметры и заголовки как недоверенные; с клиента принимай только ID сущности и изменение, остальное (владельца, содержимое) перечитывай из доверенного источника по сессии. — [1](https://nextjs.org/docs/app/guides/server-actions), [2](https://nextjs.org/blog/next-14)
- Заново проверяй аутентификацию и авторизацию в каждом Server Action (`auth()` и права): то, что форма показывается только залогиненным, не граница безопасности. — [1](https://nextjs.org/docs/app/guides/server-actions), [2](https://nextjs.org/docs/app/guides/forms)
- Для деструктивных операций (удаление) требуй усиленную проверку сессии или повторную аутентификацию. — [источник](https://nextjs.org/docs/app/guides/server-actions)
- Возвращай из action только то, что нужно UI, а не сырые записи БД. — [источник](https://nextjs.org/docs/app/guides/server-actions)
- Доп. аргументы передавай через `action.bind(null, id)`, а не скрытыми полями. — [источник](https://nextjs.org/docs/app/guides/forms)
- Вызывай `revalidatePath`/`updateTag`/`refresh` до `redirect`: `redirect` бросает исключение, код после него не выполняется. — [1](https://nextjs.org/docs/app/guides/server-actions), [2](https://nextjs.org/blog/next-14)
- Ревалидация: `revalidateTag(tag, profile)` всегда со вторым аргументом `cacheLife`; для read-your-writes в Server Actions используй `updateTag(tag)`; для обновления некешируемых данных и клиентского роутера после action вызывай `refresh()` из `next/cache`. — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16), [3](https://nextjs.org/docs/app/guides/interactive-apps)
- Настрой `serverActions.allowedOrigins`, если за прокси `Origin`/`Host` отличаются, и `serverActions.bodySizeLimit` (по умолчанию 1MB) под реальные нужды. — [источник](https://nextjs.org/docs/app/guides/server-actions)
- Actions на клиенте выполняются по одному: не используй их для параллельной загрузки данных. — [источник](https://nextjs.org/docs/app/guides/server-actions) **Mdigital:** для этого используй TanStack Query v5 (SWR запрещён).
- Для self-host с несколькими инстансами задай `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`; ID actions меняются между деплоями (ротация минимум раз в 14 дней). — [источник](https://nextjs.org/docs/app/guides/server-actions)
- Для мгновенной реакции на клик вызывай Server Function внутри `startTransition` и ставь новое значение через `useOptimistic`; то же для фильтров в URL (`router.push` внутри `startTransition`, pending через `useOptimistic`). — [источник](https://nextjs.org/docs/app/guides/interactive-apps)
- Не жди все данные в начале page: разбей их на компоненты, передавай каждому promise и оборачивай каждый в `<Suspense>` со skeleton, чтобы shell отрисовывался сразу. — [источник](https://nextjs.org/docs/app/guides/interactive-apps)
- Переиспользуемые UI-компоненты делай с action-пропами (`changeAction`): компонент сам запускает transition и ставит атрибут `data-pending`, предки стилизуются через CSS `:has()` (`group-has-data-pending:opacity-50`). — [источник](https://nextjs.org/docs/app/guides/interactive-apps)
- Для новых комментариев и элементов списка заведи `useOptimistic([])` для pending-элементов в клиентском компоненте, а сохранённые элементы рендери на сервере. — [источник](https://nextjs.org/docs/app/guides/interactive-apps)
- Для кэшированных данных после мутации используй `cacheTag` и `updateTag`. — [источник](https://nextjs.org/docs/app/guides/interactive-apps)
- В `error.tsx` при ошибке загрузки данных/RSC используй `unstable_retry()` вместо `reset()`: он делает `router.refresh()` + `reset()` в transition. — [источник](https://nextjs.org/blog/next-16-2)
- Push-подписки обрабатывай в Server Actions, VAPID-ключи храни в env (приватный без `NEXT_PUBLIC_`). — [источник](https://nextjs.org/docs/app/guides/progressive-web-apps)
