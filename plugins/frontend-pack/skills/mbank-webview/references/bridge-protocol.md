# Mbank WebView bridge protocol v1 (proposal)

The contract between the Mbank mobile app (iOS, Android) and a WebView microservice made from `templates/mbank-webview`. It is a **proposal** from the frontend side: names marked "proposed" change in `src/shared/bridge/transports.ts` once the mobile team confirms its own.

## Why a bridge and not cookies or the URL

- The token must not live in the URL query (server logs, history, Referer) or in web storage (any script on the page reads it).
- The app owns the session: only it can refresh a token or send the person to the login.
- Language and theme change while the service is open.

## Channel

| Direction | iOS (WKWebView) | Android (WebView) | React Native app |
|---|---|---|---|
| page → app | `window.webkit.messageHandlers.mbank.postMessage(obj)` (proposed handler name `mbank`) | `window.MbankAndroid.postMessage(jsonString)` (proposed `@JavascriptInterface` name `MbankAndroid`) | `window.ReactNativeWebView.postMessage(jsonString)` |
| app → page | `evaluateJavaScript("window.mbankBridgeReceive(<json>)")` | `evaluateJavascript("window.mbankBridgeReceive(<json>)")` | `webview.postMessage(jsonString)` → `message` event |

`window.mbankBridgeReceive` accepts a JSON string or an object. The page detects the channel in this order: iOS, Android, React Native; none → launch parameters; none → "open in the app" screen.

## Messages

Every message has `v: 1`. Messages with another `v` or broken JSON are ignored.

Page → app (request):

```json
{ "v": 1, "id": "lq3k-0", "method": "init", "params": {} }
```

App → page (response, the same `id`):

```json
{ "v": 1, "id": "lq3k-0", "result": { "token": "…", "lang": "ky", "theme": "dark", "platform": "android", "appVersion": "5.12.0" } }
{ "v": 1, "id": "lq3k-1", "error": { "code": "unauthorized", "message": "…" } }
```

App → page (event, no `id`):

```json
{ "v": 1, "event": "lang", "data": { "lang": "en" } }
```

## Methods (page → app)

| Method | Params | Result | Timeout | When |
|---|---|---|---|---|
| `init` | — | `{ token, lang?, theme?, platform?, appVersion? }` | 3 s | page start; no answer → "could not reach the app" screen with retry |
| `refreshToken` | — | `{ token }` or error `unauthorized` | 8 s | the API answered 401; one at a time for the whole page |
| `close` | — | none (one-way) | — | done / cancel / back on the first screen: the app closes the WebView |
| `openUrl` | `{ url }` | none (one-way) | — | external link: the app opens the system browser or its own viewer |

`token` is the access token for the microservice API (`Authorization: Bearer …`). `lang` is `ru`, `ky` or `en` (others → `ru`). `theme` is `light` or `dark`.

## Events (app → page)

| Event | Data | Page does |
|---|---|---|
| `lang` | `{ lang }` | switches texts and `Accept-Language` |
| `theme` | `{ theme }` | toggles `.dark` on `<html>` |
| `token` | `{ token }` | uses the new token for the next requests (the app refreshed it itself) |
| `back` | — | closes an open sheet/step, else previous page, else sends `close` |
| `resume` | — | the app came back from the background: refetches active data |

The app should send `back` instead of navigating the WebView history itself, and `resume` on every return to the foreground.

## Launch parameters (fallback without a bridge)

`https://service.example/path#token=…&lang=ky&theme=dark` — in the **hash**, so the token never reaches the server or its logs. The page reads it on start and removes it from the address bar at once. Without a bridge there is no refresh: a 401 shows "session expired".

## Open questions for the mobile team

1. Real handler / interface names for iOS and Android (or a ready SDK object).
2. Which token the service gets: the app session token or a separate short-lived token per microservice (preferred).
3. Does the app add anything to the User-Agent (to tell its WebView from a browser)?
4. Safe-area: is the WebView under the app's top bar (no top inset needed) or full-screen?
5. Who shows the close button: the app's top bar or the service?
