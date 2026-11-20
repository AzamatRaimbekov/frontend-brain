---
name: mbank-webview
description: Mbank WebView microservices - pages and mini-services opened inside the Mbank mobile app (payments, forms, promos, onboarding). Starts a project from a ready template (new-webview.mjs) with the app bridge (token, language ru/ky/en, theme, system back, return from background), every failure screen (opened outside the app, app not answering, session over, offline, crash, 404), a dev panel that plays the app and tests, then builds screens by the WebView rules. Use when creating or changing a WebView microservice for the Mbank app or when the person asks for a new project and the kind is unclear (run the project picker). Triggers - "webview", "вебвью", "веб вью", "микросервис мбанк", "микросервис для приложения", "мини-приложение", "плагин в приложении", "внутри приложения мбанк", "страница для мобилки", "new webview", "mini app", "новый проект".
---

# Mbank WebView microservices

When running in Codex, first read [Codex integration](../../references/codex.md).

A WebView microservice is a React page the Mbank mobile app opens inside itself. The app gives it the session (token), the language and the theme, draws the top bar and owns the system back. The service never asks for a login, never shows its own header and must survive every way the app can misbehave. All `react-*` rules (architecture, data fetching, UX states, testing, ui-copy, 150-line files) apply; this skill adds what is special about living inside the app.

## Which project: the picker

When the person asks for a new project and does not say which kind, or the request is unclear ("сделай новый проект", "нужен фронт под задачу", "создай что-нибудь для…"), **do not ask in chat**. Open the picker page and wait for the click:

```bash
# PLUGIN = path to plugins/frontend-pack; --parent = where the project folder goes (default: cwd)
node $PLUGIN/scripts/project-picker.mjs --parent .
# stdout, one JSON line: {"type":"webview"|"crm","name":"…","dir":"/abs/…","create":["node","…/new-webview.mjs","/abs/…"]}
```

- Run it in the foreground with a long timeout (Bash `timeout: 600000`): the command blocks until the click. Tell the person in one line that a page opened in the browser.
- Exit 0 → run the `create` command from the JSON as is. Exit 2 (no click in 10 minutes) → ask the same thing in chat once: «WebView-микросервис или CRM? Как назвать папку?».
- The kind is already named («webview для оплаты», «новая CRM») → skip the picker and start that kind directly. CRM → [mbank-crm](../mbank-crm/SKILL.md).

## Start a new project

```bash
node $PLUGIN/scripts/new-webview.mjs ../mbank-pay --name "Mbank Pay"
node $PLUGIN/scripts/new-webview.mjs ../mbank-pay --dry-run   # print the plan only
```

The project directory must not exist or be empty. Then **start it and show it** — the person asked for a running service, not a folder:

1. `npm run dev` in the background (Bash `run_in_background`), wait for `Local:` in its output.
2. Open `http://localhost:5173/` in the browser at phone size (390×844, mobile, touch) and take a screenshot.
3. Run the checks: `npm run format:check && npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build`.
4. Report the address, the dev panel (⚙ bottom right) and the `?bridge=` / `?mock=` cases below.

`npm run dev` listens on the network (`vite --host`): a phone on the same Wi-Fi opens `http://<computer-ip>:5173/` in the app's test build.

## What the template already handles

| Case | Where | What the person sees |
|---|---|---|
| Opened by the app | `shared/bridge/host.ts` `init` | skeleton up to 3 s, then the service |
| Opened in a plain browser | no bridge, no `#token=` | «Откройте в приложении Мбанк» |
| The app does not answer `init` | timeout 3 s | «Не удалось связаться с приложением» + Повторить / Закрыть |
| Token expired | `shared/api/http.ts` 401 | silent `refreshToken` from the app, the request repeats once |
| Refresh refused or still 401 | host `expired` | «Сессия истекла» + Закрыть (the app shows its login) |
| Many requests get 401 at once | single-flight refresh | one refresh, all requests wait for it |
| Language changed in the app | event `lang` | texts switch at once (ru / ky / en, fallback ru), `Accept-Language` follows |
| Theme changed in the app | event `theme` | `.dark` on `<html>`, the shadcn tokens switch |
| System back (Android button) | event `back` | open sheet/step → previous page → the app closes the WebView |
| Back from background | event `resume` | active queries refetch |
| No internet | `OfflineBanner` | banner on top, data stays |
| Crash | `AppErrorBoundary` | «Что-то пошло не так» + Перезагрузить |
| Unknown address | router `notFoundComponent` | 404 inside the service |
| Notch, home indicator | `.webview-screen`, `viewport-fit=cover` | content clear of the cut-outs |
| iOS zoom into a field | `webview.css` | fields are at least 16px |

Dev cases from the address bar: `?bridge=none` (opened in a browser), `?bridge=silent` (app silent → failed), `?bridge=expired` (session over), `?mock=error` (API 500). The ⚙ panel switches language and theme, expires the token, makes refresh fail, sends back and resume. `VITE_BRIDGE=native` turns the fake app off when the dev server is opened from the real app.

## Rules for screens

- **Token**: only through `http()` from `@/shared/api/http`. Never read it into components, never put it in `localStorage`, `sessionStorage`, cookies, URLs or logs. A raw `fetch` to the API is a bug.
- **Text**: every string through `t()`; a new key goes into `ru.json`, `ky.json` and `en.json` at once (the generator test compares the key sets). The Kyrgyz text is checked by a native speaker before release.
- **No web header, no back arrow, no burger**: the app has them. The page title is `<title>` (the app may show it).
- **Layout**: one column, 320–430 px wide; the root of every screen has `webview-screen`; the main action is a full-width `size="lg"` button at the bottom of the screen.
- **Sheets, steps, dialogs**: close them on the system back with `useBackHandler(() => { close(); return true }, open)`.
- **Links out** (an offer PDF, a partner site): `host.openUrl(url)`, never `target="_blank"` — the WebView would open it inside itself.
- **Leaving the service** (done, cancel): `host.close()`.
- **Weight**: the WebView loads over mobile data. Schemas with `zod/mini`, new screens as lazy routes, no heavy libraries (charts, editors) without the person's yes; `npm run build` must stay without the 500 kB warning.
- **Colours and radii**: only the shadcn tokens (`mbank-tokens.css`, `shadcn/tokens@1`), the same as in the kit and the CRM. No own tokens.

## The bridge

The template speaks a proposed protocol: JSON messages `{v:1,id,method,params}` to the app and responses/events back. The exact names on the native side (`webkit.messageHandlers.mbank`, `MbankAndroid`, `ReactNativeWebView`, `window.mbankBridgeReceive`) are in one file, `src/shared/bridge/transports.ts`. Until the mobile team confirms them, the service works with the fake app and with `#token=…&lang=…&theme=…` launch parameters. The full contract to hand to the mobile team: [references/bridge-protocol.md](references/bridge-protocol.md).

When the mobile team names other methods or globals, change `transports.ts` (and `protocol.ts` for new methods) only; components and `http()` do not change.

## Knowledge

- [mobile/webview-embedded-mode](../../knowledge/mobile/webview-embedded-mode.md) — one SPA as a site and inside the app (when the service must also work on the web).
