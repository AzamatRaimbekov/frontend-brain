---
name: mbank-design-system
description: The Mbank / MDigital design system (Figma folder "Mbank Tokens") as a ready component catalog - Web components, Hero Section marketing blocks, CRM UI KIT, Mobile KIT and the Mbank Icons library - with keys, variants, states, component code mapping for React/shadcn, React Native and Flutter, and the gap report for the designers. Tokens are the standard shadcn/ui set (ds-tokens), not part of this catalog. Use for any Mbank or MDigital product built on these kits - drawing screens in Figma (figma-designer agent), turning Mbank mockups into code (figma-to-react, figma-to-react-native, figma-to-flutter), installing the catalog into a project, choosing the kit for a product. Overrides generic component and icon defaults (Lucide icons) for Mbank projects. Triggers - "мбанк", "mbank", "м-банк", "дизайн-система мбанк", "по нашей дизайн-системе", "компоненты мбанк", "киты мбанк", "мобильный кит мбанк", "CRM кит", "hero section", "mdigital", "mbank design system", "Mbank components".
---

# Mbank design system

The Mbank design system lives in the Figma folder **Mbank Tokens** (org MDigital LLC, folder `75563647`). This skill ships its merged catalog, so Mbank work does not start with a fresh inventory. It sits under `figma-core`: routing, seat checks and call budgets still come from there. This skill decides **which** Mbank kit, components and icons to use. Tokens are not decided here: the design system has only the standard shadcn/ui tokens (`ds-tokens`, decision of 2026-11-11).

| File | fileKey | Holds |
|---|---|---|
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

Icons are used by every kit. Do not mix Web and Mobile components on one screen: the two kits duplicate Button, Input, Badge, Tabs and others with different APIs.

## Install the catalog into a project

1. Copy `references/catalog.json` to `<project>/.figma/design-system.json` and `references/catalog.md` to `<project>/.figma/design-system.md` (the location `figma-core` and every Figma skill read).
2. Optionally copy `references/code-mapping.md` to `<project>/.figma/code-mapping.md` for the frontend team.
3. Commit them (`.gitignore`: `.figma/*`, `!.figma/design-system.md`, `!.figma/design-system.json`).
4. To refresh, run `figma-design-system` "обнови каталог" with the Web components link (`https://www.figma.com/design/MFsAQPQULevnHwBcECccGc`). Keep the `kit` tags when it rewrites the files; drop any variables section it reads (tokens are shadcn, `ds-tokens`). Then copy the result back here if it is newer.

Components, keys and variants come from the Dev-seat inventory (2026-10-07).

## Key facts

- **Fonts in the Figma kits:** web and CRM components are drawn in **Inter Mbank**, Mobile KIT in **Nunito**. In code the font is the `font-sans` token value (`ds-tokens`).
- **Icons:** own Mbank Icons library (Hugeicons-like, not Lucide), 24px, `Style=Line` by default.
- **Density:** medium. Inputs L 56 / M 44 / S 36 (32), five button sizes xl..xs, table rows 44 (28 on mobile).

## Rules

1. **Instances only.** Build screens from instances of these kits (`importComponentSetByKeyAsync` with the `key` from the catalog). Never redraw a component, detach it or copy one from DS:Mbank or Starter KIT. A missing component is a gap: draw a `[draft]` frame and add it to the report.
2. **Tokens = standard shadcn/ui only** (`ds-tokens`). Your own layers bind colours to the shadcn variables (`background`, `card`, `foreground`, `muted-foreground`, `primary`, `border` …) and radius to the shadcn scale; paddings and gaps are px on the 4 px grid. No raw hex, no product brand modes, no other token collections.
3. **Icons from the Icons library**, 24px, `Style=Line` unless the design or the user says otherwise; swap through the component's icon property. Flags and product logos come from the same library.
4. **Light and dark via modes.** Do not pick a component's `Dark` variant to get a dark theme; switch the light/dark mode of the shadcn variables.
5. **States the kits lack** (focus, some disabled/pressed, G10) are added in code (`focus-visible:ring-ring/50`, `disabled:opacity-50`), not invented in Figma without a confirmed plan.
6. **Code:** components and icons by `references/code-mapping.md`; colours, radius and fonts only through the standard shadcn token classes.

## Drawing: use mbank-figma-patterns

Before any `use_figma` write on these kits, load the **`mbank-figma-patterns`** skill (`figma-pack:mbank-figma-patterns`). It holds the verified screen anatomy, exact component and icon keys, text-layer names, font fallbacks and the one-call mobile screen recipe. Rules here decide *what* to use; that skill decides *how* to build it.

## Refreshing the catalog

When the library changes, run `figma-design-system` "обнови каталог" for components (Full or Dev seat). Never fill a key or a variant with a guessed one.

## Precedence

- For Mbank projects this design system **overrides generic defaults**: Mbank Icons instead of `lucide-react`, Mbank components instead of the generic kit choices of `figma-design`. Tokens are not overridden: the standard shadcn/ui set with the project's values.
- `frontend-pack` rules still apply in full: architecture and folders, data fetching, error handling, UX states, accessibility, cva/`cn()` styling discipline, file limits and library policy (except the icon library above).
- `figma-core` preconditions (seat, budget, confirmation before writes) and the designers' ownership of the library still apply: agents propose, designers change the library.

## References

- `references/catalog.json` - merged machine catalog (`catalog-format.md` schema + `kit` tags, `layoutSlots`): libraries and keys, 234 components, 52 blocks, icons, component and file gaps
- `references/catalog.md` - human-readable catalog: kits, libraries, component index per kit, blocks, icons
- `references/code-mapping.md` - icon export procedure and component mapping (tokens: `ds-tokens`)
- `references/gaps.md` - issues report for the designers (in Russian), by severity, with a fix per item
- `references/crm-kit-additions.md` - designer handoff (in Russian): the CRM blocks the team re-created locally (Key-value row, Application card, Transfer row, KPI card, Timeline item) plus List item drawn from tokens to build in CRM UI KIT with DS Builder from `builder/contracts/crm-*.json`, publish, and swap the local copies
- `../mbank-figma-patterns/` - verified build patterns, icon keys by role, mobile screen recipe
- `../ds-tokens/` - the token set: standard shadcn/ui only

## Fonts available to the Figma MCP (re-checked 2026-10-09)

- **Inter Mbank is NOT available** to `use_figma` (not an organization shared font). Web components, Hero Section and CRM UI KIT instances fail with "unloaded font Inter Mbank", so full web/CRM screens wait until an org admin uploads Inter Mbank (Admin → Fonts). Never substitute Inter silently: with the user's consent, build an Inter `[draft]` following `mbank-figma-patterns/references/crm-screen.md`.
- **SF UI Display** (iOS status bar in Mobile KIT) is not available: only the status-bar time falls back to SF Pro (see `mbank-figma-patterns` rule 2). Do not skip the status bar or replace it with padding.
- **Available:** Nunito, Nunito Sans, Roboto, Inter, SF Pro, SF Pro Rounded, SF Compact. Mobile KIT screens draw fully.
- Before placing any other instance, load every font of its text nodes; skip and report instances whose fonts fail.
