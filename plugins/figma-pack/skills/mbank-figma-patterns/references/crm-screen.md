# CRM / web screens on the Mbank kits (verified 2026-10-12)

Tested in file `vVuM5uw3TsWo1xm3vJelXG`: page "CRM / Переводы" (a dashboard, a transfers list and a transfer card with AML) and page "CRM / Кредитный конвейер" (a stage board and an application card, built in 3 calls with section 7), all at 1440. Audit result: 0 errors, 0 warnings.

## 0. While Inter Mbank is not an org font

Inter Mbank is the font of CRM UI KIT and Web components, and the MCP cannot load it. **Ask the user before drawing.** Offer two options: draft on Inter, or wait for the admin to upload the font. If the user picks the draft:

- name the screens `[draft] …` and say in the report that they use Inter instead of Inter Mbank;
- switch the text of every kit instance to Inter **before** inserting the instance into any frame (see section 2);
- your own text: Inter with the exact metrics of the matching web style (size, weight, line height from `tokens.md` section 5). Text styles cannot be applied (they need Inter Mbank). Name text layers **by role** (`Title`, `Amount`, `Status`), as `figma-structure` requires; the swap-back finds the style by metrics;
- run `structure-audit.js` with `DRAFT_MODE_FONT = 'Inter'`, so the fallback is counted once as `draft-font` info instead of one warning per text;
- once the font is uploaded, run the swap-back from section 6.

## 1. Anatomy

File structure per `figma-structure`: page `CRM / <Flow>`, one Section per screen (`CRM / Дашборд`, `CRM / Все переводы`, `CRM / Карточка перевода`), states in rows; local components on the `Components` page, Section `CRM`. Screen content per `figma-design/references/ui-patterns.md`.

```
[draft] <Product> / <Screen> / <State> / 1440      horizontal auto layout, 1440x1080, background/surface/soft, gap spacing/none
├─ sideMenu (CRM UI KIT, type=default)     280, FILL height; select the item with item-sidemenu-menu-tree-states → State=Selected
└─ Content (vertical, FILL)
    ├─ topHeader (detached, see section 2)  68, FILL width; title, search placeholder, button, user name and role
    └─ Body (vertical, FILL)                padding spacing/l-2 = 24, gap spacing/m-2-base = 16 (24 between large blocks)
        └─ cards                             background/onsurface/0, radius/l = 16, padding spacing/m-1 = 20, gap 16
```

- The `topHeader` variant `Type=subheader` gives breadcrumbs. It has three `title` layers: section / list / object.
- There is one primary action per screen. The `Экспорт` button in the header is the kit's dark `neutralState=on`.
- Text colours: `text/default` for values, `text/muted` for labels, `text/soft` for body copy in cards. Status colours come from `border/accent/*` (dots) and `Badge-status` (`Appearance` = Success / Warning / Error / Info / Default, `Size=S`, `Solid=off`).
- Local components that the kit does not have (make each once, place instances, write a `description`):
  - `CRM / KPI card`: Label (`font/Body/s`, muted), Value (`font/Heading/h4`), Delta (`font/Body/s-md`, `text/positive` or `text/danger`) plus a caption;
  - `CRM / Transfer row`: a detached `TableSection 2.0` Base row with the cells you need. Hidden cells are removed and the status cell holds `Badge-status`;
  - `CRM / Key-value row`: label 180 + value FILL, padding 8/0;
  - `CRM / Timeline item`: a 12 px dot + title + meta;
  - `CRM / Application card`: board card, 200 wide (Fill in use), padding 12, gap 4, radius/m: ID + Time, Name (1 line, truncate), Amount (16/24 Bold), Meta, `Badge-status` S for SLA.
- Table columns are fixed widths and the status column is FILL. A cell has padding 12 + 12, so the text needs width + 24. With Inter the text is wider than with Inter Mbank: check for wrapping on the screenshot.

## 2. Kit instances: what can be inserted

| Component | In auto layout after switching to Inter | Notes |
|---|---|---|
| `sideMenu` | yes | item texts are layers named `text` in menu order; `Brand Name`, `subtext` |
| `button/default` | yes | `Button Title` is a text layer; set `left-icon#`, `right-icon#` to false |
| `Badge-status` | yes | `Label Text#…` |
| `input/search`, `input/dropdown` | yes | `Text`, `FieldLabelText`; turn off `Description Hint#…` |
| `segment`, `pagination/basic` | yes | `Title` × n |
| `topHeader`, `Widget-Chart` | **no** | the main component has hidden text in Inter Mbank (`Поставщик`, `Date`) that cannot be reached from an instance. `detachInstance()` the top level only (nested buttons and inputs stay instances), then switch to Inter. Name it `… (detached)` |
| `TableSection 2.0`, `TableCell` | **no** | same cause. Detach **recursively** (`while (f.findOne(INSTANCE)) detach`), switch to Inter, then `createComponentFromNode` into a local row component |

How to switch an instance to Inter (do it before `appendChild`; otherwise you get "unloaded font Inter Mbank" even on a frame without auto layout):

```js
const STY = {Regular:'Regular', Medium:'Medium', SemiBold:'Semi Bold', Bold:'Bold'};
// findAll on a detached frame does not go into nested instances, so collect texts from them separately
function deep(r){ const m=new Map(); const add=n=>{ if(n.type==='TEXT') m.set(n.id,n); if('findAll' in n) for (const t of n.findAll(x=>x.type==='TEXT')) m.set(t.id,t); };
  add(r); if('findAll' in r) for (const i of r.findAll(x=>x.type==='INSTANCE')) add(i); return [...m.values()]; }
function toInter(r){ for (const x of deep(r)) {
  for (const p of ['fontFamily','fontStyle','fontWeight']) if (x.boundVariables?.[p]) x.setBoundVariable(p, null);
  if (!x.characters.length) { x.fontName = {family:'Inter', style:'Regular'}; continue; }
  for (const s of x.getStyledTextSegments(['fontName'])) if (s.fontName.family !== 'Inter')
    x.setRangeFontName(s.start, s.end, {family:'Inter', style: STY[s.fontName.style] || 'Regular'}); } }
```

Changing a variant (`setProperties({State:'Selected'})`) resets the texts of that item, so run `toInter` and the text overrides again after it.

## 3. Colours: the fallback must be the real value

`setBoundVariableForPaint({color:{r:1,g:1,b:1}}, 'color', v)` binds correctly, but when `v` is an alias of a library primitive (for example `text/positive` → `accent/positive/default`) the canvas renders the **fallback**, which here is white. After building, re-apply every colour of your own layers with its resolved value:

```js
const r = v.resolveForConsumer(node).value;
figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:r.r, g:r.g, b:r.b}}, 'color', v);
```

## 4. Sizes and wrapping

- In `topHeader`, `title` is FIXED 88 inside a FIXED `Title Page`. For a long title, set `textAutoResize = 'WIDTH_AND_HEIGHT'` and change the parent frames to HUG.
- A local component built with `createComponent()` and then `resize()` becomes FIXED. Set `primaryAxisSizingMode = 'AUTO'` again after `resize`, otherwise the instances collapse.
- A failed `use_figma` call is rolled back completely (including `createPage`), so the next call starts from the same state.

## 5. Audit

The same audit as for mobile: zero unbound paddings, gaps, radii and colours on your own frames. Frames inside kit instances and inside the `(detached)` kit blocks are the kit's business. Check for no `Title`, `Label`, `Data`, `Button` or `Badge` on the screen, and that the only font is Inter (on a draft) or Inter Mbank (after the swap).

## 6. Swap back when Inter Mbank is uploaded

1. Instances of `sideMenu`, button, badge, inputs: on every `Inter` text inside an instance, reset the font override with `setRangeFontName(…, {family:'Inter Mbank', style})`. The style map is the reverse of `STY`.
2. Your own text: match size + weight + line height to the web text style in `tokens.md` section 5 (e.g. 14/20 Regular → `font/Body/s`, 20/28 Bold → `font/Heading/h5`), import it by key and set `textStyleId`.
3. The `(detached)` blocks: replace them with instances of `topHeader` and `Widget-Chart`, carrying over the texts. Build tables from `TableSection 2.0` instances.
4. Remove `[draft]` from the name and run the audit.

## 7. A new CRM area from screens that already exist (fastest, verified 2026-10-12)

When the file already has a finished CRM screen, a new area (credit conveyor, clients, ...) is built by **cloning the shell** instead of inserting the kit again: the clone keeps the switched-to-Inter sideMenu, the detached header and the local components, so there are no font failures. Three calls: component on the Components page, page with both screens, a fix after the screenshot.

1. `await srcPage.loadAsync()`, then `node.clone()` and `section.appendChild(clone)` on the new page. The new page is created with `figma.createPage()` and moved with `figma.root.insertChild(index, page)` right after the source page (it is new, so moving it is safe).
2. **Variables without a library search:** read them from bound nodes of the source screen (`boundVariables` and `fills[].boundVariables.color` -> `getVariableByIdAsync`) into a map by name; import only the missing ones by key from `tokens.json` (`importVariableByKeyAsync`). Guard `'findAll' in n` - a text node id in the list throws.
3. **Sidebar:** the menu texts are in a fixed order (`sm.findAll(TEXT)`; brand, group label, items, ..., role, user). Replace them by index with a list of the same length. Do not change the selected variant (it resets the texts); instead order the items so that the already selected position is the right one (dashboard selects item 1, the detail page selects its list).
4. Header: search placeholder, user and role, title or breadcrumbs. Short crumbs: a long first crumb pushes the user block out of the 1160 header.
5. Replace the body block by block: keep cards whose structure fits (key-value cards, score card, history), rename their titles and layer names, remove extra `Key-value row` instances instead of hiding them. Fixed 1080 height: count the blocks before adding one (Body 1012 - padding 48).
6. New kit badges and buttons: clone an existing switched instance, `setProperties`, then `toInter` again (a variant change can bring back Inter Mbank).
7. Run `figma-structure` audit with `DRAFT_MODE_FONT = 'Inter'`, then one screenshot per screen; check clipped lines (a long context line in a FIXED text), dot colours in timelines and the header width.
