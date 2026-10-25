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
6. Объяви маршрут одной строкой до начала работы, чтобы человек видел, что мозг сработал и что будет дальше:

   `Frontend: <тип задачи> · конвейер <small-edit | feature | figma | bug | new-project | review | refactor> · режим <написать | ревью | спроектировать | починить> → этапы: <по порядку> · скиллы: <по порядку> · статьи: <найденные или «нет»> · задача: <slug или «без файла»>`

   Грузи только то, что нужно этой задаче: правка отступа не тянет за собой UX-бриф и архитектуру, новая страница тянет.

## Конвейер

Выбери один конвейер по задаче. Полные таблицы этапов (кто, вход, выход, ворота) — [references/pipelines.md](references/pipelines.md).

| Задача | Конвейер | Этапы | Человек нужен на |
|---|---|---|---|
| Правка 1–2 файлов без новой страницы | `small-edit` | code → checks | итог |
| Новая страница, экран, форма, фича, API | `feature` | brief → plan → approve-plan → code → checks → review → handoff | план большой фичи, MR |
| Ссылка на Figma, «по макету» | `figma` | access → brief → draft → approve-design → spec → ux → plan → code → design-qa → review → handoff | бриф, draw plan, утверждение макета, MR |
| Баг, регрессия, «не работает» | `bug` | reproduce → failing-test → fix → checks → review → handoff | MR |
| Новый проект с нуля | `new-project` | requirements → scaffold → shell → checks → review → handoff | стек, если не назван |
| Ревью, «проверь» | `review` | scope → review → report | — |
| Разбить, вынести, перестроить | `refactor` | baseline → plan → approve-plan → refactor → checks → review → handoff | план (если крупный), MR |

Всё, что не помечено как «человек», идёт **автоматически**: дирижёр не спрашивает разрешения на следующий этап, если ворота пройдены.

### Как вести этапы

1. **Файл задачи.** Для любого конвейера, кроме `small-edit`, создай его до первого этапа: `node <plugin-root>/scripts/task.mjs new <slug> --title "…" --pipeline <конвейер> --goal "…"`. Формат и правила — [references/task-file.md](references/task-file.md).
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

Исполнители этапов: [frontend-architect](../../agents/frontend-architect.md) — план, [frontend-engineer](../../agents/frontend-engineer.md) — код, тесты и проверки, [frontend-reviewer](../../agents/frontend-reviewer.md) — ревью, [design-qa](../../agents/design-qa.md) — сверка с макетом, [design-lead](../../agents/design-lead.md) — проверка ворот конвейера `figma` и совет о следующем шаге (никого не запускает).

## Маршрутизация

Загрузи скиллы под задачу. Обычно их несколько.

| Задача | Скиллы |
|---|---|
| Новый проект с нуля | [react-new-project](../react-new-project/SKILL.md), потом остальные по мере работы |
| Новая страница, экран, раздел, форма | [react-page-ux](../react-page-ux/SKILL.md) (сначала `UX.md`), [react-architecture](../react-architecture/SKILL.md), [react-ui](../react-ui/SKILL.md), [react-ux](../react-ux/SKILL.md) |
| Запросы к API, кэш, мутации | [react-data-fetching](../react-data-fetching/SKILL.md), [react-error-handling](../react-error-handling/SKILL.md) |
| Вёрстка, стили, тема, адаптив | [react-ui](../react-ui/SKILL.md), [shadcn](../shadcn/SKILL.md) при `components.json` |
| Продукт Mbank (банк, касса, travel, artwin, koko) или экран из Mbank Figma | [mbank-ui](../mbank-ui/SKILL.md): кодовый UI-кит и токены, ставится `add-ui.mjs`; плюс [react-ui](../react-ui/SKILL.md) |
| Ссылка на Figma, «по макету», «сделай в фигме и сверстай», передача в разработку | конвейер `figma` по [design-to-code](../design-to-code/SKILL.md): этапы бриф → Figma → утверждение → спека → код → сверка; агенты `design-lead`, `design-qa` и плагин figma-pack |
| Тесты: юнит, компонент, страница, e2e, моки MSW | [react-testing](../react-testing/SKILL.md) |
| Сложная форма, мастер из шагов, где хранить состояние | [react-forms-state](../react-forms-state/SKILL.md) (UX форм — в [react-ux](../react-ux/SKILL.md)) |
| Медленная страница, размер бандла, аудит доступности | [react-performance-a11y](../react-performance-a11y/SKILL.md) |
| Авторизация, токены, env, CSP, переводы, формат денег и дат | [react-security-i18n](../react-security-i18n/SKILL.md) |
| Загрузка, пустые состояния, формы, тосты | [react-ux](../react-ux/SKILL.md) |
| Ошибки, белый экран, error boundary | [react-error-handling](../react-error-handling/SKILL.md) |
| Большой компонент, структура папок | [react-architecture](../react-architecture/SKILL.md) |
| Повторяющийся код | [react-dry](../react-dry/SKILL.md) |
| Новая или выбранная библиотека | [libraries.json](../../rules/libraries.json): только из белого списка |
| План большой фичи | процедура [frontend-architect](../../agents/frontend-architect.md) |
| Ревью или «проверь фронт» | процедура [frontend-reviewer](../../agents/frontend-reviewer.md), только чтение |
| «Добавь в мозг», новое правило, рецепт, ловушка | [frontend-contribute](../frontend-contribute/SKILL.md): PR в frontend-brain |

## Перед финишем

- Проверь изменённые файлы по загруженным скиллам и исправь замечания.
- Компонент не длиннее 150 строк: `node <plugin-root>/scripts/check-file-size.mjs <файлы>`. Старые большие файлы можно править, если они не выросли.
- У каждой новой страницы рядом лежит `UX.md`.
- Ошибки ESLint, которые вернул хук после правки, исправлены в том же файле.
- В приложении есть экран падения, страница 404 и баннер «нет интернета» ([app-shell](../react-error-handling/references/app-shell.md)).
- Если в задаче нашлось то, чего нет в мозге (ловушка, рецепт, решение), предложи пользователю добавить это через [frontend-contribute](../frontend-contribute/SKILL.md). Сам PR не создавай без его согласия.
- Прогони проверки проекта, которые есть: `tsc --noEmit`, линтер, тесты. Видимый UI проверь в браузере, если он доступен.
- Файл задачи отражает последний этап, решения и результаты проверок; закрытая задача — `task.mjs stage <slug> done`.

## Формат ответа

По-русски, коротко:

- что сделано и где это посмотреть (адрес страницы или компонент);
- конвейер, пройденные этапы и где файл задачи;
- какие скиллы, агенты и статьи базы знаний применены;
- допущения и что осталось уточнить;
- какие проверки прошли, а какие не удалось запустить и почему.

## Ограничения

- Не добавляй библиотеки вне белого списка и не меняй стек проекта без прямой просьбы.
- Не придумывай контракты API: если бэкенда нет, сделай мок в `api/` фичи и отметь это в итоге.
- Не называй код соответствующим правилам только потому, что скилл загружен: подтверди проверкой.
- Не пропускай ворота и этапы с человеком; пропуск этапа — только по таблице конвейера и через `task.mjs skip` (он пишет причину в «Решения»).
- Не пушь, не создавай merge request и не публикуй без прямой просьбы.
