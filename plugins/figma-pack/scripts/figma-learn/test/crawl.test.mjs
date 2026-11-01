import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createClient, tokenFromEnv, parseFileKey, parseTeamId, FigmaError, pool } from '../api.mjs';
import { crawlTeam, crawlFile, readJson } from '../crawl.mjs';
import { mockFigma, loadTeam } from '../fixtures/mock-figma.mjs';
import { run } from '../../figma-learn.mjs';
import { TEAM, tempRoot, noSleep } from './helpers.mjs';

const allFiles = (dir, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) allFiles(p, out); else out.push(p);
  }
  return out;
};

test('token comes from env only and is never echoed', async () => {
  assert.throws(() => tokenFromEnv({}), /FIGMA_ACCESS_TOKEN is not set/);
  assert.equal(tokenFromEnv({ FIGMA_ACCESS_TOKEN: ' figd_x ' }), 'figd_x');
  await assert.rejects(run(['crawl', '--team', TEAM, '--token', 'figd_secret']), /env FIGMA_ACCESS_TOKEN only/);
});

test('file keys and team ids parse from URLs', () => {
  assert.equal(parseFileKey('https://www.figma.com/design/MFsAQPQULevnHwBcECccGc/Web?node-id=1-2'), 'MFsAQPQULevnHwBcECccGc');
  assert.equal(parseFileKey('https://www.figma.com/file/abcDEF123456/x'), 'abcDEF123456');
  assert.equal(parseFileKey('MFsAQPQULevnHwBcECccGc'), 'MFsAQPQULevnHwBcECccGc');
  assert.throws(() => parseFileKey('not a key!'));
  assert.equal(parseTeamId('https://www.figma.com/files/team/1234567890/Mdigital'), '1234567890');
});

test('pool keeps order and limits concurrency', async () => {
  let live = 0;
  let peak = 0;
  const out = await pool([1, 2, 3, 4, 5], 2, async (x) => {
    live++; peak = Math.max(peak, live);
    await new Promise((r) => setTimeout(r, 2));
    live--;
    return x * 10;
  });
  assert.deepEqual(out, [10, 20, 30, 40, 50]);
  assert.equal(peak, 2);
});

test('429 waits Retry-After and retries; 5xx backs off; 403 explains scopes without the token', async () => {
  const m = mockFigma({ fail: { '/v1/teams': [429, 503] } });
  const { waits, sleep } = noSleep();
  const logs = [];
  const client = createClient({ token: m.token, fetch: m.fetch, sleep, log: (s) => logs.push(s) });
  const res = await client.get(`/v1/teams/${TEAM}/projects`);
  assert.equal(res.projects.length, 2);
  assert.deepEqual(waits, [2000, 2000], 'Retry-After 2 s, then backoff 2^1 s');
  assert.equal(client.calls(), 3);
  const bad = createClient({ token: 'wrong-token', fetch: m.fetch, sleep });
  await assert.rejects(bad.get(`/v1/teams/${TEAM}/projects`), (e) => e instanceof FigmaError && e.status === 403 && /file_content:read/.test(e.message) && !e.message.includes('wrong-token'));
  assert.ok(!logs.join('\n').includes(m.token));
});

test('crawl --team caches every file outside the repo and never writes the token', async () => {
  const root = tempRoot();
  const m = mockFigma({ fail: { '/v1/teams': [429] } });
  const client = createClient({ token: m.token, fetch: m.fetch, sleep: async () => {} });
  const r = await crawlTeam({ client, team: TEAM, root });
  assert.equal(r.projects, 2);
  assert.deepEqual(r.fetched.map((f) => f.name).sort(), ['CRM Клиенты', 'CRM Кредиты', 'Мобильный банк — Вход']);
  assert.equal(r.failed.length, 0);
  for (const key of ['FileCrmCredit01', 'FileCrmClients02', 'FileMobileAuth03']) {
    for (const f of ['file.json', 'nodes.json', 'components.json', 'meta.json']) assert.ok(existsSync(join(r.dir, 'files', key, f)), `${key}/${f}`);
  }
  const credit = readJson(join(r.dir, 'files', 'FileCrmCredit01', 'meta.json'));
  assert.equal(credit.screens, 4, 'Cover page is skipped; 4 frames in two Sections');
  assert.ok(m.calls.some((c) => c.startsWith('/v1/files/FileCrmCredit01?depth=3')));
  assert.ok(m.calls.some((c) => c.startsWith('/v1/files/FileCrmCredit01/nodes?ids=')));
  const state = readJson(join(r.dir, 'state.json'));
  assert.equal(state.files.FileCrmClients02.lastModified, '2026-10-25T09:30:00Z');
  for (const f of allFiles(root)) assert.ok(!readFileSync(f, 'utf8').includes(m.token), `token leaked into ${f}`);
});

test('crawl is incremental by last_modified, honours --since and --project', async () => {
  const root = tempRoot();
  const team = loadTeam();
  const m = mockFigma({ team });
  const client = createClient({ token: m.token, fetch: m.fetch, sleep: async () => {} });
  await crawlTeam({ client, team: TEAM, root });
  const before = m.calls.length;
  const again = await crawlTeam({ client, team: TEAM, root });
  assert.equal(again.fetched.length, 0);
  assert.deepEqual(again.skipped.map((s) => s.reason), ['unchanged', 'unchanged', 'unchanged']);
  assert.equal(m.calls.length - before, 3, 'only the team and two project listings');
  team.files['501'][1].last_modified = '2026-10-30T12:00:00Z';
  const changed = await crawlTeam({ client, team: TEAM, root });
  assert.deepEqual(changed.fetched.map((f) => f.key), ['FileCrmClients02']);
  const forced = await crawlTeam({ client, team: TEAM, root, force: true, since: '2026-10-01' });
  assert.deepEqual(forced.fetched.map((f) => f.key).sort(), ['FileCrmClients02', 'FileCrmCredit01']);
  assert.deepEqual(forced.skipped.map((s) => s.reason), ['older than --since']);
  const one = await crawlTeam({ client, team: TEAM, root: tempRoot(), project: 'Mobile' });
  assert.deepEqual(one.fetched.map((f) => f.key), ['FileMobileAuth03']);
  await assert.rejects(crawlTeam({ client, team: TEAM, root, project: 'nope' }), /not found/);
});

test('crawl --file works with a URL and skips an unchanged file', async () => {
  const root = tempRoot();
  const m = mockFigma();
  const client = createClient({ token: m.token, fetch: m.fetch, sleep: async () => {} });
  const r = await crawlFile({ client, key: parseFileKey('https://www.figma.com/design/FileMobileAuth03/Auth'), root });
  assert.equal(r.fetched[0].screens, 3);
  assert.ok(r.dir.endsWith('files'));
  const again = await crawlFile({ client, key: 'FileMobileAuth03', root });
  assert.equal(again.skipped[0].reason, 'unchanged');
});

test('CLI crawl + analyze through run() with env token and cache', async () => {
  const root = tempRoot();
  const m = mockFigma();
  const logs = [];
  const opts = { env: { FIGMA_ACCESS_TOKEN: m.token, FIGMA_LEARN_CACHE: root }, fetch: m.fetch, sleep: async () => {}, log: (s) => logs.push(s) };
  await run(['crawl', '--team', `https://www.figma.com/files/team/${TEAM}/Mdigital`], opts);
  const report = await run(['analyze', '--team', TEAM], opts);
  assert.equal(report.totals.files, 3);
  assert.ok(existsSync(join(root, TEAM, 'report.md')));
  assert.ok(!logs.join('\n').includes(m.token));
  await assert.rejects(run(['crawl', '--team', TEAM], { ...opts, env: { FIGMA_LEARN_CACHE: root } }), /not set/);
});
