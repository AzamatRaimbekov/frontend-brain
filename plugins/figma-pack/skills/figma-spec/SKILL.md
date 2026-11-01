---
name: figma-spec
description: Turns a ТЗ (requirements doc) or a product idea into one compact JSON spec of all screens - navigation, blocks, states and widths - that the DS Builder Figma plugin builds on the shadcn kit with the project's Brand tokens. The model writes structure only (columns as "Сумма:money", no table rows, no pixel values); the plugin generates realistic data, layouts, loading/empty/error/no-access states and mobile versions deterministically, so a whole project costs a few thousand tokens. Triggers - "собери экраны по ТЗ", "сделай все страницы в фигме", "spec экранов", "спецификация экранов", "макеты всего проекта", "screens from spec", "build all screens in Figma".
---

# ТЗ → screen spec → Figma (Mdigital)

The plugin draws; you decide **what** is on each screen. Never write Plugin API code or `use_figma` calls for screens that the spec can express — that is slower, costs MCP calls and drifts from the system.

Format and block catalog: `references/spec-format.md`. Validator: `node <plugin-root>/builder/cli/ds.mjs spec check <file>` ([builder](../../builder/README.md)).

**Start from a template.** `<plugin-root>/builder/templates/<archetype>.spec.json` (`list`, `record`, `form`, `dashboard`, `login`, `board`, …) holds the block structure our designers actually use for that kind of screen, refreshed from the team's Figma files by `figma-learn` (`template.derivedFrom` says from how many screens). Copy the screen, rename it, adjust columns and copy to the ТЗ; keep the block order unless the ТЗ needs another.

## Steps

1. **Read the ТЗ once** and list: roles, entities, user goals, required screens. If the ТЗ is silent on platform or widths, take web desktop + mobile; ask only what changes the screens (see `figma-brief`).
2. **Navigation first:** 4–7 nav items, grouped if more. Each screen points to its nav item.
3. **One screen = one user goal.** Typical CRM set per entity: list (table + toolbar + pagination), card (header + stepper/details + timeline), create/edit form. Plus dashboard and login.
4. **Pick blocks from the catalog only.** Unknown needs → nearest block + a note in your report, never an invented type.
5. **States:** every list screen gets `loading`, `empty`, `error`; forms get `error`; restricted screens get `no-access`. Write `empty` texts that tell the user what to do next.
6. **Data by type, not by value:** `"columns": ["Номер:id", "Клиент:person", "Сумма:money", "Статус:status"]`, `"statuses": [...]` from the domain. Write explicit values only for KPIs, titles and domain words.
7. **Validate** with `ds.mjs spec check` and fix every error before handing over.
8. **Hand over:** save `specs/<project>.spec.json`; the designer pastes it into the plugin («Экраны» → brand, style, theme → «Собрать»).

## Beauty rules (the plugin enforces layout; you enforce content)

- One primary action per screen: prefix it with `+` in `actions` (`"+ Новая заявка"`); others become outline buttons. Max 3 actions.
- KPIs: 3–4, each with a delta or hint. Never 7 tiny cards.
- Tables: 5–7 columns, the person/company column second, money right-aligned (type `money`), status as `status`, last column `:actions`.
- Detail screens: `split` with ratio `2:1` — facts left, risk/alerts/history right.
- Forms: ≤ 8 fields per card, `required` marked, hints only where they help, `width` 640–760 on desktop.
- Russian UI copy, sentence case, verbs on buttons («Создать клиента», not «ОК»).

## Report

```
Spec: specs/<project>.spec.json — <n> экранов → <m> фреймов (ds spec check: ок)
Экраны: <список с состояниями>
Не покрыто каталогом: <что и чем заменено> | нет
Дальше: плагин DS Builder → «Экраны» → бренд <Brand>, стиль <Style>
```
