# Tokens and theming (Tailwind v4 + shadcn)

## How it fits together

1. Raw values live as CSS variables on `:root` (light) and `.dark` (dark).
2. `@theme inline` maps them to Tailwind theme variables (`--color-*`, `--radius-*`, `--font-*`), which generates utilities (`bg-primary`, `rounded-lg`, `font-sans`).
3. Components use only the utilities. Switching theme = swapping variable values; no component changes.

## globals.css skeleton

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  /* + secondary, accent, popover, chart-1..5, sidebar-* from shadcn init */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* every token from :root redefined */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ...one line per token */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4); /* ... up to 4xl */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

Use what `shadcn init` generates; the snippet shows structure, not exact values.

## The token set is fixed

The design system uses **only the standard shadcn/ui tokens**: names are the standard shadcn/ui tokens, **values are Mbank** (2.theme / Foundation from Figma, mapped onto shadcn names on 2026-11-19: yellow `primary`, near-black `secondary`, radius 12px, Inter Mbank). Canonical list: [`registry/mbank/shadcn-tokens.json`](../../../registry/mbank/shadcn-tokens.json) - 31 colours (`background`, `foreground`, `card(-foreground)`, `popover(-foreground)`, `primary(-foreground)`, `secondary(-foreground)`, `muted(-foreground)`, `accent(-foreground)`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar`, `sidebar-foreground`, `sidebar-primary(-foreground)`, `sidebar-accent(-foreground)`, `sidebar-border`, `sidebar-ring`), `--radius` with `radius-sm..4xl`, fonts `sans` / `heading`.

- **No custom tokens.** No `--success`, `--warning`, `--info`, `--brand`, `--surface-*`, `*-hover`, `*-text`, `--z-*`, `--shadow-*`, custom `--text-*`. A project may only change the **values** of the names above (light and `.dark`).
- Pairs: `<name>` is the surface, `<name>-foreground` is text/icons on it: `bg-primary text-primary-foreground`.
- Values in `oklch()`.

## Mapping meanings to the fixed set

| Need | Use |
|---|---|
| Hover / pressed | opacity of the same token: `hover:bg-primary/90`, `hover:bg-secondary/80`, `hover:bg-destructive/90`, ghost/outline `hover:bg-accent hover:text-accent-foreground` |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` (no disabled colours) |
| Surfaces / layers | `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-secondary`, `bg-popover` |
| Borders | `border-border`, `border-input` |
| Error | `destructive`: `text-destructive`, `bg-destructive/10`, fields `aria-invalid:border-destructive aria-invalid:ring-destructive/20` |
| Success / warning / info status | neutral Badge `default` / `secondary` / `outline` + text and icon; never colour alone |
| Charts, a truly distinct colour | `chart-1..5` |

Plain Tailwind palette colours (`green-500`, `amber-100`, `slate-*`) are not allowed, including for statuses.

## Rules

- Tokens are defined only in the global CSS file (generated from `shadcn-tokens.json`). No colors in `.tsx`, no per-feature CSS files with colors.
- Do not use `@theme` (non-inline) for values that reference other variables - use `@theme inline`, otherwise the variable resolves in the wrong scope.
- Theme from design (Figma variables): the designer's variables bind to these shadcn names; a different look = different values, never a parallel set.

## Spacing, type, radius

- Spacing derives from `--spacing` (default `0.25rem`): `p-4` = 1rem. Do not override `--spacing` per project without a design reason - it rescales everything.
- Type scale: Tailwind defaults (`text-xs` .. `text-6xl`). No custom `--text-*` tokens and no inline `text-[15px]`.
- Fonts: load with `next/font` (Next.js) or `@fontsource-variable/*` (Vite), expose as a CSS variable, map to `--font-sans` in `@theme inline`.

## Dark mode

- Class strategy: `.dark` on `<html>`; `@custom-variant dark (&:is(.dark *));` makes `dark:` follow the class instead of the OS media query.
- Next.js: `next-themes` `ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`, plus `suppressHydrationWarning` on `<html>`.
- Vite: shadcn's `ThemeProvider` (context + localStorage + `matchMedia`) in `src/app/providers`. Add the inline head script that sets the class before paint to avoid a flash.
- Offer three options: light, dark, system.
- Components should not contain `dark:bg-*` / `dark:text-*`. If a component needs a different color in dark, fix the token value (or pick another shadcn token), never add a token.
- Images/illustrations that break in dark: provide a dark variant or use `currentColor` SVGs.
