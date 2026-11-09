---
name: ui-copy
description: Keeps generated interface text short and button layout predictable in Mdigital React screens - a text budget per screen, label/button/placeholder/hint/empty-state/error/toast length rules, a list of filler phrases that are never written ("Здесь вы можете", "Добро пожаловать", "Пожалуйста", descriptions under every heading), no invented sections or demo blocks, and fixed button placement (one primary action, primary on the right, cancel left of it, destructive apart, max two visible actions plus a "⋯" menu). Use whenever the agent writes or reviews any user-facing text or action buttons - new page, form, dialog, table, empty state, toast, or spec for Figma - and when the user says "слишком много текста", "лишний текст", "убери воду", "тексты кнопок", "где поставить кнопки", "расположение кнопок", "микротекст", "too much text", "button placement", "UI copy". Checker - node <plugin-root>/scripts/check-ui-copy.mjs <src>.
---

# UI copy: less text, buttons in fixed places

When running in Codex, first read [Codex integration](../../references/codex.md).

AI-generated screens drown in text: a subtitle under every heading, a description in every card, a hint under every field, "Добро пожаловать" banners, tips blocks nobody asked for, five buttons in a row. Every extra string is code to write, translate, test and later delete. This skill sets the budget. How errors, empty and loading states **behave** stays in [react-ux](../react-ux/SKILL.md); this skill decides **how much is written and where actions sit**.

## 1. The default is no text

Write a string only if the screen is unclear without it. Delete test for every string: *if I remove it, does the user lose information they need for the next action?* No → remove.

- Build **only the sections and blocks named in the task, the spec or the mockup.** No invented "Статистика", "Советы", "Последние действия", FAQ, onboarding banners, footers, "Нужна помощь?" cards.
- No text that repeats what the UI already shows: heading "Список клиентов" above a table of clients is enough, no "Ниже представлен список всех клиентов".
- Internal tools (CRM, admin, back-office) have **no marketing tone**: no slogans, no "легко и быстро", no emoji, no exclamation marks.
- Demo data is not copy: rows of a table, names, sums come from mocks/API, never hard-coded into the component, and there are exactly as many as the design shows.

## 2. Budget per element

| Element | Limit | Example |
|---|---|---|
| Page title (`h1`) | 1–3 words, a noun | «Заявки», «Новый клиент» |
| Page subtitle | **none by default**; one line ≤ 60 chars only when it carries data | «Обновлено в 09:40» |
| Section / card title | 1–3 words, no description under it | «Документы» |
| Button | 1–2 words, a verb with the object if needed | «Сохранить», «Добавить клиента» |
| Field label | 1–3 words, no colon, no «Введите» | «Телефон» |
| Placeholder | an example of the format or nothing; never repeats the label | «+996 555 123 456» |
| Hint under a field | only for a format or a limit, ≤ 1 line | «Не меньше 8 символов» |
| Empty state | title ≤ 4 words + one action; a line of text only if the action is not obvious | «Заявок нет» + «Создать заявку» |
| Error | what happened + what to do, ≤ 1 sentence | «Не удалось сохранить. Повторите.» |
| Toast | ≤ 4 words, result of the action | «Клиент сохранён» |
| Confirm dialog | title = question with the object; body only for the irreversible consequence | «Удалить заявку CL-240118?» |
| Tooltip | only on icon-only buttons, = the action name | «Экспорт» |

Never write: «Здесь вы можете…», «В этом разделе…», «Добро пожаловать», «Пожалуйста», «Обратите внимание», «Нажмите кнопку, чтобы…», «Введите ваш…», «Успешно!», «Ой!», «Упс», «Данный», ALL CAPS, «!» anywhere in product text. The checker (§5) finds them.

## 3. Buttons: how many and where

**One primary action per area** (page header, form, dialog, card). Everything else is `outline`/`ghost`/`link`. Two primary buttons side by side = a bug.

| Place | Layout |
|---|---|
| Page header | right side of the title row: secondary actions, then the **primary rightmost** («Экспорт», «+ Новая заявка») |
| Form on a page | bottom of the form, aligned with the fields, right-aligned: «Отмена» (`outline`), then primary «Сохранить» rightmost |
| Dialog / sheet footer | right-aligned, shadcn `DialogFooter`: «Отмена», then primary; on phone stacked full-width, primary on top |
| Destructive | `destructive` variant, separated from the others (left edge of the footer or inside the «⋯» menu), never the default focused button |
| Table row | no button columns; row click opens the record, row actions in a «⋯» `DropdownMenu` at the end of the row |
| Bulk actions | appear in a bar above the table only while rows are selected |
| Card | at most one action; the whole card is the link when it opens something |
| Mobile | primary action full width at the bottom (sticky if the form is long) |

- **At most 2 visible buttons per group**; the third and further go into a «⋯» menu.
- Do not duplicate one action in two places on the same screen (header + bottom + floating button).
- Icon + text only for the primary «+ Создать»; elsewhere text only or icon only (with `aria-label` and tooltip).
- Disabled buttons only while submitting; otherwise keep enabled and show validation (see react-ux).

## 4. Before writing a screen: a copy list

Before code (or before a spec for Figma), list every string the screen will show — one line each: `element → text`. Cross out everything the delete test removes. Only what is left goes into the code, and only through the project's i18n (`t('clients.title')`), never inline literals when i18n exists. In the final report give the count: «строк интерфейса: 14».

## 5. Checker

The plugin runs it **after every edit** of a `.tsx`/`.jsx` file (hook, like ESLint) and returns the findings to the agent; fix them in the same file. Off for one project: `MDIGITAL_COPY_HOOK=off`.

```bash
node <plugin-root>/scripts/check-ui-copy.mjs src            # scan; exit 1 on findings
node <plugin-root>/scripts/check-ui-copy.mjs src/pages/Clients.tsx --json
```

It flags subtitles without data (a muted `<p>` right after a heading or a `subtitle="…"` with no number, date or count and not an instruction like «Проверьте адрес…»), filler phrases, «!», ALL CAPS, long text in JSX, buttons longer than 3 words, two primary buttons (no `variant` or `variant="default"`) within a few lines of each other, and placeholders that repeat their label. Exempt: tests, stories, `components/ui`, `shared/ui`, i18n dictionaries (checked by phrase only). A finding is fixed by deleting or shortening the text, not by disabling the rule.

## Checklist before finishing

- [ ] Only blocks from the task / spec / mockup; nothing invented
- [ ] No subtitles or descriptions under headings unless they carry data
- [ ] Every string passed the delete test; copy list count is in the report
- [ ] Buttons 1–2 words; one primary per area; primary rightmost; cancel left of it
- [ ] ≤ 2 visible buttons per group, rest in «⋯»; destructive apart
- [ ] Placeholders are format examples or empty; hints only for format/limits
- [ ] `check-ui-copy.mjs` passes on the changed files
