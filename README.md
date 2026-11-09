# Мозг фронтенда Mdigital — frontend-pack для Claude Code

Плагин для [Claude Code](https://claude.com/claude-code) (и Codex), который учит агента писать React так, как принято во фронтенд-команде Mdigital: архитектура, UX, UI, загрузка данных, обработка ошибок, ревью. Здесь хранятся все правила разработки и общая база знаний — агент работает строго по ним, а каждый фронтендер может пополнять мозг через PR.

Стек: React 19 + TypeScript, Vite + TanStack Router или Next.js App Router, shadcn/ui, Tailwind v4, TanStack Query v5, React Hook Form + Zod.

# Руководство по использованию

## 1. Установить плагин

**Codex**

1. Открой Codex → Плагины.
2. Нажми «Добавить маркетплейс».
3. Заполни поля:
   - Источник: `https://github.com/AzamatRaimbekov/frontend-brain`
   - Git ref: оставь пустым
   - Выборочные пути: оставь пустыми
4. Нажми «Добавить маркетплейс».
5. Выбери каталог **Mdigital Frontend Hub**.
6. Открой плагин **frontend-pack** и нажми «Установить».

Из терминала то же самое: `codex plugin marketplace add AzamatRaimbekov/frontend-brain`, затем `codex plugin add frontend-pack@frontend-brain`.

**Claude Code**

```bash
claude plugin marketplace add AzamatRaimbekov/frontend-brain
claude plugin install frontend-pack@frontend-brain
claude plugin install figma-pack@frontend-brain
```

Перезапусти Claude Code. Обновление: `claude plugin marketplace update frontend-brain` (в Codex: `codex plugin marketplace upgrade`).

Репозиторий приватный: чтобы установить плагин, нужен доступ к нему на GitHub (попроси добавить тебя) и вход в git на компьютере (`gh auth login`). Для хуков нужен Node.js 18+.

## 2. Начать работу

Открой папку фронтенд-проекта и создай новый чат. В Codex введи `$frontend` и опиши задачу обычными словами, либо нажми `@` и выбери **Mdigital Frontend Hub**. В Claude Code достаточно описать задачу: нужные правила подгрузятся сами (или вызови `/frontend-pack:frontend`).

Для нового проекта папка может быть пустой.

## 3. Пример запроса

Скопируй текст и укажи, что уже известно. Неизвестное можно оставить пустым.

```text
Используй $frontend.

Сделай [страницу / форму / компонент / новый проект] для [название сервиса].

Что известно:
- Что должен сделать пользователь: [цель экрана]
- Данные: [API и ссылка на swagger / пока моки]
- Макет: [ссылка на Figma / нет]
- Устройства: [мобильный / десктоп / оба]
- Ограничения: [библиотеки, сроки, что не трогать]

Сначала коротко скажи план и какие правила применишь. Неизвестное отметь как [уточнить], контракты API не придумывай.
```

## 4. Примеры задач

```text
$frontend Создай новый проект админки на Vite с авторизацией и списком клиентов.
$frontend Сделай страницу заказов: таблица с фильтрами в URL, пагинация, пустое состояние.
$frontend Подключи API списка клиентов: схема Zod, queryOptions, обработка ошибок.
$frontend Разбей OrdersPage.tsx, он больше 150 строк.
$frontend Добавь форму создания заявки с валидацией и ошибками сервера по полям.
$frontend Проверь фронтенд в этой ветке перед merge request.
```

## 5. Пополнить мозг

Наступил на ловушку, нашёл рецепт или решение, которое пригодится всем? Скажи агенту в любом проекте:

```text
Добавь в мозг: <что узнал и почему это важно>
```

Агент найдёт похожие статьи, напишет новую по шаблону, прогонит проверки, покажет diff и после твоего «да» откроет PR. Мейнтейнер проверит и выпустит релиз. Подробно: [CONTRIBUTING.md](CONTRIBUTING.md).

Плагин пишет и проверяет код по правилам команды, но не пушит, не создаёт merge request и не добавляет библиотеки вне белого списка без прямой просьбы.

## 6. Мозг обновляется сам

Мейнтейнер (или расписание) раз в неделю говорит агенту «обнови мозг». Скилл `brain-update`:

- `node plugins/frontend-pack/scripts/brain-watch.mjs` — что вышло нового в 17 источниках с прошлой проверки и какие скиллы это затрагивает;
- агент читает новое, сам правит безопасное (статьи, правила, версии), спорное помечает для мейнтейнера;
- `node plugins/frontend-pack/scripts/brain-metrics.mjs [--projects <папки>]` — здоровье мозга, статистика по задачам из `.frontend/tasks` и предложения, что улучшить;
- один PR с таблицей изменений и метриками; мерджит и выпускает релиз мейнтейнер.

Как поставить на расписание — `plugins/frontend-pack/skills/brain-update/references/schedule.md`.

## Что внутри

| Скилл | За что отвечает |
|---|---|
| `frontend` | Точка входа `$frontend`: понимает задачу и подгружает нужные скиллы ниже |
| `react-brain` | Обязательный фильтр качества: правила Vercel React Best Practices, Web Interface Guidelines, переход к нужным скиллам ниже |
| `shadcn` | Работа с shadcn/ui: поиск компонентов, актуальные API, Radix и Base UI, CLI |
| `react-new-project` | Новый проект через официальные CLI и базовая обвязка команды |
| `react-page-ux` | UX-бриф перед каждой страницей, проверка в браузере после |
| `react-architecture` | Структура папок, лимит 150 строк на компонент, декомпозиция, где хранить состояние |
| `react-dry` | Убрать дублирование и не создать неправильную абстракцию |
| `react-data-fetching` | TanStack Query, ключи запросов, кэш, инвалидация, оптимистичные обновления |
| `react-ui` | shadcn, токены Tailwind, варианты, доступность |
| `react-ux` | Состояния загрузки, пустые и ошибки, формы, тосты, состояние в URL |
| `ui-copy` | Меньше текста в интерфейсе: бюджет на каждый элемент, без воды и выдуманных блоков, одна главная кнопка справа; проверка `check-ui-copy.mjs` |
| `react-error-handling` | ApiError, error boundaries, сообщения пользователю |
| `mbank-ui` | Кодовый UI-кит Mbank: токены (светлая/тёмная тема, 5 брендов) и 20 компонентов, ставится `node plugins/frontend-pack/scripts/add-ui.mjs <имена\|all>` |
| `design-to-code` | Процесс «бриф → Figma из дизайн-системы → утверждение → спека → код → сверка с макетом» |
| `react-testing` | Vitest + Testing Library + MSW, что тестировать на каждом слое, e2e |
| `react-forms-state` | Сложные формы, мастера из шагов, где хранить состояние |
| `react-performance-a11y` | Скорость, бандл, виртуализация, WCAG 2.2 AA |
| `react-security-i18n` | XSS, токены, env, CSP, переводы ru/ky/en, формат денег и дат |
| `nextjs` | Next.js по nextjs.org: 377 практик по темам, хронология версий 13 → 16.4, бюллетени безопасности, официальные скиллы Next.js; свежие новости и советы под проект: `node plugins/frontend-pack/scripts/nextjs-news.mjs --project <папка>` |
| `mbank-crm` | CRM и админки на Mbank: 11 блоков из Figma (меню, шапка, KPI, канбан, карточки, степпер, скоринг, история), новый проект одной командой `node plugins/frontend-pack/scripts/new-crm.mjs <папка>` |
| `brain-update` | Мозг обновляется сам: следит за 17 источниками (Next.js, React, TanStack, shadcn, Tailwind, Vite, MSW, Zod, Figma…), считает метрики здоровья и работы в проектах, открывает PR с обновлениями |
| `frontend-contribute` | Пополнить мозг: статья в базе знаний или правка правила через PR |

База знаний: `plugins/frontend-pack/knowledge/` — короткие статьи (правило, рецепт, решение, ловушка) по областям и стекам, оглавление в [knowledge/INDEX.md](plugins/frontend-pack/knowledge/INDEX.md). Агент ищет в ней перед работой: `node plugins/frontend-pack/scripts/knowledge.mjs search <слова> --stack vite`.

Как идёт работа: скилл `frontend` (`$frontend`) — **дирижёр**. Он выбирает конвейер под задачу (правка, фича, из Figma, баг, новый проект, ревью, рефакторинг), сам запускает агентов по этапам, проверяет ворота между ними и ведёт файл задачи `.frontend/tasks/<задача>.md`, чтобы работу можно было продолжить в новом чате. Человека спрашивает только на ключевых точках: план большой фичи, утверждение макета, MR. Незавершённые задачи хук показывает при старте сессии.

Агенты: `frontend-engineer` (код, исправление или рефакторинг на своём этапе; без дирижёра может сделать задачу целиком), `frontend-architect` (план фичи до кода), `frontend-reviewer` (ревью, только читает), `design-lead` (проверяет ворота процесса из Figma и называет следующий шаг), `design-qa` (сверяет страницу с макетом).

Второй плагин **figma-pack**: каталог дизайн-системы Mbank, рисование экранов в Figma только из компонентов системы (агент `figma-designer`, нужно Full-место), чтение макета в спеку (агент `figma-reader`, хватает Dev-места), код для React, React Native и Flutter. Установка: `claude plugin install figma-pack@frontend-brain`.

Как связаны спека, Figma, токены и код, частые команды и что проверено — [docs/design-automation.md](docs/design-automation.md). Границы плагинов — [docs/architecture.md](docs/architecture.md).

Белый и чёрный список библиотек — один файл: `plugins/frontend-pack/rules/libraries.json`.

Хуки:
- перед созданием новой страницы (`src/pages/<route>/*.tsx`, `page.tsx` в Next.js) рядом должен лежать `UX.md` с брифом (отключить в проекте: `MDIGITAL_UX_BRIEF=off`);
- после каждой правки `.tsx`/`.jsx` файл длиннее 150 строк возвращается на декомпозицию (`shared/ui`, тесты и stories не считаются; старые файлы можно править, если они не растут).
- после каждой правки `.ts`/`.tsx`/`.js` файл проверяется ESLint проекта, ошибки сразу возвращаются агенту (нужны `eslint.config.*` и установленные зависимости; отключить: `MDIGITAL_LINT_HOOK=off`);
- при старте сессии хук показывает незавершённые задачи из `.frontend/tasks` (отключить: `MDIGITAL_TASKS_HOOK=off`);
- на фронтовой задаче в React/Next/Vite-проекте мозг включается сам и объявляет маршрут: тип задачи, режим, скиллы (отключить: `MDIGITAL_FRONTEND_AUTOSTART=off`).

Приоритет: правила Mdigital выше внешних. Где правило Vercel спорит с нашими (SWR, ручная мемоизация, barrel-файлы), в `react-brain` написано, что применять вместо него.

## Codex

Маркетплейс для Codex: `.agents/plugins/marketplace.json`. Как скиллы работают в Codex: `plugins/frontend-pack/references/codex.md`.

## Структура

```
.claude-plugin/marketplace.json   маркетплейс frontend-brain (Claude Code)
.agents/plugins/marketplace.json  маркетплейс для Codex
plugins/figma-pack/               плагин Figma: дизайн-система Mbank, макеты, design-to-code
  builder/, widget/, bridge/       DS Builder (спека → экраны), виджет Mbank Tokens, мост для Claude
plugins/design-engine/            движок: связка Figma и кода, sync-contracts, build-front, MCP mbank-ds
plugins/frontend-pack/            плагин фронтенда
  skills/<скилл>/SKILL.md         правила и маршрутизация
  rules/libraries.json            белый и чёрный список библиотек
  knowledge/<область>/*.md        база знаний команды, INDEX.md генерируется
  registry/mbank/                 UI-кит Mbank: tokens.css, компоненты, registry.json
  agents/                         frontend-engineer, frontend-architect, frontend-reviewer, design-lead, design-qa
  hooks/, scripts/                хуки UX-бриф и 150 строк, knowledge.mjs (поиск, индекс, проверка)
.github/                          CODEOWNERS, шаблон PR; CI-файл лежит в docs/ci/test.yml — перенести в .github/workflows/ после выдачи gh права workflow
apps/ds-configurator/             конфигуратор дизайн-системы (форк shadcn /create): бренд + опции + свои токены → registry:base JSON, tokens.css, скрипт use_figma; cd apps/ds-configurator && npm i && npm run dev
docs/design-automation.md         карта системы: спека → Figma → токены → код
docs/architecture.md              границы трёх плагинов и контракты
docs/reports/                     отчёты (A/B-тест UX-брифа)
scripts/test.mjs                  проверки репозитория: npm test
scripts/release.mjs               релиз: одна версия во всех манифестах
CONTRIBUTING.md                   как пополнять мозг
```

Сторонние материалы и лицензии: [NOTICE.md](NOTICE.md).
