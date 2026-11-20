---
name: ds-tokens
description: The design tokens of the Mdigital design system - the standard shadcn/ui set plus six shadcn-style status tokens (37 colours light/dark in OKLCH, radius and its scale, fonts), one file shared by Figma and code. A project changes token values (its preset on the ds-configurator site), never names; no custom, brand, surface, spacing or typography tokens exist, and success / warning / info (+ -foreground) are the only status names. Use when choosing a colour, radius or font for a screen or component, when a project needs its own colours, when a Figma colour has no token, or when token values must reach Figma variables and tokens.css. Triggers - "токены", "токены для проекта", "цвета проекта", "новый бренд", "добавь токен", "настрой тему", "тёмная тема", "globals.css", "tokens.css", "shadcn theme", "brand colours", "add a token", "theme for project".
---

# Design tokens = standard shadcn/ui

Source of truth: [references/shadcn-tokens.json](references/shadcn-tokens.json) (schema `shadcn/tokens@1`). Decision of 2026-11-11: the design system has **only** these names, there is no Mbank token layer. Decision of 2026-11-19: the **values** are Mbank (2.theme / Foundation, from the old `registry/mbank/tokens.css`), stored as oklch that round-trips to the exact Figma hex; `muted-foreground` light is `#5d6c79` (Mbank status-neutral) because `#768793` fails 4.5:1. Decision of 2026-11-20: six shadcn-style status tokens `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` (right after `destructive`, values from Mbank Figma) join the set — 37 colours; `sidebar-primary` is green `#16a34a`.

| Group | Names |
|---|---|
| Colours (light + dark, `oklch(...)`) | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring` |
| Radius | `radius` (base) and the scale `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl` derived from it |
| Fonts | `font-sans`, `font-heading` |

Spacing and type sizes are not tokens: use the Tailwind scale (`--spacing` = 4 px steps, `text-sm`, `font-medium`).

## Rules

1. **Names never change and never grow.** The 37 names above are the whole set: the six status tokens (`success` / `warning` / `info` and their `-foreground`) are the only names beyond standard shadcn. No `custom/*`, no product brands, no `surface-*`, no `*-muted` / `status-*` variants, no `*-hover` / `*-active`, no spacing or typography tokens. A need that no name covers is a question to the designer, answered with the closest standard name.
2. **A project changes values only.** Its preset (on the ds-configurator site, `apps/ds-configurator`) overrides values of the standard names, for example `primary` to the brand colour. Everything it does not override stays at the shadcn default.
3. **Colours in OKLCH**, light and dark both set. A value without a dark pair is incomplete.
4. **Contrast AA (4.5) in both themes** for every `X` / `X-foreground` pair and for `foreground` on `background`, `card`, `popover`, `muted`. Fix the value, do not lower the bar. The single documented exception: `sidebar-primary-foreground` (white) on `sidebar-primary` (green `#16a34a`) is 3.3:1 — used for the logo mark only, never for text.
5. **Hover / active / disabled come from code,** not from tokens: `hover:bg-primary/90`, `disabled:opacity-50`, `focus-visible:ring-ring/50` (shadcn defaults).
6. **Figma variables have the token's own name** (`primary`, `muted-foreground`, light/dark modes). Never bind a Figma layer to another library's variables or to a raw hex.
7. **Code uses the Tailwind classes** (`bg-primary`, `text-muted-foreground`, `border-border`, `rounded-lg`), never hex or arbitrary colour values.

## Change values for a project

1. Take the brand colour and the neutral palette from the brief.
2. Set the values on the ds-configurator site (project preset) or, for the system default, in `references/shadcn-tokens.json`. Check rule 4 for every pair you touched.
3. Code: `node plugins/design-engine/scripts/sync-contracts.mjs` copies the file to frontend-pack and rebuilds `tokens.css`; a project takes the new `tokens.css` (design-engine MCP `ds_sync_project`).
4. Figma: write the values into the variables of the same names through the Figma widget shadcn Tokens (`plugins/figma-pack/widget`), dry run first.

## Bind tokens to components

Components are generated from contracts, not drawn: [references/component-bindings.md](references/component-bindings.md).

## Report

```
Проект: <name>
Изменены значения: <токены> (имена стандартные, новых нет)
Контраст: AA ок | проблемы: <пары>
Шрифт: <font-sans>
```
