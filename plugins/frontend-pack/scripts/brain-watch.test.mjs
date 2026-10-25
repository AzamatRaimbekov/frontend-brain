// Tests for brain-watch.mjs, no network. Run: node --test plugins/frontend-pack/scripts/brain-watch.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  SOURCES_FILE, STATE_FILE, TYPES, newSince, nextState, parseArgs, parseCommits, parseFeed, parseNpm, parseReleases, render, watch,
} from './brain-watch.mjs';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Blog</title>
<item><title><![CDATA[Next.js 16.4]]></title><link>https://nextjs.org/blog/next-16-4</link>
<guid isPermaLink="false">/blog/next-16-4</guid><pubDate>Tue, 06 Oct 2026 16:00:00 GMT</pubDate></item>
<item><title>Security &amp; you</title><link>https://nextjs.org/blog/sec</link><guid>/blog/sec</guid>
<pubDate>Wed, 14 Oct 2026 10:00:00 GMT</pubDate></item>
<item><title>Old post</title><link>https://nextjs.org/blog/old</link><pubDate>Mon, 01 Jun 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`;

const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>tag:github.com,2008:Repository/1/v2.0.2</id>
<updated>2026-10-14T18:40:49Z</updated><link rel="alternate" type="text/html" href="https://github.com/figma/code-connect/releases/tag/v2.0.2"/>
<title>Code Connect 2.0.2</title></entry></feed>`;

const RELEASES = [
  { tag_name: 'v16.5.0-canary.27', name: 'v16.5.0-canary.27', prerelease: true, draft: false, html_url: 'u1', published_at: '2026-10-24T23:47:46Z' },
  { tag_name: 'v16.4.3', name: 'v16.4.3', prerelease: false, draft: false, html_url: 'u2', published_at: '2026-10-23T13:32:31Z' },
  { tag_name: 'create-vite@9.3.1', name: '', prerelease: false, draft: false, html_url: 'u3', published_at: '2026-10-20T03:01:54Z' },
  { tag_name: 'v16.4.2', name: 'v16.4.2', prerelease: false, draft: true, html_url: 'u4', published_at: '2026-10-15T00:00:00Z' },
  { tag_name: 'v16.4.1', name: 'v16.4.1', prerelease: false, draft: false, html_url: 'u5', published_at: '2026-10-14T00:00:00Z' },
];

test('RSS items are parsed, decoded and sorted newest first', () => {
  const items = parseFeed(RSS);
  assert.deepEqual(items.map((i) => i.id), ['/blog/sec', '/blog/next-16-4', 'https://nextjs.org/blog/old']);
  assert.equal(items[0].title, 'Security & you');
  assert.equal(items[1].title, 'Next.js 16.4');
  assert.equal(items[1].url, 'https://nextjs.org/blog/next-16-4');
  assert.equal(items[1].date, '2026-10-06T16:00:00.000Z');
});

test('Atom entries take the link from href and the date from updated', () => {
  const [item] = parseFeed(ATOM);
  assert.equal(item.url, 'https://github.com/figma/code-connect/releases/tag/v2.0.2');
  assert.equal(item.date, '2026-10-14T18:40:49.000Z');
  assert.equal(item.title, 'Code Connect 2.0.2');
});

test('GitHub releases drop drafts, prereleases and tags outside match', () => {
  assert.deepEqual(parseReleases(RELEASES, { match: '^v\\d' }).map((i) => i.id), ['v16.4.3', 'v16.4.1']);
  assert.deepEqual(parseReleases(RELEASES, { match: '^v\\d', prereleases: true }).map((i) => i.id), ['v16.5.0-canary.27', 'v16.4.3', 'v16.4.1']);
  assert.equal(parseReleases(RELEASES).length, 3, 'no match: every non-draft stable tag');
  assert.equal(parseReleases(RELEASES)[1].title, 'create-vite@9.3.1', 'empty name falls back to the tag');
});

test('commits keep the short sha and the first line of the message', () => {
  const [c] = parseCommits([{ sha: 'abcdef1234567', html_url: 'u', commit: { message: 'Add rule\n\nbody', committer: { date: '2026-10-05T20:49:16Z' } } }]);
  assert.equal(c.title, 'abcdef1 Add rule');
  assert.equal(c.id, 'abcdef1234567');
});

test('npm versions come with publish time, prereleases skipped', () => {
  const doc = { name: '@tanstack/react-query', versions: { '5.104.4': {}, '5.104.5': {}, '6.0.0-beta.1': {} },
    time: { created: '2020-01-01T00:00:00Z', modified: '2026-10-19T00:00:00Z', '5.104.4': '2026-10-17T00:00:00Z', '5.104.5': '2026-10-19T00:00:00Z', '6.0.0-beta.1': '2026-10-20T00:00:00Z' } };
  assert.deepEqual(parseNpm(doc).map((i) => i.id), ['5.104.5', '5.104.4']);
  assert.match(parseNpm(doc)[0].url, /npmjs\.com\/package\/@tanstack\/react-query\/v\/5\.104\.5$/);
});

test('state diff: anchor id, date fallback, --since override, no state', () => {
  const items = parseFeed(RSS);
  assert.deepEqual(newSince(items, { state: { id: '/blog/next-16-4' } }).map((i) => i.id), ['/blog/sec']);
  assert.deepEqual(newSince(items, { state: { id: 'gone', date: '2026-10-01T00:00:00.000Z' } }).map((i) => i.id), ['/blog/sec', '/blog/next-16-4']);
  assert.equal(newSince(items, { state: { id: '/blog/sec' } }).length, 0);
  assert.equal(newSince(items, { since: '2026-05-01T00:00:00.000Z' }).length, 3);
  assert.equal(newSince(items, {}).length, 0, 'first run without state shows nothing');
});

test('watch reports offline and rate-limited sources as skipped and keeps their state', async () => {
  const sources = [
    { id: 'blog', name: 'Blog', type: 'rss', url: 'https://x/feed.xml', affects: ['skills/a'] },
    { id: 'rel', name: 'Rel', type: 'github-releases', repo: 'o/r', affects: [] },
    { id: 'down', name: 'Down', type: 'npm', package: 'p', affects: [] },
  ];
  const fetchImpl = async (url) => {
    if (url.includes('feed.xml')) return new Response(RSS, { status: 200 });
    if (url.includes('api.github.com')) return new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } });
    throw new TypeError('fetch failed', { cause: { code: 'ENOTFOUND' } });
  };
  const state = { blog: { id: '/blog/next-16-4' }, rel: { id: 'v1', date: '2026-01-01' } };
  const results = await watch({ sources, state, fetchImpl, env: {} });
  assert.deepEqual(results.map((r) => r.status), ['ok', 'skipped', 'skipped']);
  assert.match(results[1].reason, /rate limit/);
  assert.match(results[2].reason, /ENOTFOUND/);
  assert.deepEqual(results[0].items.map((i) => i.id), ['/blog/sec']);
  const next = nextState(results, state, '2026-10-25');
  assert.equal(next.sources.blog.id, '/blog/sec');
  assert.deepEqual(next.sources.rel, state.rel, 'skipped source keeps the old anchor');
  assert.match(render(results), /## Blog \(blog\) — 1 нов\.[\s\S]*Затрагивает: skills\/a[\s\S]*## Пропущено/);
});

test('arguments: bad --since and unknown flags are errors, others parse', () => {
  assert.ok(parseArgs(['--since', '01.09.2026']).error);
  assert.ok(parseArgs(['--nope']).error);
  const opts = parseArgs(['--since', '2026-09-01', '--json', '--update-state']);
  assert.equal(opts.since, '2026-09-01T00:00:00.000Z');
  assert.ok(opts.json && opts.updateState);
  const cli = spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'brain-watch.mjs'), '--bogus'], { encoding: 'utf8' });
  assert.equal(cli.status, 2);
});

test('watch-sources.json is valid: unique ids, known types, affected paths exist, state ids known', () => {
  const { sources } = JSON.parse(readFileSync(SOURCES_FILE, 'utf8'));
  const ids = sources.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
  for (const s of sources) {
    assert.ok(TYPES.includes(s.type), `${s.id}: type`);
    assert.ok(s.name && s.affects?.length, `${s.id}: name and affects`);
    if (s.type === 'rss') assert.match(s.url, /^https:\/\//, `${s.id}: url`);
    if (s.type.startsWith('github')) assert.match(s.repo, /^[\w.-]+\/[\w.-]+$/, `${s.id}: repo`);
    if (s.type === 'npm') assert.ok(s.package, `${s.id}: package`);
    if (s.match) new RegExp(s.match);
    for (const p of s.affects) assert.ok(existsSync(join(PLUGIN, p)), `${s.id}: affects ${p} does not exist`);
  }
  const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  for (const id of Object.keys(state.sources)) assert.ok(ids.includes(id), `watch-state has unknown source ${id}`);
});
