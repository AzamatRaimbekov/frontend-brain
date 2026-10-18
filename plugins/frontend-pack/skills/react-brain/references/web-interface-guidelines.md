# Web Interface Guidelines

Apply this checklist to every changed interface file. During implementation, follow each applicable rule; before finishing, review the changed files and fix findings. For a standalone review, inspect the requested files and report concise, file-grouped findings in the format at the end.

## Accessibility

- Icon-only buttons need `aria-label`.
- Form controls need `<label>` or `aria-label`.
- Interactive custom elements need keyboard handlers (`onKeyDown`/`onKeyUp`); prefer native controls with built-in keyboard behavior.
- Use `<button>` for actions and `<a>`/`<Link>` for navigation, never `<div onClick>`.
- Images need `alt` (`alt=""` when decorative); decorative icons need `aria-hidden="true"`.
- Async updates (toasts, validation) need `aria-live="polite"`.
- Prefer semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) before ARIA.
- Keep headings hierarchical (`<h1>`–`<h6>`); include a skip link to main content.
- Add `scroll-margin-top` to heading anchors.
- Give meaningful media captions, transcripts, or descriptions as appropriate. Media controls need keyboard support; hide decorative media from assistive technology.

## Focus States

- Interactive elements need visible focus: `focus-visible:ring-*` or an equivalent.
- Never use `outline-none` / `outline: none` without a replacement focus style.
- Prefer `:focus-visible` to `:focus` to avoid showing a ring after pointer clicks.
- Use `:focus-within` for compound controls.
- Sticky headers, footers, and overlays must not cover the focused element.

## Forms

- Inputs need `autocomplete` and a meaningful `name`.
- Use the correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`.
- Never block paste with `onPaste` and `preventDefault`.
- Make labels clickable with `htmlFor` or by wrapping the control.
- Disable spellcheck on emails, codes, and usernames (`spellCheck={false}`).
- Checkboxes and radios: label and control share one hit target with no dead zones.
- Keep submit enabled until the request starts; show a spinner during the request.
- Place errors inline beside fields; focus the first error on submit.
- Placeholders end with `…` and show an example pattern.
- Use `autocomplete="off"` on non-auth fields to avoid password-manager triggers.
- Warn before navigation with unsaved changes (`beforeunload` or a router guard).

## Animation

- Honor `prefers-reduced-motion` with a reduced variant or by disabling non-essential motion.
- Animate `transform`/`opacity` only where practical for compositor-friendly motion.
- Never use `transition: all`; list properties explicitly.
- Set the correct `transform-origin`.
- For SVG, transform a `<g>` wrapper with `transform-box: fill-box; transform-origin: center`.
- Animations must be interruptible and respond to user input mid-animation.
- Autoplay motion over five seconds alongside other content needs pause, stop, or hide controls.
- Muted decorative loops must stop under `prefers-reduced-motion`.

## Typography

- Use `…`, not `...`.
- Use curly quotes `“ ”` in prose, not straight quotes.
- Use non-breaking spaces for units and shortcuts: `10&nbsp;MB`, `⌘&nbsp;K`.
- Loading states end with an ellipsis: `Loading…`, `Saving…`.
- Use `font-variant-numeric: tabular-nums` for number columns and comparisons.
- Use `text-wrap: balance` or `text-pretty` on headings to prevent widows.

## Content Handling

- Text containers handle long content with `truncate`, `line-clamp-*`, or `break-words`.
- Flex children need `min-w-0` to allow text truncation.
- Handle empty states; do not render broken UI for empty strings or arrays.
- Anticipate short, average, and very long user-generated content.

## Images

- Images need explicit `width` and `height` to prevent layout shift.
- Below-fold images use `loading="lazy"`.
- Above-fold critical images use `priority` or `fetchpriority="high"`, according to the framework.

## Performance

- Virtualize large lists (over 50 items) with an appropriate tool such as `virtua` or `content-visibility: auto`.
- Do not perform layout reads during render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`).
- Batch DOM reads and writes; avoid interleaving them.
- Prefer uncontrolled inputs; controlled inputs must stay cheap per keystroke.
- Add `<link rel="preconnect">` for CDN and asset domains when they are used.
- Preload critical fonts with `<link rel="preload" as="font">` and use `font-display: swap`.
- Prefer muted, inline video to animated GIF when suitable; provide a still alternative.
- For short non-essential loops, use a Safari H.264 MP4 source, a `prefers-reduced-motion` media condition, and a still fallback.

## Navigation & State

- Keep the URL in sync with stateful filters, tabs, pagination, and expanded panels when deep links or browser navigation matter.
- Use `<a>`/`<Link>` for navigation to preserve Cmd/Ctrl-click and middle-click.
- For stateful UI, consider URL sync via `nuqs` or the project's equivalent.
- Destructive actions need a confirmation modal or undo window; never run immediately.

## Touch & Interaction

- Set `touch-action: manipulation` to prevent double-tap zoom delay where appropriate.
- Set `-webkit-tap-highlight-color` intentionally.
- Use `overscroll-behavior: contain` in modals, drawers, and sheets.
- For fine-pointer layouts, consider `overscroll-behavior: none` on `<html>`; preserve coarse-pointer defaults for pull-to-refresh. On hybrid devices, `pointer` describes the primary input, and `none` also disables scroll chaining and native swipe navigation.
- During drag, disable text selection and make dragged elements `inert` where supported and appropriate.
- Drag, swipe, pinch, and path gestures need tap/click and keyboard alternatives unless essential.
- Use `autoFocus` sparingly: desktop only, one primary input; avoid on mobile.

## Safe Areas & Layout

- Full-bleed layouts need `env(safe-area-inset-*)` for notches.
- Avoid unwanted scrollbars by fixing content overflow; use `overflow-x-hidden` only when clipping is intended.
- Prefer flex/grid over JavaScript measurement for layout.

## Dark Mode & Theming

- Set `color-scheme: dark` on `<html>` for dark themes to style scrollbars and native inputs.
- Match `<meta name="theme-color">` to the page background.
- Native `<select>` needs explicit `background-color` and `color` for Windows dark mode.

## Locale & i18n

- Format dates and times with `Intl.DateTimeFormat`, not hardcoded formats.
- Format numbers and currency with `Intl.NumberFormat`, not hardcoded formats.
- Detect language via `Accept-Language` / `navigator.languages`, not IP.
- Wrap brand names, code tokens, and identifiers with `translate="no"` to prevent garbled auto-translation.

## Hydration Safety

- Inputs with `value` need `onChange`; otherwise use `defaultValue` for uncontrolled inputs.
- Guard date/time rendering against server/client hydration mismatches.
- Use `suppressHydrationWarning` only when a mismatch is expected and intentional.

## Hover & Interactive States

- Buttons and links need a `hover:` state with visual feedback.
- Hover, active, and focus states increase contrast and prominence.

## Content & Copy

- Prefer active voice: “Install the CLI,” not “The CLI will be installed.”
- Use locale-appropriate capitalization for headings and buttons.
- Use numerals for counts: “8 deployments,” not “eight deployments.”
- Use specific button labels: “Save API Key,” not “Continue.”
- Error messages include a fix or next step, not only the problem.
- Address the user directly; use `&` instead of “and” when space is constrained.

## Anti-patterns to Flag

- `user-scalable=no` or `maximum-scale=1` that disables zoom.
- `onPaste` with `preventDefault`.
- `transition: all`.
- `outline-none` without a `:focus-visible` replacement.
- Inline `onClick` navigation instead of a link.
- `<div>` or `<span>` with click handlers instead of a button.
- Images without dimensions.
- Large arrays rendered with `.map()` without virtualization when the list is large.
- Form inputs without labels.
- Icon buttons without `aria-label`.
- Hardcoded date or number formats instead of `Intl.*`.
- `autoFocus` without a clear justification.
- Animated GIF when compressed video is suitable.
- Gesture-only actions without tap/click and keyboard alternatives.

## Review Output

Group findings by file and use `file:line` locations. Keep findings terse and include a fix for the issue. Mark clean files with `✓ pass`. Do not add a preamble.

```text
## src/Button.tsx

src/Button.tsx:42 - icon button missing aria-label
src/Button.tsx:18 - input lacks label
src/Button.tsx:55 - animation missing prefers-reduced-motion
src/Button.tsx:67 - transition: all → list properties

## src/Modal.tsx

src/Modal.tsx:12 - missing overscroll-behavior: contain
src/Modal.tsx:34 - "..." → "…"

## src/Card.tsx

✓ pass
```
