---
name: webview-bridge-builder
description: Use when designing, reviewing, implementing, or debugging MBANK WebView Bridge integrations, including `window.MBankBridge.invoke`, `src/shared/mobile-bridge`, typed bridge helpers, capabilities, native actions, bridge errors, Sentry logging, payment, PDF preview, external links, deeplinks, analytics, adjust, biometry, and device report.
---

# WebView Bridge Builder

## Purpose

Help build MBANK native-action integrations through the typed helper in this template. Keep feature code bridge-safe, typed, reusable, and aligned with the documented capabilities/origin model.

## First Steps

1. Read `AGENTS.md` for current project constraints.
2. Read `docs/webview-app-builder/references/mbank-webview-bridge.md`.
3. Read `docs/webview-app-builder/references/mbank-bridge-helper.md`.
4. For navigation, deeplink, back, or close behavior, also use `webview-navigation-builder` or read `docs/webview-app-builder/references/navigation-best-practices.md`.
5. For payment flows, inspect the backend preparation endpoint before calling `payment.start`.

Runtime files to inspect when implementation is requested:

- `src/shared/mobile-bridge/index.ts`
- `src/shared/mobile-bridge/types.ts`
- `src/shared/mobile-bridge/mobileBridge.ts`
- `src/modules/Auth/components/AuthProvider.tsx` when the task includes startup auth
- `src/@types/global.d.ts`

## Current Template Pattern

Feature code imports from `@shared/mobile-bridge`.

There is no global bridge provider that invokes native actions at startup. Helpers check bridge availability and retry `bridgeUnavailable` for the concrete action.

`token=GUEST` is guest mode: do not bootstrap backend auth or invoke `auth.required` automatically. Mount `AuthProvider` only when the project needs backend auth bootstrap; use `requestMobileAuth()` explicitly for an auth-required startup flow or protected guest action.

Localhost uses bridge mock mode by default. `?mbankBridge=mock` and `?mbankBridge=disabled` both return successful mock results in the current helper; they are not a replacement for a native MBANK WebView check.

Use `callMobile(type, payload, options)` for generic events and typed helpers for common actions:

- `closeMobileWebView`
- `requestMobileAuth`
- `startMobilePayment`
- `shareMobileText`
- `previewMobilePdfUrl`
- `previewMobilePdfBase64`
- `openExternalMobileUrl`
- `openDeepLink`
- analytics / adjust / biometry / device report helpers

Do not call `window.MBankBridge.invoke` directly in feature code unless editing the shared helper itself.

Use `callMobileResponse` only when the feature must handle raw `ok: false` responses itself. Otherwise prefer `callMobile` / typed helpers and catch `MobileBridgeInvokeError` with `isMobileBridgeInvokeError`.

## Bridge Work Checklist

Before implementing or reviewing a bridge action, identify:

- event type;
- required capability;
- payload shape;
- result shape if feature code depends on it;
- whether payload contains URL and needs `allowedOrigins`;
- fallback for missing bridge or old MBANK app;
- user-friendly error behavior;
- Sentry/error diagnostics;
- manual release check with MBANK capabilities and origins.

## Implementation Rules

- Add new event types to `MobileBridgeEventMap` first.
- Add a typed helper only when the event is common or improves feature readability.
- Keep capabilities as backend/MBANK configuration knowledge; do not hardcode a frontend allowed-capability list.
- For `bridgeUnavailable`, rely on helper retry unless the scenario needs custom UX around retries.
- For `missingCapability`, `forbiddenOrigin`, `unsupportedAction`, or `handlerFailed`, treat the issue as integration/config/diagnostic work.
- Keep technical `error.code` and `error.details` out of user-facing text.
- Log bridge errors through the shared helper/Sentry path.

## Guardrails

- Do not invent capabilities, event types, backend endpoints, deeplink schemes, or allowed origins.
- Do not use legacy URL/AJAX interception for new WebView native actions.
- Do not use `window.flutter_inappwebview.callHandler`.
- Do not start wider template migration while adding bridge actions.
- If the user confirms new bridge behavior, update the relevant docs under `docs/webview-app-builder/`.
