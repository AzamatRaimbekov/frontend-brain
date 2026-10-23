# Sources

Checked October 2026.

## Performance
- React Compiler 1.0 announcement (stable since 2025-10-07). https://react.dev/blog/2025/10/07/react-compiler-1
- React Compiler installation (Vite, Next.js, ESLint via `eslint-plugin-react-hooks`, `'use no memo'`). https://react.dev/learn/react-compiler/installation
- Next.js `reactCompiler` option. https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler
- Vite 8 + `@vitejs/plugin-react` v6 removed the `babel` option; compiler via `@rolldown/plugin-babel` + `reactCompilerPreset` (research note, verify against the installation page above for the installed versions).
- TanStack Router automatic code splitting. https://tanstack.com/router/latest/docs/framework/react/guide/automatic-code-splitting
- TanStack Virtual. https://tanstack.com/virtual/latest
- web.dev "Web Vitals" - LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75; FID retired in 2024. https://web.dev/articles/vitals
- web.dev INP and CLS articles (poor thresholds 500 ms, 0.25). https://web.dev/articles/inp , https://web.dev/articles/cls
- `web-vitals` library. https://github.com/GoogleChrome/web-vitals
- Chrome DevTools MCP tools: `performance_start_trace`, `performance_analyze_insight`, `emulate`, `lighthouse_audit` (Lighthouse there excludes performance by design).

## Accessibility
- W3C "What's New in WCAG 2.2" - 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8 at A/AA; 4.1.1 removed. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- WCAG 2.2 quick reference. https://www.w3.org/WAI/WCAG22/quickref/
- WAI-ARIA Authoring Practices Guide - patterns. https://www.w3.org/WAI/ARIA/apg/
- Deque axe-core rules. https://github.com/dequelabs/axe-core

## Related pack files
- `react-ui` [accessibility-ui.md](../../react-ui/references/accessibility-ui.md)
- `react-ux` [accessibility-ux.md](../../react-ux/references/accessibility-ux.md)
- `react-architecture` [SKILL.md](../../react-architecture/SKILL.md) section 10
