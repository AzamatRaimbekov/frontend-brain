---
name: figma-spec
description: Turns a ТЗ (requirements doc) or a product idea into one compact JSON spec of all screens - navigation, blocks, states and widths - that the DS Builder Figma plugin builds on the shadcn kit with the project's Brand tokens. The model writes structure only (columns as "Сумма:money", no table rows, no pixel values); the plugin generates realistic data, layouts, loading/empty/error/no-access states and mobile versions deterministically, so a whole project costs a few thousand tokens. Triggers - "собери экраны по ТЗ", "сделай все страницы в фигме", "spec экранов", "спецификация экранов", "макеты всего проекта", "screens from spec", "build all screens in Figma".
---

# ТЗ → screen spec → Figma (Mdigital)

The plugin draws; you decide **what** is on each screen. Never write Plugin API code or `use_figma` calls for screens that the spec can express — that is slower, costs MCP calls and drifts from the system.

Format and block catalog: `references/spec-format.md`. Validator: `node <plugin-root>/builder/cli/ds.mjs spec check <file>` ([builder](../../builder/README.md)).

**Start from a template.** `<plugin-root>/builder/templates/<archetype>.spec.json` (`list`, `record`, `form`, `dashboard`, `login`, `board`, …) holds the block structure our designers actually use for that kind of screen, refreshed from the team's Figma files by `figma-learn` (`template.derivedFrom` says from how many screens). Copy the screen, rename it, adjust columns and copy to the ТЗ; keep the block order unless the ТЗ needs another.

## New project: order

1. **Tokens first.** The designer opens the «Mbank Tokens» widget in the project file: brand, edits, «Токены проекта» for project-only tokens, «Применить в Figma». Components that need a project token get it in the widget's «Компоненты» tab → «Обновить компонент в файле» (instances everywhere follow). Do not build screens before this: they bind to these variables.
2. **ТЗ → spec** by the steps below, with links, so every screen is reachable by clicks.
3. **DS Builder → «Экраны» → «Собрать»:** one Figma page per product section (all states × widths) + page «Прототип» with every screen linked; Present starts at login or the first menu screen.
4. Designer reviews and approves; then code from the same spec (`design-to-code`).

## Steps

1. **Read the ТЗ once** and list: roles, entities, user goals, required screens. If the ТЗ is silent on platform or widths, take web desktop + mobile; ask only what changes the screens (see `figma-brief`).
2. **Navigation first:** 4–7 nav items, grouped if more. Each screen points to its nav item.
3. **One screen = one user goal.** Typical CRM set per entity: list (table + toolbar + pagination), card (header + stepper/details + timeline), create/edit form. Plus dashboard and login.
4. **Pick blocks from the catalog only.** Unknown needs → nearest block + a note in your report, never an invented type.
5. **States:** every list screen gets `loading`, `empty`, `error`; forms get `error`; restricted screens get `no-access`. Write `empty` texts that tell the user what to do next.
6. **Links (prototype):** say where every click goes, so the designer gets a clickable product. Nav items link themselves. Add `"link": "<screenId>"` to each list/table/kanban/cards block that opens a record, an arrow to actions that open a screen (`"+ Новый клиент → client-new"`), `"to"` to forms (list screen after save/cancel); breadcrumbs go to the list of the same nav item by default. Anything else → top-level `"links": [{ "from", "on": "<button text>", "to" }]`. Every screen should be reachable from the start (login or dashboard).
7. **Data by type, not by value:** `"columns": ["Номер:id", "Клиент:person", "Сумма:money", "Статус:status"]`, `"statuses": [...]` from the domain. Write explicit values only for KPIs, titles and domain words.
8. **Validate** with `ds.mjs spec check` and fix every error before handing over.
9. **Hand over:** save `specs/<project>.spec.json`; the designer pastes it into the plugin («Экраны» → brand, style, theme → «Собрать»). They get a page per product section plus the «Прототип» page to click through in Present.

## Beauty rules (the plugin enforces layout; you enforce content)

- One primary action per screen: prefix it with `+` in `actions` (`"+ Новая заявка"`); others become outline buttons. Max 3 actions.
- KPIs: 3–4, each with a delta or hint. Never 7 tiny cards.
- Tables: 5–7 columns, the person/company column second, money right-aligned (type `money`), status as `status`, last column `:actions`.
- Detail screens: `split` with ratio `2:1` — facts left, risk/alerts/history right.
- Forms: ≤ 8 fields per card, `required` marked, hints only where they help, `width` 640–760 on desktop.
- Russian UI copy, sentence case, verbs on buttons («Создать клиента», not «ОК»).
- Less text: `subtitle` only when it carries data («Обновлено в 09:40», «128 заявок в работе»), never a description («Здесь вы можете…», «Список всех клиентов»); no blocks the ТЗ did not ask for. The code generator copies every string into the app, so filler in the spec becomes filler in the code (frontend-pack `ui-copy`).

## Report

```
Spec: specs/<project>.spec.json — <n> экранов → <m> фреймов (ds spec check: ок)
Экраны: <список с состояниями>
Переходы: <n> (старт: <экран>); недостижимые экраны: <список> | нет
Не покрыто каталогом: <что и чем заменено> | нет
Дальше: плагин DS Builder → «Экраны» → бренд <Brand>, стиль <Style>
```
