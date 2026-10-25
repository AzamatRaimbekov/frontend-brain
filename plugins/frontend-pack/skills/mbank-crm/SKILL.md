---
name: mbank-crm
description: Mbank CRM kit - start any CRM, admin panel or back-office on the Mbank design system from a ready app (new-crm.mjs) and Figma-accurate blocks (side menu, top header, KPI cards, period segment, kanban board with application cards, key-value sections, stage stepper, scoring card, timeline, summary header) instead of from scratch. Use when creating a new CRM or admin panel for Mbank, adding a page to one, or turning a Figma CRM frame into React. Triggers - "срм", "crm", "црм", "админка", "админ панель", "админ-панель", "бэк-офис", "бэкофис", "back-office", "admin panel", "admin dashboard", "кредитный конвейер", "канбан заявок", "доска заявок", "карточка заявки", "новая срм", "new crm", "crm template".
---

# Mbank CRM kit

When running in Codex, first read [Codex integration](../../references/codex.md).

CRMs and admin panels on the Mbank design system are the most frequent Mdigital projects. This skill gives them one start: a scaffold with the layout, navigation, two reference pages and tests, plus CRM blocks copied into the project like the kit components. It sits on top of `mbank-ui` (tokens, components, `add-ui.mjs`) and all `react-*` rules (architecture, data fetching, UX states, testing, 150-line files). Nothing here overrides them.

Design source: Figma `vVuM5uw3TsWo1xm3vJelXG`, page «CRM / Кредитный конвейер» (35:2): frame 35:29 «Конвейер заявок» and 35:178 «Заявка на кредит / Андеррайтинг». Every block names its Figma node in [references/blocks.md](references/blocks.md).

## When to use

- A new CRM, admin panel, back-office or internal tool for Mbank / MKassa / Mbank Travel / Artwin / Koko.
- A new page in such a project (list, kanban, entity card, dashboard).
- A Figma frame built from `sideMenu` + `topHeader` + cards (CRM UI KIT or the CRM drafts).

Not for client-facing Mbank web (use `mbank-ui` directly), non-Mbank admin panels (`react-ui` + shadcn) or mobile.

## Start a new project

```bash
# PLUGIN = path to plugins/frontend-pack; the directory must not exist or be empty
node $PLUGIN/scripts/new-crm.mjs ../loans-crm --name "Mbank Кредиты"
node $PLUGIN/scripts/new-crm.mjs ../loans-crm --dry-run   # print the plan only
```

The script runs: `create-vite` (react-ts, `--eslint`, no prompts) → `npm install` of the template packages (TanStack Router + Query, zod, react-error-boundary, Tailwind v4, the kit packages, MSW, Vitest + RTL) → `add-ui.mjs all` (kit + every CRM block) → copies [`templates/mbank-crm`](../../templates/mbank-crm) over the scaffold (configs, `src/`) → sets `<title>`, `lang="ru"`, npm scripts → `npx msw init public`. Then check it:

```bash
npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build
npm run dev    # mock API in the browser; ?mock=empty | error | action-error opens the other states
```

react-hook-form, sonner and i18n are not installed: add them with the first form / toast / second language (`react-forms-state`, `react-security-i18n`).

## What the project contains

```
src/app/            router.tsx (routes + staticData.header), navigation.ts (side menu config),
                    AppLayout (CrmLayout), AppSideMenu, AppHeader, AppErrorBoundary, RouteErrorFallback
src/pages/          pipeline (board, KPI, period), application/$applicationId (summary, stages, sections,
                    scoring, history, decision dialog), section (placeholder), not-found — each with UX.md
src/features/applications/  api (zod schemas, queryOptions, mutations), lib (format, messages), ui
src/shared/ui/      kit;  src/shared/components/crm/  blocks;  src/mocks/  MSW handlers + seed = Figma data
src/test/           setup.ts (jest-dom, MSW, window.scrollTo stub), server.ts, render.tsx (renderRoute)
```

Gotchas already handled in the template, keep them when you copy code elsewhere:

- MSW 3 takes `onUnhandledFrame` (`'bypass'` in the browser, `'error'` in tests). `onUnhandledRequest` is silently ignored.
- Vitest setup is `src/test/setup.ts` and stubs `window.scrollTo` (TanStack Router restores scroll; jsdom has none).
- Confirmation dialogs use the kit `alert-dialog` **without** `AlertDialogAction`: the confirm button is a `Button` with `loading`, the dialog stays open while the request runs, closes in `onSuccess`, shows the error inside. Keep the dialog mounted after success (see `ApplicationActions`), or the `mutate` callbacks never run.
- TanStack `Link` marks a parent path current (`/applications` on `/applications/CL-1`); side menu links pass `activeOptions={{ exact: true }}` and the current item comes from `staticData.header.navId`.
- Menu items without a page get a placeholder route (`placeholderItems`), so the menu has no dead links and unknown URLs still show the 404 page.

## Add a page

1. Write `src/pages/<name>/UX.md` first (`react-page-ux`; the hook blocks a page without it).
2. Data in `src/features/<entity>/`: zod schema, `queryOptions`, mutations, MSW handler + seed in `src/mocks` until the API exists (`react-data-fetching`).
3. Compose the page from blocks and kit components only: list of blocks and props in [references/blocks.md](references/blocks.md). Missing piece → build it in the feature from kit primitives and tokens; if it is reusable across CRMs, propose it as a new block in the brain.
4. Route in `src/app/router.tsx` with `staticData: { header: { navId, title } }` (or `crumbs` + `backTo` for a detail page). Remove the item from the placeholders: add its id to `implemented` in `navigation.ts`.
5. Tests next to the page (`renderRoute('/path')`): loading, empty, error + retry, data, every action incl. its failure (`react-testing`).

## Navigation

`src/app/navigation.ts` is the only place for menu structure: sections (`title`, `collapsible`, items with `id`, `label`, `href`, `icon`) and the help section pinned to the bottom. Icons come from `crm-icons.tsx` until Mbank Icons are exported. Roles: filter the sections by permission before passing them to `SideMenu`, and guard the routes (`beforeLoad`) — hiding a link is not access control.

## Figma CRM frame → code

1. Read the frame (`figma-pack:figma-reader` / `get_metadata` + `get_design_context`), list its parts.
2. Map: `sideMenu` → `SideMenu`, `topHeader` → `TopHeader` (+ `Breadcrumbs`, `HeaderSearch`, `HeaderIconButton`, `UserMenu`), `CRM / KPI card` → `KpiCard`, `segment` → `PeriodSegment`, `CRM / Application card` → `ApplicationCard` in `BoardColumn`, `CRM / Key-value row` → `KeyValueRow` in `KeyValueSection`, `Stages` → `StageStepper`, `CRM / Timeline item` → `TimelineItem` in `Timeline`, Summary → `SummaryHeader`, Scoring → `ScoreCard`. Everything else → `mbank-ui` references/components.md.
3. Keep the frame's grid: body padding 24, 16 between cards and rows of cards, card padding 20, side menu 280, header 68.
4. Put the frame's data into the MSW seed, run the app at 1440 and compare screenshots with the frame; then check 375 and 768 (`react-ux`).

## Known gaps

- G03: the Inter Mbank font is not distributed; text renders in Inter / system-ui and is a little wider than in Figma (long breadcrumbs truncate earlier).
- G12 (figma-pack `mbank-design-system` gaps.md): the CRM UI KIT has no KPI card, key-value row, timeline item, kanban card, stage stepper, toolbar above a table, filters panel, pagination, drawer, empty state, skeleton, toast, login page. The blocks reproduce the local components of the CRM drafts; filters, pagination, drawer, login are not blocks yet.
- Icons and the logo are placeholders (`crm-icons.tsx`, the «M» square in `AppSideMenu`) until the Mbank Icons SVGs and the logo are exported.
- «Запросить документы» uses `soft` + `bg-secondary-muted text-link`: the Figma colour pair has no button variant in the kit yet.
- Figma has no states for the CRM blocks (hover, focus, loading, empty, mobile); the blocks add them from `react-ux` rules.

## Checklist

- [ ] Started with `new-crm.mjs` (or blocks added with `add-ui.mjs <block>` into an existing Mbank project)
- [ ] Every page has UX.md, tests for loading / empty / error / data / actions
- [ ] Menu from `navigation.ts`, current item from `staticData.header.navId`, no dead links
- [ ] Only blocks, kit components and tokens; no hex, palette classes, Lucide
- [ ] Screens compared with the Figma frame at 1440, checked at 375 and 768
- [ ] `tsc`, `npm run lint`, `npm test`, `npm run build` pass
