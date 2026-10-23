---
name: react-security-i18n
description: Mdigital frontend security and internationalization rules for React 19 apps (Vite SPA or Next.js App Router) - XSS (dangerouslySetInnerHTML, user URLs), auth token storage (BFF and HttpOnly cookies, never localStorage), CSP for Vite and Next.js, environment variables (VITE_ and NEXT_PUBLIC_ are public), dependency audit; and i18next / react-i18next setup with ru as default plus ky and en, key naming, CLDR plurals (_one/_few/_many/_other), typed keys, Intl date, number and currency formatting (KGS, RUB, USD). Use when handling auth, tokens, cookies, HTML from users or a CMS, links from data, env variables, CSP or security review, or when adding languages, translations, plurals, dates, numbers or money. Triggers - "безопасность", "XSS", "токен", "localStorage", "куки", "CSP", "env переменные", "секрет в бандле", "npm audit", "перевод", "локализация", "i18n", "кыргызский", "мультиязычность", "плюрализация", "формат даты", "валюта", "сом", "security review", "token storage", "secrets", "translations", "localization", "plural", "currency format".
---

# Frontend security and i18n (Mdigital)

When running in Codex, first read [Codex integration](../../references/codex.md).

Two areas that look unrelated but share one rule: **nothing user-facing or secret is hard-coded in components**. Secrets stay on the server; strings go through i18n.

Owners this skill builds on (do not restate them differently):
- HTTP client, `credentials: 'include'`, where the 401 handler lives, PII scrubbing in reports: `react-error-handling` [api-errors.md](../react-error-handling/references/api-errors.md), [logging.md](../react-error-handling/references/logging.md).
- `shared/config/env.ts` parsed with Zod: `react-new-project` [SKILL.md](../react-new-project/SKILL.md) section 4.
- Microcopy rules (every string through `t()`, plurals, room for longer translations): `react-ux` section 9 [SKILL.md](../react-ux/SKILL.md).
- Form error messages as i18n keys: `react-ux` [forms.md](../react-ux/references/forms.md).

## Part A. Security

### A1. XSS

- React escapes text by default. The holes are: `dangerouslySetInnerHTML`, URLs from data in `href`/`src`, and inline event strings.
- `dangerouslySetInnerHTML` only with HTML sanitized by DOMPurify right before rendering, inside one shared component (`shared/components/SafeHtml.tsx`); never in feature code directly. DOMPurify is pending approval in `rules/libraries.json`. Prefer rendering Markdown or structured data as React elements.
- Links from data or users: allow only `http:`, `https:`, `mailto:`, `tel:` through `shared/lib/safeUrl.ts`; anything else (`javascript:`, `data:`) renders as text. External links get `rel="noopener noreferrer"` with `target="_blank"`.
- Never build HTML strings, never `eval` / `new Function`, never put user data into `<script>` or `style` strings.

### A2. Auth tokens

| Option | Use |
|---|---|
| **BFF**: backend holds OAuth tokens, browser gets only an `HttpOnly; Secure; SameSite` session cookie | **default** for apps with business or personal data |
| Access token in memory (module variable in `shared/api`), refresh token in an `HttpOnly` cookie | only if a BFF is impossible; add anti-CSRF token for cookie-authenticated mutations |
| Any token in `localStorage` / `sessionStorage` / non-HttpOnly cookie | **forbidden**: readable by any injected script |

- `http.ts` sends `credentials: 'include'`; the frontend never reads or parses the session cookie.
- `HttpOnly` does not stop XSS from acting as the user: CSP (A3) is still required.
- Logout clears the query cache (`queryClient.clear()`) and in-memory state; the server invalidates the session.
- No tokens, emails or phones in URLs, logs, error messages or `reportError` context.

### A3. Content Security Policy

- Vite SPA: CSP is an HTTP header set by the web server or CDN serving `index.html` (not a `<meta>` tag): `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` plus the API origin in `connect-src`. No `'unsafe-inline'` or `'unsafe-eval'` in production.
- Next.js: nonce-based CSP from `proxy.ts` (strict, makes every page dynamic) or SRI for static pages. Trade-offs and code: [references/security.md](references/security.md).
- Start in `Content-Security-Policy-Report-Only` on staging, fix violations, then enforce.

### A4. Environment variables

- Everything prefixed `VITE_` (Vite) or `NEXT_PUBLIC_` (Next.js) is **inlined into the public bundle**. Only public values there: API base URL, public app id, feature flags.
- Secrets (API keys, client secrets, DB URLs) live on the server only: Next.js server-only env, Server Actions, Route Handlers; Vite apps reach third-party APIs through the BFF or a proxy.
- Never set Vite `envPrefix` to `''`. `.env*.local` files are git-ignored; `.env.example` lists names without values.
- Type `import.meta.env` in `src/vite-env.d.ts` and validate at startup in `shared/config/env.ts` (owned by `react-new-project`).

### A5. Dependencies and supply chain

- Every new package must be in `rules/libraries.json`; anything else needs approval.
- CI runs `npm audit --omit=dev --audit-level=high` and fails on high/critical; fix by upgrading, not by `overrides` without a note.
- Commit the lockfile; CI installs with `npm ci`. Review `postinstall` scripts of new packages.
- Remove unused dependencies when touching `package.json`.

## Part B. i18n

### B1. Setup

`react-i18next` (allowed) with `i18next`. Default and fallback language `ru`; supported `ru`, `ky`, `en`. One instance in `src/shared/config/i18n.ts`, resources in `src/shared/config/locales/<lng>/<namespace>.json`, typed keys via `i18next.d.ts`. Full code, Next.js variant and CI key check: [references/i18n.md](references/i18n.md).

- RTL is not needed (ru, ky, en are all left-to-right); do not add `dir` logic.
- `<html lang>` follows the active language.
- Language choice: user setting → `localStorage` preference → `ru`. No browser-language auto-switch for internal tools unless the product asks for it.

### B2. Keys

- Namespaces by feature: `common` (buttons, generic states), `errors`, `<feature>` (`orders`, `users`).
- Key shape `<feature>.<screen or component>.<element>[.<state>]`: `orders.form.email.label`, `orders.empty.title`, `errors.loadFailed.title`.
- Keys describe meaning, not text: `orders.create`, not `orders.createOrderButtonText`. Never use the Russian sentence as the key.
- No concatenation: `t('orders.deleted', { number })`, not `t('orders.deleted') + number`. Markup inside text with `<Trans>` components.
- `ru` is the source of truth: every key exists in `ru` first; `ky` and `en` may lag, falling back to `ru`.

### B3. Plurals

i18next takes plural categories from `Intl.PluralRules` (CLDR). The variable must be named `count`.

| Language | Keys needed | Example |
|---|---|---|
| ru | `_one` (1, 21), `_few` (2-4, 22-24), `_many` (0, 5-20, 11-14), `_other` (fractions: 1,5) | `orders.count_one`: «{{count}} заказ», `_few`: «{{count}} заказа», `_many`: «{{count}} заказов», `_other`: «{{count}} заказа» |
| ky | `_one`, `_other` | `orders.count_one`, `orders.count_other` |
| en | `_one`, `_other` | `orders.count_one`: "{{count}} order", `_other`: "{{count}} orders" |

`_zero` is optional and overrides the category for 0 (use it for "Нет заказов"). Ordinals: `t('key', { count, ordinal: true })` with `_ordinal_*` keys. A CI check fails when a `ru` plural key lacks `_few` or `_many` ([references/i18n.md](references/i18n.md)).

The `react-ux` phrase "ICU plurals" means these CLDR categories; i18next uses suffix keys, not ICU MessageFormat syntax, unless a project already uses `i18next-icu`.

### B4. Dates, numbers, money

- Format with `Intl.DateTimeFormat` / `Intl.NumberFormat` using the active language, through helpers in `src/shared/lib/format.ts`; never hand-built strings or `toFixed` for display.
- Money: `formatMoney(amount, 'KGS')` → `Intl.NumberFormat(lng, { style: 'currency', currency })`. Amounts arrive from the API as numbers in major units or as strings per the API contract; never compute money with floats on the client beyond display.
- Dates from the API are ISO strings; display in the user's time zone (pass `timeZone` explicitly when the product defines one) and send back as ISO.
- Relative time with `Intl.RelativeTimeFormat`. No moment.js; date libraries need approval.

## Anti-patterns (reject in review)

- `dangerouslySetInnerHTML` without DOMPurify; `href={user.website}` without a protocol check.
- Tokens in `localStorage`/`sessionStorage`; reading auth cookies in JS; tokens in URLs or logs.
- Secrets in `VITE_*` / `NEXT_PUBLIC_*`; `envPrefix: ''`; committed `.env.local`.
- CSP with `'unsafe-inline'` / `'unsafe-eval'` in production; CSP as `<meta>` only.
- Hard-coded Russian strings in JSX; string concatenation of translations; only `_one`/`_other` for `ru`.
- Plural without `count`; dates as `${d}.${m}.${y}`; currency as `amount + ' сом'`.

## Checklist before finishing

- [ ] No raw HTML without sanitizing; user URLs pass `safeUrl`.
- [ ] Session via HttpOnly cookie (BFF); no tokens in web storage; logout clears the query cache.
- [ ] CSP header defined for the deployment (report-only on staging first).
- [ ] No secrets in public env prefixes; `env.ts` validates env at startup.
- [ ] `npm audit` clean at high; new packages are in `libraries.json`.
- [ ] Every new string is a key in `ru` (and `ky`/`en` or falling back); `ru` plurals have `_one/_few/_many/_other`.
- [ ] Dates, numbers and money go through `shared/lib/format.ts`.

Sources: [references/sources.md](references/sources.md).
