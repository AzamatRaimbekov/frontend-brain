# Мозг фронтенда — frontend-pack для Claude Code

Плагин для [Claude Code](https://claude.com/claude-code) (и Codex), который учит агента писать React так, как принято во фронтенд-команде Mdigital: архитектура, UX, UI, загрузка данных, обработка ошибок, ревью. Здесь хранятся все правила разработки — агент работает строго по ним.

Стек: React 19 + TypeScript, Vite + TanStack Router или Next.js App Router, shadcn/ui, Tailwind v4, TanStack Query v5, React Hook Form + Zod.

## Установка

```bash
claude plugin marketplace add AzamatRaimbekov/frontend-brain
claude plugin install frontend-pack@frontend-brain
```

Перезапустите Claude Code. Обновление: `claude plugin marketplace update frontend-brain`.

Нужен Node.js 18+ (на нём работают хуки).

## Что внутри

| Скилл | За что отвечает |
|---|---|
| `react-brain` | Обязательный фильтр качества: правила Vercel React Best Practices, Web Interface Guidelines, переход к нужным скиллам ниже |
| `shadcn` | Работа с shadcn/ui: поиск компонентов, актуальные API, Radix и Base UI, CLI |
| `react-new-project` | Новый проект через официальные CLI и базовая обвязка команды |
| `react-page-ux` | UX-бриф перед каждой страницей, проверка в браузере после |
| `react-architecture` | Структура папок, лимит 150 строк на компонент, декомпозиция, где хранить состояние |
| `react-dry` | Убрать дублирование и не создать неправильную абстракцию |
| `react-data-fetching` | TanStack Query, ключи запросов, кэш, инвалидация, оптимистичные обновления |
| `react-ui` | shadcn, токены Tailwind, варианты, доступность |
| `react-ux` | Состояния загрузки, пустые и ошибки, формы, тосты, состояние в URL |
| `react-error-handling` | ApiError, error boundaries, сообщения пользователю |

Агенты: `frontend-architect` (планирует фичу до кода), `frontend-reviewer` (ревью кода, только читает).

Белый и чёрный список библиотек — один файл: `plugins/frontend-pack/rules/libraries.json`.

Хуки:
- перед созданием новой страницы (`src/pages/<route>/*.tsx`, `page.tsx` в Next.js) рядом должен лежать `UX.md` с брифом (отключить в проекте: `MDIGITAL_UX_BRIEF=off`);
- после каждой правки `.tsx`/`.jsx` файл длиннее 150 строк возвращается на декомпозицию (`shared/ui`, тесты и stories не считаются; старые файлы можно править, если они не растут).

Приоритет: правила Mdigital выше внешних. Где правило Vercel спорит с нашими (SWR, ручная мемоизация, barrel-файлы), в `react-brain` написано, что применять вместо него.

## Как пользоваться

Пишите обычным языком, плагин сам подгрузит нужные правила:

- «создай страницу заказов» — сначала UX-бриф, потом код, потом проверка в браузере
- «разбей этот компонент» — декомпозиция по `react-architecture`
- «подключи API списка клиентов» — `queryOptions`, ключи, Zod-схема
- «проверь фронтенд» — агент `frontend-reviewer`

## Codex

Маркетплейс для Codex: `.agents/plugins/marketplace.json`. Как скиллы работают в Codex: `plugins/frontend-pack/references/codex.md`.

## Структура

```
.claude-plugin/marketplace.json   маркетплейс frontend-brain (Claude Code)
.agents/plugins/marketplace.json  маркетплейс для Codex
plugins/frontend-pack/            сам плагин
  skills/<скилл>/SKILL.md         правила и маршрутизация
  rules/libraries.json            белый и чёрный список библиотек
  agents/                         frontend-architect, frontend-reviewer
  hooks/, scripts/                хуки UX-бриф и 150 строк
docs/reports/                     отчёты (A/B-тест UX-брифа)
scripts/test.mjs                  проверки репозитория: npm test
```

Сторонние материалы и лицензии: [NOTICE.md](NOTICE.md).
