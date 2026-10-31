# NOTICE

This app contains code forked from **shadcn/ui** (https://github.com/shadcn-ui/ui),
Copyright (c) 2023 shadcn, MIT License (see `LICENSE`, copied unchanged from upstream).

Upstream commit: `24a16429815cc4d691f38b49d0f4ffc11a9daef4` (2026-10-31).

| File here | Upstream file | Changes |
|---|---|---|
| `src/upstream/preset.ts` | `packages/registry/src/preset/preset.ts` | none (preset code encoder/decoder) |
| `src/upstream/themes.ts` | `apps/v4/registry/themes.ts` | `RegistryItem` type import made local |
| `src/upstream/base-colors.ts` | `apps/v4/registry/base-colors.ts` | import path |
| `src/upstream/font-definitions.ts` | `apps/v4/lib/font-definitions.ts` | none |
| `src/upstream/icon-libraries.ts` | `packages/registry/src/icons/libraries.ts` | none |
| `src/upstream/styles.ts` | `apps/v4/registry/styles.tsx` | SVG icons removed |
| `src/upstream/config.ts` | `apps/v4/registry/config.ts` | subset: RADII, MENU_*, getThemesForBaseColor, buildRegistryTheme, buildRegistryBase; no zod; transforms split out; Radix base only |
| `src/upstream/registry-item.schema.json` | `apps/v4/public/schema/registry-item.json` | none (used by tests) |
| `src/components/picker.tsx` | `apps/v4/app/(app)/(create)/components/picker.tsx` | trimmed, Mbank token classes, kit CheckIcon |

Patterns (not copied verbatim) from `apps/v4/app/(app)/(create)/`: `components/customizer.tsx`
(picker order), the individual `*-picker.tsx` files (generalised into `option-picker.tsx`),
`components/preview-override.tsx` (hover preview) and `components/design-system-provider.tsx`
(theme vars written into a `<style>`). Not forked: the docs site, auth, analytics, v0, iframe preview,
project/template download, history, locks, randomizer.

Own code also copies (with a comment in each file, not imported at runtime) from this repository:
`plugins/figma-pack/builder/core/color.js` → `src/lib/color.ts`, `scopesFor` from
`plugins/figma-pack/builder/core/tokens.js` → `src/lib/figma-scopes.ts`.
