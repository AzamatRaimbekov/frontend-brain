---
name: ds-tokens
description: Creates and changes design tokens for a project on the shadcn/ui kit the Mdigital way - one Brand mode per project between the kit's Style and Mode collections, colors generated from a brand color in OKLCH and snapped to Tailwind primitives, WCAG AA contrast checked in light and dark, project-only tokens named custom/<project>/<role>, and the same tokens exported to globals.css for shadcn/Tailwind v4. Works through the DS Builder Figma plugin and the `ds` CLI. Triggers - "токены для проекта", "новый бренд", "цвета проекта", "добавь токен", "настрой тему", "дизайн-система под проект", "globals.css из фигмы", "brand tokens", "add a token", "theme for project", "shadcn theme".
---

# Project tokens on the shadcn kit (Mdigital)

Architecture and the reasoning behind it: [builder/docs/architecture.md](../../builder/docs/architecture.md). Short version:

```
Tailwind (primitives) → Style (Vega…Lyra, kit-owned) → Brand (one mode per project) → Mode (Light/Dark, components bind here)
```

Code: [figma-pack/builder](../../builder/README.md) (`BUILDER` below = path to `plugins/figma-pack/builder`). Plugin: `$BUILDER/plugin/manifest.json` → Figma desktop → Plugins → Development → Import plugin from manifest.

## Rules

1. **Never edit Style or Tailwind.** They belong to the kit; an update overwrites them. A project changes only its `Brand` mode.
2. **Never alias Mode straight to Tailwind.** Every Mode token goes `Mode → Brand → (Style | Tailwind | hex)`. The plugin's «Включить слой Brand» migrates legacy tokens once and can roll back.
3. **A brand overrides only what differs.** Default overrides: primary (+foreground), ring, sidebar-primary (+foreground), sidebar-ring, chart-1..5, success / warning / info (+foreground). Neutrals (background, card, border…) stay inherited from the style unless the project really needs its own grey.
4. **Prefer Tailwind steps over hex.** Generated colors within ΔE 2.5 of a Tailwind primitive become an alias (`primary → amber/400`). Raw hex only for a real brand color with no close step.
5. **Contrast AA (4.5) in both themes** for every text/fill pair. `ds tokens check` fails otherwise; fix the token, do not lower the bar.
6. **Project-only tokens:** `custom/<project>/<role>`, latin kebab-case, no spaces, no repeated project name (`custom/mmarket/badge-bg-orange`, CSS `--mmarket-badge-bg-orange`). Create a custom token only when no shadcn or status token fits; say which one you checked.
7. **Statuses are shared, not per project:** `success`, `warning`, `info` and their `-foreground` exist for every brand.
8. **Fonts:** `Brand/font/sans` and `font/heading` per brand. If the brand font is not installed (Inter Mbank is not shared in the org), the plugin falls back to Inter and reports it — tell the user, never silently.

## New project brand

1. Ask (or take from the brief): brand color (hex), neutral palette (neutral / zinc / slate / stone / gray / tinted), font, light + dark needed.
2. Generate and check:
   ```bash
   node $BUILDER/cli/ds.mjs tokens new --name <project> --brand "#fabf00" --neutral zinc --font "Inter Mbank" -o tokens/<project>.json
   node $BUILDER/cli/ds.mjs tokens check tokens/<project>.json
   ```
3. In Figma: plugin → «Бренд» → add brand `<Project>` → «Токены» → same color → «Сгенерировать» → review the contrast line → «Применить к бренду».
4. Code: plugin «Получить globals.css» (or `ds tokens css tokens/<project>.json -o src/app/globals.css`). Same source for Figma and code.

## Add a project token

Plugin «Токены» → «Новый проектный токен»: project, role, light value, dark value (`orange/200` or `#hex`). Scopes are set from the role (`*-foreground`/`*-text` → text, `*-border`/`*-ring` → stroke, else fill).

## Bind tokens to components

Components are generated from contracts, not drawn: plugin tab «Компоненты» renders `builder/contracts/<name>.json` into a component set with every fill, stroke, radius, padding, gap and height bound to a variable, and «Привязки» rebinds a token in Figma and in the contract at once. How bindings work and what to do with tokens the plugin had to create: [references/component-bindings.md](references/component-bindings.md).

## Report

```
Бренд: <name> (стиль <Style>)
Переопределено: <n> токенов, из них к Tailwind привязано <m>
Контраст: AA ок | проблемы: <пары>
Проектные токены: <список>
Шрифт: <font> | запасной Inter (шрифт не установлен)
```
