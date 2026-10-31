# Design system catalog: Mbank (Mbank Tokens folder)

Source: https://www.figma.com/files/project/75563647 (folder "Mbank Tokens", org MDigital LLC) | main library Web components `MFsAQPQULevnHwBcECccGc` | libraryKey `lk-8f7b6b84fe01…`
Updated: 2026-10-09 | components: Dev-seat inventory (2026-10-07) | **values: complete** (Full-seat read 2026-10-09) - every token value and key, light/dark and the 5 brand modes are in `mbank-figma-patterns/references/tokens.md`; where a table below still shows `?`, that file wins
Product font: Inter Mbank on web/CRM (`font/Body/*`), Nunito on mobile (confirmed) | Icons: Icons library, 2776 icon sets + 266 flags, component set per icon

`?` = value not read yet (never guessed). Full keys are in `catalog.json`; short keys below are the first 8 characters.

## 0. Kits and when to use them

| Kit | Files (libraries) | Use for | Notes |
|---|---|---|---|
| web | Web components + Hero Section + Foundation + Icons | public sites, landings, promo pages, client web apps | Hero Section = ready marketing blocks, Desktop 1920 first |
| crm | CRM UI KIT + Web components + Foundation + Icons | CRM, admin panels, back-office, dashboards | CRM adds side menu, top header, tables, chart widget; buttons/inputs come from Web components |
| mobile | Mobile KIT + Foundation + Icons | iOS/Android apps (React Native, Flutter) | iOS 393 + Android 360 frames; font Nunito |

| Product type | Kit | Start from |
|---|---|---|
| Marketing site / landing / promo | web | Hero Section blocks (Header, hero-*, Footer) + Web components |
| Client web app (cabinet, forms) | web | Web components (input/*, button/default, Dialog, Toast) |
| CRM / admin / back-office | crm | sideMenu + topHeader + TableSection 2.0 + Web components controls |
| Mobile app | mobile | Mobile KIT (Top-app-bar, Tab Bar, Cell/list item, bttn / default) |
| Product brand (bank, kassa, artwin, travel) | any | switch the `1.brand` mode, never recolour by hand |

## 1. Libraries

| Library | libraryKey | fileKey | Role | In folder |
|---|---|---|---|---|
| Foundation | lk-9c863272c240… | uvwWMJmo79mf4L6J3BQCV6 | tokens: variables 1.brand, 2.theme, 3.Primitive Colors, 4.border-radius; z-index doc page | yes |
| Web components | lk-8f7b6b84fe01… | MFsAQPQULevnHwBcECccGc | primary (web): base components, text styles, shadows, spacing | yes |
| Hero Section | - | dJHk9SLzZJmqrrqrcMDu2n | blocks: marketing sections for sites and landings (built from Web components) | yes |
| CRM UI KIT | lk-5c207a9c4525… | MisYjVLDaBvvQ95uzxpFB0 | admin/CRM organisms: side menu, top header, tables, chart widget (base controls come from Web components) | yes |
| Mobile KIT | lk-10093ae5d153… | DDGKxlACx8C55wVs641I7I | mobile app components (iOS 393 / Android 360) | yes |
| Icons | lk-450575c3585d… | mS7YDd02ncMJH43DFk2Ixy | icons (custom set, 24px, Line/Outlined/Solid/Duo Tone), flags, product logos | yes |
| DS:Mbank | lk-2c7ff0a33374… | - | older Mbank DS (1.Theme BG/*, TableCell, Empty States, camelCase text styles) | no (seen in org) |
| Starter KIT | lk-df852dbb552f… | - | generic starter kit (Skeleton, Empty States, Table/*, 3.Spacing); subscribed by Mobile KIT | no (seen in org) |
| Solid Icons | lk-538282818d09… | - | icons (other set) | no (seen in org) |
| MDigital — Brand Foundation | lk-19a59a8c76ff… | - | MDigital corporate brand primitives (zinc/50..950, Tailwind-like); not Mbank | no (seen in org) |

Untitled `eUOV1NJcObN4mLupTfUmB4` is empty and ignored.

## 2. Tokens

### Semantic colours (2.theme; modes Light / Dark, names assumed)

| Figma variable | Token | Light | Dark | Key |
|---|---|---|---|---|
| `background/surface/light` | background | #FFFFFF | ? | 6b620b04 |
| `background/surface/soft` | muted | #F4F6F7 | #17191D | 9937a923 |
| `background/onsurface/0` | surface-0 | #FFFFFF | ? | 597e34eb |
| `background/onsurface/1` | surface-1 | #F4F6F7 | ? | 6ff51ba6 |
| `background/onsurface/2` | surface-2 | #EAEEF0 | ? | fbe8e323 |
| `background/global/soft/hover` | accent | ? | ? | da113c8a |
| `text/default` | foreground | #0E0F11 | ? | 8af86f38 |
| `text/muted` | muted-foreground | #768793 | ? | 8bb44dbe |
| `text/soft` | soft-foreground | #40474F | ? | f729c62f |
| `text/disabled` | disabled-foreground | ? | ? | 667c29a1 |
| `text/inverse` | inverse-foreground | #F4F6F7 | ? | f85ccfae |
| `text/brand` | brand-text | ? | ? | 91827752 |
| `text/link` | link | #3B82F6 | ? | 3019aa5c |
| `text/danger` | destructive-text | ? | ? | c71864d1 |
| `text/warning` | warning-text | ? | ? | 863eb273 |
| `text/positive` | success-text | ? | ? | 38f2afee |
| `border/divider/primary` | border | #E0E5E8 | ? | 51813af7 |
| `border/divider/secondary` | border-secondary | #D7DCE1 | ? | - |
| `border/divider/tetriary` | border-subtle | ? | ? | a8277d11 |
| `border/global/soft/default` | input | #D7DCE1 | ? | - |
| `border/accent/brand` | ring | ? | ? | dc946628 |
| `border/accent/danger` | border-destructive | ? | ? | a725b522 |
| `accent/primary/default` | primary | #FDDB2B | ? | 25473330 |
| `accent/primary/hover` | primary-hover | #F7C21C | ? | 6b557bc7 |
| `accent/primary/active` | primary-active | ? | ? | 7dad401d |
| `accent/primary/on-accent` | primary-foreground | ? | ? | 5e755c94 |
| `accent/primary/container-muted` | primary-muted | ? | ? | f51910b0 |
| `neutral/primary/default` | secondary | #17191D | ? | 082d1082 |
| `neutral/primary/hover` | secondary-hover | ? | ? | 2cb95313 |
| `neutral/primary/on-accent` | secondary-foreground | ? | ? | 850d035c |
| `neutral/primary/container-muted` | secondary-muted | ? | ? | c1195d12 |
| `neutral/secondary/flat default/default` | neutral-flat | #E0E5E8 | ? | - |
| `neutral/static/container-muted` | static-muted | #F0F3F4 | ? | - |
| `accent/positive/default` | success | #0FA976 | ? | - |
| `accent/negative/default` | destructive | #EF4444 | ? | - |
| `accent/static/default` | static | ? | ? | cc0476ad |
| `static/light` | static-light | #FFFFFF | ? | - |
| `supportive/filled/3` | supportive-3 | #10B981 | ? | - |
| `supportive/filled/5-hc` | supportive-5-hc | #F43F5E | ? | - |

Other 2.theme groups (keys in JSON, values `?`): `background/onsurface/3..6` -> surface-3..6; `background/global/{soft/active, clear/hover, clear/active, light/hover}` -> accent-active, state-*; `accent/primary/on-accent-muted` -> primary-foreground-muted; `neutral/primary/{active, on-accent-muted}`; `accent/static/{hover,active}`; `accent/positive|negative/{hover,active}` -> success-*/destructive-*; `border/accent/{warning,positive}`, `border/global/soft/hover` -> input-hover; `status/ghost/bg/{default,info,clear,error,accent,success,warning}` -> status-*-muted, `status/filled/bg/{info,clear,error,success,accent}` -> status-*, `status/ghost/text/{info,clear,error,accent}` -> status-*-foreground.

### Brand (1.brand; modes per product assumed: bank, kassa, artwin, travel)

| Figma variable | Token | Value (default mode) | Key |
|---|---|---|---|
| `brand/default` | brand | #16A34A | 3fcd6d12 |
| `brand/hover` | brand-hover | #189547 | 82a3be58 |
| `brand/active` | brand-active | ? | 1b3f03e7 |
| `brand/on-accent-muted` | brand-foreground-muted | #A9B4BC | - |
| `brand/ghost-container-muted` | brand-muted | #F0FDF4 | - |
| `neutral/brand/on-accent` | brand-foreground | #FFFFFF | - |

2.theme also holds fixed per-product colours `brand/{bank,kassa,artwin,travel}/{default,hover,active}` (tokens brand-bank, brand-bank-hover, ...; values `?`). Use them only for cross-product UI (logos, product switcher); everything else takes `brand` and the 1.brand mode.

### Radius (1.brand `radius/*`, duplicated by 4.border-radius `border-radius/*`)

| Figma | Token | px |
|---|---|---|
| `radius/none` | radius.none | ? |
| `radius/xss` | radius.2xs | 2 |
| `radius/xs` | radius.xs | 4 |
| `radius/s` | radius.sm | 8 |
| `radius/m` | radius.md | 12 |
| `radius/l` | radius.lg | ? |
| `radius/xl` | radius.xl | ? |
| `radius/xl-2` | radius.2xl | ? |
| `radius/xl-3` | radius.3xl | ? |
| `radius/xl-4` | radius.4xl | ? |
| `radius/full` | radius.full | ? |

Conflict: CRM topHeader resolves `radius/xs` = 8 (Web and Mobile: 4). Controls use 8-12 (`radius/s`, `radius/m`); chips, segment and FloatButton have a pill option.

### Spacing (no spacing in Foundation; three schemes in kits)

| Figma | Token | px | Seen in |
|---|---|---|---|
| `spacing/none` | space.0 | 0 | Web/CRM |
| `spacing/xs` | space.1 | 4 | Web/CRM |
| `spacing/s-1` | space.3 | 12 | Web/CRM |
| `spacing/s-2` | - | ? | Web/CRM |
| `spacing/s-3` | space.2 | 8 | Web/CRM |
| `spacing/m-1` | - | ? | Web/CRM |
| `spacing/l-1` | - | ? | Web/CRM |
| `spacing/l-2` | - | ? | Web/CRM |
| `spacing/xl-1` | - | ? | Web/CRM |
| `spacing/xl-2` | - | ? | Web/CRM |
| `spacing/xxl-1` | - | ? | Web/CRM |
| `spacing/xxl-2` | - | ? | Web/CRM |
| `spacing/m-2-base` | space.4 | 16 | Web/CRM |
| `paddings/default/none` | space.0 | 0 | Mobile/CRM |
| `paddings/default/xs` | space.1 | 4 | Mobile/CRM |
| `paddings/default/s` | space.2 | 8 | Mobile/CRM |
| `paddings/default/s-2` | space.3 | 12 | Mobile/CRM |
| `paddings/default/m-2` | space.4 | 16 | Mobile/CRM |
| `paddings/default/l` | space.5 | 20 | Mobile/CRM |
| `paddings/default/xs 2` | space.1 | 4 | Mobile/CRM |
| `rem/default/{4,8,10,12,14,16,20}` | - | ? (name suggests px) | Web/CRM padding |

### Shadows (effect styles, keys not read)

- web (Web components, each published twice): `shadow/none`, `shadow/top/s`, `shadow/top/m`, `shadow/top/l`, `shadow/top/xl`, `shadow/bottom/s`, `shadow/modal`
- mobile (Mobile KIT): `shadow/modal`, `shadow/Default`, `shadow/tooltip`

Visual: flat UI, shadows only on overlays (dropdowns, modals, tooltips).

### Z-index (text table on Foundation page Z-Index, not variables)

| Layer | hide | default | dropdown | sticky | fab | overlay | loader | modal | toast | popover | tooltip |
|---|---|---|---|---|---|---|---|---|---|---|---|
| z | -1 | 0 | 1000 | 1100 | 1200 | 1300 | 1400 | 1500 | 1600 | 1700 | 1800 |

## 3. Typography

| Style | Kit | Family / weight | Size / line height |
|---|---|---|---|
| `font/Heading/h1..h6` | web | Inter Mbank | ? / ? (metrics not read) |
| `body/large, body/medium, body/small` | mobile | Nunito | ? / ? |
| `font/Body/xs` | web | Inter Mbank Regular | 13 / 16 |
| `font/Body/xs-md` | web | Inter Mbank Medium | 13 / 16 |
| `font/Body/s` | web | Inter Mbank Regular | 14 / 20 |
| `font/Body/s-md` | web | Inter Mbank Medium | 14 / 20 |
| `font/Body/m` | web | Inter Mbank Regular | ? / ? |
| `font/Body/m-md` | web | Inter Mbank Medium | ? / ? |
| `font/Body/l` | web | Inter Mbank Regular | 16 / 24 |
| `font/Body/l-md` | web | Inter Mbank Medium | 16 / 24 |
| `font/Body/xl` | web | Inter Mbank Regular | ? / ? |
| `font/Body/xl-md` | web | Inter Mbank Medium | ? / ? |
| `font/Body/s-strong` | web | Inter Mbank Bold | 14 / 20 |
| `font/Body/xl-strong` | web | Inter Mbank Bold | 18 / 26 |
| `label/large-prominent` | mobile | Nunito Bold | 16 / 24 |
| `label/medium-prominent` | mobile | Nunito Bold | 14 / 20 |

Variables: `font/size/body/{xs,s,l}` = 13/14/16, `font/height/body/{xs,s,l}` = 16/20/24, `font/family/primary` = Inter Mbank (web), `font/family/Primary` = Nunito (mobile). UI text is Medium 500.

## 4. Components

States are normalized (default, hover, focus, pressed, disabled, error, loading, selected). `type` is inferred from variant properties.

### Web components (kit web) - 103

| Component | Page | Key | Variants | States |
|---|---|---|---|---|
| Avatars | Avatar | a3d5e794 | Size=96 px/88 px/80 px/72 px/…(15); Placeholder=False/True; Upload=False/True; Name=True/False | default |
| alert-text | Alert | 862527fc | Property 1=Default/Attantion/Warning/success/Error | default, error |
| item / accordion / bottomInfo | Accordion | 0e1633b2 | - | default |
| Item  / accordion / states | Accordion | a6ca0d05 | size=m; selected=off/on | default, selected |
| Item / accordion / header | Accordion | 3d2b0cad | state=default/hover/active | default, hover, pressed |
| accordion | Accordion | 4d26ed47 | Property 1=row | default |
| item/pagintaion / buttons | Pagination | 2255ec92 | size=l/m/s; Type=number/arrow; hover=false/true; Selected=false/true; disabled=false/true | default, hover, selected, disabled |
| item/pagination/page/dropdown | Pagination | b938355a | size=l/m/s; state=default/active | default, selected |
| pagination/basic | Pagination | f225fc73 | type=basic/more pages; size=l/m/s; align=left/center/right | default |
| Item / dropdown / default | DropdownMenu | e0cec33c | Type=Single selection/Multi selection; Size=l/m/s; State=Default/hover/selected | default, hover, selected |
| Item / dropdown / list-cells | DropdownMenu | b3aea8e6 | Type=default/group/result none; Size=l/m/s | default |
| Item / dropdown / simple-cells | DropdownMenu | 80482c75 | Type=default; Size=l/m/s | default |
| Item / dropdown / groupTitle-items | DropdownMenu | d719ef07 | Size=l/m; Divider=on/off | default |
| Item / multiCalendar-items | DropdownMenu | e8082acb | Type=default/currentDay/selectedDay/multiSelected/selectYear/multiSelectedYear | default, selected |
| molecules / Calendar-items | DropdownMenu | 6b2f4c01 | Type=default/Selected/MultiSelected/CurrentDay/…(10) | default, selected |
| molecules / Calendar-items | DropdownMenu | 757de7d4 | - | default |
| atoms / month+year | DropdownMenu | 22395e4e | Property 1=month/year/single month/default/single year | default |
| atoms / monthYearCell-items | DropdownMenu | a3aff9d8 | state=default/active single/active start/active mid/…(7) | default, selected, hover, focus |
| atoms / day-items | DropdownMenu | e948f92a | state=default/active single day/active start/active mid/…(10); disabled=false/true | default, selected, hover, focus, disabled |
| atoms / dayName-items/dayName | DropdownMenu | 97a14ed5 | - | default |
| Action Sheet Container | DropdownMenu | c0b98a02 | bg=True/False | default |
| Item / dropdown / simple | DropdownMenu | 79cec158 | size=l/m/s; Property 1=Default/hover | default, hover |
| atoms | DropdownMenu | 146c5ec9 | State=TimeCell-items/hover/Selected | default, hover, selected |
| button/default | Button | 713c9040 | size=xl/l/m/s/xs; variant=primary/brand/secondary/negative/…(9); state=default/hover/active/disabled/loading; neutralState=off/on | default, hover, pressed, disabled, loading |
| closebutton | Button | fc77caad | size=xl/l/m/s; state=ghost/light | default |
| Breadcrumb | BreadCrumbs | 385c08c2 | Count=2/3/4/4+ | default |
| FloatButton | FloatButton | 96fa4021 | Type=primary/secondary; Size=l/m/s; States=default/hover/active; rounded=off/on | default, hover, pressed |
| Badge-status | Badge & Counter | f25dcf8a | Size=XS/S/M/L; Form=rounded/squired; Appearance=Default/Accent/Success/Info/…(7); Status=Off/On; Icon=Off/On; Solid=on/off | default, error |
| Badge-counter | Badge & Counter | 88f9d9b1 | size=l/m/s; Counter=1+/9+/99+; color=red/gray/green/blue; invert=off/on | default |
| badge-dot | Badge & Counter | 43a1d0d9 | Property 1=red/orange/gray/green/…(9) | default |
| rating-basic | Rating | f8e9564d | type=brand/neutral; size=m; state=Default/hover/selected-1/selected-2/…(7) | default, hover, selected |
| rating-custom | Rating | 90a14242 | state=Default/hover/selected-sad/selected-normal/selected-smile | default, hover, selected |
| item-dot | Carousel | 5b663787 | active=on/off | default, selected |
| dot-row | Carousel | 67ac62c6 | - | default |
| Item / chipsButton | Chips | a2f7f177 | type=primary/secondary/outline; size=l/m/s; state=default/selected/hover/disabled; rounded=off/on | default, selected, hover, disabled |
| chipsButton | Chips | 112a70d0 | size=l/m/s; type=primary/secondary/outline; rounded=off/on | default |
| toast | Toast | 17ef4420 | state=default/error/info/success/warning; Type=Light/Dark | default, error |
| item / Drag & Drop | Upload | ebdcd7af | Property 1=Default/active; Type=area/Button | default, pressed |
| item / files | Upload | 9285bfac | state=uploading/uploaded/error/download/state5 | default, loading, error |
| upload/drag&drop | Upload | af2d4d95 | Property 1=Default/uploaded | default |
| upload/default | Upload | 7b583d65 | size=m; Property 1=default/uploading/error/uploaded/hover uploaded/error hover | default, loading, error, hover |
| molecul-progressbar-segments | Progress Bar & Uploading | 642dcd3f | - | default |
| Progress circle | Progress Bar & Uploading | 54846bb7 | size=s/m/l/xl; bottom text=on/off | default |
| Progress bar / Determinate | Progress Bar & Uploading | cf474781 | size=s/m/l; bottom text=on; square=off/on; rounded=off/on | default |
| Progress-Step/Default | Progress Bar & Uploading | d335a37e | - | default |
| Progress-Scrubber/Basic | Progress Bar & Uploading | bda4572a | - | default |
| Progress-Line | Progress Bar & Uploading | 1c2d0e92 | type=percent text/icon status/stepper; state=default/Success/Exeption; size=l/m; rounded=off/on | default, error |
| Item / segmentButtons | Segment & Tabs | d3dce4a1 | size=l/m/s; selected=on/off; fixed=off/on | default, selected |
| Item / tabOutlineButtons | Segment & Tabs | b6519d0e | size=l/m/s; states=active/normal/hover; fixed=off/on | default, selected, hover |
| Item / tabOutlineButtonsVertical | Segment & Tabs | 50b87c8f | right=on/off; size=l/m/s; states=selected/normal/hover; fixed=off/on | default, selected, hover |
| Item / tabLine | Segment & Tabs | aa7ce564 | size=l/m/s; states=normal/hover/active; fixed=off/on | default, hover, selected |
| Item / tabStepper | Segment & Tabs | e4c3361e | size=l/m/s; states=active/normal/hover; fixed=off/on | default, selected, hover |
| segment | Segment & Tabs | f28915a7 | size=l/m/s; quantity=8/7/6/5/…(7) | default |
| tab-outline | Segment & Tabs | d0547d5a | size=l/m; quantity=8/7/6/5/…(21) | default |
| tab-outline | Segment & Tabs | ec50e887 | size=l/m/s; quantity=9/8/7/6/…(8) | default |
| tab-stepper | Segment & Tabs | b14ead0d | size=l/m; quantity=8/7/6/5/…(21) | default |
| tab-outline-vertical | Segment & Tabs | d0f6474d | right=on/off; size=l/m/s | default |
| Chart | Charts | 88914b6e | Type=Lines/Coulm/Coulm group; Stacked=False/True; Hover=False/True | default, hover |
| Chart-tooltip | Charts | e477d6ca | - | default |
| item-stepper-basic | Stepper 🟠 | 954b3a3b | Property 1=active/error/not active/finished; Mobile=False/True | default, pressed, error |
| item-stepper-vertical-basic | Stepper 🟠 | ae3cebd9 | Property 1=normal/active/disabled | default, pressed, disabled |
| stepper-horizontal | Stepper 🟠 | 4d8a0444 | Vertical=False/True; Property 1=1/2/3/4/…(8) | default |
| input/default | ↪ Input | 9b99d128 | Size=L - 56px/M - 44px/S - 36px; State=default/hover/active/typing/…(10); Label Outside=off/on | default, hover, pressed, error, disabled |
| input/search | ↪ InputSearch | bdc52ccb | Size=l/m/s; State=default/hover/active/typing/filled/disabled | default, hover, pressed, disabled |
| input/counter | ↪ InputСounter | 338fa384 | Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, pressed, error, disabled |
| item-input-minplusButton | ↪ InputСounter | 2f254027 | - | default |
| input/password | ↪ InputPassword | 28499b52 | OnLight=off; Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on; Show password=off/on | default, hover, pressed, error, disabled |
| input/calendar-single | ↪ InputCalendar | 9015ffe0 | Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, selected, error, disabled |
| input/calendar-multi | ↪ InputCalendarMulti | 324c9152 | Mode=Gray; Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/selectedDateOne/…(10); Label Outside=off/on; OnLight=on | default, hover, selected, selected, error, disabled |
| input/dropdown | ↪ InputDropdown | a51f7990 | Size=L - 56px/M - 44px/S - 36px; State=default/hover/active/typing/…(10); Label Outside=off/on | default, hover, pressed, error, disabled |
| input/filter-dropdown | ↪ InputFilterDropdown | 1ea4ca08 | Size=L - 56px/M - 44px/S - 36px; State=default/active/typing/filled/…(8); Label Outside=off/on; Hover=False/True | default, pressed, error, disabled, hover |
| input/phone | ↪ InputPhone | b40b3876 | Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, pressed, error, disabled |
| input/phone-international | ↪ InputPhoneInternational | 1561b937 | Mode=Gray; Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, pressed, error, disabled |
| input/time-picker | ↪ InputTime | 257ef42e | Size=L - 56px/M - 44px/S - 32px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, pressed, error, disabled |
| TextArea | ↪ TextArea | f5e8ed2f | Size=L/M/S; State=default/hover/active/typing/…(10); Label Outside=off/on | default, hover, pressed, error, disabled |
| marks | ↪ InputSlider | 31a3122a | Position=start/middle/end; active=off/on | default, selected, pressed |
| marks-range | ↪ InputSlider | 6ae81d16 | Property 1=6/7/8 | default |
| inputSlider | ↪ InputSlider | 1e60d117 | Size=L - 56px/M - 44px; State=default/hover/active/typing/…(9); Label Outside=off/on | default, hover, pressed, error, disabled |
| slider-marks | ↪ InputSlider | 1c102fe0 | Property 1=start/half | default |
| slider | ↪ InputSlider | c418488c | Property 1=start/middle/full | default |
| Switchers - Check | Switchers - Check | be053b39 | Type=Checkbox/Radiobutton/Toggle; State=default/hover/disabled; Size=l/m/s; Selected=off/on | default, hover, disabled, selected |
| dialogInfo | Dialog | 12ed29cb | Image=on/off; State=Error/Warning/Positive/Neutral; DuoButton=on/off | default, error |
| dialogConfirm | Dialog | fb9525d2 | Property 1=Default/negative; Type=Desktop/Mobile | default, error |
| dialogForm | Dialog | f15b7fde | Property 1=Default/Success | default |
| dialogForm | Dialog | c7e1a2d3 | Property 1=Default; align=left/center | default |
| item-otpContainer | OTP | d12dbdec | size=l; state=default/active/typing/error/Filled | default, pressed, error |
| otpInput | OTP | 05cf3de2 | code=on/off; state=default/active/typed/error | default, pressed, error |
| otp | OTP | 62d25040 | Type=Default/Filled/Error/Resend | default, error |
| tooltip | Tooltip | cb5b8f83 | Position=Top Left/Top/Top Right/Right Top/…(12); Inverted=off/on; Resizable=off/on | default |
| Tooltip | Tooltip | 02d8a501 | Rotate=Top/Right/Buttom/Left; Dark=False/True | default |
| spinner | Spinner | 03ca97e3 | Size=12 – XS/16 – S/20 – M/24 – X/…(7); Mode=Primary/onLight/onDark | default |
| overlay | Overlay | d7c7ed2b | Type=default; Size=m/l | default |
| ImageSlot | ↪ Image | ab60ab70 | Aspect ratio=1:1/1:2/2:1/2:3/…(37) | default |
| ImageSlot | ↪ Image | 26790236 | Ratio=1:1/4:3/3:2/16:10/…(12); Placeholder=off/on | default |
| Text Slots / Text | ↪ Text | 298225d9 | Truncate text=false/true | default |
| user-existing | ↪ Вход/Регистрация 🟠 | 7776809d | - | default |
| Status Bar - iPhone & Android | Native | 00fc526c | Device=Android/iPhone; Background=True/False | default |
| Keyboard / Default | Native | f60578af | Type=Lower Case/Upper Case/Numerals/Numbers | default |
| Cursor | Native | 51e5d7c8 | cursor=grabbing/crosshair/default/help/…(13); OS=Mac/Windows | default |
| Hint | Native | 1f9e6c7b | Cursor Type=Pointer/Caret/Arrow/Disable/No cursor | default, disabled |
| Scroll | Native | 00ab2154 | OS=Windows/Mac; Hover=False/True | default, hover |
| scrollbar | Native | 23ddbbc4 | Vertical=off/on; State=Normal/Active/Hover | default, pressed, hover |
| cursor | Native | 4f49211b | Property 1=Default/Variant2 | default |

### CRM UI KIT (kit crm) - 37

| Component | Page | Key | Variants | States |
|---|---|---|---|---|
| sideMenu | side menu | f4eb0421 | type=default/short/short+subcategory | default |
| sideMenu/type4 | side menu | 0b8f9f4a | - | default |
| item-sidemenu-menu-tree-1 | side menu | 9789323b | size=m; state=default/default-more/selected on white/selected on gray/short | default, selected |
| item-sidemenu-menu-tree-2 | side menu | 5a3b5cd2 | size=m; state=default/default-more/selected/hover/short | default, selected, hover |
| item-sidemenu-menu-tree-states | side menu | e29d49b9 | State=Default/Selected/Opened | default, selected |
| item-sidemenu-menu-tree-dropdown | side menu | 94a384ee | Property 1=Default-selected/dropdown/hover/default | default, selected, hover |
| item-sidemenu-menu-avatar | side menu | 6df0be9f | Property 1=Default/short | default |
| widget-slidemenu-default-menu-1 | side menu | 02ec35d8 | closed=off/on | default |
| header (side menu) | side menu | 4d3c3acb | Property 1=Default/short | default |
| logoCont | side menu | 720b5702 | short=off/on | default |
| logoCont (dup name) | side menu | 810a1061 | Property 1=Default/Mpeople | default |
| buttonsSidemenu | side menu | 38c6d65e | Property 1=default/hover | default, hover |
| item-buttonSide-menu | side menu | 827d03be | - | default |
| Add New Widget | side menu | 741ec81d | - | default |
| crmOverlay | side menu | 8ea6d3c0 | - | default |
| Frame 851213252 | side menu | 398e50dc | - | default |
| topHeader | Header | 8514e4cd | Type=Default/subheader | default |
| table/row/base | table v1 | cee8a22d | mobile=off/on; type=base/topheader; count=1..10 | default |
| table/row/expand | table v1 | e4829690 | expanded=off/on; mobile=on/off | default |
| item/cell/basic | table v1 | a2f88fdf | ☏ Mobile=off/on; Width=80/100/120/140/…(11); Align=left/right/center | default |
| item/cell/header | table v1 | e28abae9 | - | default |
| item/cell/listing | table v1 | f55177a6 | Width=content/140/180/200/…(8) | default |
| item/cell/data listing | table v1 | 1563d3e6 | Width=content/140..360 | default |
| item/table-cell/header/sorter | table v1 | 68cd1b7a | state=default/hover; Sort order=inactive/↓ descending/↑ ascending | default, hover |
| item/table-cell/header/filter | table v1 | 4e86a37c | Active=true/false; Hover=true/false | default, selected, hover |
| item/table-cell/header/search | table v1 | ea36f5da | Active=true/false; Hover=true/false | default, selected, hover |
| item/table-cell/header/checkbox | table v1 | 0a2baf9f | - | default |
| item/table-cell/status | table v1 | 29cbf76f | states=success/Accent/error/default/Processing/Warning | default, error, loading |
| item/table-cell/action | table v1 | 51b82bfb | seperated=on/off; items=3/3+/2/1/icon/icon4 | default |
| item/table-cell/button | table v1 | 2d45ba40 | count=3/2/1 | default |
| item/tablecell/leading/* and tailing/* (34 slot sets) | table v1 | - | - | default |
| TableSection 2.0 | Table 2 version | f4eabde9 | Type=TopHeader/Base/BG; Hover=False/True | default, hover |
| TableCell | Table 2 version | 75d931d4 | Type=Header/Cell; Min width=Hug/120/160/200/…(8) | default |
| TableСellContent 2.0 | Table 2 version | bb111de8 | Size=M/S; Type=ActionIcons/Shorting/Icons/Check-box/…(9) | default |
| TextContent | Table 2 version | 4eb1522a | Type=Text/Data; Size=14/16 | default |
| Widget-Chart | Charts | 4dd645cf | Type=columns; Time=Day/week/mount/3 mount | default |
| header (doc) | Документация | c32b04c3 | - | default |

### Mobile KIT (kit mobile) - 54

| Component | Page | Key | Variants | States |
|---|---|---|---|---|
| ElementFile | 🔥 To Do | 9a1c2dd4 | State=Button/Loading/Normal/Failed/No Preview | default, loading, error |
| Help / StatusElementFile | 🔥 To Do | 64bdd085 | Element=delete/delete-loading/warning-tr | default |
| Avatars | 👤 Avatars | a9581917 | Size=96 px/88 px/80 px/72 px/…(15); Photo=True/False; Online=False/True; Placeholder=False/True; Upload/icon=False/True | default |
| bttn / default | 🆗 Buttons | 8a0f6380 | size=xl/l/m/s; variant=primary/accent/secondary/static light/…(7); state=default/active/disabled/loading | default, pressed, disabled, loading |
| FloatButton | FloatButton | fa886162 | Type=primary/secondary; Size=l/m/s; States=default/hover/active; rounded=off/on | default, hover, pressed |
| badge | Badge | 78488056 | Size=L/M/S/XS; Form=rounded/squired; Appearance=Default/Accent/Success/Info/…(7); Status=Off/On; Icon=Off/On; Solid=on/off | default |
| Banner | Banner | b6bc642a | Text size=18/14 | default |
| Card | Cards | c2fb003e | View=icon/icon-bg/image/image-large; Description=off/on | default |
| ImageSlot | Image | 8a4e830f | Aspect ratio=1:1/1:2/2:1/2:3/…(37) | default |
| Counter | Counter | 1f568a5a | Counter=1+/9+/99+; Disabled=False/True; Color bg=False/True | default, disabled |
| chipsButton | Chips | 158b24dc | Size=l/m; State=default/selected; Onlight=off/on | default, selected |
| Cell/list item | Cell & list | 561d137e | Leading=none/icon/image/avatar; Trailing=none/checkbox/radio/switch/icon; Overline=false/true; Description=false/true; Badge=False/True | default |
| Cell data item | Cell & list | 8d74e9ff | Type=complex/simple; Space=12/8; Label=14/16; Divider=False/True | default |
| Section header | Cell & list | d207cac5 | Title size=14/16/22/24; Description=off/on | default |
| Tooltip | Tooltip | 3a2fed8e | Rotate=Top/Right/Buttom/Left; Dark=False/True | default |
| input | Input | 27543358 | type=on gray/border; Size=L - 56px/M - 44px/S - 32px; State=normal/active/typing/filled/…(9); Label Outside=off/on | default, pressed, error, disabled |
| input-phone | Input-phone | 82b9057d | type=on gray/border; Size=L - 56px/M - 44px/S - 32px; State=normal/active/typing/filled/…(9); Label Outside=off/on | default, pressed, error, disabled |
| Search | Input-search | b71f7c31 | State=default/active/typing/filled | default, pressed |
| input | Input-password | d18fb896 | type=on gray/border; Size=L - 56px/M - 44px/S - 32px; State=normal/active/typing/filled/…(9); Label Outside=off/on | default, pressed, error, disabled |
| TextArea | Input-text area | da2e55d3 | Size=L - 56px/M - 44px/S - 32px; State=default/active/typing/filled/…(8); Label Outside=off/on | default, pressed, error, disabled |
| inputDropdown | inputSelect | c4b3f730 | Type=Border/On gray; Size=L - 56px/M - 44px/S - 32px; State=normal/filled/error+normal/error-active/error+typing/disabled; Label Outside=off/on | default, error, disabled |
| slider | inputSlider | e8a6046b | Type=Count/middle/Range; Position=start/Middle/Finish | default |
| inputSlider | inputSlider | dd0d755e | Type=border/on gray; Size=L - 56px/M - 44px; State=default/active/typing/filled/…(8); Label Outside=off/on | default, pressed, error, disabled |
| switches | Selection Controls | 4fb76631 | Type=Checkbox/Radiobutton/Toggle; Size=l/m; Selected=off/on; Disabled=off/on | default, selected, disabled |
| Scroll line | Selection Controls | 4adf9932 | Counter=1/2/3/4/5 | default |
| Drag_Upload | Upload | 3e530b1a | Type=Area/Button/Icon; Property 1=File/Media/Open camera/Add | default |
| File | Upload | 4b184dfb | View=Cell/Card; State=uploading/File/Media | default, loading |
| item-stepper-basic | Stepper | 7d9c10dd | Size=Big/small; Orientation=Vertical/Horizontal; State=active/error/not active/finished | default, pressed, error |
| Top-app-bar | Top bar | cdd803b3 | Type=Small-center/on-scroll/Large/Search | default |
| Tab Bar | Tab bar | 5546b31b | Type=Android/iOS; liquid glass=False/True; label=off/on; Selected=1/2/3/4/5 | default, selected |
| atom / tabButtons | Tabs | 7569aefd | Selected=False/True | default, selected |
| Tabs with underline | Tabs | 7b37803d | quantity=2/3/4; BG=True/false | default |
| Tabs in pills | Tabs | 252dda68 | Size=xl/l/m; Type=accent/on gray/on light/accent 2; Select=False/True | default, selected |
| Tab Item | Segments | b701185b | State=Default/Active; Text=Off/On; Icon=Off/On; Size=Medium/Large | default, selected |
| Tab Item - accent | Segments | 7cd347c3 | Active=False/True; Text=Off/On; Icon=Off/On; Size=Medium/Large | default, selected |
| Segmented Control | Segments | c9ebea08 | Size=Medium/Large; Quantity=2/3/4/5 | default |
| Segmented Control - accent | Segments | 9bc3a70c | Size=Medium/Large; Quantity=2/3/4/5 | default |
| item-dot | Carousel | fe7c17c7 | active=on/off | default, selected |
| dot-row | Carousel | 3aaf0a10 | Count=1/2/3/4/…(8) | default |
| Alert | Alert & confirm | a735861e | Type=confirm/alert | default |
| Form Status | Alert & confirm | 795dce79 | Type=Default/Accent/Success/Warning/…(7) | default |
| Bottom sheet/info | Functional modal | b5bf689f | bg=true/false | default |
| Bottom sheet/confirmation | Functional modal | b30510f2 | bg=true/false | default |
| Action Sheet Container | Functional modal | a47ddf6c | bg=True/False | default |
| Modal: List | Functional modal | 35916236 | Searching=False/True; BG=True/False | default |
| Modal: list | Functional modal | 709501c4 | Searching=False/True | default |
| x / Base / Placeholder | Placeholders | a7c8b9dc | - | default |
| Notification | Notification | 0a56e73e | BG=on gray/on light | default |
| Top alerts | Notification | 67bfa123 | Property 1=Default/Show message/hide | default |
| Status Bar - iPhone & Android | Native components | 434ca11a | Device=Android/iPhone; Background=True/False | default |
| Keyboard / Default | Native components | cab51928 | Type=Lower Case/Upper Case/Numerals/Numbers | default |
| cursor | Native components | 787372a6 | Property 1=Default/Variant2 | default |
| alert-ios | Native components | 8aa67cd4 | Type=Prompt/Cascade/Input | default |
| Created by | Created by mark | 94ecef70 | Orientation=Horizontal/Vertical; Dark BG=On light/On dark/On color | default |

### Hero Section building parts - 40 (kit web)

logo `4752cc19`, item `95c2fe8b`, item-target `69fbbd61`, blogCard `8051170e`, blogCard-medium `b0229346`, cardBankProduct `dd44bbc7`, Partner `b3d843ab`, galleryItem `7d4bccaa`, apps / downLoad / button `5bad69dc`, item-infoBlock-hightPriory `d4dce9e6`, item-hero-infoBlock-lowPriory `0ef6a907`, item-infoBlock-medium-Priory `e8161a28`, item-stepper-default `36a05032`, item-partner `39ed1cf4`, Youtube player `b55aca22`, video `99ed8b7e`, item-faq `9dd07fc3`, item-faq-block-answerCont `528bedf8`, item-downloadFile-multi `1427199c`, item-downloadFile-large `3482bbde`, item-downloadFile-small `508f68b0`, item-downloadFIle-medium `4fb56a52`, Created by `78c31f66`, item-features-small `a7432516`, item-features-medium `7bfb152c`, item-hero-reward-large `b17be041`, item-hero-reward-small `200072e5`, item-hero-possibility-large-lineTitle-one `d14df91d`, item-hero-possibility-medium `96506369`, item-hero-person-medium `28e8ae8a`, item-hero-possibilityBanner-large `cd5c384a`, item-features-large `7a649f4d`, item-hero-image-logos `46154cc7`, listing `6d56d452`, button-apps `45d10601`, stepCard `d13d1703`, MMarket_logo-01 (2) 1 `0ee9c061`, item2-features-medium `f231eb8c`, item-bannerDefault `4823a866`, Frame 2087326547 `f14949b5`.

Layout slots (Web components, page Blocks): 30 empty auto-layout containers `Vertical×1..12`, `Horizontal×1..12` (+ nesting levels) for composing content.

## 5. Blocks

| Block | Kit | Category | Key | Breakpoints | Contains |
|---|---|---|---|---|---|
| Header | web | header | cd8ce3e4 | Desktop | logo, search |
| Footer | web | footer | 786dc536 | Desktop | - |
| hero-image-logo | web | hero | 4ffa41a3 | Desktop | button/default, item-hero-image-logos |
| hero-image-default | web | hero | d696fd91 | Desktop | button/default |
| hero-possibility-large | web | features | 167eb902 | Desktop | button/default, item-hero-possibility-large-lineTitle-one |
| hero-possibilityBanner-large | web | features | 477125f1 | Desktop | item-hero-possibilityBanner-large |
| hero-hero-reward--large | web | features | 21d448c7 | Desktop | item-hero-reward-large |
| hero-features-small | web | features | b960a403 | Desktop | item-features-small |
| hero-features-medium | web | features | 2799e082 | Desktop | item-features-medium |
| hero-features-large | web | features | e79426f0 | Desktop | item-features-large |
| hero-reward-small | web | features | b22c9b05 | Desktop | item-hero-reward-small |
| hero-possibility-small | web | features | b6c7ba57 | Desktop | button/default, item-hero-possibility-medium |
| hero-target | web | features | ef3d8f11 | Desktop | item-target |
| hero-multi | web | features | 061aeae6 | Desktop | button/default, item-features-small |
| hero-banner | web | cta | 1865a408 | Desktop, Mobile | button/default |
| hero-blog | web | card-grid | 6cd995e3 | Desktop | blogCard |
| hero-blog-medium | web | card-grid | 09e67378 | Desktop | blogCard-medium |
| hero-blog-mini | web | card-grid | a607882f | Desktop | button/default, item2-features-medium |
| hero-product | web | card-grid | c35c1288 | Desktop | cardBankProduct, segment |
| hero-calculator | web | form-layout | cbf74bce | Desktop | Cell/list item, Form Status, Section header, button/default, input/dropdown, inputSlider |
| hero-partner | web | other | 317703e8 | Desktop | Partner, dot-row |
| hero-gallery | web | other | 295274e8 | Desktop | FloatButton, Partner, dot-row, galleryItem |
| hero-InfoBLock | web | other | a33db072 | Desktop | item-hero-infoBlock-lowPriory, item-infoBlock-hightPriory, item-infoBlock-medium-Priory |
| hero-segment | web | other | 51be3133 | Desktop, Mobile | segment |
| hero-stepper | web | features | 53a4106e | Desktop | button/default, item-stepper-default |
| hero-stepper-screen | web | features | f260a29e | Desktop | button/default, stepCard |
| hero-listing | web | other | 3a489169 | Desktop | listing |
| hero-partners | web | other | c6902c09 | Desktop | button/default |
| hero-partnersColor | web | other | d44abe0e | Desktop | Item / chipsButton, button/default, item-partner |
| hero-video-column | web | other | 32294ac8 | Desktop | video |
| hero-faq-row | web | faq | c03b0545 | Desktop | item-faq |
| hero-downloadFile | web | other | 902c9068 | Desktop, Mobile | button/default, file, item-downloadFIle-medium, item-downloadFile-large, item-downloadFile-multi, item-downloadFile-smal |
| hero-formApply | web | form-layout | d930163a | Desktop | Switchers - Check, button/default, input/default, input/phone, upload/drag&drop |
| hero-possibility | web | form-layout | 632fc87e | Desktop | Section header, Switchers - Check, TextArea, alert-text, button/default, input/calendar-single, input/default, input/dro |
| hero-possibility | web | form-layout | dc507718 | Desktop | Switchers - Check, TextArea, button/default, input/default, input/phone, upload/drag&drop |
| hero-createdby | web | other | 865f7169 | Desktop | Created by |
| hero-condition | web | table | 5d993918 | Desktop | segment |
| hero-table | web | table | 1bda4ce5 | Desktop, Mobile | TableSection 2.0, input/dropdown, item/pagintaion / buttons, scrollbar, segment |
| hero-banner-default | web | other | f49042b3 | Desktop, Mobile | item-bannerDefault |
| sideMenu | crm | sidebar | f4eb0421 | Desktop | logoCont, header, item-sidemenu-menu-tree-states, Add New Widget, listMenu, item-buttonSide-menu, item-sidemenu-menu-ava |
| topHeader | crm | header | 8514e4cd | Desktop | Search, button/default, Bell, setting, Avatars, chevron-cell |
| table/row/base + item/cell/* | crm | table | cee8a22d | Desktop, Mobile | item/cell/basic, item/cell/header, leading/tailing slots |
| TableSection 2.0 (table v2) | crm | table | f4eabde9 | Desktop | TableCell, TableСellContent 2.0, TextContent |
| Widget-Chart | crm | card-grid | 4dd645cf | Desktop | segment, input/calendar-multi, Chart-tooltip |
| Frame 851213253 / 851213254 (sideMenu + empty content area 1360/1920) | crm | page-template | - | Desktop | sideMenu |
| Описание ячеек (cell docs: Default/Hover/Hover Action/Editable/Editable confirm) | crm | other | - | - | - |
| Top-app-bar | mobile | nav | cdd803b3 | Mobile | - |
| Tab Bar | mobile | nav | 5546b31b | Mobile | - |
| Status Bar - iPhone & Android | mobile | native | 434ca11a | Mobile | - |
| Bottom sheet/info, Bottom sheet/confirmation, Action Sheet Container, Modal: List, Modal: list | mobile | dialog | - | Mobile | - |
| x / Base / Placeholder | mobile | empty-state | a7c8b9dc | Mobile | - |
| Keyboard / Default, alert-ios, cursor | mobile | native | - | Mobile | - |

## 6. Icons

- Library: **Icons** (`mS7YDd02ncMJH43DFk2Ixy`), own Mbank set (naming and styles resemble Hugeicons; not Lucide).
- Count: 3075 published = 2776 icon sets + 33 standalone + 266 flags; 2781 unique names.
- Strategy: one component set per icon, variant `Style` = Line / Outlined / Solid / Duo Tone; placed through INSTANCE_SWAP. Default style: **Line**.
- Size: 24 px only (16 px exists only as the slot `IconSlots / Icon 16x16`).
- Naming: flat kebab-case English noun phrases, no size/category prefix: 'airplane', 'electric-car-front-view', 'square-delete', 'no-money'; numeric suffix rare ('bookmark-01'); flags = ISO-3166 alpha-2 lowercase ('kg','zw') on page 'flag', built on external '_flagBase'
- Categories: transport (airplane, bus, electric-car); arrows/navigation (circle-nw-arrow, chevron-*, direction-left-arrow); files/docs (file-*, folder-*, search-file); actions (add-*, remove-*, delete-*, check-*, cancel-*, edit-*); users (add-user, block-group, cash-user); finance (change-money, no-money, bitcoin-search, bank-location, atm-location); cloud/security (cloud-*, lock-*, shield-*, malware-*, password-cross); communication (bubble-*, remove-call, Reply, Forward); media/music (music-*, upload-music, disc); text editor (align-*, bold-*, right-alignment, letter-sort); maps/location (*-location, map-layer, y-junction); weather/nature, food, health, sport (full-moon, nachos, kidney, swimming-glasses); AI (ai-*, music-ai); brand logos (standalone) (mbank-logo, Mbank-icon, MPay, Mpay-logo, mbonus-logo, mbusiness-logo, mtravel-logo, minvest-logo, mkassa-logo, mcafe-logo, msilamic-logo, logo_adal, logo_murabaha, asia-logo, telegram, whatsapp); slots (IconSlots / Icon 24x24, IconSlots / Icon 16x16, empty-slot)
- Logos: mbank-logo, Mbank-icon, MPay, Mpay-logo, mbonus-logo, mbusiness-logo, mtravel-logo, minvest-logo, mkassa-logo, mcafe-logo, msilamic-logo, logo_adal, logo_murabaha, asia-logo, telegram, whatsapp
- Flags: page `flag`, ISO 3166-1 alpha-2 lowercase (`kg`, `kz`).
- Hygiene: 28 duplicate names, 50 sets with `Property 1` instead of `Style`, 40 sets with `Outlned` (see gaps.md).

## 7. Code Connect

Published in Figma: 0/233 (published per file: Web 134, Hero 79, CRM 79, Mobile 54). Code mapping rules: `code-mapping.md`.

Figma -> code map: design-engine `references/components-map.json` (2026-10-31), 92 of 233 components linked to `@mdigital/mbank-ui` (9 mapped + 57 partial; web 5 + 35, crm 4 + 22), 94 missing (kit backlog), 20 ignore, 54 mobile out of scope. Each JSON component has `code.web` filled from it. Check, backlog and Code Connect files: `node plugins/design-engine/scripts/components-map.mjs check | report | code-connect --out <dir>`.

## 8. Gaps

27 gaps: 3 blocker, 12 major, 12 minor (JSON `gaps[]`, ids G01..G27). Report for the designers, in Russian, with a fix per item: `gaps.md`.

- **G01 2.theme / 1.brand / 3.Primitive Colors values**: Only ~30 colour values resolved (from nodes); palette and typography specimen pages unreachable via MCP (page list truncated); hue ramps unknown
- **G02 1.brand, 2.theme**: Mode names unconfirmed (Light/Dark and bank/kassa/artwin/travel assumed); brand colours exist both as 1.brand modes (assumed) and as brand/<product>/* variables in 2.theme
- **G03 font family**: Web/CRM use 'Inter Mbank' (font/family/primary), Mobile uses 'Nunito' (font/family/Primary); Inter Mbank files and licence not supplied

## 9. Changelog

- 2026-10-09 Full-seat read: all values, modes (2.theme light/dark; 1.brand bank/kassa/travel/artwin/koko), text and effect styles; fonts re-checked (Inter Mbank, SF UI Display still missing)
- 2026-10-07 created from the Foundation, Web components, Hero Section, CRM UI KIT, Mobile KIT and Icons inventories (Dev seat, no use_figma)
