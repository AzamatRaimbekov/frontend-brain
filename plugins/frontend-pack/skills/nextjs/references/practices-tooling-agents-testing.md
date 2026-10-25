# Практики Next.js: AI-агенты, инструменты, тестирование и миграция

Сводка практик с nextjs.org (блог и App Router guides), проверено 2026-10-25 для Next.js 16.4.3. Источник указан у каждого пункта; при расхождении взят более новый.

## Агенты и AI-инструменты (ai-agents)

### Документация и правила для агента
- Перед написанием кода агент читает версионную документацию из `node_modules/next/dist/docs/` (16.2+), а не полагается на знания из обучения. Положи в корень проекта `AGENTS.md` с блоком `nextjs-agent-rules` и `CLAUDE.md` с директивой `@AGENTS.md`; свои правила пиши вне маркеров BEGIN/END. — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-16-2-ai), [3](https://nextjs.org/docs/app/guides/upgrading/version-16)
- Коммить блок `nextjs-agent-rules` в `AGENTS.md`, который генерирует `next dev` (16.3+); настройка и отключение через `agentRules`. Для версий ниже 16.2 (16.1 и ниже) запусти `npx @next/codemod@canary agents-md`: он скачивает документацию в `.next-docs/`. — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-16-3-ai-improvements), [3](https://nextjs.org/blog/next-16-2-ai)
- Документация доступна по сети в Markdown: `.md` в конце URL, `Accept: text/markdown`, `/docs/llms.txt`, `/docs/llms-full.txt`; страницы ошибок `/docs/messages` есть только онлайн. — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-16-3-ai-improvements)
- Давай агенту сжатый индекс документации (`agents.md`), генерируемый codemod, вместо надежды на его обучающие данные. — [источник](https://nextjs.org/blog/agentic-future)
- Старые knowledge skills Next.js обновляй/удаляй через `npx skills update`. — [источник](https://nextjs.org/blog/next-16-3-ai-improvements) **Mdigital:** совет про удаление knowledge skills не относится к собственным skills команды, их не трогаем.

### Отладка агентом
- Ошибки браузера смотри в терминале через `logging.browserToTerminal` в `next.config.ts` (`'error'` по умолчанию, `'warn'` или `true` для всего вывода); логи Server Actions и пересылка браузерных ошибок помогают агенту видеть рантайм-ошибки. PID, порт и URL dev-сервера лежат в `.next/dev/lock`. — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-16-2-ai), [3](https://nextjs.org/blog/agentic-future)
- Перед запуском `next dev` проверяй `.next/dev/lock`: если сервер уже запущен, подключайся к его URL или завершай процесс по PID, а не запускай второй. — [источник](https://nextjs.org/blog/next-16-2-ai)
- Не держи per-request fetch (например, счётчик) на верхнем уровне page: выноси в отдельный компонент внутри `<Suspense>`, чтобы остальная страница попала в статический PPR-shell. Для проверки shell есть экспериментальный `next-browser ppr lock` / `ppr unlock`. — [источник](https://nextjs.org/blog/next-16-2-ai)
- Для проверки страницы в браузере после каждой правки есть skill `next-dev-loop` (`npx skills add vercel/next.js --skill next-dev-loop`); нужен `agent-browser` >= 0.27 с `--enable react-devtools`. — [источник](https://nextjs.org/blog/next-16-3-ai-improvements) **Mdigital:** внешние skills и `agent-browser` ставь только после approval.
- `experimental.agentFeedback` работает только с включённой телеметрией Next.js; перед отправкой проверяй черновик на отсутствие данных проекта. — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-16-4) **Mdigital:** в клиентских и банковских проектах `experimental.agentFeedback` остаётся выключенным (требует телеметрии).

### next-devtools-mcp
- Добавь `next-devtools-mcp` в `.mcp.json` (`npx -y next-devtools-mcp@latest`) или поставь через `npx add-mcp`: агент увидит ошибки, маршруты и сегменты запущенного dev-сервера. Эндпоинт работает только в dev, выключается через `experimental.mcpServer: false`. — [1](https://nextjs.org/docs/app/guides/mcp), [2](https://nextjs.org/blog/agentic-future) **Mdigital:** пакет `next-devtools-mcp` не в whitelist, нужен approval.
- Пусть агент проверяет компиляцию через `get_compilation_issues` и `compile_route`, а не запускает `next build` во время правок. Держи нужные страницы открытыми в браузере: `get_errors` и `get_page_metadata` читают активные сессии. — [источник](https://nextjs.org/docs/app/guides/mcp)
- Для таймлайнов запросов и поведения кэша включи `experimental.requestInsights` и используй `get_request_insights`. — [источник](https://nextjs.org/docs/app/guides/mcp)

### Апгрейд через агента
- Запускай апгрейд через `next upgrade --agent` (или `npx next@canary upgrade --agent` из папки приложения; из монорепо передай путь к приложению). Не комбинируй `--agent` с `--revision`. CLI нужен доступ к release metadata и security advisory: учитывай при закрытой сети. — [1](https://nextjs.org/docs/app/guides/upgrading/agent-upgrade), [2](https://nextjs.org/docs/app/guides/ai-agents)
- Для банковских продуктов используй политику `security` (по умолчанию): берёт последний безопасный релиз в ближайшем допустимом мажоре. Сохрани политику в `experimental.agentUpgrade` в `next.config`, чтобы `next dev`/`next build` показывали напоминания об апгрейде; `false` отключает. — [1](https://nextjs.org/docs/app/guides/upgrading/agent-upgrade), [2](https://nextjs.org/docs/app/guides/ai-agents)
- Реагируй на Vulnerability Insight в DevTools во время `next dev`: он даёт промпт для security-апгрейда. — [источник](https://nextjs.org/docs/app/guides/upgrading/agent-upgrade)
- Для адопции Cache Components / Partial Prefetching используй их adoption skills (`next-cache-components-adoption`; инкрементально или напрямую) или политику `experimental-future`. На ошибку Instant Insight выбирай Stream/Cache/Block осознанно и используй Copy prompt с документом по правилу. — [1](https://nextjs.org/docs/app/guides/upgrading/agent-upgrade), [2](https://nextjs.org/blog/next-16-3-ai-improvements)

### Агент для разбора бэклога
- Для разбора бэклога багов используй агента в изолированной песочнице, который только читает и возвращает структурированный результат (confidence, причина, доказательства), а решение о закрытии оставляй людям. Не закрывай issues только по неактивности; проверяй воспроизведение на текущей стабильной версии и canary; оценку уверенности держи консервативной: неудачное воспроизведение само по себе не повод закрыть. — [источник](https://nextjs.org/blog/how-we-closed-1500-github-issues)

## DX и инструменты (dx-tooling)

### Сборка и отладка
- Читай вывод `next build`, чтобы понять, какие маршруты статические/частично/динамические. Производительность роутов мерь через Lighthouse/Core Web Vitals, а не по выводу `next build` (size/First Load JS удалены). — [1](https://nextjs.org/docs/app/guides/building), [2](https://nextjs.org/docs/app/guides/upgrading/version-16)
- При ошибке prerender запускай `next build --debug-prerender` для понятных стектрейсов (такой билд не деплой). Для большого приложения собирай отдельные маршруты через `--debug-build-paths="app/products/[id]/page.tsx"`. — [источник](https://nextjs.org/docs/app/guides/building)
- С Cache Components `generateStaticParams` должен вернуть хотя бы один параметр: пустой массив даёт ошибку сборки. Блокирующую работу (`await params`, uncached-данные) выноси под `Suspense`. — [источник](https://nextjs.org/docs/app/guides/building)
- Добавь в репозиторий `.vscode/launch.json` с конфигурациями «debug server-side» (`npm run dev -- --inspect`), «client-side» и «full stack»; серверную отладку делай через `next dev --inspect` (а не `NODE_OPTIONS=--inspect`), в монорепо (Turborepo) указывай `cwd`, например `"${workspaceFolder}/apps/web"`. — [1](https://nextjs.org/docs/app/guides/debugging), [2](https://nextjs.org/blog/next-16-1)
- Оборачивай ошибки через `Error.cause`: оверлей показывает цепочку до 5 уровней. — [источник](https://nextjs.org/blog/next-16-2)
- Для логов браузера в терминале используй `logging.browserToTerminal` (ранняя версия флага `experimental.browserDebugInfoInTerminal` заменена). — [1](https://nextjs.org/docs/app/guides/ai-agents), [2](https://nextjs.org/blog/next-15-4)
- Для ранней клиентской аналитики и мониторинга (ошибки, performance marks) используй `instrumentation-client.ts` в корне проекта; для наблюдаемости сервера `instrumentation.ts` с `register()` и `onRequestError`. — [1](https://nextjs.org/blog/next-15-3), [2](https://nextjs.org/blog/next-15)
- Тяжёлые серверные пакеты и транзитивные нативные зависимости указывай в `serverExternalPackages`, не добавляя их в свой `package.json`; для внешних пакетов полезны sourcemap с `ignoreList`. — [1](https://nextjs.org/blog/next-16-1), [2](https://nextjs.org/blog/next-15-1), [3](https://nextjs.org/blog/next-15)

### Локальная разработка
- В разработке запускай `next dev` без Docker; Docker оставь для production-сборок и их тестирования (Docker Desktop на Mac и Windows медленно пробрасывает файловые события). Если Docker неизбежен, используй synchronized file shares или нативный Linux; не применяй `watchOptions.pollIntervalMs`. — [источник](https://nextjs.org/docs/app/guides/local-development)
- На macOS включи developer mode для терминала (`sudo spctl developer-mode enable-terminal`). — [источник](https://nextjs.org/docs/app/guides/local-development)
- Держи `next` на последней версии. Turbopack используется по умолчанию (в 16), webpack включай только при необходимости; кастомные webpack-плагины не переносятся в Turbopack, проблемы с лоадерами проверяй по списку поддерживаемых фич. — [1](https://nextjs.org/docs/app/guides/local-development), [2](https://nextjs.org/blog/turbopack-for-development-stable)
- Проверяй barrel-импорты, иконочные библиотеки и `content`-пути Tailwind; для диагностики включай подробное логирование fetch (`logging.fetches`) и трейсинг Turbopack. — [источник](https://nextjs.org/docs/app/guides/local-development)
- Локально тестируй HTTPS через `next dev --experimental-https`; для push-сообщений валидируй источник и используй только HTTPS. — [источник](https://nextjs.org/docs/app/guides/progressive-web-apps)
- Используй `paths`/`baseUrl` в `tsconfig` для алиасов импорта. — [источник](https://nextjs.org/blog/next-9-4)
- Для MDX установи `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react` и `@types/mdx`, затем добавь `md` и `mdx` в `pageExtensions`. — [источник](https://nextjs.org/docs/app/guides/mdx) **Mdigital:** эти пакеты не в whitelist, нужен approval.

### Turbopack
- В CI/Docker восстанавливай `.next/cache` между сборками, иначе кэш `next build` не ускорит сборку. — [источник](https://nextjs.org/blog/next-16-3-turbopack)
- `experimental.turbopackMemoryEviction: false` ставь только при отладке кэша или производительности dev. — [источник](https://nextjs.org/blog/next-16-3-turbopack)
- Для максимального выигрыша от Rust React Compiler полностью уходи с Babel; `reactCompiler: true` включай осознанно, он замедляет компиляцию (Babel). — [1](https://nextjs.org/blog/next-16-3-turbopack), [2](https://nextjs.org/blog/next-16)
- В монорепо с разными PostCSS-конфигами пакетов включай `experimental.turbopackLocalPostcssConfig`; конфиг PostCSS можно писать на TypeScript (`postcss.config.ts`). — [1](https://nextjs.org/blog/next-16-3-turbopack), [2](https://nextjs.org/blog/next-16-2-turbopack)
- `import.meta.glob` используй только с Turbopack (не с `--webpack`): для ленивой загрузки вызывай значения как async-функции, для немедленной `eager: true`. — [источник](https://nextjs.org/blog/next-16-3-turbopack)
- Для строгой CSP без принудительного динамического рендеринга (nonce) включи `experimental.sri = { algorithm: 'sha256' }`: хэши скриптов считаются на билде. — [источник](https://nextjs.org/blog/next-16-2-turbopack)
- Используй деструктуризацию в динамических импортах (`const { x } = await import('./lib')`): неиспользуемые экспорты удаляются. — [источник](https://nextjs.org/blog/next-16-2-turbopack)
- Лоадеры конфигурируй в `next.config.ts` через `turbopack.rules`; inline-атрибуты `import ... with { turbopackLoader }` применяй только для сгенерированного кода. Шум от вендорного/сгенерированного кода глуши через `turbopack.ignoreIssue` (`path`/`title`/`description`), а не игнорируй все предупреждения. — [источник](https://nextjs.org/blog/next-16-2-turbopack)

### Апгрейд и codemods
- Для апгрейда выбирай между `next upgrade --agent`, codemods и пошаговым гайдом нужной мажорной версии. Обновляться можно `next upgrade`, `npx @next/codemod@canary upgrade latest` или `npm install next@latest react@latest react-dom@latest`. — [1](https://nextjs.org/docs/app/guides/upgrading), [2](https://nextjs.org/blog/next-16-2), [3](https://nextjs.org/blog/next-16-1)
- Запускай codemod как `npx @next/codemod <transform> <path>`, сначала с `--dry` и `--print`. Апгрейд через `npx @next/codemod upgrade` принимает `revision` (patch/minor/major/тег/версия); в CI запускается неинтерактивно и принимает все дефолты. При конфликтах peer-зависимостей используй `--skip-react-upgrade` / `--skip-eslint-upgrade` и повторяй тот же точный target. — [источник](https://nextjs.org/docs/app/guides/upgrading/codemods)
- Комментарии `@next-codemod-error` и касты `UnsafeUnwrapped*` от `next-async-request-api` обязательно доделывай вручную: билд падает, пока они есть. — [1](https://nextjs.org/docs/app/guides/upgrading/codemods), [2](https://nextjs.org/docs/app/guides/upgrading/version-15)
- Перейди на ESLint Flat Config и запускай `eslint .` отдельно: `next build` больше не линтит; вместо `next lint` в скриптах используй `"lint": "eslint"` (или `biome check`). — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16), [3](https://nextjs.org/blog/next-15-5) **Mdigital:** `biome` не в whitelist, нужен approval.
- В `next.config` не проверяй `process.argv.includes('dev')`: используй `NODE_ENV` или `phase`. Вместо `serverRuntimeConfig`/`publicRuntimeConfig` используй переменные окружения. — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-15), [3](https://nextjs.org/blog/next-16)
- Добавь `data-scroll-behavior="smooth"` на `<html>`, если нужен плавный скролл. — [1](https://nextjs.org/docs/app/guides/upgrading/version-16), [2](https://nextjs.org/blog/next-16)
- Включи `typedRoutes: true` для проверки `href` у `<Link>` на этапе компиляции; типизируй страницы и лейауты глобальными `PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext` без импортов; в CI запускай `next typegen && tsc --noEmit` для проверки типов без билда. — [источник](https://nextjs.org/blog/next-15-5)
- Убери `legacyBehavior` и вложенный `<a>` у `next/link`. — [источник](https://nextjs.org/blog/next-15-5)

## Тестирование (testing)

- Async Server Components тестируй E2E-тестами (Playwright, Cypress), а не unit/component-тестами (Vitest, Jest, Cypress component): многие инструменты их пока не поддерживают. Unit-тесты на Vitest + React Testing Library пиши только для синхронных Server и Client Components. — [1](https://nextjs.org/docs/app/guides/testing), [2](https://nextjs.org/docs/app/guides/testing/vitest), [3](https://nextjs.org/docs/app/guides/testing/cypress)
- Комбинируй unit/component тесты для хуков и Client Components с E2E для пользовательских сценариев. — [источник](https://nextjs.org/docs/app/guides/testing)
- Гоняй E2E против production-сборки: `next build && next start`, затем Cypress/Playwright. В CI используй headless `cypress run` (например с `start-server-and-test`); Cypress >= 13.6.3 при TypeScript 5 с `moduleResolution: 'bundler'`. — [1](https://nextjs.org/docs/app/guides/testing/cypress), [2](https://nextjs.org/docs/app/guides/testing/playwright)
- Jest: используй `next/jest` в `jest.config` (он подхватывает SWC, моки CSS/изображений/`next/font`, `.env` и `next.config`), синхронизируй `moduleNameMapper` с `paths` из tsconfig/jsconfig, подключай `@testing-library/jest-dom` в `jest.setup`. — [источник](https://nextjs.org/docs/app/guides/testing/jest)
- Playwright: задай `baseURL: 'http://localhost:3000'` в `playwright.config.ts` и пиши `page.goto('/')`; используй `webServer`, чтобы Playwright сам поднимал сервер и ждал готовности; в CI ставь зависимости браузеров через `npx playwright install-deps` (тесты по умолчанию headless); гоняй три движка: Chromium, Firefox, WebKit. — [источник](https://nextjs.org/docs/app/guides/testing/playwright)
- Vitest: конфиг клади в `vitest.config.mts` в корне, добавь скрипт `test` в `package.json` (по умолчанию watch); тестовые файлы можно держать в `__tests__` или колоцировать внутри `app`. — [источник](https://nextjs.org/docs/app/guides/testing/vitest)
- При Cache Components проверяй, что видно сразу после навигации, хелпером `instant()` из `@next/playwright` и лови им регрессии навигаций в CI. — [1](https://nextjs.org/docs/app/guides/testing/playwright), [2](https://nextjs.org/blog/next-16-3) **Mdigital:** `@next/playwright` проверь по whitelist.

## Миграция (migration)

- Не используй стратегию `worker` у `<Script>` в `app/`: не поддерживается. — [источник](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- CRA: переименуй `REACT_APP_*` в `NEXT_PUBLIC_*` (без префикса переменные в браузер не попадают); проксирование API-запросов делай через `rewrites` в `next.config`. — [источник](https://nextjs.org/docs/app/guides/migrating/from-create-react-app)
- Vite: переименуй `VITE_*` в `NEXT_PUBLIC_*` и замени `import.meta.env` на `process.env`. — [источник](https://nextjs.org/docs/app/guides/migrating/from-vite)
- В проектах с `src/` передавай кодмодам `./src/app`; неверный путь даёт `0 ok` без ошибки: проверяй число файлов. — [источник](https://nextjs.org/docs/app/guides/upgrading/codemods)
- Для кэширования клиентского роутера страниц используй `staleTimes`; `serverExternalPackages` вместо `experimental.serverComponentsExternalPackages`. — [источник](https://nextjs.org/docs/app/guides/upgrading/version-15)
