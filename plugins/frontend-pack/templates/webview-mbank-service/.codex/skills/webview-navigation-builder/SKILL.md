---
name: webview-navigation-builder
description: Use when designing, reviewing, planning, or debugging navigation in MBANK WebView projects, including React Router routes, header title/back behavior, close/exit, nested routes, steppers, deep links, auth redirects, dirty-form exits, and bridge navigation actions.
---

# WebView Navigation Builder

## Purpose

Help design and review navigation for MBANK WebView screens in this React template/workbench. Focus on mobile-app-like behavior: predictable back, explicit close, no full page reloads, safe bridge usage, and route metadata that keeps the native-like header correct.

## First Steps

1. Read `AGENTS.md` to confirm the current project phase and constraints.
2. Read `docs/webview-app-builder/references/navigation-best-practices.md`.
3. If the task touches native close, deeplinks, payment, preview, or auth bridge behavior, read `docs/webview-app-builder/references/mbank-webview-bridge.md` and `docs/webview-app-builder/references/mbank-bridge-helper.md`.
4. If the task touches auth redirects or query token startup, read `docs/webview-app-builder/references/webview-context.md`.
5. If the task touches exiting a dirty form, read `docs/webview-app-builder/references/forms-best-practices.md`.

Only inspect runtime files when the user asks for code-aware guidance or implementation. For this template, start with:

- `src/pages/model.tsx`
- `src/modules/Common/model/types.ts`
- `src/modules/Common/lib/headerHelpers.ts`
- `src/modules/Common/hooks/useHeader.ts`

## Current Template Pattern

Routes are configured in `src/pages/model.tsx` through `createRouteObject([...])`.

Each route can define `handle` metadata used by the common header:

- `title`: i18n key for header text.
- `subtitle`: marks that header subtitle should be taken from location state.
- `dynamicTitle`: marks that header title should be taken from location state.
- `backUrl`: controls back button behavior. It can be a static string or a function receiving the active match and all matches.
- `isExit`: makes header back action close the WebView instead of navigating inside the app.

`useHeader` resolves behavior in this order:

1. If `isExit` is present, call `closeMobileWebView()`.
2. Else if `backUrl` resolves, navigate to it with replace.
3. Else call `navigate(-1)`.

When proposing a new route, always specify its `path`, `element`, `handle.title`, and whether it needs `backUrl`, `isExit`, `subtitle`, or `dynamicTitle`.

Use `closeMobileWebView()`, `openDeepLink()`, and `requestMobileAuth()` from `@shared/mobile-bridge` for native navigation actions. Do not call `window.MBankBridge.invoke(...)` directly in feature code.

## Navigation Design Checklist

Before recommending or editing navigation, clarify:

- What is the first screen of the flow?
- Which screens are linear steps, optional steps, success/result screens, or technical transition screens?
- What should header back do on every screen?
- Which screens should use `replace` behavior so the user cannot return to a stale transition/success/payment screen?
- Does close fully exit the WebView, or should the user go to a previous step?
- Are there dirty-form rules before back/close?
- Are there deeplinks that must be pre-approved through bridge capabilities/origin?
- Does auth required flow return to main route or a restoration route?

## Output Format

For planning tasks, answer with:

1. Flow summary.
2. Route map.
3. Header/back/close behavior per route.
4. Bridge actions and required capabilities, if any.
5. Dirty-form or auth redirect rules, if any.
6. Open questions.
7. Implementation checklist.

For debugging tasks, route to `webview-debugger` too and include navigation-specific hypotheses: wrong route handle, missing `backUrl`, stale history, wrong replace usage, bridge unavailable, unapproved deeplink, dirty-form interception, or auth redirect mismatch.

## Guardrails

- Do not invent deeplinks, bridge capabilities, or native behavior. Mark unknowns as `Нужно уточнить`.
- Do not design around full page reloads; reload should not be part of normal flow.
- Treat close and back as different actions.
- Prefer route-level metadata over one-off header logic when possible.
- Keep docs as the source of truth. If the user confirms new navigation rules, update `docs/webview-app-builder/references/navigation-best-practices.md`.
- Do not change runtime code unless the user explicitly asks to implement.
