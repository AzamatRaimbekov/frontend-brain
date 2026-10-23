# Security: code and configuration

## SafeHtml (the only place with dangerouslySetInnerHTML)

Requires `dompurify` (pending approval in `rules/libraries.json`).

```tsx
// src/shared/components/SafeHtml.tsx
import DOMPurify from 'dompurify'

type SafeHtmlProps = { html: string; className?: string }

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }) // no SVG/MathML unless needed
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
```

Sanitize at render time, not when saving: the rules may tighten later. In Next.js Server Components sanitize on the server with a DOM implementation, or render this component on the client.

## safeUrl

```ts
// src/shared/lib/safeUrl.ts
const ALLOWED = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** Returns the URL if its protocol is allowed, otherwise undefined. Relative paths are allowed. */
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value, window.location.origin)
    return ALLOWED.has(url.protocol) ? value : undefined
  } catch {
    return undefined // not a URL: render as text
  }
}
```

```tsx
const href = safeUrl(company.website)
{href ? <a href={href} target="_blank" rel="noopener noreferrer">{company.website}</a> : <span>{company.website}</span>}
```

## Token options in detail

IETF "OAuth 2.0 for Browser-Based Applications" ranks the architectures by security: Backend-for-Frontend (tokens never reach the browser), then token-mediating backend, then a pure browser client. OWASP: never store session identifiers in local storage; it is readable by any script on the origin.

If a BFF is impossible (decided by the backend lead, written in the project `CLAUDE.md`):
- Access token in a module-scoped variable inside `src/shared/api/` (lost on reload by design), refreshed through an endpoint that reads the `HttpOnly` refresh cookie.
- The refresh call and 401 retry live in `http.ts` (owned by `react-error-handling`), never in features.
- Cookie-authenticated state-changing requests carry an anti-CSRF token header; cookies are `SameSite=Lax` or `Strict`.

## CSP for Vite SPA (nginx example)

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.kg; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" always;
```

- `style-src 'unsafe-inline'` is often needed for runtime inline styles (virtualized lists, some primitives); scripts stay strict.
- Remove inline scripts from `index.html` (the dark-mode pre-paint script from `react-ui` needs a hash: `script-src 'self' 'sha256-...'`).
- Ship `Content-Security-Policy-Report-Only` with the same value on staging first.

## CSP for Next.js App Router

**Nonce (strict, dynamic rendering):** `proxy.ts` (named `middleware.ts` with a `middleware` export before Next.js 16) generates a nonce per request and sets the header; Next.js adds the nonce to its own scripts.

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('Content-Security-Policy', csp)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}
```

Cost: every page renders dynamically; static generation, ISR and CDN caching of HTML are off, and Partial Prerendering is incompatible. Use it for authenticated apps.

**SRI (static pages):** `experimental.sri` in `next.config` adds integrity hashes at build time and keeps static rendering (App Router only). Use it for public, mostly static sites.

`'unsafe-eval'` only in development. Check the current Next.js CSP guide for the exact matcher and options of the installed version.

## Environment variables

```ts
// src/vite-env.d.ts (no imports in this file, or it stops being ambient)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: 'dev' | 'stage' | 'prod'
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Validation with Zod in `shared/config/env.ts` follows `react-new-project`. In Next.js, read server secrets only in server code (Server Components, Route Handlers, Server Actions); a module that touches them must never be imported from a `'use client'` file.

## Security review checklist (frontend)

- [ ] `grep -rn "dangerouslySetInnerHTML" src` - only `SafeHtml.tsx`.
- [ ] `grep -rn "localStorage\|sessionStorage" src` - only UI preferences, no tokens or server data.
- [ ] `grep -rn "VITE_\|NEXT_PUBLIC_" src .env.example` - no secrets.
- [ ] CSP header present on the deployed app (`curl -sI <url> | grep -i content-security`).
- [ ] `npm audit --omit=dev --audit-level=high` clean.
- [ ] No PII or tokens in URLs, logs, or `reportError` context.
