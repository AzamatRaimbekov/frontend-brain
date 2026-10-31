---
name: mbank-ui
description: Coded Mbank UI kit for React 19 + Tailwind CSS v4 + Radix (shadcn-style) - verified Figma tokens (light/dark, brand modes bank/kassa/travel/artwin/koko, radius, type, shadows, z-index) and ready components (Button, Input, Textarea, Label, Badge, Card, Checkbox, Switch, Tabs, Dialog, Select, Skeleton, Table, Alert, Avatar, Tooltip, DropdownMenu, EmptyState) installed with add-ui.mjs. Use for any Mbank web product (client cabinet, CRM, admin, landing) and for any Figma-to-React build from the Mbank design system, instead of default shadcn styling. Triggers - "mbank", "мбанк", "дизайн-система", "дизайн система mbank", "компоненты mbank", "ui kit", "юай кит", "токены mbank", "сверстай по макету mbank", "из фигмы в код mbank", "mkassa", "design system components", "mbank components", "mbank tokens", "figma to react mbank".
---

# Mbank UI kit (coded)

When running in Codex, first read [Codex integration](../../references/codex.md).

This skill is the code side of the Mbank design system. The figma-pack skills `mbank-design-system` and `mbank-figma-patterns` own the Figma side (catalog, token values, gaps); this kit turns those values into components a React project copies in and owns, the same way shadcn/ui works.

All `react-*` rules still apply (architecture, 150-line files, `cn()`, cva, tokens only, React 19 refs, accessibility). This skill only changes **which** tokens and components you start from. Where it differs from `react-ui`, it says so below.

## When to use

- Any web product for Mbank, MKassa, Mbank Travel, Artwin or Koko: client web apps, CRM / back-office, admin panels, promo pages.
- Building a screen from an Mbank Figma file (`get_design_context` / figma-pack `figma-to-react`): map every Figma component to the kit component in [references/components.md](references/components.md) before writing JSX.
- Restyling an existing Mbank project away from default shadcn colours (`slate-*`, `oklch` neutrals).

Not for React Native or Flutter (figma-pack `figma-to-react-native`, `figma-to-flutter`) or for non-Mbank Mdigital projects (plain `react-ui`).

## Install into a project

The kit lives in [`registry/mbank`](../../registry/mbank/registry.json); [`scripts/add-ui.mjs`](../../scripts/add-ui.mjs) copies it.

```bash
# from the project root; PLUGIN = path to plugins/frontend-pack
node $PLUGIN/scripts/add-ui.mjs --list                  # what is available
node $PLUGIN/scripts/add-ui.mjs button input dialog     # + their dependencies (utils, tokens, icons ...)
node $PLUGIN/scripts/add-ui.mjs all --dry-run           # show the plan, write nothing
node $PLUGIN/scripts/add-ui.mjs all --force             # replace existing files (review the diff!)
```

Options: `--dir src/shared/ui` (primitives), `--components-dir src/shared/components` (EmptyState), `--lib-dir src/shared/lib` (`utils.ts`), `--tokens src/styles/mbank-tokens.css`, `--cwd <project>`.

The script never overwrites an existing file without `--force`, then prints:

1. `npm install ...` for packages missing from `package.json` (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`).
2. The CSS lines for the global stylesheet:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./styles/mbank-tokens.css";
```

If the project was created with `npx shadcn init` (`react-new-project`), clean the global CSS **before** the first build: delete the shadcn-generated `:root { ... }`, `.dark { ... }`, `@theme inline { ... }`, `@custom-variant dark ...` and `@layer base { ... }` blocks, leaving only the three imports above. Those blocks come after the imports and silently override the kit (default `oklch` neutrals for `--primary`, `rounded-md` = `calc(var(--radius) - 2px)`). `add-ui.mjs` warns when it sees `--primary:`, `oklch(` or `@theme inline` in the CSS entry.

After installing:

- `@/` must resolve to `src/` in `tsconfig` paths and the bundler alias (all files import `@/shared/lib/utils`).
- Keep the kit's `utils.ts`: it extends tailwind-merge with `text-2xs`, `text-caption`, `text-md`. With plain `twMerge` those classes get dropped next to `text-<colour>`.
- Replacing an existing `button`/`badge` changes the API (e.g. Badge `tone` uses the Figma status roles `neutral | accent | success | warning | error | info | clear`, so `danger` becomes `error`). Run `tsc` and fix the callers.
- Vite projects lint with `react-refresh/only-export-components`, which errors on kit files that export `cva` variants (`buttonVariants`, `badgeVariants`). Turn it off for `src/shared/ui/**` only, see `react-architecture` references/eslint-config.md.
- Radix `Select` has no empty value: use a sentinel such as `"all"` for «Все» and map it to `undefined` in the filter.
- Put `.dark` and `data-brand` on `<html>`, not on a wrapper div: dialogs, menus and tooltips render in a portal under `<body>` and only inherit tokens from `<html>`.

## Token rules

- Colours only via the kit tokens: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-input`, `bg-primary` (yellow), `bg-secondary` (near-black), `bg-brand` (product colour), `bg-status-error-muted text-status-error-foreground`, `bg-surface-1..6`, etc. Full list: `@theme inline` in [`tokens.css`](../../registry/mbank/tokens.css). No hex, no `slate-*`, no `dark:` colour overrides.
- `primary` is the yellow accent button (`accent/primary`), **not** the green brand. Product colour = `brand`, switched by `<html data-brand="kassa">`, never recoloured in a component.
- Radius: `rounded-sm` 8, `rounded-md` 12 (controls), `rounded-lg` 16 (cards, dialogs), `rounded-full` pills. Mbank values replace the shadcn `--radius` math.
- Type: `text-xs` 13/16, `text-sm` 14/20, `text-md` 15/22, `text-base` 16/24, `text-lg` 18/26, headings `text-xl`..`text-4xl` (h5..h1), controls `font-medium`, headings `font-bold`.
- Spacing: default Tailwind 4px scale (Mbank web spacing is on the 4px grid).
- Shadows: `shadow-xs..xl`, `shadow-dropdown`, `shadow-modal`, `shadow-tooltip`. Layers: `z-(--z-sticky|--z-overlay|--z-modal|--z-tooltip ...)`. Anything that floats out of a portal (Select, DropdownMenu, Popover, Combobox content) uses `z-(--z-popover)` (1700, above `--z-modal` 1500) so it stays visible inside a Dialog; `--z-dropdown` (1000) is only for non-portal in-flow menus.
- Hex values (not oklch) are kept on purpose so every value traces back to Figma `tokens.md`. This is the one deviation from `react-ui/references/tokens-and-theming.md`.
- Need a token that is not there? Check figma-pack `mbank-figma-patterns/references/tokens.md`, then add the Figma variable to [`tokens.map.json`](../../registry/mbank/tokens.map.json), run `tokens-build.mjs` and send a PR. Never invent a value, never edit `tokens.css` by hand (it is generated).

## Updating tokens from Figma

`tokens.css` is generated: Figma variables ([`tokens.json`](../../../figma-pack/skills/mbank-figma-patterns/references/tokens.json)) + the mapping CSS var → Figma variable ([`tokens.map.json`](../../registry/mbank/tokens.map.json)) → [`scripts/tokens-build.mjs`](../../scripts/tokens-build.mjs). When a designer changes a colour, radius, text or effect style in the Mbank libraries:

1. Agent with a **Full** seat (figma-pack `figma-core`) runs [`read-tokens.js`](../../../figma-pack/skills/mbank-figma-patterns/references/read-tokens.js) through `use_figma` in each library file (Foundation `KIT='foundation'`, Web components `KIT='web'`, Mobile KIT `KIT='mobile'`) and saves each result as `raw-<kit>.json` outside the repo. It only reads.
2. `node plugins/frontend-pack/scripts/tokens-build.mjs --check --from raw-foundation.json --from raw-web.json --from raw-mobile.json` shows what changed in Figma (`~ theme text/link [light]: #3b82f6 -> #2563eb`) and which CSS vars it moves. Writes nothing.
3. Same command without `--check` rewrites `tokens.json` and `tokens.css`. Sections the dumps do not contain are kept.
4. New Figma variables are listed as `info: ... not used by tokens.map.json`. Map the ones the web needs (light `:root`, dark `.dark` and the `--color-*` utility come from one entry), or add a prefix to `ignore`. A value that is wrong in Figma gets an override with its gap id (`"dark": { "value": ..., "gap": "G04", "note": ... }`) and a line in figma-pack `gaps.md`, never a silent edit.
5. `tokens-build.mjs --check` passes, `npm test` passes, PR with the Figma change list from step 2. Copy the new `tokens.css` to the mbank-ui package (`src/styles/tokens.css`) in the same release.

`--check` exits 1 with `selector  css var  <- Figma variable  expected / actual` when `tokens.css` is out of date; `--strict` also fails on unmapped Figma variables; `--json` gives the same report to agents.

## Icons

Mbank UI does not use Lucide (figma-pack code-mapping section 6 overrides the `react-ui` Lucide rule for Mbank projects). Export the needed icons from the Mbank Icons library as SVG components into `src/shared/ui/icons/`. The kit's `icons.tsx` (check, minus, chevron-down, close) holds temporary placeholder glyphs until those exports exist.

## Building a screen from Figma

1. Read the frame (`get_design_context`), list the Mbank components it uses.
2. Map each one with [references/components.md](references/components.md); install the missing ones with `add-ui.mjs`.
3. Compose the screen from kit components + tokens only (`react-architecture`, `react-page-ux` UX brief, `react-ux` states).
4. Anything without a kit component: build it in `src/shared/components/` from kit primitives and tokens, not from raw Tailwind colours.
5. Check light/dark and the product's `data-brand`, at 375 / 768 / 1280 px.

## Known gaps (from figma-pack `gaps.md`)

- G03: the Inter Mbank font files are not distributed yet. The stack falls back to Inter / system-ui. Self-host the woff2 files when they arrive.
- G04: some dark values in Figma are unreadable (secondary/outline text, travel/artwin dark ghosts). `tokens.css` marks every substitution with `TODO(G04)`.
- G06: shadow colour/opacity was not read. Geometry is real, the colour is a marked placeholder.
- G10: Figma has no focus states. The kit uses a 3px brand ring on `focus-visible`.
- Not yet read from Figma: button heights (the kit follows the input heights 36 / 44 / 56), checkbox/switch selected fill (the kit uses `brand`). Both are marked TODO in the files.

## Checklist

- [ ] Components installed with `add-ui.mjs`, not hand-copied or regenerated by `npx shadcn add` over them
- [ ] Global CSS imports `tw-animate-css` and `mbank-tokens.css`, no leftover shadcn `:root` / `.dark` / `@theme inline` blocks; `.dark` / `data-brand` on `<html>`
- [ ] No hex / palette classes / `dark:` colour overrides in feature code
- [ ] Every Figma component mapped through `references/components.md`
- [ ] Mbank icons (SVG components), no Lucide
- [ ] `tsc` and the build pass after replacing existing primitives
