---
name: frontend
description: Entry point and conductor of the Mdigital frontend brain. Use when a user invokes $frontend or asks to build, change, split, connect, fix or review anything in a React, Next.js or Vite web frontend - a new project, page, screen, form, component, API connection, bug, refactoring, a page from Figma or code review - and when the user asks to continue a frontend task. Classifies the task, picks its pipeline, runs the stages in the main session and launches the frontend-pack agents in order with gate checks between them, keeps the task file .frontend/tasks/<slug>.md, and finishes with the team's checks. Triggers include "фронтенд", "сделай страницу", "сверстай", "подключи API", "разбей компонент", "почини", "проверь фронт", "новый проект", "по макету", "продолжи задачу", "build a page", "frontend task", "continue the task".
---

# Frontend

Точка входа во frontend-мозг Mdigital и **дирижёр**: определи тип задачи, выбери конвейер, проведи её по этапам. Этапы выполняются по скиллам frontend-pack, а не по памяти. Правила команды важнее общих привычек и внешних примеров.

Дирижёр — этот скилл в **основной сессии**. В Claude Code агент не может запустить другого агента, поэтому всех исполнителей запускает основная сессия инструментом Agent, по одному этапу, и проверяет ворота между ними. Если ты сам запущен как агент (например `frontend-engineer`), ты исполнитель своего этапа: используй маршрутизацию и проверки ниже, а этапы и файл задачи не веди.

## Сначала

1. Всегда прочитай [react-brain](../react-brain/SKILL.md): это обязательный фильтр качества для любого кода React. В Codex перед этим прочитай [интеграцию с Codex](../../references/codex.md).
2. **Продолжение?** Если пользователь просит продолжить задачу или хук старта сессии показал незавершённые задачи: `node <plugin-root>/scripts/task.mjs list --open`, затем `show <slug>` и порядок из [файла задачи](references/task-file.md#продолжение-в-новом-чате). Новую задачу не начинай, пока не ясно, что старая не та же.
3. Посмотри проект: фреймворк, версия React, библиотеки, `AGENTS.md` или `CLAUDE.md`, `components.json`. Сохраняй стек и структуру проекта.
4. Найди в [базе знаний](../../knowledge/INDEX.md) статьи под задачу и стек: `node <plugin-root>/scripts/knowledge.mjs search <слова> --stack <vite|next|react|expo>`. Прочитай найденные и применяй их наравне со скиллами; при конфликте побеждает скилл.
5. Если чего-то не хватает для первого шага, задай только вопросы, без которых нельзя начать. Остальное реши разумно и перечисли допущения в итоге.
   В `vibe` — **не больше одного вопроса**, и только если непонятно, *что* за страница («сделай страницу» без слов о содержании). Всё остальное — дефолты, без вопросов:
   - просят новый проект, а тип не назван или задача неясна («сделай новый проект», «нужен фронт под задачу») → **не спрашивай в чате**: открой страницу выбора `node <plugin-root>/scripts/project-picker.mjs --parent .` (WebView-микросервис Мбанка или CRM) и дождись клика, порядок — [mbank-webview](../mbank-webview/SKILL.md#which-project-the-picker); после создания проект запускается и открывается в браузере;
   - нет проекта в папке, а страница названа → новый Vite + React + TS + Tailwind + shadcn ([react-new-project](../react-new-project/SKILL.md)) в подпапке с понятным именем. **shadcn ставится всегда, даже для одной страницы**: кнопки, поля, карточки — из `@/shared/ui`, а не самодельные стили. Для одной страницы можно не ставить роутер и TanStack Query;
   - нет макета → чистая раскладка по [react-ui](../react-ui/SKILL.md);
   - нет API → моки;
   - адаптив и тёмная тема — всегда.

   Содержание названо («где есть калькулятор», «таблица клиентов») → сразу делай. В конце скажи, где лежит проект и по какому адресу открыть.
6. Объяви маршрут одной строкой до начала работы, чтобы человек видел, что мозг сработал и что будет дальше:

   `Frontend: <тип задачи> · конвейер <vibe | small-edit | feature | spec | figma | bug | new-project | review | refactor> · режим <написать | ревью | спроектировать | починить> → этапы: <по порядку> · скиллы: <по порядку> · статьи: <найденные или «нет»> · задача: <slug или «без файла»>`

   Грузи только то, что нужно этой задаче: правка отступа не тянет за собой UX-бриф и архитектуру, новая страница тянет.

## Режим: vibe по умолчанию

Мозг нужен, чтобы **быстро делать фронт вайбкодом**. Поэтому страница, экран, форма, компонент, фича и подключение API по умолчанию идут конвейером **`vibe`**: без файла задачи, без агентов, без утверждения плана, без вопросов, которые можно решить самому.

`vibe`: `brief` (UX.md на 5 строк, не ждёшь ответа) → `code` (сам, в этой сессии, по скиллам из маршрутизации) → `checks` (`tsc --noEmit`, линтер, хуки 150 строк / ESLint / ui-copy молчат; тесты — если они уже есть в проекте) → `look` (страница открыта в браузере, скриншот, если браузер доступен) → короткий итог.

Полный процесс (`feature`, `refactor`, `handoff` с MR, агенты, файл задачи) — **только** когда:

- пользователь просит процесс: «до MR», «по процессу», «с ревью», «возьми задачу», «как для прода», ссылка на тикет;
- или в проекте лежит `.frontend/mode` со словом `team` (или `MDIGITAL_FRONTEND_MODE=team`) — хук старта сообщит об этом.

Конвейеры `figma`, `spec`, `bug`, `new-project`, `review` работают как раньше: у них своя причина. Качество в `vibe` не падает — его держат хуки и проверки, а не церемонии.

## Конвейер

Выбери один конвейер по задаче. Полные таблицы этапов (кто, вход, выход, ворота) — [references/pipelines.md](references/pipelines.md).

| Задача | Конвейер | Этапы | Человек нужен на |
|---|---|---|---|
| Правка 1–2 файлов без новой страницы | `small-edit` | code → checks | итог |
| Новая страница, экран, форма, компонент, фича, API (**по умолчанию**) | `vibe` | brief → code → checks → look | итог |
| То же, но «до MR», «по процессу» или `.frontend/mode` = `team` | `feature` | brief → plan → approve-plan → code → checks → review → handoff | план большой фичи, MR |
| ТЗ или целый продукт из блоков каталога (CRM, админка, кабинет): «собери по ТЗ», «дизайн и фронт автоматически» | `spec` | brief → spec → tokens → draft → approve-design → scaffold → generate → code → checks → design-qa → review → handoff | бриф, экраны в Figma, утверждение дизайна, MR |
| Ссылка на Figma, «по макету» | `figma` | access → brief → draft → approve-design → spec → ux → plan → code → design-qa → review → handoff | бриф, draw plan, утверждение макета, MR |
| Баг, регрессия, «не работает» | `bug` | reproduce → failing-test → fix → checks → review → handoff | MR |
| Новый проект с нуля | `new-project` | requirements → scaffold → shell → checks → review → handoff | стек, если не назван |
| Ревью, «проверь» | `review` | scope → review → report | — |
| Разбить, вынести, перестроить | `refactor` | baseline → plan → approve-plan → refactor → checks → review → handoff | план (если крупный), MR |

Всё, что не помечено как «человек», идёт **автоматически**: дирижёр не спрашивает разрешения на следующий этап, если ворота пройдены.

### Как вести этапы

1. **Файл задачи.** Для любого конвейера, кроме `vibe` и `small-edit`, создай его до первого этапа: `node <plugin-root>/scripts/task.mjs new <slug> --title "…" --pipeline <конвейер> --goal "…"`. Формат и правила — [references/task-file.md](references/task-file.md).
2. **Этап.** Исполнитель из таблицы:
   - «сессия» — делаешь сам по скиллам из маршрутизации;
   - «агент `X`» — запускаешь инструментом Agent агента frontend-pack (`frontend-architect`, `frontend-engineer`, `frontend-reviewer`, `design-qa`, `design-lead`) или figma-pack (`figma-designer`, `figma-reader`). В задании агенту — путь к проекту, путь к файлу задачи, входные артефакты этапа и что вернуть. Агент не видит этот чат: всё нужное передай текстом или путями.
3. **Ворота.** Проверь фактом: вывод команды, вердикт агента, файл на месте. Слова исполнителя «готово» — не факт. Не прошли — верни этап тому же исполнителю со списком; после трёх кругов — `--status blocked` и вопрос человеку.
4. **Граница этапа.** Сразу после ворот: `task.mjs stage <slug> <следующий>`, факт проверки — `note <slug> checks "…"`, решения и допущения — `note … decisions`, новые файлы и ссылки — `note … artifacts`. Файл обновляется на каждой границе, а не в конце.
5. **Человек.** На этапах с человеком задай один конкретный вопрос, отметь `--status blocked` и жди ответа. Согласие даёт только человек в этом чате; ответ агента согласием не является.
6. **Смена конвейера.** Правка выросла в страницу, баг оказался фичей — скажи об этом, запиши в «Решения» и продолжи по новому конвейеру (`task.mjs new` с новым slug, старую задачу закрой со ссылкой).

### Большие задачи: параллельно

Если план большой фичи или рефакторинга делится на части без общих файлов, этап `code` можно отдать нескольким агентам `frontend-engineer` сразу: каждому свой git worktree, своя ветка и свой список файлов. Общие файлы (`package.json`, lock-файл, роутер, `shared/`) правит только дирижёр. После агентов дирижёр сливает ветки, решает конфликты и прогоняет `checks` на результате. Порядок — [pipelines.md, «Параллельная работа»](references/pipelines.md#параллельная-работа).

### Без инструмента Agent (Codex и другие)

Те же конвейеры, этапы, ворота и файл задачи. Вместо запуска агента прочитай его файл (`agents/<имя>.md`, для figma-pack — `plugins/figma-pack/agents/<имя>.md`) и выполни его процедуру в этой же сессии, соблюдая его ограничения (ревьюер не меняет код, design-qa не пишет в Figma). Параллельной части нет: части плана — по очереди.

## Режимы

| Режим | Когда | Как работать |
|---|---|---|
| написать | новая страница, фича, компонент | UX-бриф для страниц, затем код по скиллам, тесты по [react-testing](../react-testing/SKILL.md) рядом с кодом |
| ревью | «проверь», «ревью», перед MR | процедура [frontend-reviewer](../../agents/frontend-reviewer.md), код не меняешь |
| спроектировать | большая фича, рефакторинг, «как разбить» | процедура [frontend-architect](../../agents/frontend-architect.md): план файлов до кода |
| починить | баг, «не работает», регрессия | сначала воспроизведи и найди причину, затем тест, который падает, и только потом фикс; не меняй код наугад |

Исполнители этапов: [frontend-architect](../../agents/frontend-architect.md) — план, [frontend-engineer](../../agents/frontend-engineer.md) — код, тесты и проверки, [frontend-reviewer](../../agents/frontend-reviewer.md) — ревью, агент `design-engine:design-qa` — сверка с макетом, агент `design-engine:design-lead` — проверка ворот конвейера `figma` и совет о следующем шаге (никого не запускает).

## Маршрутизация

Загрузи скиллы под задачу. Обычно их несколько.

| Задача | Скиллы |
|---|---|
| Новый проект с нуля | тип не назван или неясен — страница выбора `project-picker.mjs` ([mbank-webview](../mbank-webview/SKILL.md)); WebView-микросервис Мбанка — [mbank-webview](../mbank-webview/SKILL.md) (`new-webview.mjs`); CRM или админка на Mbank — сразу [mbank-crm](../mbank-crm/SKILL.md) (`new-crm.mjs`); остальное — [react-new-project](../react-new-project/SKILL.md); потом остальные по мере работы |
| WebView-микросервис внутри приложения Мбанк (новый или новый экран в нём): токен, язык, тема, «назад» от приложения | [mbank-webview](../mbank-webview/SKILL.md): мост `@/shared/bridge`, запросы только через `http()`, тексты в ru/ky/en; плюс [react-ui](../react-ui/SKILL.md), [react-ux](../react-ux/SKILL.md) |
| Новая страница, экран, раздел, форма | [react-page-ux](../react-page-ux/SKILL.md) (сначала `UX.md`), [react-architecture](../react-architecture/SKILL.md), [react-ui](../react-ui/SKILL.md), [react-ux](../react-ux/SKILL.md), [ui-copy](../ui-copy/SKILL.md) |
| Запросы к API, кэш, мутации | [react-data-fetching](../react-data-fetching/SKILL.md), [react-error-handling](../react-error-handling/SKILL.md) |
| Вёрстка, стили, тема, адаптив | [react-ui](../react-ui/SKILL.md), [shadcn](../shadcn/SKILL.md) при `components.json` |
| Продукт Mbank (банк, касса, travel, artwin, koko) или экран из Mbank Figma | [mbank-ui](../mbank-ui/SKILL.md): кодовый UI-кит на стандартных токенах shadcn (свои токены запрещены), ставится `add-ui.mjs`; плюс [react-ui](../react-ui/SKILL.md) |
| CRM, админка, бэк-офис на Mbank (новая или новая страница в ней) | [mbank-crm](../mbank-crm/SKILL.md): новый проект — `node <plugin-root>/scripts/new-crm.mjs <папка>`, страницы — из CRM-блоков (`add-ui.mjs crm-…`) |
| ТЗ → экраны в Figma и код одной спекой, «автоматизируй дизайн и фронт» | конвейер `spec` ([pipelines.md](references/pipelines.md#spec)): `figma-pack:figma-spec` пишет спеку, плагин DS Builder строит Figma, `scripts/spec-to-code.mjs` — код на `@mdigital/mbank-ui`; токены — `mbank-ui` (`tokens-build.mjs`) или `figma-pack:ds-tokens` |
| Ссылка на Figma, «по макету», «сделай в фигме и сверстай», передача в разработку | конвейер `figma` по `design-engine:design-to-code`: этапы бриф → Figma → утверждение → спека → код → сверка; агенты `design-lead`, `design-qa` и плагин figma-pack |
| Тесты: юнит, компонент, страница, e2e, моки MSW | [react-testing](../react-testing/SKILL.md) |
| Сложная форма, мастер из шагов, где хранить состояние | [react-forms-state](../react-forms-state/SKILL.md) (UX форм — в [react-ux](../react-ux/SKILL.md)) |
| Медленная страница, размер бандла, аудит доступности | [react-performance-a11y](../react-performance-a11y/SKILL.md) |
| Авторизация, токены, env, CSP, переводы, формат денег и дат | [react-security-i18n](../react-security-i18n/SKILL.md) |
| Проект на Next.js: App Router, кэш, Server Actions, SEO, свой хостинг; «что нового в Next», «обновить Next» | [nextjs](../nextjs/SKILL.md): практики с nextjs.org, новости и советы под проект — `node <plugin-root>/scripts/nextjs-news.mjs --project .` |
| «Обнови мозг», «метрики мозга», что нового в источниках мозга | [brain-update](../brain-update/SKILL.md): `brain-watch.mjs`, `brain-metrics.mjs`, PR с обновлениями |
| Загрузка, пустые состояния, формы, тосты | [react-ux](../react-ux/SKILL.md) |
| Любые тексты интерфейса и кнопки: заголовки, подписи, пустые состояния, тосты, диалоги; «слишком много текста», «где поставить кнопки» | [ui-copy](../ui-copy/SKILL.md): бюджет текста, ничего сверх задачи, одна главная кнопка справа; проверка `check-ui-copy.mjs` |
| Подобрать дизайн-систему, стиль, палитру, шрифты для нового не-Mbank продукта; UX-проверка по базе | [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md): `--design-system` → выбор человека → токены в переменные shadcn. Mbank — всегда [mbank-ui](../mbank-ui/SKILL.md) |
| Ошибки, белый экран, error boundary | [react-error-handling](../react-error-handling/SKILL.md) |
| Большой компонент, структура папок | [react-architecture](../react-architecture/SKILL.md) |
| Повторяющийся код | [react-dry](../react-dry/SKILL.md) |
| Новая или выбранная библиотека | [libraries.json](../../rules/libraries.json): только из белого списка |
| План большой фичи | процедура [frontend-architect](../../agents/frontend-architect.md) |
| Ревью или «проверь фронт» | процедура [frontend-reviewer](../../agents/frontend-reviewer.md), только чтение |
| «Добавь в мозг», новое правило, рецепт, ловушка | [frontend-contribute](../frontend-contribute/SKILL.md): PR в frontend-brain |
| В работе узнали новое и проверенное | [brain-learn](../brain-learn/SKILL.md): сам открывает MR в GitLab frontend-brain |

## Перед финишем

- Проверь изменённые файлы по загруженным скиллам и исправь замечания.
- Компонент не длиннее 150 строк: `node <plugin-root>/scripts/check-file-size.mjs <файлы>`. Старые большие файлы можно править, если они не выросли.
- У каждой новой страницы рядом лежит `UX.md` (в `vibe` — 5 строк).
- Лишнего текста нет: только блоки из задачи, кнопки по [ui-copy](../ui-copy/SKILL.md), `node <plugin-root>/scripts/check-ui-copy.mjs <файлы>` без замечаний.
- Ошибки ESLint, которые вернул хук после правки, исправлены в том же файле.
- В приложении есть экран падения, страница 404 и баннер «нет интернета» ([app-shell](../react-error-handling/references/app-shell.md)).
- Если в задаче нашлось то, чего нет в мозге (ловушка, рецепт, решение, неверное правило), прогони [brain-learn](../brain-learn/SKILL.md): прошло его ворота — он сам откроет MR в frontend-brain, без вопроса человеку.
- Прогони проверки проекта, которые есть: `tsc --noEmit`, линтер, тесты. Видимый UI проверь в браузере, если он доступен.
- Файл задачи отражает последний этап, решения и результаты проверок; закрытая задача — `task.mjs stage <slug> done`.

## Формат ответа

В `vibe` — 3–5 строк: что сделано, где посмотреть, какие проверки прошли, допущения. В остальных конвейерах по-русски, коротко:

- что сделано и где это посмотреть (адрес страницы или компонент);
- конвейер, пройденные этапы и где файл задачи;
- какие скиллы, агенты и статьи базы знаний применены;
- допущения и что осталось уточнить;
- какие проверки прошли, а какие не удалось запустить и почему.

## Ограничения

- Не добавляй библиотеки вне белого списка и не меняй стек проекта без прямой просьбы.
- Не придумывай контракты API: если бэкенда нет, сделай мок MSW в `src/features/<f>/api/<f>.handlers.ts` (сборка в `src/mocks/handlers.ts`, подробно — [react-testing](../react-testing/SKILL.md) §5) и отметь это в итоге. В существующем проекте оставь его раскладку моков.
- Не называй код соответствующим правилам только потому, что скилл загружен: подтверди проверкой.
- Не пропускай ворота и этапы с человеком; пропуск этапа — только по таблице конвейера и через `task.mjs skip` (он пишет причину в «Решения»).
- Не пушь, не создавай merge request и не публикуй без прямой просьбы. Исключение — MR знаний в frontend-brain через [brain-learn](../brain-learn/SKILL.md).
