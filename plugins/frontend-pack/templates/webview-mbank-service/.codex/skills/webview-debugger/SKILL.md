---
name: webview-debugger
description: Use when investigating, explaining, triaging, or writing structured bug reports for MBANK WebView issues in this React template, including UI, API/RTK Query, auth/token, bridge, form, navigation, loading, error-state, and mobile WebView behavior.
---

# WebView Debugger

Use this skill to analyze WebView bugs in a structured way and produce a formal, useful bug report or fix recommendation.

## First Steps

1. Read `AGENTS.md`.
2. Read `docs/webview-app-builder/references/debugging-playbook.md`.
3. Classify the bug as one or more areas:
   - UI
   - API / RTK Query
   - Auth / Token
   - Bridge
   - Form
   - Navigation
4. Read the relevant reference docs before diagnosing:
   - UI: `docs/webview-app-builder/references/ui-best-practices.md`
   - API: `docs/webview-app-builder/references/api-error-handling.md`
   - Auth/token: `docs/webview-app-builder/references/legacy-webview-integration.md`
   - Bridge: `docs/webview-app-builder/references/mbank-webview-bridge.md`
   - Forms: `docs/webview-app-builder/references/forms-best-practices.md`
   - Navigation: `docs/webview-app-builder/references/navigation-best-practices.md`

## Required Behavior

- Ask only the missing questions needed to reproduce or classify the bug.
- Prefer concrete evidence: route, screen, component, payload, API status, bridge response, Sentry issue, screenshot, video, or network response.
- Explain the suspected cause in plain language.
- Point to exact docs and code paths when possible.
- Use the formal bug report format from `debugging-playbook.md` when the user asks for a bug report or when handing off to a developer.
- Never show technical bridge codes, raw backend details, or the word "Ошибка" as user-facing copy recommendations.

## Code Paths To Check First

- RTK Query errors: `src/shared/api/rtk-query/lib/queryErrorLogger.ts`
- Error helpers: `src/shared/api/rtk-query/lib/errorUtils.ts`
- Skip notification: `src/shared/api/rtk-query/lib/transformErrorWithSkip.ts`
- Refresh flow: `src/shared/api/rtk-query/lib/baseQueryWithRefresh.ts`
- Auth provider: `src/modules/Auth/components/AuthProvider.tsx`
- Token provider: `src/app/providers/TokenProvider/`
- Storage: `src/shared/libs/storage/`

## Output Shape

For analysis:

- Summary
- Likely area
- Evidence needed or evidence found
- Suspected cause
- Proposed fix
- Verification
- References

For formal reports, use the full template in `debugging-playbook.md`.

## Guardrails

- Do not invent API contracts, bridge capabilities, or MBANK config.
- Do not bypass the centralized RTK Query error handling without a reason.
- If an endpoint-specific error should be handled in a component, mention skip notification.
- If runtime code changes are made, run the minimal relevant verification command.
