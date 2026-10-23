# Sources

Checked October 2026.

## Security
- IETF OAuth WG, "OAuth 2.0 for Browser-Based Applications" - BFF, token-mediating backend, browser-only client ranked by security; BFF recommended for business and personal data. https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/
- OWASP HTML5 Security Cheat Sheet - do not store session identifiers in local storage. https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
- OWASP Cross Site Scripting Prevention Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Vite "Env Variables and Modes" - `VITE_*` is exposed to client code; do not put sensitive data there; `ImportMetaEnv` typing. https://vite.dev/guide/env-and-mode
- Next.js "Environment Variables" - `NEXT_PUBLIC_*` is inlined into the client bundle. https://nextjs.org/docs/app/guides/environment-variables
- Next.js "Content Security Policy" - nonce via proxy, dynamic rendering cost, `experimental.sri`, `'unsafe-eval'` only in development. https://nextjs.org/docs/app/guides/content-security-policy
- DOMPurify. https://github.com/cure53/DOMPurify
- npm audit. https://docs.npmjs.com/cli/commands/npm-audit

## i18n
- i18next plurals - `Intl.PluralRules` categories, `count` variable, `_zero`, ordinals. https://www.i18next.com/translation-function/plurals
- Unicode CLDR 48 language plural rules (ru: one/few/many/other; ky: one/other; en: one/other). https://www.unicode.org/cldr/charts/48/supplemental/language_plural_rules.html
- i18next TypeScript - `CustomTypeOptions`, typed resources. https://www.i18next.com/overview/typescript
- locize, "i18next TypeScript selector API" (verify the version in the changelog before adopting). https://locize.com/blog/i18next-typescript-selector-api
- react-i18next. https://react.i18next.com/
- MDN `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

## Related pack files
- `react-error-handling` [api-errors.md](../../react-error-handling/references/api-errors.md), [logging.md](../../react-error-handling/references/logging.md)
- `react-ux` [forms.md](../../react-ux/references/forms.md)
