---
name: react-performance-a11y
description: Mdigital performance and accessibility standard for React 19 apps (Vite + TanStack Router or Next.js App Router) - React Compiler policy, route code splitting and lazy loading, images and fonts, list virtualization with TanStack Virtual, Core Web Vitals budget (LCP, INP, CLS) and how to measure it in the lab (Chrome DevTools MCP trace, Lighthouse) and in the field (web-vitals), plus the WCAG 2.2 AA page checklist, WAI-ARIA APG patterns for custom widgets and the accessibility audit procedure (axe, keyboard pass, screen reader smoke test). Use when a page is slow, a bundle is large, a list is long, before releasing a page, or when auditing or fixing accessibility. Triggers - "медленно", "тормозит", "оптимизация", "производительность", "бандл", "lazy", "виртуализация", "web vitals", "LCP", "INP", "CLS", "lighthouse", "доступность", "a11y", "WCAG", "аудит доступности", "клавиатура", "скринридер", "slow page", "performance", "bundle size", "code splitting", "virtualize list", "accessibility audit", "keyboard navigation", "screen reader".
---

# Performance and accessibility (Mdigital)

When running in Codex, first read [Codex integration](../../references/codex.md).

Measure first, then fix the measured bottleneck. Accessibility is checked on every page before release, not retrofitted.

Owners this skill builds on (do not restate them differently):
- Memoization and React Compiler rules: `react-architecture` section 10 [SKILL.md](../react-architecture/SKILL.md) and the Vercel rule overrides in `react-brain` [SKILL.md](../react-brain/SKILL.md) (`bundle-*`, `rerender-*`, `rendering-*` rules).
- Visual a11y (names, contrast, focus ring, target size, custom widget checklist): `react-ui` [accessibility-ui.md](../react-ui/references/accessibility-ui.md).
- Behavioural a11y (focus after navigation, live regions, keyboard, motion): `react-ux` [accessibility-ux.md](../react-ux/references/accessibility-ux.md).
- Fonts: `react-ui` [tokens-and-theming.md](../react-ui/references/tokens-and-theming.md). Data prefetching: `react-data-fetching` section 11.

## 1. React Compiler

- New projects enable the compiler (`babel-plugin-react-compiler` in Vite, `reactCompiler: true` in Next.js), as allowed in `rules/libraries.json`. Then: no new `useMemo` / `useCallback` / `memo` except the escape hatches in `react-architecture` section 10.
- Lint with `eslint-plugin-react-hooks` (v6+) using its latest recommended preset; the separate `eslint-plugin-react-compiler` package is not needed. A lint violation means the compiler skips that component: fix the Rules of React violation, do not silence it.
- Opt one component out with the `'use no memo'` directive at the top of the function only while fixing a confirmed compiler bug; leave a comment with the reason.
- Pin the compiler version. Setup differs between Vite plugin versions: see [references/performance.md](references/performance.md).

## 2. Code splitting and loading

| Where | Rule |
|---|---|
| Routes, Vite + TanStack Router | Every route is a separate chunk: enable `autoCodeSplitting` in the router plugin (or `.lazy.tsx` route files). Preload on intent (`defaultPreload: 'intent'`, set in the router per `react-new-project`). |
| Routes, Next.js | Automatic per route. Keep `'use client'` boundaries as low as possible so server components do not ship JS. |
| Heavy widgets (charts, editors, maps, PDF) | `lazy(() => import(...))` + `Suspense` (Vite) / `next/dynamic` (Next.js), loaded when shown, not on page load. |
| Third-party scripts | Defer after hydration or interaction (Vercel rule `bundle-defer-third-party`). |
| Imports | Import from the package entry that tree-shakes; no barrel files in `shared/` (`react-architecture`). |

## 3. Images and fonts

- Next.js: `next/image` with `width`/`height` (or `fill` + sized parent) and `sizes`; the LCP image gets `priority`.
- Vite: always `width` and `height` attributes (no CLS), `loading="lazy"` + `decoding="async"` below the fold, `fetchpriority="high"` on the LCP image only, AVIF/WebP with `srcset` + `sizes`.
- Icons are `lucide-react` components, not image files. Illustrations: SVG.
- Fonts: self-hosted per `react-ui` (`@fontsource-variable/*` or `next/font`); variable font, only the subsets used (`cyrillic`, `latin`).

## 4. Long lists and heavy rendering

- More than ~100 rows or items: virtualize with `@tanstack/react-virtual` (allowed). Pagination from the server is still preferred for data the user does not scroll through.
- Virtualized tables keep semantics: `aria-rowcount` on the table and `aria-rowindex` on rendered rows.
- Keep typing responsive with `useDeferredValue` / transitions (`react-ux` async-states.md); never debounce state that drives the input itself.
- Do not compute heavy derived data in render on every keystroke: move it into the query `select` or a pure function in `lib/` that the compiler can cache.

## 5. Web Vitals budget

Targets at the 75th percentile, mobile and desktop separately. A page passes only when all three pass.

| Metric | Good | Fail |
|---|---|---|
| LCP (largest content visible) | ≤ 2.5 s | > 4 s |
| INP (response to input) | ≤ 200 ms | > 500 ms |
| CLS (layout shift) | ≤ 0.1 | > 0.25 |

How to measure (procedure in [references/performance.md](references/performance.md)):
- **Lab, every new or changed page**: production build (`npm run build && npm run preview` / `next build && next start`), Chrome DevTools MCP `performance_start_trace` with mobile emulation (`emulate` viewport + CPU 4x + Fast 4G), read LCP/CLS and insights; interact to check INP. Lighthouse via `lighthouse_audit` covers accessibility and best practices, not performance.
- **Field, production apps**: report LCP, INP, CLS from real users to our own endpoint with the `web-vitals` library (pending approval in `libraries.json`; code in the reference).

## 6. Accessibility: WCAG 2.2 AA

Target is WCAG 2.2 level AA on every page. The full page checklist, including the criteria new in 2.2, is in [references/a11y-audit.md](references/a11y-audit.md). Highlights new in 2.2 that older team checklists miss:

| SC | Requirement | Typical fix |
|---|---|---|
| 2.4.11 Focus Not Obscured | focused element not fully hidden by sticky header, cookie banner, chat widget | `scroll-margin-top`, non-overlapping banners |
| 2.5.7 Dragging Movements | every drag action has a single-pointer alternative | move up/down buttons or a menu |
| 2.5.8 Target Size | targets ≥ 24×24 CSS px or enough spacing | shadcn `size="icon"`, padding |
| 3.2.6 Consistent Help | help/contact in the same place on every page | in the layout, not per page |
| 3.3.7 Redundant Entry | do not ask again for data given in the same process | prefill, "same as billing" |
| 3.3.8 Accessible Authentication | no cognitive tests; paste and password managers allowed; OTP can be pasted | `autoComplete`, no paste blocking |

4.1.1 Parsing is removed in 2.2; do not cite it in audits.

## 7. Custom widgets: APG patterns

Use the shadcn primitive (Base UI / Radix) first: they implement the WAI-ARIA Authoring Practices patterns. Build a custom widget only when no primitive exists, follow the APG pattern exactly, and pass the custom widget checklist in `react-ui` accessibility-ui.md. Pattern map: [references/a11y-audit.md](references/a11y-audit.md#apg-pattern-map).

## 8. Audit procedure (before release of a page)

1. Static: `eslint-plugin-jsx-a11y` passes.
2. Automated: `lighthouse_audit` (Chrome DevTools MCP) on the page, mobile and desktop; `@storybook/addon-a11y` for shared components when Storybook exists. Zero serious or critical violations.
3. Keyboard pass: Tab through the whole page, operate every control, open and close every dialog, check focus order, visibility, return focus, no traps.
4. Zoom and reflow: 200 % zoom and 320 px width without loss of content or horizontal scroll (except tables, maps).
5. Screen reader smoke test (VoiceOver or NVDA) on the main flow: headings, landmarks, form labels and errors, announcements.
6. Record the result in the page's `UX.md` (from `react-page-ux`): what was checked, what is left.

Automated scanners cannot judge focus order, meaningful names or announcements; steps 3-5 are not optional.

## Anti-patterns (reject in review)

- Optimizing without a measurement; adding `useMemo`/`memo` "just in case" with the compiler on.
- Whole app in one chunk; heavy chart or editor imported on page load.
- Images without dimensions; lazy-loading the LCP image; `fetchpriority="high"` on several images.
- Rendering thousands of DOM rows; debouncing the input's own state.
- Lighthouse score from a dev server quoted as the result.
- `div` with `onClick` as a button; ARIA roles without the keyboard behaviour they promise.
- Drag-only reordering; sticky header covering focused fields; paste blocked on password or OTP.

## Checklist before finishing

- [ ] Compiler on (new projects); no new manual memoization without a stated reason.
- [ ] Routes split; heavy widgets lazy; third-party scripts deferred.
- [ ] Images sized; LCP image prioritized; fonts self-hosted and subset.
- [ ] Lists > ~100 items virtualized or paginated.
- [ ] Lab trace on a production build: LCP ≤ 2.5 s, CLS ≤ 0.1, interactions ≤ 200 ms on mobile emulation.
- [ ] WCAG 2.2 AA checklist passed: automated, keyboard, zoom, screen reader smoke test.
- [ ] Custom widgets follow an APG pattern; result written to `UX.md`.

Sources: [references/sources.md](references/sources.md).
