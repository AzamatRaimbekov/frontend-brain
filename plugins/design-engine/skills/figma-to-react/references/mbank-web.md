# Mbank web: build from the coded kit

Applies when the mockup uses the Mdigital kits (Web components, Hero Section, CRM UI KIT) or the project is an Mbank / MDigital product. It replaces the generic shadcn branch of `../SKILL.md` section 2 for components and icons; tokens are the standard shadcn/ui set (section 4). Everything else (flow, brief, 150 lines, data layer, review) stays as in `../SKILL.md`.

## 1. Load

1. `figma-pack:mbank-design-system` - kit choice, component catalog, rules (`../../mbank-design-system/SKILL.md`).
2. `frontend-pack:mbank-ui` - the coded Mbank UI kit: its install command, component list, props and theme file. File in the frontend-brain repository: `plugins/frontend-pack/skills/mbank-ui/SKILL.md`. If the Skill tool is unavailable, locate the plugin root with `find ~/.claude/plugins . -path '*frontend-pack/.claude-plugin/plugin.json' 2>/dev/null | head -1` and read `skills/mbank-ui/SKILL.md`.
3. `../../mbank-design-system/references/code-mapping.md` - icons and component mapping. Tokens: `figma-pack:ds-tokens` (the 31 shadcn colours, radius scale, fonts in `skills/ds-tokens/references/shadcn-tokens.json`; the design-engine MCP `ds_tokens` serves the same set).

`mbank-ui` or `scripts/add-ui.mjs` not installed or not found (check: `ls <frontend-pack>/skills/mbank-ui/SKILL.md <frontend-pack>/scripts/add-ui.mjs`) -> say so in the plan and the final report, skip section 2, build with the code-mapping tables (section 7 for components), and do not invent a parallel kit in the project.

## 2. Install the kit into the project

Only when the section 1 check found both `mbank-ui` and `add-ui.mjs`. Components come from the coded kit, never from `npx shadcn@latest add` with the default theme:

```bash
node <frontend-pack>/scripts/add-ui.mjs <names>
```

`<frontend-pack>` is the plugin root found above. `<names>` are the kit component names that `mbank-ui` lists (only the ones the screen needs). The theme file and the font setup come with the kit as `mbank-ui` describes; check that they are in place before writing the first component. A component the kit lacks -> follow `mbank-ui` (ask, or add it to the kit as a variant), never a local restyle of a shadcn default.

## 3. Component lookup order

For every Figma instance in the spec (section "components"):

1. Code Connect mapping on the node (catalog `codeConnect`; today 0 are mapped, gap G15).
2. Catalog `components[].code.web` and its `props` dictionary ("Figma property=value -> code prop") when filled. Today `code.web` is `null` in the shipped catalog; when it is filled, use it as is, without guessing.
3. `mbank-ui` component list and props (skip when it is absent).
4. `code-mapping.md` section 7 (suggested mapping: cva variant names such as `Button` `variant` primary / brand / secondary / destructive / ghost / soft / outline / static / success, `size` xs..xl).

A Figma variant that has no prop in code is a mismatch row (spec section 9): ask, do not add a one-off class.

## 4. Tokens and font

- Tokens are the standard shadcn/ui names only (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar-*`, each with `-foreground` where shadcn has it) and the shadcn radius scale. Use the Tailwind classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`), never hex. A project changes token values (preset on the ds-configurator site), never adds names.
- A Figma colour that has no standard name is a mismatch row (spec section 9): map it to the closest shadcn token and ask the designer; never add a custom variable or a one-off class.
- Font: through `--font-sans` / `--font-heading` from the kit theme; do not hard-code a family in components.
- Focus ring, disabled states: in code from tokens (`focus-visible:ring-ring`, `disabled:opacity-50`).

## 5. Icons

Mbank Icons, not `lucide-react` (overrides `translation-rules.md` section 6 and the `react-ui` icon rule for Mbank projects only). Procedure: `code-mapping.md` section 6 (export SVG once, SVGR into `src/shared/ui/icons/`, `currentColor`, only the icons used). A lucide import in an Mbank project is a review finding. An icon missing in the library is a gap for the designers, not a lucide substitute.

## 6. Checklist additions

- [ ] `mbank-ui` loaded and kit components installed with `add-ui.mjs`, none hand-built - or their absence reported and code-mapping section 7 used
- [ ] Props taken by the lookup order of section 3; unmapped variants asked as mismatch rows
- [ ] No hex, no Tailwind palette classes, no `lucide-react`; only standard shadcn token classes
- [ ] Font through `--font-sans` / `--font-heading`
