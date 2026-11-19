# Mbank kit components: props, variants, Figma mapping

Source files: [`registry/mbank/components`](../../../registry/mbank/components). Figma names come from figma-pack `mbank-design-system/references/code-mapping.md` section 7 and `catalog.md`. Every component accepts `className` (merged last with `cn`), spreads native props, takes `ref` as a normal prop (React 19) and sets `data-slot`.

## Props and variants

| Component (file) | Parts | Variants / props | Default |
|---|---|---|---|
| `Button` (button.tsx) | - | `variant`: primary (shadcn default look), secondary, destructive, outline, ghost, link. `size`: xs 32, sm 36, md 44, lg 56, icon-sm, icon, icon-lg. `loading` (spinner + disabled + `aria-busy`), `asChild` | primary / md |
| `Input` (input.tsx) | - | `size`: sm 36, md 44, lg 56. States: `aria-invalid`, `disabled` | md |
| `Textarea` (textarea.tsx) | - | auto-grows (`field-sizing-content`), `aria-invalid`, `disabled` | - |
| `Label` (label.tsx) | - | Radix Label; dims with a disabled peer or `data-disabled` group | - |
| `Badge` (badge.tsx) | - | `tone`: neutral (secondary look), accent (primary look), error (destructive), clear (outline). `shape`: rounded, square. `size`: sm, md, lg. `asChild` | neutral / rounded / md |
| `Card` (card.tsx) | CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | composition only | - |
| `Checkbox` (checkbox.tsx) | - | Radix; `checked` true / false / "indeterminate", `aria-invalid` | - |
| `Switch` (switch.tsx) | - | Radix; `checked`, `disabled` | - |
| `Tabs` (tabs.tsx) | TabsList, TabsTrigger, TabsContent | `TabsList variant`: segment, outline, line | segment |
| `Dialog` (dialog.tsx) | DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay | `DialogContent showCloseButton` | true |
| `Select` (select.tsx) | SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator | `SelectTrigger size`: sm, md, lg; `SelectContent position` (popper) | md |
| `Skeleton` (skeleton.tsx) | - | size it with `className` (`h-4 w-40`) | - |
| `Table` (table.tsx) | TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption | `TableRow data-state="selected"` | - |
| `Alert` (alert.tsx) | AlertTitle, AlertDescription | `tone`: clear, error (`role="alert"` for error, else `status`) | clear |
| `Avatar` (avatar.tsx) | AvatarImage, AvatarFallback | `size`: xs 24, sm 32, md 40, lg 56, xl 72 | md |
| `Tooltip` (tooltip.tsx) | TooltipProvider, TooltipTrigger, TooltipContent | shadcn look (`bg-primary text-primary-foreground`); one `TooltipProvider` per app | - |
| `DropdownMenu` (dropdown-menu.tsx) | Trigger, Content, Group, Item, CheckboxItem, Label, Separator, Shortcut | `DropdownMenuItem variant`: default, destructive | default |
| `Pagination` (pagination.tsx) | - | controlled `page` (1-based), `pageCount`, `onPageChange`; page-size select with `pageSize` + `onPageSizeChange` (+ `pageSizeOptions`); `size`: sm, md, lg; `align`: left, center, right; `summary` text; `siblingCount`; `labels`. Helper `getPaginationRange` | md / right |
| `DataTable` (data-table.tsx + data-table-body / -toolbar / -columns) | DataTableToolbar, DataTableColumnHeader, dataTableSelectColumn() | `columns`, `data` (TanStack `ColumnDef`), `loading` (+ `loadingRows`, Skeleton rows), `empty` slot (pass `<EmptyState />`), `toolbar` (render fn or `null`), `searchPlaceholder`, `paginated`, `initialPageSize` 20, `pageSizeOptions`, `getRowId`, `tableOptions` (controlled state, `manualPagination` + `rowCount` for server data). Column title for the visibility menu: string `header` or `meta.label` | - |
| `Popover` (popover.tsx) | PopoverTrigger, PopoverAnchor, PopoverContent | Radix; stacking as shadcn ships it (no z-index tokens) | - |
| `Calendar` (calendar.tsx) | CalendarDayButton | react-day-picker v9 props: `mode` single / range / multiple, `selected`, `onSelect`, `disabled` matchers, `numberOfMonths`, `captionLayout="dropdown"` (month + year). Russian locale by default (`locale` to change) | ru, outside days on |
| `DatePicker`, `DateRangePicker` (date-picker.tsx) | - | `value` (Date / DateRange), `onValueChange`, `size`: sm, md, lg, `placeholder`, `formatDate` (default 31.10.2026), `disabledDays`, `calendarProps` (captionLayout, startMonth, endMonth, locale), native `aria-invalid`, `disabled`, `id`. Range shows 2 months (`numberOfMonths`) | md |
| `Progress` (progress.tsx) | ProgressCircle | `value` 0-100 (null = indeterminate), `size`: sm, md, lg, `shape`: rounded, square, `showValue` (percent text); indicator `bg-primary` on `bg-primary/20`. `ProgressCircle`: `value`, `size` sm, md, lg, xl, `children` = text under it | md / rounded |
| `Accordion` (accordion.tsx) | AccordionItem, AccordionTrigger, AccordionContent | Radix `type` single (+ `collapsible`) / multiple; `variant`: line, card (FAQ) | line |
| `Sheet` (sheet.tsx) | SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription | `SheetContent side`: right, left, top, bottom; `size`: md, lg; `showCloseButton` | right / md |
| `Toaster` (sonner.tsx) + `toast` | - | one `<Toaster />` in the app root (`position` top-right); `toast()`, `toast.success / error / warning / info / promise`. Unstyled sonner on kit tokens, follows `.dark` | - |
| `ChartContainer` (chart.tsx + chart-tooltip.tsx) | ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, `useChart` | `config: ChartConfig` (`{ key: { label, color?, icon? } }`); series use `fill` / `stroke` = `var(--color-<key>)`; no colour -> `chart-1..5` in order. Tooltip: `indicator` dot / line, `hideLabel`, `nameKey`, `labelFormatter`, `valueFormatter` (ru numbers) | - |
| `EmptyState` (EmptyState.tsx, in `shared/components`) | - | `title`, `description?`, `action?`, `icon?` (same API as `react-ux`) | - |
| `Spinner` (spinner.tsx) | - | `size`: sm 16, md 20, lg 24 (bigger via `className`); colour from `currentColor` | sm |
| `Separator` (separator.tsx) | - | `orientation`: horizontal, vertical; `decorative` (default true, else `role="separator"`) | horizontal |
| `RadioGroup` (radio.tsx) | RadioGroupItem | Radix; `primary` fill when checked, `disabled` | - |
| `SearchInput` (search-input.tsx) | - | native `type="search"` input with the search icon; `size`: sm 36, md 44, lg 56 | md |
| `FilterChip` (filter-chip.tsx) | - | `selected` (`aria-pressed`, `bg-primary text-primary-foreground`), `chevron` (default true); opens a Popover / DropdownMenu | - |
| `NavItem` (nav-item.tsx) | - | link: `active` (`aria-current="page"`), `icon?`, `count?`, `aria-disabled` | - |
| `TabbarItem` (tabbar-item.tsx) | - | mobile bottom bar link: `active`, `icon?` | - |
| `BreadcrumbItem` (breadcrumb-item.tsx) | - | `label`, `href?`, `current` (no separator, `aria-current="page"`); put items in `nav > ol` | - |
| `StepperStep` (stepper-step.tsx) | - | `status`: done, current, upcoming; `number`, `label`, `description?`; put steps in an `ol` | upcoming |

## Figma component to code

| Mbank Figma component | Kit code | Notes |
|---|---|---|
| `button/default` (Web), `bttn / default` (Mobile) | `Button` | Figma variant -> `variant`: primary, secondary, negative -> destructive, flat -> ghost, outline; brand / positive / flat filled / static have no code variant any more: use primary or secondary. `state=loading` -> `loading`. `neutralState=on` (tone) is not implemented yet |
| `closebutton` | `Button variant="ghost" size="icon-sm"` + close icon | give it `aria-label` |
| `input/default`, `input/password`, `input/phone` (`input/search` -> `SearchInput`) | `Label` + `Input` | Size L / M / S -> `lg` / `md` / `sm`. `Label Outside=on` -> visible `Label`. `error` -> `aria-invalid` + error text with `aria-describedby` |
| `TextArea` | `Label` + `Textarea` | |
| `input/dropdown`, `Item / dropdown / default` | `Select` | Multi selection -> Combobox with checkboxes (not in the kit yet) |
| `Item / dropdown / simple`, `Action Sheet Container` | `DropdownMenu` | |
| `Switchers - Check` Type=Checkbox / Toggle / Radiobutton | `Checkbox` / `Switch` / `RadioGroupItem` | |
| `segment`, `Item / segmentButtons` | `TabsList variant="segment"` | Use ToggleGroup when it filters data instead of switching panels |
| `tab-outline`, `Item / tabOutlineButtons` | `TabsList variant="outline"` | |
| `Item / tabLine` | `TabsList variant="line"` | `tab-stepper` -> stepper component (not in the kit yet) |
| `Badge-status` | `Badge` | Appearance -> `tone`: Error -> error, Default -> neutral, Attention -> accent, others -> neutral / clear with the meaning in the label. Solid has no code equivalent (`fill` removed), Form squired -> `shape="square"` |
| `Badge-counter`, `badge-dot` | `Badge` with a number / `className="size-2 p-0"` | |
| `alert-text` | `Alert` | Error -> `tone="error"`, every other state -> `clear` |
| `dialogInfo`, `dialogForm` | `Dialog` | `dialogConfirm` -> AlertDialog built the same way |
| `tooltip`, `Tooltip` | `Tooltip` | |
| `Avatars` | `Avatar` | Placeholder -> `AvatarFallback` |
| `TableSection 2.0`, `TableCell`, `table/row/*` | `DataTable` (list screens) or plain `Table` | `item/table-cell/header/sorter` -> `DataTableColumnHeader`; header search -> `DataTableToolbar` global search; header filter and `table/row/expand` are not in the kit yet |
| `pagination/basic`, `item/pagintaion / buttons`, `item/pagination/page/dropdown` | `Pagination` | size l / m / s -> lg / md / sm, align -> `align`; DataTable already renders it |
| `input/calendar-single`, `input/calendar-multi` | `DatePicker`, `DateRangePicker` | Size L / M / S -> `lg` / `md` / `sm`, error -> `aria-invalid` |
| `molecules / Calendar-items`, `atoms / day-items`, `atoms / month+year` | `Calendar` | month / year grid views are not built: `captionLayout="dropdown"` |
| `Progress bar / Determinate`, `Progress-Line`, `Progress circle` | `Progress`, `ProgressCircle` | `percent` -> `showValue`; Success / Exeption states are shown by text, not colour |
| `accordion`, `Item / accordion / *`, `item-faq` | `Accordion` | FAQ look -> `variant="card"` |
| `Chart`, `Chart-tooltip` | `ChartContainer` + recharts `LineChart` / `BarChart`, `ChartTooltipContent` | Coulm group / Stacked -> `BarChart` with `stackId` |
| side panels (details, filters next to a table) | `Sheet` | mobile Bottom sheet on the web -> `side="bottom"` |
| `spinner` | `Spinner` | |
| `Item / chipsButton` (type outline) | `FilterChip` | toolbar filters; other chip types are not in the kit |
| `item-sidemenu-menu-tree-1` | `NavItem` (CRM shell: `SideMenuItem`) | state selected -> `active` |
| `Breadcrumb` | `BreadcrumbItem` (CRM header: `Breadcrumbs`) | |
| `item-stepper-basic` | `StepperStep` (CRM: `StageStep`) | finished / active / not active -> done / current / upcoming |
| Starter KIT `Skeleton` | `Skeleton` | Web components has no skeleton (G11 / G12) |
| (none, G12) empty states | `EmptyState` | |
| `toast` | `Toaster` + `toast()` (sonner.tsx) | state -> `toast.success / error / info / warning`; Light / Dark follows `.dark` |
| `otp`, `slider`, time picker | shadcn component as is (shadcn tokens) | Not in the kit yet (backlog: design-engine `components-map.mjs report`) |

## Tokens

Components use only the standard shadcn tokens (list: [`shadcn-tokens.json`](../../../registry/mbank/shadcn-tokens.json)). The Figma variables are bound to the same shadcn names (owner figma-pack `ds-tokens`), so there is no Figma-to-CSS mapping table any more; the old Mbank variables (`background/onsurface/*`, `status/*`, `1.brand`, `text/link` …) are not used in code.
