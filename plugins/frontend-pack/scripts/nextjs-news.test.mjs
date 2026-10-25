// Tests for nextjs-news.mjs parsing, without network. Run: node --test plugins/frontend-pack/scripts/nextjs-news.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  parseFeed, parseVersion, formatVersion, compareVersions, behind, pickReleases,
  readProjectVersion, isSecurityRelease, upgradeGuide, render, VERIFIED,
} from './nextjs-news.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
  <title><![CDATA[Next.js Blog]]></title>
  <item>
    <title><![CDATA[Next.js 16.3]]></title>
    <description><![CDATA[Instant Navigations &amp; more]]></description>
    <link>https://nextjs.org/blog/next-16-3</link>
    <pubDate>Mon, 03 Aug 2026 17:00:00 GMT</pubDate>
  </item>
  <item>
    <title><![CDATA[Next.js 16.4]]></title>
    <link>https://nextjs.org/blog/next-16-4</link>
    <pubDate>Tue, 06 Oct 2026 20:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Upcoming Next.js Security Update</title>
    <link>https://nextjs.org/blog/upcoming</link>
    <pubDate>Thu, 08 Oct 2026 18:00:00 GMT</pubDate>
  </item>
</channel></rss>`;

const v = parseVersion;

test('parseFeed reads CDATA and plain titles, ISO dates, newest first, respects limit', () => {
  const posts = parseFeed(FEED);
  assert.deepEqual(posts.map((p) => p.title), ['Upcoming Next.js Security Update', 'Next.js 16.4', 'Next.js 16.3']);
  assert.equal(posts[1].date, '2026-10-06');
  assert.equal(posts[1].link, 'https://nextjs.org/blog/next-16-4');
  assert.equal(posts[2].description, 'Instant Navigations & more');
  assert.equal(parseFeed(FEED, 1).length, 1);
  assert.deepEqual(parseFeed('<rss></rss>'), []);
});

test('parseVersion accepts ranges, tags and prereleases', () => {
  assert.deepEqual(v('^15.3.0'), { major: 15, minor: 3, patch: 0, pre: '' });
  assert.deepEqual(v('>=14'), { major: 14, minor: 0, patch: 0, pre: '' });
  assert.deepEqual(v('v16.5.0-canary.27'), { major: 16, minor: 5, patch: 0, pre: 'canary.27' });
  assert.equal(v('latest'), null);
  assert.equal(formatVersion(v('~16.4.1')), '16.4.1');
});

test('compareVersions: numeric parts, release after its prereleases, canary.10 after canary.9', () => {
  assert.ok(compareVersions(v('16.4.3'), v('16.4.10')) < 0);
  assert.ok(compareVersions(v('16.5.0'), v('16.5.0-canary.27')) > 0);
  assert.ok(compareVersions(v('16.5.0-canary.10'), v('16.5.0-canary.9')) > 0);
  assert.equal(compareVersions(v('16.4.3'), v('v16.4.3')), 0);
});

test('behind reports the largest differing part', () => {
  assert.equal(behind(v('15.3.0'), v('16.4.3')), 'major');
  assert.equal(behind(v('16.2.1'), v('16.4.3')), 'minor');
  assert.equal(behind(v('16.4.1'), v('16.4.3')), 'patch');
  assert.equal(behind(v('16.4.3'), v('16.4.3')), 'none');
  assert.equal(behind(v('16.5.0-canary.1'), v('16.4.3')), 'ahead');
});

test('pickReleases picks the highest stable even if a backport was published later', () => {
  const rel = (tag, prerelease, date, extra = {}) => ({ tag_name: tag, prerelease, published_at: `${date}T00:00:00Z`, html_url: `u/${tag}`, ...extra });
  const picked = pickReleases([
    rel('v16.5.0-canary.27', true, '2026-10-24'),
    rel('v15.5.28', false, '2026-10-24'),
    rel('v16.4.3', false, '2026-10-23'),
    rel('v16.5.0-canary.9', true, '2026-10-10'),
    rel('v17.0.0', false, '2026-10-25', { draft: true }),
  ]);
  assert.equal(picked.stable.tag, 'v16.4.3');
  assert.equal(picked.canary.tag, 'v16.5.0-canary.27');
  assert.equal(picked.sameMajor(15).tag, 'v15.5.28');
  assert.equal(picked.sameMajor(14), null);
});

test('readProjectVersion prefers node_modules, then lockfiles, then the declared range', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nextjs-news-'));
  try {
    assert.match(readProjectVersion(dir).error, /package\.json/);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '19.2.0' } }));
    assert.match(readProjectVersion(dir).error, /next/);

    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '^15.3.0' } }));
    let r = readProjectVersion(dir);
    assert.equal(formatVersion(r.version), '15.3.0');
    assert.match(r.source, /package\.json/);

    writeFileSync(join(dir, 'pnpm-lock.yaml'), "importers:\n  .:\n    dependencies:\n      next:\n        specifier: ^15.3.0\n        version: 15.5.4(react@19.2.0)\n");
    r = readProjectVersion(dir);
    assert.equal(formatVersion(r.version), '15.5.4');
    assert.equal(r.source, 'pnpm-lock.yaml');

    writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({ packages: { 'node_modules/next': { version: '15.5.27' } } }));
    assert.equal(formatVersion(readProjectVersion(dir).version), '15.5.27');

    mkdirSync(join(dir, 'node_modules', 'next'), { recursive: true });
    writeFileSync(join(dir, 'node_modules', 'next', 'package.json'), JSON.stringify({ version: '15.5.28' }));
    r = readProjectVersion(dir);
    assert.equal(formatVersion(r.version), '15.5.28');
    assert.equal(r.declared, '^15.3.0');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('yarn.lock is read when there is no other lockfile', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nextjs-news-'));
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ devDependencies: { next: '16.x' } }));
    writeFileSync(join(dir, 'yarn.lock'), '"next@16.x":\n  version "16.4.1"\n  resolved "https://registry.yarnpkg.com/next/-/next-16.4.1.tgz"\n');
    assert.equal(formatVersion(readProjectVersion(dir).version), '16.4.1');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('security filter skips pre-announcements; upgrade guide URL per major', () => {
  assert.equal(isSecurityRelease({ title: 'September 2026 Security Release' }), true);
  assert.equal(isSecurityRelease({ title: 'Upcoming Next.js Security Update' }), false);
  assert.equal(isSecurityRelease({ title: 'Next.js 16.4' }), false);
  assert.equal(upgradeGuide(16), 'https://nextjs.org/docs/app/guides/upgrading/version-16');
});

test('render offline says so and falls back to the verified version', () => {
  const text = render({ checkedAt: '2026-10-25', verified: VERIFIED, posts: [], latest: null, errors: ['блог: ENOTFOUND'] });
  assert.match(text, /Нет сети/);
  assert.match(text, new RegExp(VERIFIED.version.replace(/\./g, '\\.')));
});
