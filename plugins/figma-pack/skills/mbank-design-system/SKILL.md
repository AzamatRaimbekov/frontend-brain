---
name: mbank-design-system
description: The Mbank / MDigital design system (Figma folder "Mbank Tokens") as a ready catalog - Foundation tokens, Web components, Hero Section marketing blocks, CRM UI KIT, Mobile KIT and the Mbank Icons library - with keys, variants, states, token values, code mapping for React/shadcn, React Native and Flutter, and the gap report for the designers. Use for any Mbank or MDigital product built on these kits - drawing screens in Figma (figma-designer agent), turning Mbank mockups into code (figma-to-react, figma-to-react-native, figma-to-flutter), installing the catalog into a project, choosing the kit for a product, picking product brand themes (bank, kassa, artwin, travel). Overrides generic defaults (Lucide icons, default shadcn colours) for Mbank projects. Triggers - "мбанк", "mbank", "м-банк", "дизайн-система мбанк", "по нашей дизайн-системе", "компоненты мбанк", "токены мбанк", "киты мбанк", "мобильный кит мбанк", "CRM кит", "hero section", "mdigital", "kassa", "mkassa", "artwin", "mtravel", "mbank design system", "Mbank Tokens", "Mbank components".
---

# Mbank design system

The Mbank design system lives in the Figma folder **Mbank Tokens** (org MDigital LLC, folder `75563647`). This skill ships its merged catalog, so Mbank work does not start with a fresh inventory. It sits under `figma-core`: routing, seat checks and call budgets still come from there. This skill decides **which** Mbank kit, components, tokens and icons to use.

| File | fileKey | Holds |
|---|---|---|
| Foundation | `uvwWMJmo79mf4L6J3BQCV6` | variables `1.brand` (brand colours per product + radius), `2.theme` (semantic colours, Light/Dark), `3.Primitive Colors`, `4.border-radius`; z-index table |
| Web components | `MFsAQPQULevnHwBcECccGc` | web base kit (103 published sets read), text styles, shadows, spacing; **main library** |
| Hero Section | `dJHk9SLzZJmqrrqrcMDu2n` | 39 marketing blocks + 40 parts (hero, features, banner, FAQ, forms, partners, header, footer) |
| CRM UI KIT | `MisYjVLDaBvvQ95uzxpFB0` | side menu, top header, table system, chart widget (controls come from Web components) |
| Mobile KIT | `DDGKxlACx8C55wVs641I7I` | 54 mobile components, iOS 393 + Android 360 |
| Icons | `mS7YDd02ncMJH43DFk2Ixy` | 2776 icon sets (Line/Outlined/Solid/Duo Tone, 24px), 266 flags, product logos |

`Untitled` (`eUOV1NJcObN4mLupTfUmB4`) is empty; ignore it. DS:Mbank, Starter KIT, Solid Icons and MDigital Brand Foundation are other org libraries, **not** part of this system: do not take components from them.

## When to use

- Any Mbank or MDigital product built on these kits: site, landing, client web app, CRM/admin, mobile app.
- The `figma-designer` agent and `figma-design` draw with this catalog: Mbank instances and variables only.
- `figma-to-react`, `figma-to-react-native` and `figma-to-flutter` map Mbank mockups to code with `references/code-mapping.md`.
- Designers ask "что не так с дизайн-системой": hand over `references/gaps.md`.

## Which kit for which product

| Product | Kit | Start from |
|---|---|---|
| Website, landing, promo page | **web**: Web components + Hero Section | Hero Section blocks (`Header`, `hero-*`, `hero-faq-row`, `hero-formApply`, `Footer`) filled with Web components |
| Client web app (cabinet, applications, forms) | **web**: Web components | `input/*`, `button/default`, `dialog*`, `toast`, `Segment & Tabs`, `pagination/basic` |
| CRM, admin panel, back-office, dashboard | **crm**: CRM UI KIT + Web components | `sideMenu` + `topHeader` + `TableSection 2.0` + `Widget-Chart`; buttons, inputs and badges from Web components |
| Mobile app (iOS, Android) | **mobile**: Mobile KIT | `Top-app-bar`, `Tab Bar`, `Cell/list item`, `bttn / default`, `input`, `Bottom sheet/*` |

Foundation and Icons are used by every kit. Do not mix Web and Mobile components on one screen: the two kits duplicate Button, Input, Badge, Tabs and others with different APIs.

## Install the catalog into a project

1. Copy `references/catalog.json` to `<project>/.figma/design-system.json` and `references/catalog.md` to `<project>/.figma/design-system.md` (the location `figma-core` and every Figma skill read).
2. Optionally copy `references/code-mapping.md` to `<project>/.figma/code-mapping.md` for the frontend team.
3. Commit them (`.gitignore`: `.figma/*`, `!.figma/design-system.md`, `!.figma/design-system.json`).
4. To refresh, run `figma-design-system` "обнови каталог" with the Web components link (`https://www.figma.com/design/MFsAQPQULevnHwBcECccGc`). Keep the `kit` tags and the Mbank token names when it rewrites the files. Then copy the result back here if it is newer.

Components, keys and variants come from the Dev-seat inventory (2026-10-07). **All token values** (2.theme light/dark, 1.brand × 5 modes, spacing, radius, text and effect styles, with keys) were re-read on a Full seat on 2026-10-09 and live in `mbank-figma-patterns/references/tokens.md` (+ `tokens.json`); that file wins over any `?` left in `catalog.md`.

## Key facts

- **Fonts:** web and CRM use **Inter Mbank** (Inter-based, self-hosted), Medium 500 for UI text. Mobile uses **Nunito** (confirmed: Mobile KIT text styles). Body sizes: 13/16, 14/20, 16/24 (plus 18/26 bold in CRM).
- **Brand colours (default brand mode):** brand green `#16A34A` (hover `#189547`); signature yellow accent / primary CTA `#FDDB2B` (hover `#F7C21C`); near-black neutral button `#17191D`; text `#0E0F11`, muted text `#768793`; negative `#EF4444`; positive `#0FA976`; link `#3B82F6`.
- **Surfaces:** white `#FFFFFF` pages and cards, soft grey `#F4F6F7` / `#F0F3F4`, dividers `#E0E5E8`, input borders `#D7DCE1`. Light, airy, flat; shadows only on overlays.
- **Radius:** web (`1.brand`) 2 / 4 / 8 / 12 / 16 (`radius/xss`, `xs`, `s`, `m`, `l`); Mobile KIT has its own scale where `radius/m` = 16. Controls 8-12, pill option on chips, segments and FloatButton.
- **Icons:** own Mbank Icons library (Hugeicons-like, not Lucide), 24px, `Style=Line` by default.
- **Density:** medium. Inputs L 56 / M 44 / S 36 (32), five button sizes xl..xs, table rows 44 (28 on mobile).
- **Product brands:** `1.brand` modes `bank`, `kassa`, `travel`, `artwin`, `koko` (confirmed) recolour `brand*` only.
- **Dark theme:** every `2.theme` variable has a dark value; a few look wrong (gap G04), so verify contrast on dark frames.

## Rules

1. **Instances only.** Build screens from instances of these kits (`importComponentSetByKeyAsync` with the `key` from the catalog). Never redraw a component, detach it or copy one from DS:Mbank or Starter KIT. A missing component is a gap: draw a `[draft]` frame and add it to the report.
2. **Tokens from 2.theme.** Fills, strokes and text bind to `2.theme` variables (and `1.brand` for brand colours); radius to the kit's `radius/*`; padding and gap to `paddings/default/*` (mobile) or `spacing/*` (web/CRM), picked by value from `mbank-figma-patterns/references/tokens.md`. No raw hex, no primitives (`black/*`, `white/*`) on product layers.
3. **Product brand via the brand mode.** For kassa, artwin or travel switch the `1.brand` mode on the page or top frame. Never recolour components by hand and never bind `brand/kassa/*` directly, except in product switchers and logos.
4. **Icons from the Icons library**, 24px, `Style=Line` unless the design or the user says otherwise; swap through the component's icon property. Flags and product logos come from the same library.
5. **Light and dark via modes.** Do not pick a component's `Dark` variant to get a dark theme; switch the `2.theme` mode (dark values are mostly missing, G04).
6. **States the kits lack** (focus, some disabled/pressed, G10) are added in code from tokens (`ring`, `disabled-foreground`), not invented in Figma without a confirmed plan.
7. **Code:** follow `references/code-mapping.md`. Mbank token names (`brand`, `primary` = yellow, `secondary` = near-black, `muted`, `surface-*`, `status-*`) replace shadcn's default palette.

## Drawing: use mbank-figma-patterns

Before any `use_figma` write on these kits, load the **`mbank-figma-patterns`** skill (`figma-pack:mbank-figma-patterns`). It holds the verified screen anatomy, exact token and icon keys, text-layer names, font fallbacks and the one-call mobile screen recipe. Rules here decide *what* to use; that skill decides *how* to build it.

## Refreshing values

Values were read in full on 2026-10-09. When the library changes, re-read them with a Full seat following `mbank-figma-patterns` section 6, then run `figma-design-system` "обнови каталог" for components. Never fill a value with a guessed or "similar" one.

## Precedence

- For Mbank projects this design system **overrides generic defaults**: Mbank Icons instead of `lucide-react`, Mbank tokens instead of shadcn's default neutral palette and radius, Inter Mbank / Nunito instead of the template font, Mbank components instead of the generic kit choices of `figma-design`.
- `frontend-pack` rules still apply in full: architecture and folders, data fetching, error handling, UX states, accessibility, cva/`cn()` styling discipline, file limits and library policy (except the icon library above).
- `figma-core` preconditions (seat, budget, confirmation before writes) and the designers' ownership of the library still apply: agents propose, designers change the library.

## References

- `references/catalog.json` - merged machine catalog (`catalog-format.md` schema + `kit` tags, `zIndex`, `brandModes`, `layoutSlots`): libraries and keys, variables with keys and light/dark values (full table in mbank-figma-patterns), 33 text and effect styles, 234 components, 52 blocks, icons, 27 gaps
- `references/catalog.md` - human-readable catalog: kits, token tables, typography, component index per kit, blocks, icons
- `references/code-mapping.md` - Figma token -> web CSS variable / Tailwind class, React Native and Flutter names; brand themes; fonts; icon export procedure; component mapping
- `references/gaps.md` - issues report for the designers (in Russian), by severity, with a fix per item
- `references/crm-kit-additions.md` - designer handoff (in Russian): five CRM blocks the team re-created locally (Key-value row, Application card, Transfer row, KPI card, Timeline item) to build in CRM UI KIT with DS Builder from `builder/contracts/crm-*.json`, publish, and swap the local copies
- `../mbank-figma-patterns/` - verified build patterns, full token values with keys, icon keys by role, mobile screen recipe

## Fonts available to the Figma MCP (re-checked 2026-10-09)

- **Inter Mbank is NOT available** to `use_figma` (not an organization shared font). Web components, Hero Section and CRM UI KIT instances fail with "unloaded font Inter Mbank", so full web/CRM screens wait until an org admin uploads Inter Mbank (Admin → Fonts). Never substitute Inter silently: with the user's consent, build an Inter `[draft]` following `mbank-figma-patterns/references/crm-screen.md`.
- **SF UI Display** (iOS status bar in Mobile KIT) is not available: only the status-bar time falls back to SF Pro (see `mbank-figma-patterns` rule 2). Do not skip the status bar or replace it with padding.
- **Available:** Nunito, Nunito Sans, Roboto, Inter, SF Pro, SF Pro Rounded, SF Compact. Mobile KIT screens draw fully.
- Before placing any other instance, load every font of its text nodes; skip and report instances whose fonts fail.
