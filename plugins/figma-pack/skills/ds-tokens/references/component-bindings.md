# Binding tokens to components (contracts → Figma)

A component is not drawn: it is a contract `mbank/component@1` (`builder/contracts/<name>.json`, format in `builder/docs/component-contract.md`) rendered by the DS Builder plugin, tab «Компоненты». The code generator reads the same JSON, so Figma and React cannot drift.

## How a token reaches a layer

| Contract property | Figma binding |
|---|---|
| `bg`, `fg`, `border` | fill / text fill / stroke paint → `setBoundVariableForPaint(color)` |
| `focus-ring` (`ring/50`) | drop shadow spread 3 in the `state=focus` variant → `setBoundVariableForEffect(color)` |
| `radius` | four corner radii → `radius-<step>` (shadcn scale) |
| `px`, `py`, `gap`, `height`, `size`, `min-height` | padding, itemSpacing, height/width as raw px on the Tailwind scale (step × 4 px); spacing is not a token |
| `text` + `weight` | Tailwind size and weight (`text-sm` + `font-medium`) on the `font-sans` family; no text-style tokens |
| `opacity:disabled` | layer opacity (no variable) |

Variable lookup: the variable with the token's own name (`primary`, `ring`, `radius-lg`). There is no alias layer and no name map.

## Rules

1. **A colour is a token name, never hex.** The contract validator rejects `#…`, `rgb(…)`, `oklch(…)`.
2. **Only standard shadcn names.** A contract colour outside `shadcn-tokens.json` is an error, never a new variable: pick the closest standard name (hover/active as `bg:hover` = `primary/90`, not a `*-hover` token).
3. **States are variants.** `bg:hover` in the contract = `state=hover` variant in Figma = `hover:bg-…` in code. Do not hand-edit one variant in Figma: change the binding in «Привязки», which rebinds the set and updates the contract.
4. **Update in place.** Re-render keeps the component nodes (instances in mockups stay linked); variants removed from the contract stay until the designer ticks «Удалить варианты…».
5. **Export after every change** («Экспорт» → `builder/contracts/`), otherwise code is generated from the old contract.
