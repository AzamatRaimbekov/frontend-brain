#!/usr/bin/env node
// Next.js news for the nextjs skill: latest blog posts (nextjs.org/feed.xml), latest stable/canary releases
// (GitHub vercel/next.js) and, with --project, how far the project's `next` is behind and what changed since.
// Usage: node nextjs-news.mjs [--project <dir>] [--limit 8] [--json]
// No dependencies, Node 18+. Offline or rate-limited: prints what it could get and exits 0.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const VERIFIED = { version: '16.4.3', date: '2026-10-25' }; // keep in sync with skills/nextjs/SKILL.md
const FEED_URL = 'https://nextjs.org/feed.xml';
const RELEASES_URL = 'https://api.github.com/repos/vercel/next.js/releases';
const TIMEOUT_MS = 10_000;

// ---------- parsing (pure, covered by nextjs-news.test.mjs) ----------

const decode = (s) =>
  s.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : '';
};

/** RSS 2.0 string -> [{ title, link, date (YYYY-MM-DD), description }] newest first. */
export function parseFeed(xml, limit = Infinity) {
  const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const time = Date.parse(tag(item, 'pubDate'));
    return {
      title: tag(item, 'title'),
      link: tag(item, 'link'),
      date: Number.isNaN(time) ? '' : new Date(time).toISOString().slice(0, 10),
      description: tag(item, 'description'),
    };
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

/** "^15.3.0", "~16.4.1", ">=14", "v16.5.0-canary.3", "16.4.3" -> { major, minor, patch, pre } or null. */
export function parseVersion(text) {
  const m = String(text ?? '').match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/);
  if (!m) return null;
  return { major: +m[1], minor: +(m[2] ?? 0), patch: +(m[3] ?? 0), pre: m[4] ?? '' };
}
export const formatVersion = (v) => `${v.major}.${v.minor}.${v.patch}${v.pre ? `-${v.pre}` : ''}`;

/** Semver-ish compare; a release sorts after its prereleases, "canary.10" after "canary.9". */
export function compareVersions(a, b) {
  for (const k of ['major', 'minor', 'patch']) if (a[k] !== b[k]) return a[k] - b[k];
  if (a.pre === b.pre) return 0;
  if (!a.pre) return 1;
  if (!b.pre) return -1;
  return a.pre.localeCompare(b.pre, 'en', { numeric: true });
}

/** How far `installed` is behind `latest`: 'major' | 'minor' | 'patch' | 'none' | 'ahead'. */
export function behind(installed, latest) {
  const c = compareVersions(installed, latest);
  if (c > 0) return 'ahead';
  if (c === 0) return 'none';
  if (installed.major !== latest.major) return 'major';
  if (installed.minor !== latest.minor) return 'minor';
  return 'patch';
}

/** GitHub releases -> { stable, canary, sameMajor(major) } with the highest versions, not the newest dates. */
export function pickReleases(releases) {
  const items = releases
    .filter((r) => !r.draft)
    .map((r) => ({ tag: r.tag_name, version: parseVersion(r.tag_name), prerelease: r.prerelease, date: (r.published_at ?? '').slice(0, 10), link: r.html_url }))
    .filter((r) => r.version);
  const top = (list) => list.sort((a, b) => compareVersions(b.version, a.version))[0] ?? null;
  return {
    stable: top(items.filter((r) => !r.prerelease)),
    canary: top(items.filter((r) => r.prerelease)),
    sameMajor: (major) => top(items.filter((r) => !r.prerelease && r.version.major === major)),
  };
}

/** Installed `next` of a project: node_modules, then lockfiles, then the range in package.json. */
export function readProjectVersion(dir) {
  const read = (file) => (existsSync(join(dir, file)) ? readFileSync(join(dir, file), 'utf8') : null);
  const pkgText = read('package.json');
  if (!pkgText) return { error: `нет package.json в ${dir}` };
  let pkg;
  try { pkg = JSON.parse(pkgText); } catch { return { error: 'package.json не парсится как JSON' }; }
  const declared = pkg.dependencies?.next ?? pkg.devDependencies?.next ?? null;
  if (!declared) return { error: 'next не найден в dependencies/devDependencies' };
  const found = (version, source) => ({ declared, version: parseVersion(version), source });

  const installed = read('node_modules/next/package.json');
  if (installed) return found(JSON.parse(installed).version, 'node_modules/next');
  const npmLock = read('package-lock.json');
  if (npmLock) {
    const v = JSON.parse(npmLock).packages?.['node_modules/next']?.version;
    if (v) return found(v, 'package-lock.json');
  }
  const pnpmLock = read('pnpm-lock.yaml');
  const pnpm = pnpmLock?.match(/^\s+\/?next@(\d+\.\d+\.\d+[^:(\s']*)/m) ?? pnpmLock?.match(/^\s+next:\n\s+specifier:.*\n\s+version:\s*(\d[^\s(]*)/m);
  if (pnpm) return found(pnpm[1], 'pnpm-lock.yaml');
  const yarn = read('yarn.lock')?.match(/^"?next@[^\n]*:\n\s+version:?\s+"?([^"\s]+)/m);
  if (yarn) return found(yarn[1], 'yarn.lock');
  return found(declared, 'package.json (диапазон, lock-файла нет)');
}

/** A published security fix, not the "Upcoming ..." pre-announcement. */
export const isSecurityRelease = (post) => /security|vulnerab|cve/i.test(post.title) && !/^upcoming/i.test(post.title);

export const upgradeGuide = (major) => `https://nextjs.org/docs/app/guides/upgrading/version-${major}`;

// ---------- network ----------

async function get(url, accept) {
  const headers = { accept, 'user-agent': 'frontend-pack-nextjs-news' };
  if (url.startsWith('https://api.github.com') && process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = new Date(Number(res.headers.get('x-ratelimit-reset')) * 1000).toISOString().slice(11, 16);
    throw new Error(`лимит GitHub API исчерпан до ${reset} UTC (задай GITHUB_TOKEN)`);
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return accept.includes('json') ? res.json() : res.text();
}
const reason = (e) => (e?.name === 'TimeoutError' ? 'таймаут 10 с' : e?.cause?.code ?? e?.message ?? String(e));

export async function collect({ project, limit = 8 } = {}) {
  const report = { checkedAt: new Date().toISOString().slice(0, 10), verified: VERIFIED, errors: [] };
  const [feed, releases] = await Promise.allSettled([get(FEED_URL, 'application/rss+xml'), get(`${RELEASES_URL}?per_page=100`, 'application/vnd.github+json')]);
  const allPosts = feed.status === 'fulfilled' ? parseFeed(feed.value) : (report.errors.push(`блог: ${reason(feed.reason)}`), []);
  report.posts = allPosts.slice(0, limit);
  const picked = releases.status === 'fulfilled' ? pickReleases(releases.value) : (report.errors.push(`релизы: ${reason(releases.reason)}`), null);
  report.latest = picked ? { stable: picked.stable, canary: picked.canary } : null;
  if (!project) return report;

  const p = readProjectVersion(resolve(project));
  report.project = { dir: resolve(project), ...p, version: p.version ? formatVersion(p.version) : null };
  if (!p.version || !picked?.stable) return report;
  const level = behind(p.version, picked.stable.version);
  report.project.behind = level;
  report.project.latestOnItsMajor = picked.sameMajor(p.version.major)?.tag ?? null;
  report.upgradeGuides = [];
  for (let m = p.version.major + 1; m <= picked.stable.version.major; m++) report.upgradeGuides.push(upgradeGuide(m));
  report.codemod = level === 'none' || level === 'ahead' ? null : `npx @next/codemod@latest upgrade ${level}`;
  try {
    const rel = await get(`${RELEASES_URL}/tags/v${formatVersion(p.version)}`, 'application/vnd.github+json');
    report.project.releasedAt = rel.published_at.slice(0, 10);
    report.newerPosts = allPosts.filter((post) => post.date > report.project.releasedAt);
    report.securityPosts = report.newerPosts.filter(isSecurityRelease);
  } catch (e) {
    report.errors.push(`дата релиза ${formatVersion(p.version)}: ${reason(e)}`);
  }
  return report;
}

// ---------- output ----------

const line = (post) => `  ${post.date}  ${post.title}\n              ${post.link}`;

export function render(r) {
  const out = [`Next.js: новости на ${r.checkedAt}`];
  if (!r.posts.length && !r.latest) {
    out.push(`Нет сети (${r.errors.join('; ')}). Новости не получены — не пересказывай их.`,
      `Опирайся на проверенную версию: Next.js ${r.verified.version} (${r.verified.date}) и docs из node_modules/next/dist/docs/.`);
    r = { ...r, errors: [] };
  }
  if (r.latest) {
    const { stable, canary } = r.latest;
    if (stable) out.push(`Последний stable: ${stable.tag} (${stable.date}) ${stable.link}`);
    if (canary) out.push(`Последний canary: ${canary.tag} (${canary.date}) — не для продакшена`);
  }
  if (r.project) {
    const p = r.project;
    out.push('', `Проект: ${p.dir}`);
    if (p.error) out.push(`  ${p.error}`);
    else {
      out.push(`  next в package.json: ${p.declared}; установлен: ${p.version} (${p.source})${p.releasedAt ? `, релиз ${p.releasedAt}` : ''}`);
      const text = { major: 'отстаёт на мажор', minor: 'отстаёт на минор', patch: 'отстаёт на патч', none: 'актуальная версия', ahead: 'новее последнего stable (canary?)' };
      if (p.behind) out.push(`  Статус: ${text[p.behind]}`);
      if (p.latestOnItsMajor && p.behind === 'major') out.push(`  Последний патч на ветке ${p.version.split('.')[0]}.x: ${p.latestOnItsMajor} — минимум, до которого обновиться прямо сейчас`);
      for (const g of r.upgradeGuides ?? []) out.push(`  Гайд обновления: ${g}`);
      if (r.codemod) out.push(`  Кодмод: ${r.codemod}  (или агентом: npx next@canary upgrade --agent=latest)`);
      if (r.securityPosts?.length) out.push('', `Исправления безопасности после вашей версии (${r.securityPosts.length}):`, ...r.securityPosts.map(line));
      const other = r.newerPosts?.filter((post) => !/security|vulnerab|cve/i.test(post.title));
      if (other) out.push('', `Остальные посты после релиза вашей версии (${other.length}, показаны ${Math.min(other.length, r.posts.length)}):`, ...other.slice(0, r.posts.length).map(line));
    }
  }
  if (r.posts.length && !r.newerPosts) out.push('', `Последние посты блога (${r.posts.length}):`, ...r.posts.map(line));
  if (r.errors.length) out.push('', `Не удалось: ${r.errors.join('; ')}`);
  return out.join('\n');
}

function args(argv) {
  const opts = { limit: 8, json: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project') opts.project = argv[++i];
    else if (argv[i] === '--limit') opts.limit = Math.max(1, Number(argv[++i]) || 8);
    else if (argv[i] === '--json') opts.json = true;
  }
  return opts;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const opts = args(process.argv.slice(2));
  const report = await collect(opts);
  console.log(opts.json ? JSON.stringify(report, null, 2) : render(report));
}
