# Spec → code

The screen spec (one JSON, format in [figma-pack builder](../../../../figma-pack/builder/README.md)) is the single source of a CRM: the Figma plugin draws the frames from it, [`scripts/spec-to-code.mjs`](../../../scripts/spec-to-code.mjs) writes the React code from it. Write or change the spec first, then regenerate both.

```bash
# PLUGIN = path to plugins/frontend-pack
node $PLUGIN/scripts/new-crm.mjs ../loans-crm --name "Mbank Кредиты"        # once
node $PLUGIN/scripts/spec-to-code.mjs loans.spec.json --project ../loans-crm --dry-run   # plan only
node $PLUGIN/scripts/spec-to-code.mjs loans.spec.json --project ../loans-crm
node $PLUGIN/scripts/spec-to-code.mjs loans.spec.json --project ../loans-crm --only app-card   # one screen
cd ../loans-crm && npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build
```

Works in both kit modes of `new-crm.mjs`: package (`@mdigital/mbank-ui`, `@mdigital/mbank-ui/crm`) or `--kit copy` (`@/shared/ui/*`, `@/shared/components/crm/*`); the mode is read from the project's `package.json`.

## What it writes

Per screen `<id>`, route `/<id>`:

```
src/pages/<id>/          <Id>Page.tsx (route component, search in the URL), UX.md (from the spec), <Id>Page.test.tsx
src/features/<id>/api/   schemas.ts (zod: payload, URL search, form result), queries.ts (<id>Keys factory + queryOptions),
                         <id>.fixtures.ts (spec data, the same fake data as in Figma), <id>.handlers.ts (MSW), mutations.ts
src/features/<id>/lib/   messages.ts (all copy), status.ts (status label → badge tone), form.ts (form schema)
src/features/<id>/ui/    <Id>View.tsx (query + states) and one component per block; index.ts = public API
```

App files: `src/app/router.tsx` (routes, `/` → first menu screen, placeholder pages for menu items without a screen), `navigation.ts` (from `spec.nav`, groups → sections), `route-header.ts` (+ `plain` for shell `plain`), `AppLayout.tsx`, `AppHeader.tsx` (`spec.user`, header search → the first screen with a toolbar search), `AppSideMenu.tsx`, `src/mocks/handlers.ts` (all feature handlers), `src/mocks/lib.ts`, `src/shared/api/devMock.ts`, `src/shared/components/FormField.tsx`. The template demo (pipeline, application) is removed while it is untouched.

## Blocks → components

| Spec block | Code |
|---|---|
| `header` | title → `TopHeader` h1 (route `staticData.header`); with `breadcrumbs` → `Breadcrumbs` + `SummaryHeader` (h1, badge, actions); subtitle / badge / actions → `Badge`, `Button` (`+ …` = primary with `PlusIcon`) |
| `stats` | `KpiCard` grid, `loading` skeletons |
| `table` | kit `Table` (caption, skeleton rows), `Badge` for `status`, `Checkbox` for `selectable`, ghost `Button` + `MoreVerticalIcon` for `actions` |
| `toolbar` | `Input type=search` (`?q=`), kit `Select` per filter (`?<filter>=`, options from the table column with that label) |
| `pagination` | outline `Button`s + "Показано a–b из N" (`?page=`) |
| `tabs` | kit `Tabs` `line` (`?tab=`) |
| `kanban` | `Board` + `BoardColumn` + `ApplicationCard` (link to the screen with `details`/`stepper` in the same menu item), `BoardSkeleton` |
| `chart` | `Card` + bars on tokens (no chart library in the kit) |
| `list` | `Card` + `Avatar` + `Badge` rows |
| `details` | `KeyValueSection` + `KeyValueRow` |
| `timeline` | `Timeline` + `TimelineItem` |
| `stepper` | `StageStepper` (`current` from the spec) |
| `cards` | grid of `Card` + `Badge` |
| `alert` | kit `Alert` (`warning`, `destructive` → `error`, `success`, `info`) |
| `form` | `FormField` + `Input` (phone, money, date, email, number) / `Select` / `Checkbox` / `Textarea`; zod in `lib/form.ts`, `useMutation` POST |
| `login` | `Card` + email / password `FormField`s, POST `/session`, 401 → error `Alert`, success → first menu screen |
| `empty` | `EmptyState` |
| `split` | CSS grid `lg:grid-cols-[2fr_1fr]` from `ratio` |
| unknown type | `<Screen><Type>.tsx` with a `TODO(spec-to-code)` note + a warning |

## States

Every data screen is one `GET /api/screens/<id>` (one key per data block) through TanStack Query: loading → block skeletons + a `role="status"` line; 5xx → `ErrorState` with Retry (header stays); 403 → "Нет доступа"; all list blocks empty → `EmptyState` from `screen.empty` in place of the first list (other lists and pagination hidden). In the browser: `?mock=empty | error | no-access | action-error`. Tests cover data, loading, error + retry, 403, empty, paging and search (URL), form validation / submit / server error, login success / wrong password.

## Regeneration is safe

Each generated file starts with `@generated spec-to-code <hash>`. On the next run a file is replaced only if it is unchanged since generation or still the untouched template file. An edited file is kept and reported (`kept (edited)`); merge by hand or pass `--force`. Delete the marker line to take a file over for good.

## Not generated (do by hand)

- Header actions, table row menus, empty-state buttons: rendered with `TODO(spec-to-code)` — wire them to routes or mutations.
- The API contract is invented (`/api/screens/<id>`, all values pre-formatted strings): replace schemas and handlers with the real API when it exists.
- Forms use zod + `useState` (react-hook-form is not in the template). Required selects default to their first option.
- Roles: the `no-access` state is wired to 403, there is no route guard.
