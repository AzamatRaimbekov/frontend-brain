---
name: react-testing
description: Mdigital testing standard for React 19 + TypeScript apps (Vite + TanStack Router or Next.js App Router) - test pyramid, Vitest + Testing Library + user-event + MSW, what to test per layer (schemas, queryOptions, hooks, forms, pages), every UI state (loading, empty, 500, 422), test file placement and naming, coverage expectations, CI commands, and Playwright or Scenario Lab for end-to-end flows. Use when writing, fixing or reviewing tests, adding a feature that needs tests, setting up the test runner, or deciding what to cover. Triggers - "напиши тесты", "покрой тестами", "тест страницы", "моки", "MSW", "vitest", "e2e", "playwright", "покрытие", "тесты падают", "flaky", "write tests", "add tests", "test this page", "mock the API", "coverage", "flaky test", "e2e test".
---

# React testing (Mdigital)

When running in Codex, first read [Codex integration](../../references/codex.md).

Tests prove behaviour the user sees, through the same code paths production uses. Mock the **network**, never our own hooks, fetchers or components.

Owners this skill builds on (do not restate them differently):
- MSW handlers, `renderWithClient`, fresh `QueryClient` per test, data-fetching cases: `react-data-fetching` [references/testing.md](../react-data-fetching/references/testing.md).
- `ApiError` kinds and `applyServerErrors`: `react-error-handling` [references/api-errors.md](../react-error-handling/references/api-errors.md).
- Which states a screen must have (loading, empty, error, success): `react-ux` [SKILL.md](../react-ux/SKILL.md).
- Allowed packages: `rules/libraries.json` (`vitest`, `@testing-library/react + user-event + jest-dom + jsdom`, `msw`, `msw-storybook-addon`).

## 1. Pyramid for our stack

| Layer | Tool | What it proves | Share of tests |
|---|---|---|---|
| Unit | Vitest (node env) | Zod schemas, pure `lib/` functions, `getUserMessage`, query key factories | many, milliseconds each |
| Integration (component / page) | Vitest + Testing Library + user-event + MSW (jsdom) | A feature renders every state, forms validate and submit, mutations update the list | **the bulk of value** |
| End-to-end | Playwright or Scenario Lab, against a running build | Critical user journeys across pages: login, checkout, create-and-find | few, only critical paths |

Rule of thumb: if a bug would reach the user, an integration test should be able to catch it. E2E is for journeys that cross routes, auth and real backends, not for every field.

## 2. What to test per layer

| Code | Test it with | Must cover |
|---|---|---|
| `features/<f>/api/*.schemas.ts` | unit | valid payload parses; a missing or wrong field fails (contract break) |
| `features/<f>/lib/*.ts` (pure) | unit | edge cases: empty, boundary, invalid input |
| `*.queries.ts` (`queryOptions`) | integration via the hook or page, MSW | success, 500, empty; the key changes when params change |
| `*.mutations.ts` | integration via the form or page | success invalidates and the UI shows the result; 422 lands on fields; optimistic update rolls back on error |
| Custom hooks with state | `renderHook` from `@testing-library/react` only if the hook has logic beyond wiring; otherwise test through the component | transitions, not internals |
| Forms | integration | required errors appear only after blur or submit; submit sends the right payload; server 422 maps to the field; input survives a failed submit |
| Pages | integration with MSW, routed when the page reads search params | loading, empty, error with Retry, success; URL params restore the UI |
| `shared/ui` primitives from shadcn | not unit-tested; covered by pages and Storybook a11y | - |

Do not test: implementation details (state variable names, number of renders, class names), third-party libraries, snapshots of whole pages. Snapshot tests are forbidden for components; they pass on regressions and fail on harmless markup changes.

## 3. Every screen state, every time

For each page or widget with server data, write these four tests minimum. Full working example: [references/page-test-example.md](references/page-test-example.md).

| State | How to produce it | Assert |
|---|---|---|
| Loading | default handler with `await delay()` from `msw`, or assert before data arrives | skeleton region is present (`getByRole('status')` or test id on the skeleton container), no empty state |
| Empty | `server.use(http.get('*/orders', () => HttpResponse.json([])))` | empty-state title and its primary action |
| Server error (500) | `server.use(... HttpResponse.json({ code: 'internal' }, { status: 500 }))` | `ErrorState` text from `getUserMessage`, Retry refetches and shows data |
| Validation (422) | `server.use(... HttpResponse.json({ errors: { email: ['taken'] } }, { status: 422 }))` on the mutation | message on the field (`aria-invalid="true"`, text visible), focus on the first invalid field, no global toast |

Add when relevant: 401/403 (redirect or no-access view), contract break (`ApiError` kind `contract` reaches the boundary), pagination keeps previous rows, optimistic rollback.

## 4. Writing tests

- Query by what the user perceives, in this order: `getByRole` (with `name`), `getByLabelText`, `getByText`, `getByPlaceholderText`; `getByTestId` only for regions with no accessible name (skeleton container).
- Interact with `userEvent.setup()` and `await user.click/type`. No `fireEvent` except for events user-event cannot produce.
- Wait with `findBy*` or `waitFor`; never `setTimeout` sleeps. Assert absence with `queryBy*`.
- One behaviour per test, name it as a sentence: `it('shows the empty state with a create button when there are no orders')`.
- Arrange data with fixture builders (`orderFixture({ status: 'closed' })`) next to the handlers; no shared mutable fixtures.
- Every `await` is awaited: `@typescript-eslint/no-floating-promises` stays on in test files.
- Routed pages: render inside a memory router (TanStack Router `createMemoryHistory` + `RouterProvider`; Next.js: test the page's client component and mock only `next/navigation` hooks). Helper code: [references/page-test-example.md](references/page-test-example.md).
- i18n: render with the real i18n instance and `ru` resources so tests catch missing keys; assert on translated text.
- Time: `vi.useFakeTimers({ shouldAdvanceTime: true })` only for debounce or undo-toast timers; restore in `afterEach`.

## 5. File placement and naming

```
src/features/orders/
  api/order.schemas.test.ts          # unit, next to the file under test
  api/__mocks__/order.handlers.ts    # MSW handlers + fixtures for this feature
  components/OrderForm.test.tsx      # integration
src/pages/orders/OrdersPage.test.tsx # page integration
src/test/                            # server.ts, render.tsx (renderWithClient, renderRoute)
e2e/                                 # Playwright specs or Scenario Lab scenarios, outside src/
```

- `*.test.ts(x)` next to the code. No `__tests__` folders, no `*.spec.tsx` inside `src/` (`*.spec.ts` is reserved for Playwright in `e2e/`).
- Handler and fixture layout follows `react-data-fetching` [testing.md](../react-data-fetching/references/testing.md): per-feature handlers in `api/__mocks__/`, assembled once in `src/test/server.ts`. The same handlers serve Storybook and local dev.
- `*.test.tsx` files are exempt from the 150-line `max-lines` rule (`react-architecture` section 2), but keep one `describe` per unit under test and split a file by behaviour when it becomes hard to scan.

## 6. Config and CI

`vitest.config.ts` (or the `test` block of `vite.config.ts`): `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, `globals: false`, `restoreMocks: true`. `vitest.setup.ts` (project root, same name as in `react-data-fetching` testing.md) imports `@testing-library/jest-dom/vitest`, starts the MSW server with `onUnhandledRequest: 'error'` and resets handlers after each test (code in [references/page-test-example.md](references/page-test-example.md)).

CI order (GitLab), each step must pass:

```bash
npx tsc --noEmit -p .          # Vite: -p tsconfig.app.json
npm run lint
npx vitest run                 # add --coverage when the coverage provider is installed
npm run build
npx playwright test            # only for projects with e2e/, against the built app
```

Coverage expectations (a floor, not a target to game): `features/**/api` and `features/**/lib` 80 % lines; every page has the four state tests from section 3; every bug fix ships with a test that failed before the fix. Do not chase 100 % on JSX.

## 7. End-to-end

- Projects that use Scenario Lab keep E2E there: scenarios are YAML compiled to Playwright, run in GitLab CI; load the `scenario-lab` plugin skills to write them.
- Otherwise use Playwright directly, following [references/e2e-playwright.md](references/e2e-playwright.md): role and label locators, web-first assertions, auth once via `storageState`, external services stubbed with `page.route`, `trace: 'on-first-retry'`.
- E2E covers 3-10 critical journeys per product; every other behaviour belongs in integration tests.

## Anti-patterns (reject in review)

- `vi.mock` of our own hooks, `queryOptions`, `http` or `fetch` (`vi.spyOn(global, 'fetch')`); use MSW.
- A shared `QueryClient` across tests; `retry` left on; unhandled requests passing silently.
- `container.querySelector`, CSS-class or `data-testid` locators when a role or label exists.
- `await new Promise(r => setTimeout(r, 500))`, `waitFor` around a `getBy` that should be `findBy`.
- Snapshot tests of components or pages; tests asserting state variables or render counts.
- Only the happy path tested; the four states missing.
- Tests that pass with the feature broken (assert nothing user-visible, or assert on mocks).

## Checklist before finishing

- [ ] Schemas and pure `lib/` functions have unit tests including a failing input.
- [ ] Each changed page or data widget has loading, empty, 500 (with Retry) and success tests via MSW.
- [ ] Each form has: validation timing, successful submit payload, 422 mapped to a field, input kept on failure.
- [ ] No mocks of our own modules; `onUnhandledRequest: 'error'`; fresh `QueryClient` with `retry: false`.
- [ ] Locators are role or label first; no sleeps; all promises awaited.
- [ ] Files are `*.test.ts(x)` next to the code; handlers in `api/__mocks__/`.
- [ ] `tsc`, lint, `vitest run`, build pass; E2E updated if a critical journey changed.

Sources: [references/sources.md](references/sources.md).
