// Shared setup for figma-learn tests: a temp cache crawled from the fixtures through the mock API.
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createClient } from '../api.mjs';
import { crawlTeam } from '../crawl.mjs';
import { mockFigma } from '../fixtures/mock-figma.mjs';
import { analyze } from '../analyze.mjs';
import { loadCatalog, loadTokens } from '../library.mjs';
import { fileURLToPath } from 'node:url';

export const TEAM = '1234567890';
export const tempRoot = () => mkdtempSync(join(tmpdir(), 'figma-learn-'));
export const noSleep = () => {
  const waits = [];
  return { waits, sleep: async (ms) => { waits.push(ms); } };
};

// A components map in the design-engine format, small and local to the tests (no path into another plugin).
export const MAP = JSON.parse(
  (await import('node:fs')).readFileSync(fileURLToPath(new URL('./components-map.fixture.json', import.meta.url)), 'utf8'),
);

let cached = null;
/** Crawls the fixture team once per test process; returns { root, dir, report, mock }. */
export async function crawled() {
  if (cached) return cached;
  const root = tempRoot();
  const mock = mockFigma();
  const client = createClient({ token: mock.token, fetch: mock.fetch, sleep: async () => {} });
  const result = await crawlTeam({ client, team: TEAM, root });
  const report = analyze(result.dir, { catalog: loadCatalog(), map: MAP, tokens: loadTokens() });
  cached = { root, dir: result.dir, report, mock, result };
  return cached;
}
