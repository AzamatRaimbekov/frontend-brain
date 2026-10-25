# Accessibility audit: WCAG 2.2 AA page checklist

Rules come from `react-ui` [accessibility-ui.md](../../react-ui/references/accessibility-ui.md) (visual) and `react-ux` [accessibility-ux.md](../../react-ux/references/accessibility-ux.md) (behaviour). This file is the **checklist and procedure** to verify them on a finished page.

## Page checklist

Structure and names
- [ ] One `<h1>`; headings do not skip levels; `<title>` names the page (2.4.2).
- [ ] Landmarks: `header`, `nav` (labelled if several), `main`, `footer`; a skip link to `main` (2.4.1).
- [ ] Every control has an accessible name; icon-only buttons have `aria-label`; images have correct `alt` (1.1.1, 4.1.2).
- [ ] Every input has a visible label; required fields marked; errors linked with `aria-describedby` and announced (1.3.1, 3.3.1, 3.3.2).
- [ ] `lang="ru"` (or the active locale) on `<html>`; changed when the user switches language (3.1.1).

Keyboard and focus
- [ ] Everything works with keyboard only; no traps (2.1.1, 2.1.2).
- [ ] Focus order follows the visual order (2.4.3); focus always visible (2.4.7).
- [ ] Focus not hidden by sticky header, banners or chat widget (2.4.11, new in 2.2).
- [ ] Dialogs move focus in and return it to the trigger; focus after route change and deletion per `react-ux`.

Pointer and touch
- [ ] Targets ≥ 24×24 CSS px or spaced (2.5.8, new in 2.2).
- [ ] Every drag action has a single-pointer alternative (2.5.7, new in 2.2).
- [ ] Nothing triggers on pointer down only (2.5.2).

Visual
- [ ] Text contrast 4.5:1 (large 3:1), UI and focus indicators 3:1, in light and dark themes (1.4.3, 1.4.11).
- [ ] State is never shown by color alone (1.4.1).
- [ ] 200 % zoom and 320 px reflow without loss of content (1.4.4, 1.4.10); text spacing override does not break layout (1.4.12).
- [ ] Content on hover/focus (tooltips) is dismissible with Esc, hoverable, persistent (1.4.13).
- [ ] Respects `prefers-reduced-motion`; nothing flashes > 3 times per second (2.3.1).

Dynamic content and forms
- [ ] Status messages (results count, saved) announced via `role="status"` without moving focus (4.1.3).
- [ ] Session timeouts warn and allow extending (2.2.1).
- [ ] Help/contact is in the same place on every page (3.2.6, new in 2.2).
- [ ] No re-entry of data already given in the same process (3.3.7, new in 2.2).
- [ ] Login: no cognitive tests, paste and password managers allowed, OTP pasteable (3.3.8, new in 2.2).
- [ ] Changing a select or radio does not navigate or submit by itself (3.2.2).

## Procedure

1. **Lint**: `npm run lint` with `eslint-plugin-jsx-a11y`.
2. **Automated scan**: Chrome DevTools MCP `lighthouse_audit` on the production build, `device: 'mobile'` and `'desktop'`; fix every failing audit it lists with DOM nodes. Storybook projects: `@storybook/addon-a11y` per shared component. E2E projects: an axe check in the critical journeys (`react-testing` [e2e-playwright.md](../../react-testing/references/e2e-playwright.md)).
3. **Keyboard pass**: unplug the mouse mentally. Tab and Shift+Tab through the page; Enter/Space on every control; arrows in menus, tabs, radio groups, listboxes; Esc in every overlay. Note where focus goes after each action.
4. **Zoom / reflow**: browser zoom 200 %; `emulate` viewport `320x640x1`; check nothing is cut and there is no horizontal scroll outside tables.
5. **Contrast and themes**: `emulate` `colorScheme: 'dark'` and `forcedColors: 'active'`; check focus rings and borders stay visible.
6. **Motion**: `emulate` `prefersReducedMotion: 'reduce'`; skeleton shimmer and transitions become static.
7. **Screen reader smoke test** (VoiceOver: Cmd+F5 on macOS; NVDA on Windows): navigate by headings (VO+Cmd+H) and landmarks, fill the main form with an error, trigger an async update and listen for the announcement.
8. **Write down** the result in the page's `UX.md`: date, what passed, open issues with SC numbers.

## APG pattern map

Before building a widget, check whether a shadcn primitive already implements the pattern.

| Need | APG pattern | Use |
|---|---|---|
| Modal window | Dialog (Modal) | shadcn `Dialog`, `AlertDialog`, `Sheet`, `Drawer` |
| Show/hide section | Disclosure | `Collapsible`, `Accordion` (Accordion pattern) |
| Tabs | Tabs | `Tabs` (arrow keys move between tabs) |
| Action list from a button | Menu Button + Menu | `DropdownMenu` |
| Pick one from a list with typing | Combobox | `Combobox` / `Command` inside `Popover` |
| Single choice, few options | Radio Group | `RadioGroup` |
| On/off setting | Switch | `Switch` |
| Hint on hover and focus | Tooltip | `Tooltip` (never the only place for essential info) |
| Data table with sorting | Table (static) / Grid (interactive cells) | `Table` + `@tanstack/react-table`; Grid only when cells are editable |
| Hierarchy | Tree View | no shadcn primitive: custom, follow APG Tree View exactly |
| Range value | Slider | `Slider` |
| Carousel | Carousel | `Carousel` (embla) with pause and visible controls |

Custom implementation rules and checklist: `react-ui` accessibility-ui.md, section "Custom widget checklist".
