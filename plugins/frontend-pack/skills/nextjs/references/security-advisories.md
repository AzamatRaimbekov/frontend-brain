# Next.js security advisories

Checked 2026-10-25 against each post on nextjs.org/blog and the GitHub release tags of `vercel/next.js`.
Newer advisories: run `scripts/nextjs-news.mjs --project <dir>` and open every post it lists under
"Исправления безопасности". Never state "safe" from this table alone after 2026-10-25.

## Minimum safe version today (2026-10-25)

| Line | Minimum patched | Latest | Status |
|---|---|---|---|
| 16.x | **16.4.1** (2026-10-14, fixes everything below) | 16.4.3 (2026-10-23, bug-fix backports) | Active LTS |
| 15.x | **15.5.28** (2026-10-14) | 15.5.28 | Maintenance LTS (two years from 2024-10-21) |
| 14.x | 14.2.35 was the last patch named in a post (2025-12-11); not listed in any 2026 security release | - | unsupported: upgrade |
| 16.0-16.3, 15.0-15.4 | no 2026 patches for these minors: move to 16.4.x or 15.5.28 | - | - |

Patched minor lines in 2026 releases were only the current 16.x minor and 15.5. Staying on an older 16 minor
means no fixes: upgrade the minor, not just the patch.

## Since the monthly program (July 2026)

Since 2026-07-13 Next.js announces security releases about a week ahead ("Upcoming ..." posts) and ships roughly
monthly, plus ad-hoc releases for urgent issues
([program](https://nextjs.org/blog/next-security-release-program)). Plan a patch slot right after each announcement.

### 2026-10-14 - out-of-band, 16.4.1 / 15.5.28 ([post](https://nextjs.org/blog/nextjs-security-update-october-14-2026))

| Severity | Issue | Affects | Advisory |
|---|---|---|---|
| Critical | RCE in `'use cache'` functions returning several typed arrays | App Router with Cache Components; no workaround | GHSA-673q-mjm6-r5xr |
| Critical | RCE in Image Optimization with SVG (upstream lib via `sharp`) | glibc Linux; workaround `sharp` ≥ 0.35.5 | CVE-2026-96889 |
| High | DoS via crafted requests | App Router with at least one Server Action | GHSA-p3m5-59mp-jv5r |

### 2026-09-30 - September release, 16.3.8 / 15.5.27 ([post](https://nextjs.org/blog/september-2026-security-release))

| Severity | Issue | Affects | Advisory |
|---|---|---|---|
| High | SSRF in Image Optimization | apps with `images.remotePatterns` | CVE-2026-94483 |
| Medium | Cache poisoning of SSG/ISR pages | self-hosted Pages Router with SSG/ISR | CVE-2026-94543 |
| Medium | Cache poisoning, cross-user content substitution | root catch-all page + SSG/ISR routes | CVE-2026-94484 |
| Medium | Metadata image routes ignore `dynamicParams` | App Router built with webpack | CVE-2026-94485 |
| Medium | Cache leak across root params in nested `'use cache'` | Cache Components | GHSA-h694-7cp9-m8p3 |
| Medium | Draft Mode content leaks via pending `'use cache'` fill | Cache Components + Draft Mode | CVE-2026-94544 |
| Low | Dev server MCP endpoint readable by other websites | `next dev` only | CVE-2026-94486 |

### 2026-09-22 - out-of-band, 16.3.6 / 15.5.26 ([post](https://nextjs.org/blog/nextjs-security-update-september-22-2026))

| Severity | Issue | Affects | Advisory |
|---|---|---|---|
| Critical | RCE in Node.js `ImageResponse` (Satori upstream) | `>=16.2.0 <16.3.6`; 15.5.26 is hardening only | GHSA-vcvr-r3jv-pc5j |

### 2026-08-25 - August release, 16.3.3 / 15.5.24 ([post](https://nextjs.org/blog/august-2026-security-release))

| Severity | Issue | Affects | Advisory |
|---|---|---|---|
| Critical | RCE in Image Optimization with AVIF (libheif via `sharp`); patch disables AVIF optimization | apps optimizing attacker-controlled AVIF | GHSA-2xp9-vwfh-vxw4 |
| Critical | RCE on Windows-hosted servers | Pages + App Router without Cache Components on a Windows filesystem | CVE-2026-75604 |

### 2026-07-20 - July release, 16.2.11 / 15.5.21 ([post](https://nextjs.org/blog/july-2026-security-release))

| Severity | Issue | Affects | Advisory |
|---|---|---|---|
| High | DoS via Server Actions | App Router with Server Actions | CVE-2026-64641 |
| High | Middleware/proxy bypass | App Router + Turbopack + a single entry in `i18n.locales` | CVE-2026-64642 |
| High | SSRF / open redirect in `rewrites()`/`redirects()` | destination hostname built from request input | CVE-2026-64645 |
| High | SSRF in Server Actions on custom servers | attacker controls Host-associated headers | CVE-2026-64649 |
| Medium | DoS in Image Optimization with SVG | self-hosted, remote images configured | CVE-2026-64644 |
| Medium | Unbounded Server Action payload | Edge runtime | CVE-2026-64646 |
| Medium | Server Action / `use cache` endpoint id disclosure | App Router | CVE-2026-64643 |
| Medium | Cache confusion of `fetch` with request body (2 variants) | server `fetch` with body | CVE-2026-64648, CVE-2026-64647 |

## Before the program

| Date | Issue | Fixed in | Post |
|---|---|---|---|
| 2025-12-11 | RSC DoS (CVE-2025-55184, complete fix CVE-2025-67779) and source code exposure (CVE-2025-55183) | 14.2.35, 15.0.7, 15.1.11, 15.2.8, 15.3.8, 15.4.10, 15.5.9, 16.0.10 | [post](https://nextjs.org/blog/security-update-2025-12-11) |
| 2025-12-03 | **React2Shell** RCE in the RSC protocol (CVE-2025-66478 / upstream CVE-2025-55182); App Router 15.x-16.x, not 13.x/14.x stable or Pages Router; rotate secrets if exposed unpatched | 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7, 16.0.7 | [post](https://nextjs.org/blog/CVE-2025-66478) |
| 2023-10-23 | Not a CVE: the security model of Server Components and Actions (DAL, `server-only`, closures, CSRF) - still the basis of `server-actions.md` | - | [post](https://nextjs.org/blog/security-nextjs-server-components-actions) |

## What this means for Mdigital projects

- Image Optimization was the most frequent target (AVIF, SVG twice, SSRF): keep `remotePatterns` narrow, keep `sharp`
  current on `node:*-slim` (glibc) images, consider `unoptimized` for user-uploaded SVG.
- Server Actions appear in three advisories: any app with actions stays on the latest patch.
- Proxy/middleware was bypassed once: authorization lives in the DAL, actions and route handlers too.
- Cache Components had their own leaks: no secrets/PII in `'use cache'` arguments or tags.
- `next dev` should not be reachable from other origins; do not browse untrusted sites while the dev MCP endpoint
  runs on an unpatched version.
