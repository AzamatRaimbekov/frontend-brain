# Мозг фронтенда — frontend-pack для Claude Code

Плагин для [Claude Code](https://claude.com/claude-code) (и Codex), который учит агента писать React так, как принято во фронтенд-команде Mdigital: архитектура, UX, UI, загрузка данных, обработка ошибок, ревью. Здесь хранятся все правила разработки — агент работает строго по ним.

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
5. Выбери каталог **Mdigital Frontend**.
6. Открой плагин **frontend-pack** и нажми «Установить».

Из терминала то же самое: `codex plugin marketplace add AzamatRaimbekov/frontend-brain`, затем `codex plugin add frontend-pack@frontend-brain`.

**Claude Code**

```bash
claude plugin marketplace add AzamatRaimbekov/frontend-brain
claude plugin install frontend-pack@frontend-brain
```

Перезапусти Claude Code. Обновление: `claude plugin marketplace update frontend-brain` (в Codex: `codex plugin marketplace upgrade`).

Репозиторий приватный: чтобы установить плагин, нужен доступ к нему на GitHub (попроси добавить тебя) и вход в git на компьютере (`gh auth login`). Для хуков нужен Node.js 18+.

## 2. Начать работу

Открой папку фронтенд-проекта и создай новый чат. В Codex введи `$frontend` и опиши задачу обычными словами, либо нажми `@` и выбери **Mdigital Frontend**. В Claude Code достаточно описать задачу: нужные правила подгрузятся сами (или вызови `/frontend-pack:frontend`).

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

Плагин пишет и проверяет код по правилам команды, но не пушит, не создаёт merge request и не добавляет библиотеки вне белого списка без прямой просьбы.

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
| `react-error-handling` | ApiError, error boundaries, сообщения пользователю |

Агенты: `frontend-architect` (планирует фичу до кода), `frontend-reviewer` (ревью кода, только читает).

Белый и чёрный список библиотек — один файл: `plugins/frontend-pack/rules/libraries.json`.

Хуки:
- перед созданием новой страницы (`src/pages/<route>/*.tsx`, `page.tsx` в Next.js) рядом должен лежать `UX.md` с брифом (отключить в проекте: `MDIGITAL_UX_BRIEF=off`);
- после каждой правки `.tsx`/`.jsx` файл длиннее 150 строк возвращается на декомпозицию (`shared/ui`, тесты и stories не считаются; старые файлы можно править, если они не растут).

Приоритет: правила Mdigital выше внешних. Где правило Vercel спорит с нашими (SWR, ручная мемоизация, barrel-файлы), в `react-brain` написано, что применять вместо него.

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
