# End-to-end with Playwright

Use for 3-10 critical journeys per product. If the project uses Scenario Lab (YAML scenarios compiled to Playwright, GitLab CI), write scenarios there instead and keep these rules for anything hand-written.

`@playwright/test` is not yet in `rules/libraries.json`: confirm with the user (or the brain's integration owner) before adding it to a project.

## Layout

```
e2e/
  auth.setup.ts          # logs in once, saves storageState
  orders.spec.ts         # one file per journey
  fixtures/              # test data builders, page helpers
playwright.config.ts
```

## playwright.config.ts (essentials)

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' }, dependencies: ['setup'] },
    { name: 'mobile', use: { ...devices['Pixel 7'], storageState: 'e2e/.auth/user.json' }, dependencies: ['setup'] },
  ],
  webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
})
```

`e2e/.auth/` goes to `.gitignore`: it holds a live session. Test credentials come from CI variables, never from the repo.

## Rules

- Locators: `getByRole(..., { name })`, `getByLabel`, `getByText`; `getByTestId` only where nothing accessible exists. No CSS or XPath selectors.
- Web-first assertions only: `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`. They retry; manual `isVisible()` checks and `waitForTimeout` do not.
- Each test is independent: own data (create it through the API in a fixture), no order dependency, runs in parallel.
- Auth once in the `setup` project and reuse `storageState`; do not log in through the UI in every test.
- Third-party services (payments, maps, analytics) are stubbed with `page.route`; our own backend is real (staging) or a dedicated E2E stand.
- Lint e2e with `@typescript-eslint/no-floating-promises` and type-check with `tsc --noEmit`: a missing `await` is the top cause of flaky Playwright tests.
- A flaky test is a bug: open the trace (`npx playwright show-trace`), fix the cause; do not raise timeouts or add retries in code.

## Example

```ts
import { test, expect } from '@playwright/test'

test('manager creates an order and finds it in the list', async ({ page }) => {
  await page.goto('/orders')
  await page.getByRole('button', { name: 'Создать заказ' }).click()
  await page.getByLabel('Email').fill('client@example.kg')
  await page.getByLabel('Количество').fill('2')
  await page.getByRole('button', { name: 'Создать заказ' }).click()

  await expect(page).toHaveURL(/\/orders\/[\w-]+$/)
  await page.goto('/orders?q=client@example.kg')
  await expect(page.getByRole('row', { name: /client@example\.kg/ })).toBeVisible()
})
```

## Playwright test agents (optional)

Playwright 1.56+ ships agents for Claude Code: `npx playwright init-agents --loop=claude` generates `.claude/agents` (planner, generator, healer), `.mcp.json` and a seed test.

- Regenerate the agents after every Playwright upgrade.
- Review every healer diff like any other code change: it may "fix" a test by weakening the assertion.
- Generated specs must follow the rules above (role locators, web-first assertions) before merge.

## Accessibility in E2E

Run an axe scan on each critical page inside the journey (via `@axe-core/playwright`, pending approval in `libraries.json`) and fail on serious and critical violations. Audit procedure: `react-performance-a11y` [a11y-audit.md](../../react-performance-a11y/references/a11y-audit.md).
