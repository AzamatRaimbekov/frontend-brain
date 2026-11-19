# Mbank: Figma -> code (icons and components)

How the Mbank Figma kits become code on web (React + Tailwind v4 + shadcn/ui), React Native and Flutter: the icon procedure and the component mapping.

**Tokens are not mapped here.** Since 2026-11-11 the design system has no token layer of its own: colours, radius and fonts are the standard shadcn/ui tokens (`figma-pack:ds-tokens`, `skills/ds-tokens/references/shadcn-tokens.json`), used as the shadcn classes (`bg-primary`, `text-muted-foreground`, `border-border`, `rounded-lg`, `font-sans`). Spacing and type sizes follow the Tailwind scale. A Figma colour without a standard shadcn name is a mismatch to ask the designer about, never a new token.

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

The exact, checked mapping is design-engine `references/components-map.json`: for every Figma component the import (`@mdigital/mbank-ui` or `/crm`), the code component, the add-ui registry item and Figma variant value -> code prop value, taken from the real cva variants. Use it first; this table is the summary. `node plugins/design-engine/scripts/components-map.mjs check` validates it against `catalog.json` and the kit code, `report` lists the missing components (kit backlog), `code-connect --out <dir>` writes `*.figma.tsx` for publishing.

| Mbank Figma | shadcn / web code | Notes |
|---|---|---|
| `button/default` (Web), `bttn / default` (Mobile) | `Button` with the kit's cva `variant` / `size` (exact value map in `components-map.json`) | `loading` -> `Spinner` + `disabled`; focus from `focus-visible:ring-ring/50` (Figma has no focus, G10) |
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
| `Badge-status`, `Badge-counter`, `badge-dot` | `Badge` cva `variant` (shadcn: default, secondary, destructive, outline), `shape` rounded/square | statuses map to these variants, no status tokens |
| `toast` | `sonner` `toast()` | per react-ui, never the Base UI toast |
| `alert-text` | `Alert` | |
| `dialogInfo`, `dialogConfirm`, `dialogForm` | `Dialog` / `AlertDialog` (confirm) | Mobile `Bottom sheet/*` -> `Drawer` on web, bottom sheet on native |
| `tooltip` / `Tooltip` | `Tooltip` | |
| `Avatars` | `Avatar` | |
| `Breadcrumb`, `pagination/basic` | `Breadcrumb`, `Pagination` | |
| `accordion` | `Accordion` | |
| `Progress bar / Determinate`, `Progress circle`, `spinner` | `Progress`, custom circular progress, `Spinner` | |
| `Chart`, `Chart-tooltip`, CRM `Widget-Chart` | shadcn `chart` (Recharts) in a `Card` | series colours `chart-1..5` |
| CRM `sideMenu`, `topHeader` | `Sidebar` (collapsible icon mode = `short`), app header in `shared/components` | |
| CRM `TableSection 2.0`, `TableCell`, `table/row/*` | `Table` + TanStack Table `DataTable` | cell content types -> column renderers |
| Hero Section blocks | page sections in `src/features/<page>/components/` built from `shared/ui` | Desktop-first drawing; implement mobile-first anyway |

Frontend-pack architecture, data-fetching and code-quality rules apply unchanged; only the icon source and the component choice come from this file.
