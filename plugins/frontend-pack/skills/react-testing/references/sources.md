# Sources

Checked October 2026.

## Unit and integration
- Testing Library guiding principles and query priority (role, label, text; test id last). https://testing-library.com/docs/queries/about/#priority
- user-event v14: `userEvent.setup()` and awaited interactions. https://testing-library.com/docs/user-event/intro
- Vitest configuration (`environment`, `setupFiles`, `globals`, `restoreMocks`). https://vitest.dev/config/
- Vitest 4 announcement - browser mode is stable (`@vitest/browser-playwright`, `vitest-browser-react`). Not adopted yet: our default stays jsdom per `rules/libraries.json`; browser mode for component tests is a pending proposal. https://voidzero.dev/posts/announcing-vitest-4 , https://github.com/vitest-dev/vitest-browser-react , https://www.infoq.com/news/2025/12/vitest-4-browser-mode
- MSW quick start and API (`setupServer`, `server.use`, `resetHandlers`, `delay`). `onUnhandledRequest: 'error'` is our policy, not an MSW default. https://mswjs.io/docs/quick-start , https://mswjs.io/docs/
- TanStack Query testing guide - fresh `QueryClient` per test, `retry: false`, explicit `retry` on a query overrides the default. https://tanstack.com/query/latest/docs/framework/react/guides/testing
- i18next `missingKey` event (requires `saveMissing: true`). https://www.i18next.com/overview/api#onmissingkey

## End-to-end
- Playwright best practices - user-facing locators, web-first assertions, isolation, `page.route` for third parties, `no-floating-promises`. https://playwright.dev/docs/best-practices
- Playwright authentication with a setup project and `storageState`. https://playwright.dev/docs/auth
- Playwright test agents (planner, generator, healer; `init-agents --loop=claude`). https://playwright.dev/docs/test-agents
- Scenario Lab - the company's E2E tool (YAML scenarios compiled to Playwright, GitLab CI); installed as the `scenario-lab` Claude Code plugin.

## Related pack files
- `react-data-fetching` [testing.md](../../react-data-fetching/references/testing.md) - canonical MSW + QueryClient test setup.
- `react-error-handling` [api-errors.md](../../react-error-handling/references/api-errors.md) - `ApiError`, `errorBodySchema`, `applyServerErrors`.
