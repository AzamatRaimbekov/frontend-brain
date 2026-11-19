---
name: mbank-ui
description: Coded Mbank UI kit for React 19 + Tailwind CSS v4 + Radix (shadcn-style) - standard shadcn/ui tokens only (light/dark, radius, fonts; no custom tokens) and ready components (Button, Input, Textarea, Label, Badge, Card, Checkbox, Switch, Tabs, Dialog, Select, Skeleton, Table, Alert, Avatar, Tooltip, DropdownMenu, Pagination, DataTable, Popover, Calendar, DatePicker, Progress, Accordion, Sheet, Toaster, Chart, EmptyState) installed with add-ui.mjs. Use for any Mbank web product (client cabinet, CRM, admin, landing) and for any Figma-to-React build from the Mbank design system, instead of hand-written components. Triggers - "mbank", "мбанк", "дизайн-система", "дизайн система mbank", "компоненты mbank", "ui kit", "юай кит", "токены дизайн-системы", "сверстай по макету mbank", "из фигмы в код mbank", "mkassa", "design system components", "mbank components", "design system tokens", "figma to react mbank".
---

# Mbank UI kit (coded)

When running in Codex, first read [Codex integration](../../references/codex.md).

This skill is the code side of the Mbank design system. The figma-pack skills `mbank-design-system` and `mbank-figma-patterns` own the Figma side (catalog, token values, gaps); this kit turns them into components a React project copies in and owns, the same way shadcn/ui works.

All `react-*` rules still apply (architecture, 150-line files, `cn()`, cva, tokens only, React 19 refs, accessibility). This skill only changes **which** components you start from; the tokens are the standard shadcn set, the same as in `react-ui`. Where it differs from `react-ui`, it says so below.

## When to use

- Any web product for Mbank, MKassa, Mbank Travel, Artwin or Koko: client web apps, CRM / back-office, admin panels, promo pages.
- Building a screen from an Mbank Figma file (`get_design_context` / figma-pack `figma-to-react`): map every Figma component to the kit component in [references/components.md](references/components.md) before writing JSX.
- Moving an existing Mbank project from hand-written components or old custom tokens (`surface-*`, `brand`, `status-*`) to the kit.

Not for React Native or Flutter (figma-pack `figma-to-react-native`, `figma-to-flutter`) or for non-Mbank Mdigital projects (plain `react-ui`).

## Install into a project

Two ways, pick one per project:

- **Package (default for new projects).** The kit and the CRM widgets are one private repository, [`AzamatRaimbekov/mbank-ui`](https://github.com/AzamatRaimbekov/mbank-ui), package `@mdigital/mbank-ui`. Updating = changing the tag. Use it unless the project must change kit sources.

  ```bash
  npm i github:AzamatRaimbekov/mbank-ui#v0.2.2 tw-animate-css   # needs git access to the repo
  ```

  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @import "@mdigital/mbank-ui/styles.css";   /* tokens + @source: Tailwind finds the kit's classes */
  ```

  Imports: primitives, `EmptyState` and `cn` from `@mdigital/mbank-ui`, CRM widgets from `@mdigital/mbank-ui/crm`. Works in Vite and Next.js App Router (interactive files carry `"use client"`). A missing component or a fix goes to the `mbank-ui` repository as a PR with a new tag, never as a local copy that shadows the package.
- **shadcn CLI (own the code, standard tooling).** The kit is also an official shadcn registry: [`registry/mbank/r`](../../registry/mbank/r/registry.json), built by `scripts/registry-build.mjs` (`--check` in `npm test`). Item `mbank` is the whole design system (`registry:base`: the standard shadcn tokens as cssVars, radius scale, fonts); every component is its own item with dependencies. Files land in the project's `components.json` aliases (`@/components/ui`, `@/lib/utils`).

  ```json
  // components.json — the repository is private, so the URL needs a GitHub token (env, never committed)
  "registries": {
    "@mbank": {
      "url": "https://raw.githubusercontent.com/AzamatRaimbekov/frontend-brain/main/plugins/frontend-pack/registry/mbank/r/{name}.json",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
  ```

  ```bash
  npx shadcn@latest add @mbank/mbank                        # design system: tokens + utils
  npx shadcn@latest add @mbank/button @mbank/data-table @mbank/crm-kpi-card
  ```

  Verified 2026-10-31 with shadcn 4.23 on a clean Vite + Tailwind v4 project served from a local URL: install, `tsc -b` and `vite build` pass. The raw GitHub URL works only after `r/` is on `main`.
- **Copy (`add-ui.mjs`).** For a project that already has the kit in `src/shared/ui` or must change component sources. The rest of this section is about this way.

The copy source is [`registry/mbank`](../../registry/mbank/registry.json); [`scripts/add-ui.mjs`](../../scripts/add-ui.mjs) copies it. The `mbank-ui` repository and the registry hold the same code: a change to one goes to the other in the same week (`brain-update` checks it).

```bash
# from the project root; PLUGIN = path to plugins/frontend-pack
node $PLUGIN/scripts/add-ui.mjs --list                  # what is available
node $PLUGIN/scripts/add-ui.mjs button input dialog     # + their dependencies (utils, tokens, icons ...)
node $PLUGIN/scripts/add-ui.mjs all --dry-run           # show the plan, write nothing
node $PLUGIN/scripts/add-ui.mjs all --force             # replace existing files (review the diff!)
```

Options: `--dir src/shared/ui` (primitives), `--components-dir src/shared/components` (EmptyState), `--lib-dir src/shared/lib` (`utils.ts`), `--tokens src/styles/mbank-tokens.css`, `--cwd <project>`.

The script never overwrites an existing file without `--force`, then prints:

1. `npm install ...` for packages missing from `package.json` (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`; `data-table` adds `@tanstack/react-table` 8, `calendar` / `date-picker` add `react-day-picker` 9, `chart` adds `recharts` 3, `sonner` adds `sonner`).
2. The CSS lines for the global stylesheet:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./styles/mbank-tokens.css";
```

If the project was created with `npx shadcn init` (`react-new-project`), clean the global CSS **before** the first build: delete the shadcn-generated `:root { ... }`, `.dark { ... }`, `@theme inline { ... }`, `@custom-variant dark ...` and `@layer base { ... }` blocks, leaving only the three imports above. They hold the same token names, so a second copy after the imports silently wins over the kit's values. `add-ui.mjs` warns when it sees `--primary:`, `oklch(` or `@theme inline` in the CSS entry.

After installing:

- `@/` must resolve to `src/` in `tsconfig` paths and the bundler alias (all files import `@/shared/lib/utils`).
- Keep the kit's `utils.ts` (`cn`); the kit has no custom text-size tokens, so plain Tailwind sizes (`text-xs`..`text-4xl`) merge correctly.
- Replacing an existing `button`/`badge` changes the API: Button `variant` is `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link`; Badge `tone` is `neutral`, `accent`, `error`, `clear` (`fill` removed); Alert `tone` is `clear`, `error`; Progress has no `tone`. Old `brand`, `success`, `soft`, `static`, `warning`, `info` usages map to these. Run `tsc` and fix the callers.
- Vite projects lint with `react-refresh/only-export-components`, which errors on kit files that export `cva` variants (`buttonVariants`, `badgeVariants`). Turn it off for `src/shared/ui/**` only, see `react-architecture` references/eslint-config.md.
- Radix `Select` has no empty value: use a sentinel such as `"all"` for «Все» and map it to `undefined` in the filter.
- Put `.dark` on `<html>` (`@custom-variant dark (&:is(.dark *))`), not on a wrapper div: dialogs, menus and tooltips render in a portal under `<body>` and only inherit tokens from `<html>`. There are no product brand modes (`data-brand`).

## Token rules

The kit uses **only the standard shadcn/ui tokens** with the shadcn neutral values. Canonical list: [`shadcn-tokens.json`](../../registry/mbank/shadcn-tokens.json) (31 colours: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent` with their `-foreground`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar-*`; `--radius` + `rounded-sm..4xl`; fonts `sans` / `heading`).

- **No custom tokens.** The Mbank token layer is removed (2026-11-11): no `surface-*`, `brand*` / `data-brand`, `*-hover` / `*-active`, `success` / `warning` / `info` / `status-*`, `*-text`, `soft`, `static`, `disabled-foreground`, `border-secondary`, `input-hover`, Mbank type sizes (`text-caption` …), `z-*` / `shadow-*` tokens. A project may only change the **values** of the shadcn names.
- Hover = opacity: `hover:bg-primary/90`, `hover:bg-secondary/80`, `hover:bg-destructive/90`, ghost/outline `hover:bg-accent hover:text-accent-foreground`. Disabled = `disabled:pointer-events-none disabled:opacity-50`.
- Surfaces: `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-secondary`, `bg-popover`. Borders: `border-border`, `border-input`. Focus: `ring-ring/50`.
- Errors: `destructive` (`text-destructive`, fields `aria-invalid:border-destructive aria-invalid:ring-destructive/20`). Other statuses: neutral Badge (`tone` neutral / accent / clear = secondary / primary / outline look) + text. Plain Tailwind palette colours (`green-500`, `slate-*`) are not allowed; `chart-1..5` only when a distinct colour is truly needed (charts).
- No hex, no `dark:` colour overrides. Radius, type, spacing, shadows, z-index: Tailwind defaults as shadcn components use them.

## Updating token values

[`tokens.css`](../../registry/mbank/tokens.css) is generated by [`scripts/tokens-build.mjs`](../../scripts/tokens-build.mjs) from `shadcn-tokens.json` only; never edit it by hand. The owner of `shadcn-tokens.json` is figma-pack `skills/ds-tokens/references/shadcn-tokens.json`; design-engine `sync-contracts.mjs` copies it here. To change a value: change the owner (or the project preset), sync, run `tokens-build.mjs`, `npm test`, PR. Copy the new `tokens.css` to the mbank-ui package (`src/styles/tokens.css`) in the same release. Adding a token name is not a valid change.

## Components from contracts

Each kit primitive has a component contract (`mbank/component@1`): one JSON per component in [`registry/mbank/contracts/`](../../registry/mbank/contracts/) that says which token sits on which property (bg, fg, border, radius, height, px, text, weight, focus-ring …) in every variant, size and state. The owner is figma-pack (`builder/contracts`, format in figma-pack `builder/docs/component-contract.md`); the DS Builder plugin renders the same contracts into Figma component sets with bound variables, so Figma and code cannot drift. This folder is a copy that only design-engine `sync-contracts.mjs` updates.

The look of a contracted component lives between `// @contract <name> start` / `// @contract <name> end` markers (the cva call, the class strings in `cn(...)`, `<name>.<part>` part blocks, `<name>.<prop>` const maps). Never hand-edit classes inside the markers:

- `node plugins/frontend-pack/scripts/contract-to-code.mjs --check` compares the generated class sets with the kit per variant/size, order-insensitive; exit 1 on drift (part of `npm test`).
- Rebind a token (e.g. button secondary `bg` → `muted`, shadcn names only): change the owner contract, run design-engine `sync-contracts.mjs`, then `contract-to-code.mjs --write button`. Only the marked blocks are rewritten, the class order is kept.
- New component: add a contract (template `button-like`, `input-like`, `badge-like` or `card-like` in `code.template`), sync, then `contract-to-code.mjs --new <name>` scaffolds `components/<name>.tsx` (cva + minimal accessible React 19 component) and the `registry.json` item; run `registry-build.mjs`.
- Classes that Figma cannot show (behaviour, svg selectors, `inline-flex`, transitions) stay in `code.extra` / `code.extras` and are generated as is. Validation of contracts (tokens are shadcn names that exist in `tokens.css`, props ⇔ variants, Figma key): design-engine `contracts-check.mjs`; first extraction from the kit: design-engine `contracts-extract.mjs`.

## Icons

Mbank UI does not use Lucide (figma-pack code-mapping section 6 overrides the `react-ui` Lucide rule for Mbank projects). Export the needed icons from the Mbank Icons library as SVG components into `src/shared/ui/icons/`. The kit's `icons.tsx` (check, minus, chevrons, close, sort arrows, search, calendar, columns) holds temporary placeholder glyphs until those exports exist.

## Building a screen from Figma

1. Read the frame (`get_design_context`), list the Mbank components it uses.
2. Map each one with [references/components.md](references/components.md); install the missing ones with `add-ui.mjs`.
3. Compose the screen from kit components + tokens only (`react-architecture`, `react-page-ux` UX brief, `react-ux` states).
4. Anything without a kit component: build it in `src/shared/components/` from kit primitives and tokens, not from raw Tailwind colours.
5. Check light and dark, at 375 / 768 / 1280 px.

CRM / admin screens: a list is `DataTable` (search, sorting, column menu, selection, Skeleton rows, `empty={<EmptyState />}`, built-in `Pagination`; server data through `tableOptions`), a period filter is `DateRangePicker`, record details or filters open in a `Sheet`, results of mutations go to `toast()` with one `<Toaster />` in the app root, dashboards use `ChartContainer` + recharts.

## Known gaps (from figma-pack `gaps.md`)

- G03: `--font-sans` is Geist (shadcn default). The Inter Mbank font is not distributed yet; when it arrives it is a value change of `--font-sans`, not a new token.
- G10: Figma has no focus states. The kit uses the shadcn 3px `ring-ring/50` on `focus-visible`.
- Not yet read from Figma: button heights (the kit follows the input heights 36 / 44 / 56). Marked TODO in the files.

## Checklist

- [ ] Kit from the `@mdigital/mbank-ui` package, or components installed with `add-ui.mjs`, not hand-copied or regenerated by `npx shadcn add` over them
- [ ] Global CSS imports `tw-animate-css` and `mbank-tokens.css`, no leftover shadcn `:root` / `.dark` / `@theme inline` blocks; `.dark` on `<html>`
- [ ] Only shadcn tokens: no custom tokens, hex, palette classes or `dark:` colour overrides in feature code
- [ ] Every Figma component mapped through `references/components.md`
- [ ] Mbank icons (SVG components), no Lucide
- [ ] `tsc` and the build pass after replacing existing primitives
