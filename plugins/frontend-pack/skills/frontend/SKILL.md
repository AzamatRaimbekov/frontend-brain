---
name: frontend
description: Entry point to the Mdigital frontend brain. Use when a user invokes $frontend or asks to build, change, split, connect, fix or review anything in a React, Next.js or Vite web frontend - a new project, page, screen, form, component, API connection, error handling, refactoring or code review. Classifies the task, loads the matching frontend-pack skills and finishes with the team's checks. Triggers include "фронтенд", "сделай страницу", "сверстай", "подключи API", "разбей компонент", "проверь фронт", "новый проект", "build a page", "frontend task".
---

# Frontend

Точка входа во frontend-мозг Mdigital. Определи, что нужно сделать, загрузи нужные скиллы frontend-pack и выполни задачу по ним, а не по памяти. Правила команды важнее общих привычек и внешних примеров.

## Сначала

1. Всегда прочитай [react-brain](../react-brain/SKILL.md): это обязательный фильтр качества для любого кода React. В Codex перед этим прочитай [интеграцию с Codex](../../references/codex.md).
2. Посмотри проект: фреймворк, версия React, библиотеки, `AGENTS.md` или `CLAUDE.md`, `components.json`. Сохраняй стек и структуру проекта.
3. Найди в [базе знаний](../../knowledge/INDEX.md) статьи под задачу и стек: `node <plugin-root>/scripts/knowledge.mjs search <слова> --stack <vite|next|react|expo>`. Прочитай найденные и применяй их наравне со скиллами; при конфликте побеждает скилл.
4. Если чего-то не хватает для первого шага, задай только вопросы, без которых нельзя начать. Остальное реши разумно и перечисли допущения в итоге.

## Маршрутизация

Загрузи скиллы под задачу. Обычно их несколько.

| Задача | Скиллы |
|---|---|
| Новый проект с нуля | [react-new-project](../react-new-project/SKILL.md), потом остальные по мере работы |
| Новая страница, экран, раздел, форма | [react-page-ux](../react-page-ux/SKILL.md) (сначала `UX.md`), [react-architecture](../react-architecture/SKILL.md), [react-ui](../react-ui/SKILL.md), [react-ux](../react-ux/SKILL.md) |
| Запросы к API, кэш, мутации | [react-data-fetching](../react-data-fetching/SKILL.md), [react-error-handling](../react-error-handling/SKILL.md) |
| Вёрстка, стили, тема, адаптив | [react-ui](../react-ui/SKILL.md), [shadcn](../shadcn/SKILL.md) при `components.json` |
| Продукт Mbank (банк, касса, travel, artwin, koko) или экран из Mbank Figma | [mbank-ui](../mbank-ui/SKILL.md): кодовый UI-кит и токены, ставится `add-ui.mjs`; плюс [react-ui](../react-ui/SKILL.md) |
| Ссылка на Figma, «по макету», «сделай в фигме и сверстай», передача в разработку | [design-to-code](../design-to-code/SKILL.md): этапы бриф → Figma → утверждение → спека → код → сверка; агенты `design-lead`, `design-qa` и плагин figma-pack |
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
- Если в задаче нашлось то, чего нет в мозге (ловушка, рецепт, решение), предложи пользователю добавить это через [frontend-contribute](../frontend-contribute/SKILL.md). Сам PR не создавай без его согласия.
- Прогони проверки проекта, которые есть: `tsc --noEmit`, линтер, тесты. Видимый UI проверь в браузере, если он доступен.

## Формат ответа

По-русски, коротко:

- что сделано и где это посмотреть (адрес страницы или компонент);
- какие скиллы и статьи базы знаний применены;
- допущения и что осталось уточнить;
- какие проверки прошли, а какие не удалось запустить и почему.

## Ограничения

- Не добавляй библиотеки вне белого списка и не меняй стек проекта без прямой просьбы.
- Не придумывай контракты API: если бэкенда нет, сделай мок в `api/` фичи и отметь это в итоге.
- Не называй код соответствующим правилам только потому, что скилл загружен: подтверди проверкой.
- Не пушь, не создавай merge request и не публикуй без прямой просьбы.
