# Mbank web: build from the coded kit

Applies when the mockup uses the Mbank Tokens kits (Web components, Hero Section, CRM UI KIT) or the project is an Mbank / MDigital product (Mbank, kassa, travel, artwin, koko). It replaces the generic shadcn branch of `../SKILL.md` section 2 for components, tokens, fonts and icons. Everything else (flow, brief, 150 lines, data layer, review) stays as in `../SKILL.md`.

## 1. Load

1. `figma-pack:mbank-design-system` - kit choice, token names, rules (`../../mbank-design-system/SKILL.md`).
2. `frontend-pack:mbank-ui` - the coded Mbank UI kit: its install command, component list, props and theme file. File in the frontend-brain repository: `plugins/frontend-pack/skills/mbank-ui/SKILL.md`. If the Skill tool is unavailable, locate the plugin root with `find ~/.claude/plugins . -path '*frontend-pack/.claude-plugin/plugin.json' 2>/dev/null | head -1` and read `skills/mbank-ui/SKILL.md`.
3. `../../mbank-design-system/references/code-mapping.md` - Figma token -> CSS variable / class, fonts, icons, component mapping. Values: `../../mbank-figma-patterns/references/tokens.md` wins over any `?` left in code-mapping.

`mbank-ui` not installed or not found -> say so in the plan and the final report, build with the code-mapping tables, and do not invent a parallel kit in the project.

## 2. Install the kit into the project

Components come from the coded kit, never from `npx shadcn@latest add` with the default theme:

```bash
node <frontend-pack>/scripts/add-ui.mjs <names>
```

`<frontend-pack>` is the plugin root found above. `<names>` are the kit component names that `mbank-ui` lists (only the ones the screen needs). The theme file and the font setup come with the kit as `mbank-ui` describes; check that they are in place before writing the first component. A component the kit lacks -> follow `mbank-ui` (ask, or add it to the kit as a variant), never a local restyle of a shadcn default.

## 3. Component lookup order

For every Figma instance in the spec (section "components"):

1. Code Connect mapping on the node (catalog `codeConnect`; today 0 are mapped, gap G15).
2. Catalog `components[].code.web` and its `props` dictionary ("Figma property=value -> code prop") when filled. Today `code.web` is `null` in the shipped catalog; when it is filled, use it as is, without guessing.
3. `mbank-ui` component list and props.
4. `code-mapping.md` section 7 (suggested mapping: cva variant names such as `Button` `variant` primary / brand / secondary / destructive / ghost / soft / outline / static / success, `size` xs..xl).

A Figma variant that has no prop in code is a mismatch row (spec section 9): ask, do not add a one-off class.

## 4. Tokens, brand, font

- Mbank token names replace shadcn's defaults: `primary` = signature yellow, `secondary` = near-black, `brand`, `muted`, `surface-*`, `status-*` (`code-mapping.md` sections 1-3). Use the classes, never hex.
- Product brand: one switch on the app root as `mbank-ui` sets it up (planned as `data-brand="kassa|travel|artwin|koko"`; `bank` is the default); components never take brand colours directly (`mbank-design-system` rule 3).
- Font: Inter Mbank through `--font-sans` (`code-mapping.md` section 4). Font files and licence are pending (gap G03): until they exist the fallback in the stack renders; report it, do not replace it with Google Fonts Inter in production.
- Focus ring, missing disabled/pressed states: in code from tokens (`focus-visible:ring-ring`, `disabled-foreground`), gap G10.

## 5. Icons

Mbank Icons, not `lucide-react` (overrides `translation-rules.md` section 6 and the `react-ui` icon rule for Mbank projects only). Procedure: `code-mapping.md` section 6 (export SVG once, SVGR into `src/shared/ui/icons/`, `currentColor`, only the icons used). A lucide import in an Mbank project is a review finding. An icon missing in the library is a gap for the designers, not a lucide substitute.

## 6. Checklist additions

- [ ] `mbank-ui` loaded (or its absence reported); kit components installed with `add-ui.mjs`, none hand-built
- [ ] Props taken by the lookup order of section 3; unmapped variants asked as mismatch rows
- [ ] No hex, no default shadcn palette, no `lucide-react`; brand via `data-brand`
- [ ] Font through `--font-sans`; missing Inter Mbank files reported (G03)
