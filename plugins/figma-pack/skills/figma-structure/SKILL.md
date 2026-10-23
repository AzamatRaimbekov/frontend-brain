---
name: figma-structure
description: How every Mdigital Figma file is organised and kept clean when an agent writes to it - page order (Cover, separators, one page per product area, Components, Proposals, Archive), one Section per screen with states in rows and breakpoints in columns, frame and layer naming, rules for creating local components (auto layout, Property=Value variants, descriptions, Components page), zero junk (no loose nodes, default names, hidden or empty layers, leftover test instances), plus two scripts - structure-setup.js (creates pages, sections, moves components) and structure-audit.js (read-only lint that must report 0 errors before a draft is handed over) - and the vendored WCAG/token lint from southleft. Use on every Figma write, by figma-design and the figma-designer agent. Triggers - "наведи порядок в файле", "структура фигмы", "страницы в фигме", "секции", "почисти мусор в макете", "проверь макет", "линт макета", "как назвать слои", "создай компонент правильно", "tidy the figma file", "file structure", "lint the design", "clean up layers".
---

# Figma file structure and hygiene (Mdigital)

A file a designer opens after the agent must look like a designer made it: pages in order, every screen in a named Section, states and breakpoints aligned, every layer named, nothing left behind. Structure is checked by a script, not by eye.

Sources: Figma `figma-generate-library/references/naming-conventions.md` (page order, separators, component and variant naming), Figma "Structure your file" and Sections/Dev Mode docs, southleft `figma-lint-design` (MIT, vendored), our own verified runs in file `vVuM5uw3TsWo1xm3vJelXG` (2026-10-12).

## 1. Pages

```
Cover                         title frame: product, status, date (set the file thumbnail by hand - no API)
---
<Area> / <Flow>               one page per product area or flow: "CRM / Переводы", "Mobile / Платежи"
...
---
Components                    local components the kit does not have, one Section per area
Proposals                     only when something is proposed to the design system
---
Archive                       only when something is replaced; never delete people's work
```

- Inspect first: if the file already has a consistent convention (emoji prefixes, other separator), match it.
- Separators are empty pages named `---`. Foundations/library pages never appear in a product file.
- Pages are reordered by moving **only new pages**: `insertChild` on a page that holds instances with a missing font fails ("unloaded font"), so existing pages keep their relative order.

## 2. Sections and frames

- Every top-level node on a flow page is a **Section** named `<Area> / <Screen>` (`CRM / Все переводы`). Nothing loose on the canvas.
- Inside a Section: frames only (plus optional notes). **Rows = states** in the brief order (Default, Loading, Empty, Error, No access, ...), **columns = breakpoints** wide -> narrow (1440, 768, 375 / 393, 360). Gap 80, padding 80; Sections stacked top to bottom with 160 between them, in flow order.
- Frame name: `[draft] <Area> / <Screen> / <State> / <width>`. The designer drops `[draft]` when approving and marks the Section "Ready for dev".
- `structure-setup.js` (MODE `flow`) builds this from frame names; re-running it is safe.

## 3. Layers inside a screen

1. Every container is an **auto-layout frame** named by meaning: `Sidebar`, `Content`, `Header`, `Filters`, `Table card`, `KPI`, `Empty state`. Never `Frame 12`, `Group 3`, `Text` (for a frame), `Rectangle`.
2. **No Groups** - use auto layout. Absolute position only for overlays (badge on an avatar, close icon, FAB).
3. **No hidden layers** of ours (delete instead of hiding); hidden layers *inside kit instances* are the kit's business.
4. **No empty frames**, no zero-size nodes, nothing at (0,0) that is not a page root.
5. Text layers are named by role (`Title`, `Amount`, `Status`); text uses the library text style. In an approved font-fallback draft the style comes back later by metrics (`mbank-figma-patterns/references/crm-screen.md` section 6).
6. All fills, strokes, paddings, gaps and radii bound to variables; spacing on the 4 px grid.
7. No placeholder copy: `Title`, `Label`, `Button`, `Data`, `Badge`, `Lorem`, `Заголовок`.
8. Kit pieces stay instances. A kit block that cannot be inserted is detached **only at its top level**, named `<name> (detached)`, and listed in the report.

## 4. Creating local components (when the kit has a gap)

Follow `figma-generate-library` for mechanics; these are our rules:

- Only after the user agreed (brief question 9). Built on the **Components** page in a Section per area, never left on a flow page or inside a screen.
- Name: `<Area> / <Name>` in PascalCase words (`CRM / KPI card`); internal parts start with `_` (`_KPI card/Delta`). Variants as `Property=Value` (`State=Default`, `Size=M`), properties ordered Type -> State -> Size; booleans for show/hide, text properties for copy, instance swap for icons - not a variant per icon.
- Auto layout with Hug height (set `primaryAxisSizingMode = 'AUTO'` again after any `resize()`), Fill width in use; tokens bound; text styles applied; states the code needs (Default, Hover, Disabled, Loading...) as variants.
- A `description` on every component: what it is, where used, why the kit lacks it, the code counterpart. It also goes into the gaps report for the designers.
- One component per repeated element - rows, cards and list items are instances, never copies.

## 5. Scripts

| Script | When | How |
|---|---|---|
| `references/structure-audit.js` | before the plan (read the file) and as the **last call** of every write | read-only; set `PAGE_NAME`, `DRAFT_MODE_FONT`; returns `summary {error, warn, info}` and nodes per rule |
| `references/structure-setup.js` | new file, or a file to tidy | MODE `cover` (pages + cover frame), then MODE `flow` once per page (rename, Sections, components -> Components) |
| `references/vendor/lint-design.js` | before handing over (accessibility) | southleft WCAG 2.2 + token lint (MIT); rules in `vendor/lint-rules.md`; report critical findings |

Gate: **0 errors** in `structure-audit.js` and **0 critical** contrast/target findings in `lint-design.js` on our own layers, or each remaining one is explained in the report. The scripts run as written; edit only the inputs block.

## 6. Agent hygiene (things that left junk before)

- Probes and experiments create nodes **inside one temporary frame** named `_tmp` and remove it in the same call (`try { ... } finally { tmp.remove() }`). A probe once left a stray `topHeader` instance at (0,0) on the first page - the audit's `loose-top-level` rule catches this.
- A failed `use_figma` call is rolled back completely; a successful one is not - so clean up in the same script that created the mess.
- `figma.createAutoLayout()` gives the frame an **unbound white fill**: set `fills = []` on every container that is not a surface (Body, lists, Footer), or bind it. The old mobile recipe missed this on 11 frames; `raw-color` in the audit catches it.
- New pages, sections and frames are created next to existing content, never on top of it (`overlap` rule).
- Never delete or move nodes made by people. Tidy only what the agent made, or what the user named.

## 7. Report lines

```
Структура: страница "<page>", секции <n>, экранов <n>; компоненты на Components: <list>
Аудит структуры: ошибок 0, предупреждений <n> (<rules>), info <n>
Доступность (lint-design): critical <n>, warning <n>
```

## References

- `references/structure-setup.js` - pages, cover, sections, component move
- `references/structure-audit.js` - read-only structure and hygiene lint
- `references/vendor/lint-design.js`, `vendor/lint-rules.md`, `vendor/LICENSE` - southleft figma-lint-design, MIT, commit 807fcc1
- `../figma-design/references/ui-patterns.md` - what goes inside the screens (UI/UX rules)
