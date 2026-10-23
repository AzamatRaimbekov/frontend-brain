# Mbank kit components: props, variants, Figma mapping

Source files: [`registry/mbank/components`](../../../registry/mbank/components). Figma names come from figma-pack `mbank-design-system/references/code-mapping.md` section 7 and `catalog.md`. Every component accepts `className` (merged last with `cn`), spreads native props, takes `ref` as a normal prop (React 19) and sets `data-slot`.

## Props and variants

| Component (file) | Parts | Variants / props | Default |
|---|---|---|---|
| `Button` (button.tsx) | - | `variant`: primary, brand, secondary, destructive, success, soft, ghost, outline, static, link. `size`: xs 32, sm 36, md 44, lg 56, icon-sm, icon, icon-lg. `loading` (spinner + disabled + `aria-busy`), `asChild` | primary / md |
| `Input` (input.tsx) | - | `size`: sm 36, md 44, lg 56. States: `aria-invalid`, `disabled` | md |
| `Textarea` (textarea.tsx) | - | auto-grows (`field-sizing-content`), `aria-invalid`, `disabled` | - |
| `Label` (label.tsx) | - | Radix Label; dims with a disabled peer or `data-disabled` group | - |
| `Badge` (badge.tsx) | - | `tone`: neutral, accent, success, warning, error, info, clear. `fill`: ghost, solid. `shape`: rounded, square. `size`: sm, md, lg. `asChild` | neutral / ghost / rounded / md |
| `Card` (card.tsx) | CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | composition only | - |
| `Checkbox` (checkbox.tsx) | - | Radix; `checked` true / false / "indeterminate", `aria-invalid` | - |
| `Switch` (switch.tsx) | - | Radix; `checked`, `disabled` | - |
| `Tabs` (tabs.tsx) | TabsList, TabsTrigger, TabsContent | `TabsList variant`: segment, outline, line | segment |
| `Dialog` (dialog.tsx) | DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay | `DialogContent showCloseButton` | true |
| `Select` (select.tsx) | SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator | `SelectTrigger size`: sm, md, lg; `SelectContent position` (popper) | md |
| `Skeleton` (skeleton.tsx) | - | size it with `className` (`h-4 w-40`) | - |
| `Table` (table.tsx) | TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption | `TableRow data-state="selected"` | - |
| `Alert` (alert.tsx) | AlertTitle, AlertDescription | `tone`: clear, accent, info, success, warning, error (`role="alert"` for error / warning, else `status`) | clear |
| `Avatar` (avatar.tsx) | AvatarImage, AvatarFallback | `size`: xs 24, sm 32, md 40, lg 56, xl 72 | md |
| `Tooltip` (tooltip.tsx) | TooltipProvider, TooltipTrigger, TooltipContent | inverse surface; one `TooltipProvider` per app | - |
| `DropdownMenu` (dropdown-menu.tsx) | Trigger, Content, Group, Item, CheckboxItem, Label, Separator, Shortcut | `DropdownMenuItem variant`: default, destructive | default |
| `EmptyState` (EmptyState.tsx, in `shared/components`) | - | `title`, `description?`, `action?`, `icon?` (same API as `react-ux`) | - |
| `Spinner` (spinner.tsx) | - | colour from `currentColor` | - |

## Figma component to code

| Mbank Figma component | Kit code | Notes |
|---|---|---|
| `button/default` (Web), `bttn / default` (Mobile) | `Button` | Figma variant -> `variant`: primary, brand, secondary, negative -> destructive, positive -> success, flat filled -> soft, flat -> ghost, outline, static. `state=loading` -> `loading`. `neutralState=on` (tone) is not implemented yet |
| `closebutton` | `Button variant="ghost" size="icon-sm"` + close icon | give it `aria-label` |
| `input/default`, `input/password`, `input/phone`, `input/search` | `Label` + `Input` | Size L / M / S -> `lg` / `md` / `sm`. `Label Outside=on` -> visible `Label`. `error` -> `aria-invalid` + error text with `aria-describedby` |
| `TextArea` | `Label` + `Textarea` | |
| `input/dropdown`, `Item / dropdown / default` | `Select` | Multi selection -> Combobox with checkboxes (not in the kit yet) |
| `Item / dropdown / simple`, `Action Sheet Container` | `DropdownMenu` | |
| `Switchers - Check` Type=Checkbox / Toggle | `Checkbox` / `Switch` | Radiobutton -> shadcn RadioGroup styled the same way (not in the kit yet) |
| `segment`, `Item / segmentButtons` | `TabsList variant="segment"` | Use ToggleGroup when it filters data instead of switching panels |
| `tab-outline`, `Item / tabOutlineButtons` | `TabsList variant="outline"` | |
| `Item / tabLine` | `TabsList variant="line"` | `tab-stepper` -> stepper component (not in the kit yet) |
| `Badge-status` | `Badge` | Appearance -> `tone` (Default -> neutral), Solid -> `fill="solid"`, Form squired -> `shape="square"` |
| `Badge-counter`, `badge-dot` | `Badge` with a number / `className="size-2 p-0"` | |
| `alert-text` | `Alert` | Default -> clear, Attantion -> accent, Warning, success, Error |
| `dialogInfo`, `dialogForm` | `Dialog` | `dialogConfirm` -> AlertDialog built the same way |
| `tooltip`, `Tooltip` | `Tooltip` | |
| `Avatars` | `Avatar` | Placeholder -> `AvatarFallback` |
| `TableSection 2.0`, `TableCell`, `table/row/*` | `Table` (+ TanStack Table DataTable) | |
| `spinner` | `Spinner` | |
| Starter KIT `Skeleton` | `Skeleton` | Web components has no skeleton (G11 / G12) |
| (none, G12) empty states | `EmptyState` | |
| `toast` | `sonner` `toast()` | Not in the kit: style the Toaster with `bg-card` / `status-*` tokens |
| `Breadcrumb`, `pagination/basic`, `accordion`, `Progress bar`, `otp`, calendars | shadcn component restyled with kit tokens | Not in the kit yet |

## Token to Figma variable

| Tailwind token | Figma variable |
|---|---|
| `background`, `foreground`, `muted`, `muted-foreground` | `background/surface/light`, `text/default`, `background/surface/soft`, `text/muted` |
| `card` / `surface-0..6` | `background/onsurface/0..6` |
| `accent`, `accent-active` | `background/global/soft/hover`, `/active` |
| `border`, `border-secondary`, `border-subtle` | `border/divider/primary`, `/secondary`, `/tetriary` |
| `input`, `input-hover`, `input-disabled` | `border/global/soft/default`, `/hover`, `/disabled` |
| `primary*` | `accent/primary/*` |
| `secondary*` | `neutral/primary/*` (foreground: `static/light`, G04) |
| `soft*`, `ghost*`, `outline*` | `neutral/secondary/flat filled/*`, `flat/*`, `outline/*` |
| `destructive*`, `success*`, `static*` | `accent/negative/*`, `accent/positive/*`, `accent/static/*` |
| `status-<role>`, `-muted`, `-foreground` | `status/filled/bg/<role>`, `status/ghost/bg/<role>`, `status/ghost/text/<role>` |
| `brand*`, `brand-text`, `ring` | `1.brand` `brand/*`, `text/brand`, `border/accent/brand` |
| `link`, `destructive-text`, `warning-text`, `success-text` | `text/link`, `text/danger`, `text/warning`, `text/positive` |
| `overlay` | `misc/overlay/default` |
