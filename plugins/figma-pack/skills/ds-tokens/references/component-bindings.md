# Binding tokens to components (contracts → Figma)

A component is not drawn: it is a contract `mbank/component@1` (`builder/contracts/<name>.json`, format in `builder/docs/component-contract.md`) rendered by the DS Builder plugin, tab «Компоненты». The code generator reads the same JSON, so Figma and React cannot drift.

## How a token reaches a layer

| Contract property | Figma binding |
|---|---|
| `bg`, `fg`, `border` | fill / text fill / stroke paint → `setBoundVariableForPaint(color)` |
| `focus-ring` (`ring/50`) | drop shadow spread 3 in the `state=focus` variant → `setBoundVariableForEffect(color)` |
| `radius` | four corner radii → `radius/<key>` |
| `px`, `py`, `gap`, `height`, `size`, `min-height` | padding, itemSpacing, height/width → `spacing/<step>` (step × 4 px) |
| `text` + `weight` | text style (Mbank `font/Body/s[-md]`, kit `text-sm/leading-normal/medium`, else `ds/*`) |
| `opacity:disabled` | layer opacity (no variable) |

Variable lookup: `Mode/<token>` → Mbank Foundation name from the baked map (`builder/core/token-map.js`, from frontend-pack `tokens.map.json`) → a variable with the token's own name.

## Rules

1. **A colour is a token name, never hex.** The contract validator rejects `#…`, `rgb(…)`, `oklch(…)`.
2. **Missing token = new token, visibly.** With the Brand layer on, the plugin creates `Mode/<token>` → `Brand/color/{light,dark}/<token>`: `*-hover` / `*-active` start as the base token, others as a magenta placeholder flagged `contract-placeholder`. Give it a real value on «Токены» (rules 3–5 of this skill) and add it to `tokens.css` through the design system, then re-export.
3. **States are variants.** `bg:hover` in the contract = `state=hover` variant in Figma = `hover:bg-…` in code. Do not hand-edit one variant in Figma: change the binding in «Привязки», which rebinds the set and updates the contract.
4. **Update in place.** Re-render keeps the component nodes (instances in mockups stay linked); variants removed from the contract stay until the designer ticks «Удалить варианты…».
5. **Export after every change** («Экспорт» → `builder/contracts/`), otherwise code is generated from the old contract.
