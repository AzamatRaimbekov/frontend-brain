# Mbank: Figma token -> code

How Mbank Figma variables, styles, icons and fonts become code on web (React + Tailwind v4 + shadcn/ui), React Native (Unistyles) and Flutter. Lookup order and general rules stay as in `figma-core/references/token-mapping.md`; this file fixes the Mbank names. Values come from `catalog.json`; `?` means not read yet (gap G01). A `?` token is still declared in code (so components can use the name), with a `TODO(G01)` comment and no guessed value; fill it after the next catalog update.

Naming: the catalog `token` is kebab-case (`muted-foreground`). Web uses it as is (`--muted-foreground`, `text-muted-foreground`), React Native camelCases it (`theme.colors.mutedForeground`), Flutter uses a `ColorScheme` field or `context.appColors.<camelCase>`.

## 1. Colours (2.theme, Light / Dark)

| Figma variable | Token | Light | Web CSS var / class | React Native | Flutter |
|---|---|---|---|---|---|
| `background/surface/light` | background | #FFFFFF | `--background` / `bg-background` | `colors.background` | `colors.surface` |
| `text/default` | foreground | #0E0F11 | `--foreground` / `text-foreground` | `colors.foreground` | `colors.onSurface` |
| `background/surface/soft` | muted | #F4F6F7 (Dark #17191D) | `--muted` / `bg-muted` | `colors.muted` | `colors.surfaceContainerLow` |
| `text/muted` | muted-foreground | #768793 | `--muted-foreground` | `colors.mutedForeground` | `colors.onSurfaceVariant` |
| `text/soft` | soft-foreground | #40474F | `--soft-foreground` | `colors.softForeground` | `appColors.softForeground` |
| `text/disabled` | disabled-foreground | ? | `--disabled-foreground` | `colors.disabledForeground` | `appColors.disabledForeground` |
| `text/inverse` | inverse-foreground | #F4F6F7 | `--inverse-foreground` | `colors.inverseForeground` | `colors.onInverseSurface` |
| `background/onsurface/0` | surface-0 (card) | #FFFFFF | `--card` (= surface-0) / `bg-card` | `colors.card` | `colors.surfaceContainerLowest` |
| `background/onsurface/1` | surface-1 | #F4F6F7 | `--surface-1` | `colors.surface1` | `colors.surfaceContainerLow` |
| `background/onsurface/2` | surface-2 | #EAEEF0 | `--surface-2` | `colors.surface2` | `colors.surfaceContainer` |
| `background/onsurface/3..6` | surface-3..6 | ? | `--surface-3..6` | `colors.surface3..6` | `surfaceContainerHigh/Highest` + `appColors` |
| (popover) | popover | = surface-0 | `--popover` -> `var(--card)` | `colors.popover` | `colors.surfaceContainerLowest` |
| `background/global/soft/hover` | accent | ? | `--accent` / `hover:bg-accent` | `colors.accent` | `appColors.accent` |
| `background/global/soft/active` | accent-active | ? | `--accent-active` | `colors.accentActive` | `appColors.accentActive` |
| `border/divider/primary` | border | #E0E5E8 | `--border` / `border-border` | `colors.border` | `colors.outlineVariant` |
| `border/divider/secondary` | border-secondary | #D7DCE1 | `--border-secondary` | `colors.borderSecondary` | `colors.outline` |
| `border/divider/tetriary` | border-subtle | ? | `--border-subtle` | `colors.borderSubtle` | `appColors.borderSubtle` |
| `border/global/soft/default` | input | #D7DCE1 | `--input` / `border-input` | `colors.input` | `appColors.input` |
| `border/global/soft/hover` | input-hover | ? | `--input-hover` | `colors.inputHover` | `appColors.inputHover` |
| `border/accent/brand` | ring | ? | `--ring` / `ring-ring` | `colors.ring` | `appColors.ring` |
| `accent/primary/default` | primary | #FDDB2B | `--primary` / `bg-primary` | `colors.primary` | `colors.primary` |
| `accent/primary/hover` | primary-hover | #F7C21C | `--primary-hover` / `hover:bg-primary-hover` | `colors.primaryHover` | `appColors.primaryHover` |
| `accent/primary/active` | primary-active | ? | `--primary-active` | `colors.primaryActive` | `appColors.primaryActive` |
| `accent/primary/on-accent` | primary-foreground | ? | `--primary-foreground` | `colors.primaryForeground` | `colors.onPrimary` |
| `accent/primary/on-accent-muted` | primary-foreground-muted | ? | `--primary-foreground-muted` | `colors.primaryForegroundMuted` | `appColors.primaryForegroundMuted` |
| `accent/primary/container-muted` | primary-muted | ? | `--primary-muted` | `colors.primaryMuted` | `colors.primaryContainer` |
| `neutral/primary/default` | secondary | #17191D | `--secondary` / `bg-secondary` | `colors.secondary` | `colors.secondary` |
| `neutral/primary/hover`, `/active` | secondary-hover, secondary-active | ? | `--secondary-hover`, `--secondary-active` | `colors.secondaryHover`, `...Active` | `appColors.secondaryHover`, `...Active` |
| `neutral/primary/on-accent` | secondary-foreground | ? | `--secondary-foreground` | `colors.secondaryForeground` | `colors.onSecondary` |
| `neutral/primary/container-muted` | secondary-muted | ? | `--secondary-muted` | `colors.secondaryMuted` | `colors.secondaryContainer` |
| `neutral/secondary/flat default/default` | neutral-flat | #E0E5E8 | `--neutral-flat` | `colors.neutralFlat` | `appColors.neutralFlat` |
| `neutral/static/container-muted` | static-muted | #F0F3F4 | `--static-muted` | `colors.staticMuted` | `appColors.staticMuted` |
| `accent/static/default` (+hover, active) | static (-hover, -active) | ? | `--static` | `colors.static` | `appColors.static` |
| `accent/positive/default` (+hover, active) | success (-hover, -active) | #0FA976 | `--success` / `bg-success` | `colors.success` | `appColors.success` |
| `accent/negative/default` (+hover, active) | destructive (-hover, -active) | #EF4444 | `--destructive` / `bg-destructive` | `colors.destructive` | `colors.error` |
| `text/link` | link | #3B82F6 | `--link` / `text-link` | `colors.link` | `appColors.link` |
| `text/danger` | destructive-text | ? | `--destructive-text` | `colors.destructiveText` | `colors.error` |
| `text/warning` | warning-text | ? | `--warning-text` | `colors.warningText` | `appColors.warningText` |
| `text/positive` | success-text | ? | `--success-text` | `colors.successText` | `appColors.successText` |
| `border/accent/danger \| warning \| positive` | border-destructive \| -warning \| -success | ? | `--border-destructive` ... | `colors.borderDestructive` ... | `appColors.borderDestructive` ... |
| `status/filled/bg/<role>` | status-<role> | ? | `--status-<role>` | `colors.status<Role>` | `appColors.status<Role>` |
| `status/ghost/bg/<role>` | status-<role>-muted | ? | `--status-<role>-muted` | `colors.status<Role>Muted` | `appColors.status<Role>Muted` |
| `status/ghost/text/<role>` | status-<role>-foreground | ? | `--status-<role>-foreground` | `colors.status<Role>Foreground` | `appColors.status<Role>Foreground` |
| `supportive/filled/3`, `5-hc` | supportive-3, supportive-5-hc | #10B981, #F43F5E | `--chart-*` candidates (`--supportive-3`) | `colors.supportive3` | `appColors.supportive3` |

Status roles: `neutral` (Figma `default`), `info`, `clear`, `error`, `accent`, `success`, `warning`. Badge `Appearance` and toast `state` use them.

`primary` here is Mbank's yellow accent button (`accent/primary`), `secondary` is the near-black neutral button (`neutral/primary`). The green brand is a separate role (section 2), never `primary`.

## 2. Brand (1.brand) and product themes

| Figma variable | Token | Default mode | Web | React Native | Flutter |
|---|---|---|---|---|---|
| `brand/default` | brand | #16A34A | `--brand` / `bg-brand` | `colors.brand` | `appColors.brand` |
| `brand/hover` | brand-hover | #189547 | `--brand-hover` | `colors.brandHover` | `appColors.brandHover` |
| `brand/active` | brand-active | ? | `--brand-active` | `colors.brandActive` | `appColors.brandActive` |
| `neutral/brand/on-accent` | brand-foreground | #FFFFFF | `--brand-foreground` | `colors.brandForeground` | `appColors.onBrand` |
| `brand/on-accent-muted` | brand-foreground-muted | #A9B4BC | `--brand-foreground-muted` | `colors.brandForegroundMuted` | `appColors.onBrandMuted` |
| `brand/ghost-container-muted` | brand-muted | #F0FDF4 | `--brand-muted` | `colors.brandMuted` | `appColors.brandMuted` |
| `text/brand` | brand-text | ? | `--brand-text` / `text-brand-text` | `colors.brandText` | `appColors.brandText` |

The product brand is a theme switch, never a recolour in components. Each `1.brand` mode (bank, kassa, travel, artwin, koko; confirmed 2026-10-09, values in `mbank-figma-patterns/references/tokens.md` section 4) becomes one theme that overrides only the `brand*` tokens:

- **Web:** `<html data-brand="kassa">` (light/dark stays on `.dark`). `:root` holds the bank values; `[data-brand="kassa"] { --brand: ...; --brand-hover: ...; --brand-active: ...; }` and the same for artwin, travel and koko. A project for one product sets the attribute once in the root layout.
- **React Native (Unistyles):** themes `light`, `dark` x brand: build them with a `makeTheme(mode, brand)` helper in `themes.ts`; switch with `UnistylesRuntime.setTheme`. Only `colors.brand*` differ between brands.
- **Flutter:** `AppColors` gets `brand`, `brandHover`, `brandActive`, `onBrand`; `AppTheme.light(brand: Brand.kassa)` picks the instance; `enum Brand { bank, kassa, artwin, travel, koko }`.

The fixed `brand/{bank,kassa,artwin,travel}/*` variables of 2.theme map to `--brand-bank`, `--brand-kassa`, ... and are used only where several products appear together (product switcher, partner logos).

## 3. Radius, spacing, z-index

Radius (Mbank values replace shadcn's computed `--radius` scale; override the Tailwind radius variables directly):

| Figma | Token | px | Web (`@theme`) | React Native | Flutter |
|---|---|---|---|---|---|
| `radius/xss` | radius.2xs | 2 | `--radius-2xs: 2px` / `rounded-2xs` | `radius['2xs']` | `AppRadius.xxs` |
| `radius/xs` | radius.xs | 4 | `--radius-xs: 4px` / `rounded-xs` | `radius.xs` | `AppRadius.xs` |
| `radius/s` | radius.sm | 8 | `--radius-sm: 8px` / `rounded-sm` | `radius.sm` | `AppRadius.sm` |
| `radius/m` | radius.md | 12 | `--radius-md: 12px` / `rounded-md` | `radius.md` | `AppRadius.md` |
| `radius/l`, `xl`, `xl-2..4` | radius.lg, xl, 2xl..4xl | ? | `--radius-lg` ... `TODO(G01)` | `radius.lg` ... | `AppRadius.lg` ... |
| `radius/full` | radius.full | pill | `rounded-full` | `radius.full` = 9999 | `AppRadius.full` = 999 |

Set shadcn's `--radius: 12px` (= `radius/m`, the control radius) so primitives that use `rounded-lg` via `--radius` still look right, and use `rounded-sm`/`rounded-md` explicitly in Mbank variants.

Spacing: the known Mbank values sit on the 4px grid, so the standard scale applies (`space.n` = n x 4: web `p-4`, RN `theme.space[4]`, Flutter `AppSpacing.s16`). Mapping of the Figma names: `spacing/none`, `paddings/default/none` -> 0; `spacing/xs`, `paddings/default/xs` -> `space.1` (4); `spacing/s-3`, `paddings/default/s` -> `space.2` (8); `spacing/s-1`, `paddings/default/s-2` -> `space.3` (12); `spacing/m-2-base`, `paddings/default/m-2` -> `space.4` (16); `paddings/default/l` -> `space.5` (20). `spacing/s-2`, `m-1`, `l-*`, `xl-*`, `xxl-*` and `rem/default/*`: snap the read value to the nearest step after G01, never guess.

Z-index (page Z-Index, no variables yet):

| Layer | Value | Web | RN / Flutter |
|---|---|---|---|
| hide / default | -1 / 0 | `--z-hide`, `--z-default` | `zIndex.hide` / `ZIndex.hide` |
| dropdown | 1000 | `--z-dropdown` -> `z-(--z-dropdown)` | `zIndex.dropdown` |
| sticky | 1100 | `--z-sticky` | `zIndex.sticky` |
| fab | 1200 | `--z-fab` | `zIndex.fab` |
| overlay | 1300 | `--z-overlay` | `zIndex.overlay` |
| loader | 1400 | `--z-loader` | `zIndex.loader` |
| modal | 1500 | `--z-modal` | `zIndex.modal` |
| toast | 1600 | `--z-toast` | `zIndex.toast` |
| popover | 1700 | `--z-popover` | `zIndex.popover` |
| tooltip | 1800 | `--z-tooltip` | `zIndex.tooltip` |

RN and Flutter rarely need z-index (portals/overlays order themselves); keep the constants for custom stacks only.

## 4. Typography and fonts

| Figma | Size / LH | Web | React Native | Flutter |
|---|---|---|---|---|
| `font/Body/xs`, `xs-md` | 13 / 16 | `text-xs` overridden to 13/16 (`--text-xs: 13px; --text-xs--line-height: 16px`) + `font-medium` | `typography.bodyXs` | `textTheme.bodySmall` |
| `font/Body/s`, `s-md`, `s-strong` | 14 / 20 | `text-sm` (+ `font-medium` / `font-bold`) | `typography.bodyS` | `textTheme.bodyMedium` |
| `font/Body/l`, `l-md` | 16 / 24 | `text-base` | `typography.bodyL` | `textTheme.bodyLarge` |
| `font/Body/xl-strong` | 18 / 26 | `text-lg` (`--text-lg--line-height: 26px`) + `font-bold` | `typography.bodyXlStrong` | `textTheme.titleMedium` |
| `font/Body/m`, `xl`, `font/Heading/h1..h6` | ? | `text-*` after G01/G05; headings `font-semibold tracking-tight` until read | `typography.h1..h6` | `displaySmall`, `headlineLarge..Small`, `titleLarge` |
| Mobile `label/large-prominent` | 16 / 24 Bold | - | `typography.labelLarge` | `textTheme.labelLarge` |
| Mobile `label/medium-prominent` | 14 / 20 Bold | - | `typography.labelMedium` | `textTheme.labelMedium` |
| Mobile `body/large, medium, small` | ? | - | `typography.bodyLarge` ... | `textTheme.bodyLarge` ... |

UI text weight is Medium 500 (`-md` styles) for controls; Regular for running text.

Fonts:

- **Web: Inter Mbank**, self-hosted. Put the woff2 files the brand team supplies (Regular 400, Medium 500, SemiBold 600 if used, Bold 700) in `src/app/fonts/` (Next.js `next/font/local`, `variable: "--font-inter-mbank"`) or `public/fonts/` + `@font-face` with `font-display: swap` (Vite). Map in `@theme inline { --font-sans: var(--font-inter-mbank), "Inter", ui-sans-serif, system-ui, sans-serif; }`. No Google Fonts "Inter" as a replacement in production; it is only the fallback in the stack. Files and licence are pending (G03).
- **Mobile: Nunito**, pending confirmation (G03). React Native: `expo-font` config plugin with one family name per weight (`Nunito-Regular`, `Nunito-Medium`, `Nunito-SemiBold`, `Nunito-Bold`). Flutter: bundle the TTFs under `assets/fonts/` and declare `family: Nunito` with weights in `pubspec.yaml` (no runtime `google_fonts` fetching in a banking app).

## 5. Shadows

Visual weight only, until the Foundation scale exists (G06): `shadow/top/s..xl`, `shadow/bottom/s` -> `shadow-xs..lg` (web), `theme.shadow.sm..lg` (RN `boxShadow` strings), `AppShadows.sm..lg` (Flutter); `shadow/modal` -> `--shadow-modal` / `theme.shadow.modal` / `AppShadows.modal`; `shadow/tooltip` -> `shadow.tooltip`. Read the effect values with the next catalog update; do not copy shadcn defaults as "Mbank" shadows.

## 6. Icons: Mbank Icons library, not Lucide

Mbank products use the **Icons** library (`mS7YDd02ncMJH43DFk2Ixy`): one component set per icon, `Style` = Line (default) / Outlined / Solid / Duo Tone, drawn at 24px. This overrides `frontend-pack` react-ui's "lucide-react only" rule **for Mbank projects**. Do not mix Lucide icons into an Mbank UI; if an icon is missing in the library, list it as a gap for the designers.

Procedure (web; same SVGs feed RN and Flutter):

1. Collect the icons the screen uses: from the design spec, or `get_design_context` on the screen (instances of the Icons library show their component name, for example `chevron-right`, `Style=Line`).
2. Export each icon node as SVG once: `download_assets` / the asset URLs returned by `get_design_context` for that icon node (`Style=Line` variant unless the design uses another), saved to `src/shared/ui/icons/svg/<name>.svg`. One file per icon and style: `<name>.svg`, `<name>-solid.svg`, `<name>-duotone.svg`.
3. Generate React components SVGR-style into `src/shared/ui/icons/` (`npx @svgr/cli --typescript --icon --replace-attr-values "#0E0F11=currentColor" --out-dir src/shared/ui/icons src/shared/ui/icons/svg`, or a small script with the same result): PascalCase name (`ChevronRightIcon`), `viewBox="0 0 24 24"`, default `width/height` 24 (`size-6`), every stroke and fill = `currentColor` (Duo Tone: second tone `currentColor` with `opacity`), props spread onto `<svg>`, `aria-hidden="true"` by default.
4. Export them from `src/shared/ui/icons/index.ts`. Use like Lucide: `<ChevronRightIcon className="size-4 text-muted-foreground" />`; icon-only buttons get `aria-label`.
5. Flags (`kg`, `kz`, ... on page `flag`) and product logos (`mbank-logo`, `mkassa-logo`, ...) keep their own colours: export as-is (no `currentColor`) into `src/shared/ui/icons/flags/` and `src/shared/ui/logos/`.
6. React Native: the same SVGs through `react-native-svg` + `react-native-svg-transformer` (or `@svgr/cli --native`), `color` prop -> `currentColor`. Flutter: `flutter_svg` with `colorFilter: ColorFilter.mode(color, BlendMode.srcIn)`, or an icon font generated from the SVG set when the app uses many icons.

Only add icons that are used; do not dump all 2776 sets into the bundle.

## 7. Component mapping (suggested)

| Mbank Figma | shadcn / web code | Notes |
|---|---|---|
| `button/default` (Web), `bttn / default` (Mobile) | `Button` with cva `variant`: primary, brand, secondary, destructive (`negative`), ghost (`flat`), soft (`flat filled`), outline, static, success (`positive`); `tone: "neutral"` for `neutralState=on`; `size`: xs, sm, md, lg, xl | `loading` -> `Spinner` + `disabled`; add `focus-visible:ring-ring` (Figma has no focus, G10) |
| `input/default`, `input/password`, `input/phone`, `input/counter`, `TextArea` | `Field` + `Input` / `Textarea` / `InputGroup`; size L 56 / M 44 / S 36 (32) via cva | `Label Outside` = visible label above; `error+*` = `aria-invalid` |
| `input/dropdown`, `input/filter-dropdown`, `Item / dropdown / *` | `Select` or `Combobox` / `DropdownMenu` | multi selection -> Combobox with checkboxes |
| `input/calendar-single`, `input/calendar-multi`, `atoms / day-items` | `Popover` + `Calendar` (range mode for multi) | |
| `input/time-picker` | `Input` type time or a Select pair | |
| `input/search` | `InputGroup` with search icon | |
| `otp`, `otpInput` | `InputOTP` | |
| `Switchers - Check` (`Type=Checkbox/Radiobutton/Toggle`) | `Checkbox`, `RadioGroup`, `Switch` | |
| `segment`, `Item / segmentButtons` | `ToggleGroup` (single) or `Tabs` with segmented style | |
| `tab-outline`, `Item / tabLine`, `tab-stepper` | `Tabs` with cva `variant`: outline, line, stepper | |
| `Item / chipsButton` | `Toggle` / `ToggleGroup` (filters) or `Badge` with remove button | |
| `Badge-status`, `Badge-counter`, `badge-dot` | `Badge` cva `tone` = status roles, `shape` rounded/square | |
| `toast` | `sonner` `toast()` with Mbank styling | per react-ui, never the Base UI toast |
| `alert-text` | `Alert` | |
| `dialogInfo`, `dialogConfirm`, `dialogForm` | `Dialog` / `AlertDialog` (confirm) | Mobile `Bottom sheet/*` -> `Drawer` on web, bottom sheet on native |
| `tooltip` / `Tooltip` | `Tooltip` | |
| `Avatars` | `Avatar` | |
| `Breadcrumb`, `pagination/basic` | `Breadcrumb`, `Pagination` | |
| `accordion` | `Accordion` | |
| `Progress bar / Determinate`, `Progress circle`, `spinner` | `Progress`, custom circular progress, `Spinner` | |
| `Chart`, `Chart-tooltip`, CRM `Widget-Chart` | shadcn `chart` (Recharts) in a `Card` | series colours from `supportive-*` once read |
| CRM `sideMenu`, `topHeader` | `Sidebar` (collapsible icon mode = `short`), app header in `shared/components` | |
| CRM `TableSection 2.0`, `TableCell`, `table/row/*` | `Table` + TanStack Table `DataTable` | cell content types -> column renderers |
| Hero Section blocks | page sections in `src/features/<page>/components/` built from `shared/ui` | Desktop-first drawing; implement mobile-first anyway |

Frontend-pack architecture, data-fetching and code-quality rules apply unchanged; only the visual tokens, fonts and icon source come from this file.
