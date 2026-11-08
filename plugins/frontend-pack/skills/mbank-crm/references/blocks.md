# CRM blocks

Source: [`registry/mbank/blocks/crm`](../../../registry/mbank/blocks/crm). Install with `add-ui.mjs <name>` (or `blocks` for all) into `--blocks-dir` (default `src/shared/components/crm`); kit dependencies come along. Import as `@/shared/components/crm/<File>`. Blocks import the kit from `@/shared/ui/*`, so keep the kit there.

Figma: file `vVuM5uw3TsWo1xm3vJelXG`, frames 35:29 (board) and 35:178 (application). Links are optional props everywhere: `renderLink` receives `{ className, children, ... }` and returns the router's `Link` (default: a plain `<a href>`), so the blocks do not depend on a router.

## crm-app-shell

| Component | Figma | Props |
|---|---|---|
| `CrmLayout` | frame: sideMenu 280 + Content | `sideMenu`, `header`, `banner?` (OfflineBanner), `collapsed?` (72px rail), `children` (page). Side menu from 1024px; body `p-4 sm:p-6` on `surface-1` |
| `SideMenu` | 35:30 `sideMenu` | `brand`, `sections: SideMenuSectionData[]`, `footerSections?`, `user?`, `activeId?`, `renderLink?`, `collapsed?`, `onToggleCollapsed?` (shows «<<»), `label?` |
| `SideMenuSection` | `listMenu` + `header` 36px | `section` (`id`, `title?`, `items`, `collapsible?`, `action?`), `activeId?`, `collapsed?`, `renderLink?` |
| `SideMenuItem` | `item-sidemenu-menu-tree-states` 44px | `item` (`id`, `label`, `href`, `icon?`, `badge?`), `active?` (aria-current=page, white surface), `collapsed?`, `renderLink?` |
| `SideMenuUser` | user card at the bottom of `sideMenu` | `name`, `role?`, `avatarSrc?`, `initials`, `children?` (DropdownMenuItem: Профиль, Выйти) |
| `SideMenuSheet` | — (mobile, not in Figma) | `children` (the same `SideMenu`), `label?`. Menu button `lg:hidden` + left drawer on the kit Dialog; closes on link click |
| `TopHeader` | 35:32 `topHeader` 68px | `title?` (h1), `breadcrumbs?`, `back?`, `leading?` (SideMenuSheet), `search?` (hidden < 768), `actions?`, `user?`. Sticky, `z-(--z-sticky)` |
| `Breadcrumbs` | 35:181 `topHeader subheader` | `items: { id, label, href? }[]`, `renderLink?`. Last item = current page, never truncates; parents hide below 768 |
| `HeaderSearch` | 35:39 `Search` 272×36 | `onSearch(query)`, `placeholder?`, `label?`, `defaultValue?`. `role="search"` form, submits on Enter |
| `HeaderIconButton` | 35:42 / 35:44 `iconCont` 36 | Button props + `label` (aria-label), `indicator?` (red dot, adds «есть новые» to the label) |
| `UserMenu` | 35:48 `avatarCont` | `name`, `role?`, `avatarSrc?`, `initials`, `children` (menu items). Name/role from 1280px |

Types: `side-menu-types.ts` (`SideMenuItemData`, `SideMenuSectionData`, `RenderSideMenuLink`).

## crm-kpi-card — `KpiCard` (35:59, 266×128)

`label`, `value?` (formatted), `delta?` (with sign: «+14%», «−18 мин»), `deltaLabel?` («к вчера»), `deltaTone?: positive | negative | neutral`, `loading?` (skeletons, `aria-busy`). Tone is about meaning, not sign: fewer overdue applications is `positive`.

## crm-period-segment — `PeriodSegment` (35:55 Period, 35:57 segment 48px)

`title` (h2), `value`, `onValueChange`, `options: { value, label }[]`, `children` (rendered as the active tab panel), `label?`. Built on kit Tabs: a real tablist + tabpanel; full width on phones.

## crm-board (35:1908 Board)

| Component | Figma | Props |
|---|---|---|
| `Board` | `Board`, 12px gaps | `children` (BoardColumn), `label?`. 5 columns ≥1280 (min 200), horizontal snap scroll below |
| `BoardColumn` | `Column <stage>` header 48 | `title` (h3), `count` (badge, «N заявок» for screen readers), `sla?`, `children` (cards, wrapped in `li`), `footer?` (ShowMore), `emptyText?` |
| `ApplicationCard` | 35:1919 `CRM / Application card` 140px | `id`, `time`, `title`, `amount`, `meta?`, `status?: { label, tone }`, `href`, `renderLink?`. Whole card is one link |
| `ShowMore` | 35:1958 `Show more` 28px | `count` (renders nothing at 0), `label?(count)`, Button props (`onClick`) |
| `BoardSkeleton` | — | `columns?`, `cards?`, `label?` (`role="status"`) |

Card badge tones used in the frame: SLA `info`, SLA at risk `warning`, «Просрочено N мин» `error`, statuses («Ждёт ответа бюро», «Ждёт подписи», «Закрыта») `neutral`.

## crm-key-value (35:225 cards, 35:228 row)

- `KeyValueSection`: `title` (h2), `children` (rows, inside a `dl`), `action?`. Card p 20, `role="region"` named by the title.
- `KeyValueRow`: `label`, `children` (value), `tone?: default | error | warning | success | muted`. 36px row, label column 180px + 16 gap, value medium, top-aligned (contract `crm-key-value-row`); stacks on phones. Problem values (a missing document) use `tone="error"`.

## crm-stage-stepper (35:2217 Stages)

- `StageStepper`: `stages: { id, title, state, meta? }[]`, `label?`. Card p 20, equal columns; vertical list on phones.
- `StageStep`: `title`, `state: done | current | upcoming | failed` (green / orange + bold / grey / red dot, state also in sr-only text, `aria-current="step"`), `meta?`.

## crm-timeline (35:267 History, 35:269 item)

- `Timeline`: `title` (h2), `children` (items, newest first, in an `ol`), `empty?`.
- `TimelineItem`: `title`, `meta?`, `tone?` (dot colour: border/accent/* as drawn), `dateTime?` (renders `<time>`).

## crm-transfer-row — `TransferRow` (23:10079 `CRM / Transfer row`)

`transfer: { id, dateTime, sender, recipient, country, amount, channel, status: { label, tone } }`, `onOpen?(id)` (row becomes focusable, Enter/Space open the transfer card), `className?`. A `TableRow` of 8 `TableCell`s with right dividers and a Badge-status; put it in `<Table><TableBody>` under `TableHead`s «ID, Дата и время, Отправитель, Получатель, Страна, Сумма, Канал, Статус». Column widths come from the table, not the row.

Contracts: the five blocks the designers re-created locally (Key-value row, Application card, Transfer row, KPI card, Timeline item) and List item have `mbank/component@1` contracts `registry/mbank/contracts/crm-*.json` (`code.kind: "block"`): every part has `data-slot="<slot>-<part>"`, checked by `contract-to-code --check`. Keep the slots when editing these blocks.

## crm-list-item — `ListItem` (`CRM / List item`, contract crm-list-item)

`title`, `subtitle?`, `meta?` (time, amount or a Badge), `initials?` / `src?` (Avatar md 40), `li` props. Row gap 12, px 16 py 12, divider at the bottom (none on the last item); put items in a `<ul>` and wrap the content in a link or button when the row opens a card.

## crm-summary-header — `SummaryHeader` (35:212 Summary)

`title` (the page h1, `tabIndex=-1` for focus after an action), `titleRef?`, `status?: { label, tone }`, `amount?`, `context?`, `actions?`. Figma button order: Отклонить (`destructive`), Запросить документы (`soft` + `bg-secondary-muted text-link`), Одобрить кредит (`primary`), all `size="sm"`; on phones they stack full width, primary on top.

## crm-score-card — `ScoreCard` (35:249 Scoring)

`title?`, `score`, `scoreTone?: success | warning | error`, `scale?` («из 900 · модель v3.2»), `risk?: { label, tone }`, `reasons?: { id, text, tone? }[]`, `meta?`.

## crm-status-dot — `StatusDot`

`tone?: success | warning | error | info | neutral | brand`, `size?: sm (6px) | md (12px)`. Decorative (`aria-hidden`): put the meaning in the text next to it.

## crm-icons

`SearchIcon`, `BellIcon`, `SettingsIcon`, `ChevronLeftIcon`, `ChevronsLeftIcon`, `PlusIcon`, `MenuIcon`, `MoreVerticalIcon` and menu icons (`HomeIcon`, `UserIcon`, `UsersIcon`, `ChartIcon`, `ClockIcon`, `ListIcon`, `LayersIcon`, `MapPinIcon`, `ScanIcon`, `FileCheckIcon`, `FileIcon`, `DownloadIcon`, `EyeIcon`, `AlertIcon`, `ShieldIcon`, `BookIcon`, `LifeBuoyIcon`). Placeholders until the Mbank Icons export (mbank-ui «Icons»).

## Kit component added with the CRM kit

`alert-dialog` (`registry/mbank/components/alert-dialog.tsx`): `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`. No `AlertDialogAction` on purpose — see the list of handled gotchas in [SKILL.md](../SKILL.md).
