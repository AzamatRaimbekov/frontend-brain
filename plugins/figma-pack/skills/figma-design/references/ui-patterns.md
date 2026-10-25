# UI and UX patterns for Mdigital screens

What goes inside the frames. The design system decides the look (tokens, components); these rules decide layout, hierarchy, states and behaviour. Where the catalog and these rules disagree, the catalog wins and the conflict goes into the report.

Collected 2026-10-12 from Vercel Web Interface Guidelines, ui-ux-pro-max (priority table), Material 3 and Apple HIG (navigation, targets), WCAG 2.2, anthropics `frontend-design`, and our own CRM/mobile runs (`mbank-figma-patterns`). Sources: `sources.md` 27-32.

## 1. Priority order when rules collide

1. Task first: the user's main job is visible without scrolling, and the primary action is obvious.
2. Accessibility: contrast 4.5:1 text / 3:1 UI and large text; targets 24x24 web, 44 pt iOS, 48 dp Android; status never by colour alone (text or icon too).
3. Consistency with the design system and with the other screens of the same file.
   Variants of one screen (iOS / Android, 1440 / 375) carry the same content and the same actions - only the layout adapts. Compare them side by side in the Section before reporting (a verified miss: the QR button was on iOS and absent on Android).
4. Density right for the role: operators scan many rows (dense), clients do one task (calm).
5. Polish: alignment, rhythm, no orphan elements.

## 2. App shell (CRM, admin, back office)

- **Layout 1440:** sidebar 240-280 expanded (64-72 collapsed) + content. Content padding 24, block gap 16-24, one value per page. Content max-width ~1280 on very wide screens.
- **Sidebar:** product logo on top; groups with small caps labels (`ПЕРЕВОДЫ`, `АДМИНИСТРИРОВАНИЕ`); 5-9 items per group, verbs or nouns of one kind; exactly **one selected item** = the current page (the detail page selects its parent list); icons from the library, same style for all items; user and role at the bottom; help/settings in a last group. No item that leads nowhere.
- **Top header:** page title (or breadcrumbs `Раздел / Список / Объект` on detail pages), global search with a concrete placeholder ("ID перевода, телефон или ФИО"), notifications, user. Page actions sit in the page, not in the global header, unless they are global (Export).
- **Page head:** title + short meta (count, period) on the left, the page's primary action on the right. One primary button per page; others secondary/flat; destructive = negative variant and never the primary position.

## 3. Dashboards

- Order: period switcher -> **KPI row** (3-5 cards) -> one or two charts -> a "needs attention" list or table with a link to the full list.
- KPI card: label (muted), value (large, tabular numbers), delta with sign and comparison base ("+8,2% к вчера"); delta colour **and** sign; the card links to the filtered list.
- Charts: title says what is measured and the unit; axes labelled; legend when >1 series; the period matches the page switcher; no 3D, no pie with >5 slices.
- Every number on a dashboard answers "and what should I do?" - pair alarming numbers with the queue that resolves them.

## 3a. Pipelines: board and stepper (credit conveyor, onboarding, orders)

- **Board** when the work moves through 3-6 stages and the operator picks the next item: one column per stage, in process order left to right. Column head: stage name + count badge + the stage SLA in one muted line. Cards are one local component (instances, never copies): id + time on top, the person, the amount large, product and term, one SLA badge. Badge colour = time left, the same rule everywhere (info: in time, warning: under 15 min, error: overdue, neutral: paused/closed).
- Show 3-5 cards per column and "Показать ещё N"; the KPI row above the board counts the same items (e.g. "Просрочен SLA 9" = the red badges).
- **Stepper** on the object page: a card under the header with the same stages, done = positive dot + time + result, current = warning dot + bold name + SLA, next = muted. Its stages and wording match the board columns.
- The detail page selects its list in the sidebar, and its breadcrumbs name the same list ("Кредиты / На андеррайтинге / CL-240118"). Keep crumbs short: the header holds the search and the user too.
- Missing documents or blockers are shown where they are (the document row in danger colour) and the matching action is in the header ("Запросить документы").

## 4. Lists and tables

- Toolbar above the table: search (what it searches), 2-5 filters as dropdowns, "Сбросить" when any filter is set; active filters visible. Bulk actions appear only when rows are selected.
- Header row: short nouns; sortable columns show an affordance; the status column last or second; row height 40-48 (dense 40-44).
- Cells: one fact per column; identifiers first; **numbers and money right-aligned in tabular figures** with the currency; dates in one format (`12.10.2026, 14:32`); long text truncates with a tooltip, never wraps a row to 3 lines.
- Status as a badge with text (`На проверке AML`), colour by meaning: success / warning / error / info / neutral - the same mapping on every screen.
- Row click opens the detail; row actions (≤3) on hover or in a "..." menu.
- Footer: "Показано 1-10 из 12 480" + pagination + page size. Long tables keep the header visible.
- Mobile (375): tables become stacked cards with the 2-3 key facts; filters go to a bottom sheet.

## 5. Detail pages (an object: transfer, client, order)

- Header block: object id and type, the key fact large (amount), status badge, one line of context (route, date, channel), and the actions: primary on the right, destructive left of it, with a confirmation step.
- Body: two columns on desktop - facts on the left in titled cards (key-value rows: label 140-200 muted, value strong), context on the right (risk, history, comments). On mobile, one column in the same priority order.
- History/timeline: newest first, each event = what happened + when + who; colour dot plus text.
- Sensitive data masked by default (`2202 •••• •••• 4417`) with an explicit "show" for permitted roles.

## 6. Forms

- Labels always visible above fields (placeholder is an example, not the label); helper text under the field; required marked consistently.
- One column for forms up to ~8 fields; group with headings; logical order (who -> what -> how much -> confirm).
- Validation on blur and on submit; the error sits under the field, says what to do ("Введите 12 цифр ИНН"); a summary at the top for long forms.
- Buttons: the primary verb names the result ("Сохранить изменения", "Отправить перевод"), never "OK"/"Submit"; cancel is secondary. Submit stays enabled; disable only while submitting (loading state).
- Destructive or money-moving actions: confirmation dialog that restates the object and the consequence, or an undo window.

## 7. States (draw them, do not assume)

| State | Content |
|---|---|
| Loading | skeleton in the final layout (rows, cards), not a lone spinner on a blank page |
| Empty (first use) | what will be here + why it is empty + one action |
| Empty (no results) | the filter that caused it + "Сбросить фильтры" |
| Error | what happened in plain words + what to do + "Повторить"; keep the user's input |
| No access | why + who grants it + a way back |
| Partial / long content | longest names, 0 and 9 999 999 amounts, 1 vs many items - the layout survives |
| Success | toast or inline confirmation with the next step; never a dead end |

## 8. Mobile app screens

- Top bar with the title and back; bottom navigation 3-5 tabs with labels, one selected; the primary action in the thumb zone above the home indicator.
- Rows are 56-72 tall with a 44/48 hit area; one line title + one line supporting text; trailing chevron for navigation.
- Forms: the keyboard state is designed, the submit button stays visible above it; amounts use a numeric keyboard.
- Platform patterns: iOS large title, swipe back, action sheet; Android top app bar, FAB only for the single main creation action, snackbar.

## 9. Copy

- Product language (Russian by default), sentence case, no CAPS except sidebar group labels if the kit uses them.
- Real, plausible data: names of the region, realistic amounts and dates, statuses from the domain. No "Lorem", no "Title".
- Buttons are verbs; empty and error texts lead to the next step; numbers carry units.

## 10. Visual polish checklist (before the screenshot is accepted)

- [ ] Every element aligns to an edge or centre line of something else; equal gaps between equal things.
- [ ] One primary action per screen; one H1; at most 3 text sizes per card.
- [ ] Every platform/breakpoint variant in the Section has the same content and actions.
- [ ] Nothing clipped, wrapped by accident or overflowing (status badges, long names, breadcrumbs).
- [ ] Icons from the library only, one style, 16/20/24 px; no placeholder triangles, circles or cameras.
- [ ] Empty space is intentional: cards hug their content, the page does not end with a half-empty white card.
- [ ] The screen does not look "AI-generic": no gradients/glows/emoji, radius by role, real density.

## 11. Component quality (local components)

- Built so the developer can map it 1:1: auto layout, tokens, text styles, variants that match code props (`State`, `Size`, `Type`), text properties for copy, instance swap for icons.
- States included up front: Default, Hover, Focus (visible ring), Disabled, Loading where async, Error for inputs.
- Content survives: Fill width, Hug height, truncation rule for long text, min width for the smallest sensible content.
- Description says purpose, usage, do/don't and the code counterpart.
