---
name: mbank-figma-patterns
description: Verified build patterns for drawing Mbank / MDigital screens in Figma through the MCP - the screen anatomy (Top-app-bar with its built-in status bar, Body, Footer, Tab Bar), token bindings with real keys and values (paddings, spacing, radius, 2.theme light/dark colours, 1.brand modes, text and effect styles), icons by role from the Mbank Icons library, text overrides by layer name, font fallbacks, a ready use_figma recipe that builds a whole mobile screen in one call, and the zero-raw-values audit. Read from Figma on a Full seat and tested on real screens. Use whenever a screen, flow or state is drawn or fixed in Figma on the Mbank kits, by the figma-designer agent or directly. Triggers - "нарисуй экран мбанк", "сделай макет по нашей дизайн-системе", "собери экран в фигме", "исправь отступы в макете", "поставь иконки", "привяжи токены", "мобильный экран мбанк", "нарисуй crm", "админка мбанк в фигме", "mbank screen in figma", "draw with mbank kit", "bind tokens", "fix paddings in figma".
---

# Mbank Figma patterns (verified)

`mbank-design-system` says **what** the system has (kits, catalog, gaps). `figma-design` says **how** we design (brief, frame plan, approval). This skill says **how to build it so it is right the first time**: exact keys, values and layer names that were verified on real screens, plus a recipe that already works.

Read on a Full seat (devmd8, MDigital LLC) and tested on 2026-10-09 in file `vVuM5uw3TsWo1xm3vJelXG`: "Переводы" iOS 393 and Android 360, and "Платежи" iOS 393. CRM tested on 2026-10-12 (page "CRM / Переводы": dashboard, list, transfer card) as an Inter draft.

## Preconditions

- `figma-core` checks: a **Full** seat on the plan that owns the target file, and **can edit** on the file (the MCP needs edit even for `use_figma` reads). Writes only after the user confirms the draw plan (`figma-designer` gate).
- Load Figma's `figma-use` and `figma-generate-design` first. Pass `skillNames: "resource:figma-use,resource:figma-generate-design"` on every mutating `use_figma`.
- Target file = a product design file, never a library file of the "Mbank Tokens" folder.

## 1. Mobile screen anatomy (Mobile KIT)

```
[draft] <Flow> / <Screen> / <State> / 393      vertical auto layout, 393x852 (Android 360x800), clip
├─ Top-app-bar  (Type=Small-center)          110 iOS / 108 Android = built-in Status Bar + bar 56
├─ Body         (auto layout, Fill)          padding 8 / 16 / 0 / 16, gap 12
│   ├─ Search                                  optional
│   ├─ Section header (Title size=16)
│   └─ <list frame>  Cell/list item × n        gap 0
├─ Footer       (only with a primary action) padding 0 / 16 / 12 / 16, bttn / default xl primary
└─ Tab Bar      (Type=iOS|Android, label=on, Selected=n)   83 iOS / 78 Android
```

Screen fill = `background/onsurface/0`; every padding and gap of our own frames is bound to a `paddings/default/*` variable (0 included).

## 2. Rules learned the hard way

1. **One status bar, inside the top bar.** `Top-app-bar` already contains `Status Bar - iPhone & Android` (Android variant by default). Swap that nested instance to `Device=iPhone` for iOS. Never add a second status bar and never fake it with a 54 px top padding.
2. **Fonts.** Nunito and Roboto load. **Inter Mbank and SF UI Display are not org fonts** for the MCP. For the iOS status bar, replace only the failing text segments with `SF Pro Semibold`; on Android the time is `Roboto Medium`. Work per styled segment: the Android time's `fontName` is mixed, so `getStyledTextSegments` + `setRangeFontName`. Any other instance whose fonts fail is skipped and reported. Web components, Hero Section and CRM use Inter Mbank, so a web/CRM screen is either an **Inter draft that the user approved** or waits for the admin to upload Inter Mbank (`references/crm-screen.md` section 0).
3. **Spacing by value, not by name.** Mobile names do not follow the px order (`xs` = 2, `xs 2` = 4, `s` = 8, `s - 2` = 12, `m` = 14, `m - 2` = 16, `l` = 20). Pick from the table in `references/tokens.md`. Web/CRM use `spacing/*` (`s-3` = 8, `s-1` = 12, `m-2-base` = 16, `l-2` = 24).
4. **Radius differs by kit.** Mobile `radius/m` = 16, web `radius/m` = 12. Kit components already bind their radius; bind yours from the same kit's collection.
5. **Colours = 2.theme only.** All 256 variables have light and dark values (`tokens.md` section 3). Brand accents follow the `1.brand` mode (`bank`, `kassa`, `travel`, `artwin`, `koko`), set on the screen frame. Never bind primitives or a fixed `brand/kassa/*`.
6. **Text overrides by layer name.** Kit text is not exposed as component properties (except the button). Set `characters` on the visible text layer:

   | Component | Layer | What |
   |---|---|---|
   | Top-app-bar | `Label` | screen title |
   | Search | `Text` | placeholder |
   | Section header | `Headline` | section title |
   | Cell/list item | `Headline`, `Supporting text` | title, subtitle (variant `Description=true`) |
   | Tab Bar | `✏️ Label` × 5 | tab labels, left to right |
   | bttn / default | property `Button Content#…` | button text (via `setProperties`) |

7. **Icons from the Icons library, swapped into existing slots.** Find the slot (nested instance whose main component has `Style=`, 24 px) and `swapComponent` to the same `Style` of the wanted icon. The selected tab stays Solid, others Line. Role → key: `references/icons.md`. The kit ships placeholders (`triangle` in the tab bar, `camera` in avatars, circles in buttons): none may survive in a draft.
8. **Button defaults.** `bttn / default` shows placeholder left/right icons and may show a counter. Set `left-icon#…`, `right-icon#…`, `counter#…` to `false` unless the design needs them (then swap the icon via `Choose left Icon`).
9. **Avatars for people:** `Avatars` with `Upload/icon=False`, `Placeholder=True` (grey person silhouette). The default `Upload/icon=True` shows a camera, which means "upload a photo", not "a contact".
10. **Cells:** `Leading=avatar` for people, `Leading=icon` for services/categories (icon swapped into the 24 px slot), `Trailing=icon` (chevron) for navigation rows.
11. **One primary action per screen.** The footer button is the only `variant=primary`. With an empty state that has its own action, drop the footer button.
12. **Colour fallback = the real value.** A paint bound to a variable that aliases a library primitive renders its fallback colour, so pass the resolved value (`resolveForConsumer`) as `color`, not white. Otherwise the text or fill is invisible.
13. **Audit before reporting.** Plus `figma-structure`: `structure-audit.js` with 0 errors (screens in Sections, nothing loose, no default names) on every touched page. Zero unbound paddings/gaps on our own frames (frames inside kit instances are the kit's business), no placeholder icons or texts, the font check passes, and one screenshot is taken. The recipe returns `audit.rawValues`, which must be `[]`.

## 3. Build a mobile screen: the recipe

`references/mobile-screen.js` builds a complete screen in **one** `use_figma` call. Edit only `SPEC`:

- `page`, `section` (`<Area> / <Screen>`, created if missing, `figma-structure`), `name` (`[draft] <Area> / <Screen> / <State> / <width>`), `width`/`height`, `device` (`iPhone` | `Android`)
- `title`, `search` (or `null`), `sections[]` of `{ header, items[] }` where an item is `{ title, subtitle?, icon? }` (`icon` → service row, no icon → person row with avatar)
- `primaryAction` (or `null`), `tabs` `{ selected, labels[5], icons[5] }`

For icons outside its `ICON` map, add the key from `references/icons.md`. Flow:

1. Phase 1 (read-only): brief, frame plan, user confirmation (`figma-design`, `figma-designer`).
2. One call per screen with the recipe → it returns `screenId`, `warnings`, `audit`.
3. One `get_screenshot` of `screenId`. Check the status bar (exactly one), titles, icons (no triangles, cameras or circles), the button, clipped text.
4. Fix problems with a targeted script, then one more screenshot. Done.

Other states (loading, empty, error) reuse the anatomy: keep the top bar and the tab bar, replace the Body content (skeleton cells, empty state with one action, error with "Повторить"). Missing kit pieces go to `Proposals` (`figma-design` section 6).

## 4. Web and CRM screens

Recipe and rules: `references/crm-screen.md`. In short:

- Anatomy 1440x1080: `sideMenu` 280 + Content (`topHeader` 68 + Body padding 24, gap 16/24, `background/surface/soft`), cards `background/onsurface/0`, `radius/l`, padding 20. Web tokens: `spacing/*`, brand `radius/*`, web text styles (`tokens.md` sections 1, 2, 5, 6).
- While Inter Mbank is not an org font: ask the user, then build a `[draft]` on Inter. Switch the text of every kit instance to Inter **before** `appendChild` (unbind `fontFamily`/`fontStyle`, `setRangeFontName` per segment). Name your own text layers after the web style, so they can be swapped back.
- `topHeader` and `Widget-Chart` cannot be inserted even after the switch (hidden Inter Mbank layers in the main component), so detach the top level only. Detach `TableSection 2.0` and `TableCell` recursively and make a local row component from them. `sideMenu`, button, `Badge-status`, inputs, `segment` and `pagination` stay instances.
- Local components for gaps in the kit: `CRM / KPI card`, `CRM / Transfer row`, `CRM / Key-value row`, `CRM / Timeline item`.

## 5. Report

The `figma-design` section 7 report, plus:

```
Паттерны mbank-figma-patterns: статус-бар из Top-app-bar (<iPhone/Android>), отступы paddings/default/*, иконки Icons (<список>)
Предупреждения рецепта: <warnings или "нет">
Аудит: сырых значений <n>, заглушек <n>, шрифт <Nunito ✓>
```

## 6. Keeping this skill current

- Tokens or keys change (a library publish, an import by key fails): re-read with a Full seat. Run one read-only `use_figma` per library file (Foundation `uvwWMJmo79mf4L6J3BQCV6`, Mobile KIT `DDGKxlACx8C55wVs641I7I`, Web components `MFsAQPQULevnHwBcECccGc`) that dumps `getLocalVariableCollectionsAsync` (name, key, values per mode, resolved aliases), `getLocalTextStylesAsync` and `getLocalEffectStylesAsync`. Keep each return under 20 KB (split 2.theme in halves). Regenerate `tokens.json` and `tokens.md` and update the dated note at the top of this file.
- A new pattern proven on a real screen: add a rule in section 2 (what broke, what works) and, if code, to the recipe. Only verified behaviour goes here, never guesses.

## References

- `references/tokens.md` - every Mbank token with value and key: spacing, radius, 2.theme light/dark (256), 1.brand × 5 modes, text and effect styles (`tokens.json` is the machine copy)
- `references/icons.md` - icon role → icon → key, and how to add one
- `references/mobile-screen.js` - the tested one-call mobile screen recipe
- `references/crm-screen.md` - CRM/web: anatomy, which kit components can be inserted, Inter draft, swap back to Inter Mbank
- `../mbank-design-system/SKILL.md` - kits, catalog, code mapping, gaps for designers
