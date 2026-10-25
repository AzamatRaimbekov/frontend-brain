#!/usr/bin/env node
// Watches the upstream sources of the frontend brain (rules/watch-sources.json) and prints what is new
// since rules/watch-state.json, grouped by source with the skills and files each source can make stale.
// Usage:
//   node brain-watch.mjs                    new items since the saved state
//   node brain-watch.mjs --since 2026-09-01 new items published after the date (ignores the state)
//   node brain-watch.mjs --json             machine-readable output
//   node brain-watch.mjs --update-state     also save the newest item of each reachable source
// Pure Node 18+, built-in fetch, no dependencies. GITHUB_TOKEN (or GH_TOKEN) raises the GitHub API limit.
// A source that times out, is rate limited or offline is reported as skipped. Exit 0 unless arguments are wrong.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCES_FILE = join(PLUGIN, 'rules', 'watch-sources.json');
export const STATE_FILE = join(PLUGIN, 'rules', 'watch-state.json');
export const TYPES = ['rss', 'github-releases', 'github-commits', 'npm'];
const TIMEOUT_MS = 10_000;
const MAX_ITEMS = 30;

// --- parsing (pure, tested offline) ---

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .trim();

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
}

const iso = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
};

/** RSS 2.0 <item> or Atom <entry> blocks -> [{ id, title, url, date }] newest first. */
export function parseFeed(xml) {
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  return sortItems(blocks.map((b) => {
    const href = b.match(/<link[^>]*\bhref="([^"]+)"/i)?.[1];
    const url = tag(b, 'link') || (href ? decode(href) : '');
    return {
      id: tag(b, 'guid') || tag(b, 'id') || url,
      title: tag(b, 'title'),
      url,
      date: iso(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date')),
    };
  }));
}

/** GitHub /releases JSON -> items; drafts dropped, prereleases only if asked, tags filtered by `match`. */
export function parseReleases(list, { match, prereleases = false } = {}) {
  const re = match ? new RegExp(match) : null;
  return sortItems(list
    .filter((r) => !r.draft && (prereleases || !r.prerelease) && (!re || re.test(r.tag_name)))
    .map((r) => ({ id: r.tag_name, title: r.name || r.tag_name, url: r.html_url, date: iso(r.published_at ?? r.created_at) })));
}

/** GitHub /commits JSON -> items with the first line of the message. */
export function parseCommits(list) {
  return sortItems(list.map((c) => ({
    id: c.sha,
    title: `${c.sha.slice(0, 7)} ${String(c.commit?.message ?? '').split('\n')[0]}`,
    url: c.html_url,
    date: iso(c.commit?.committer?.date ?? c.commit?.author?.date),
  })));
}

/** npm registry document -> versions with publish time; prereleases (x.y.z-tag) only if asked. */
export function parseNpm(doc, { prereleases = false } = {}) {
  const time = doc.time ?? {};
  return sortItems(Object.keys(doc.versions ?? time)
    .filter((v) => /^\d+\.\d+\.\d+/.test(v) && (prereleases || !v.includes('-')) && time[v])
    .map((v) => ({ id: v, title: `${doc.name}@${v}`, url: `https://www.npmjs.com/package/${doc.name}/v/${v}`, date: iso(time[v]) })));
}

function sortItems(items) {
  return items.filter((i) => i.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_ITEMS);
}

/**
 * Items newer than the saved state. The saved id is the anchor (dates of feeds can be edited);
 * if the anchor is gone from the list, everything after the saved date counts. No state: nothing is new.
 */
export function newSince(items, { state, since } = {}) {
  if (since) return items.filter((i) => i.date && i.date > since);
  if (!state) return [];
  const at = items.findIndex((i) => i.id === state.id);
  if (at !== -1) return items.slice(0, at);
  return state.date ? items.filter((i) => i.date && i.date > state.date) : [];
}

// --- fetching ---

class Skip extends Error {}

async function get(url, { fetchImpl, json = true, headers = {} }) {
  let res;
  try {
    res = await fetchImpl(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    throw new Skip(error.name === 'TimeoutError' ? `timeout ${TIMEOUT_MS / 1000}s` : `offline or unreachable (${error.cause?.code ?? error.message})`);
  }
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0')
    throw new Skip('GitHub API rate limit: set GITHUB_TOKEN or try later');
  if (!res.ok) throw new Skip(`HTTP ${res.status}`);
  return json ? res.json() : res.text();
}

function githubHeaders(env) {
  const token = env.GITHUB_TOKEN || env.GH_TOKEN;
  return { accept: 'application/vnd.github+json', 'user-agent': 'frontend-brain-watch', ...(token ? { authorization: `Bearer ${token}` } : {}) };
}

export async function fetchSource(source, { fetchImpl = fetch, env = process.env } = {}) {
  const api = 'https://api.github.com/repos/';
  if (source.type === 'rss') return parseFeed(await get(source.url, { fetchImpl, json: false, headers: { 'user-agent': 'frontend-brain-watch' } }));
  if (source.type === 'github-releases')
    return parseReleases(await get(`${api}${source.repo}/releases?per_page=100`, { fetchImpl, headers: githubHeaders(env) }), source);
  if (source.type === 'github-commits') {
    const path = source.path ? `&path=${encodeURIComponent(source.path)}` : '';
    return parseCommits(await get(`${api}${source.repo}/commits?per_page=${MAX_ITEMS}${path}`, { fetchImpl, headers: githubHeaders(env) }));
  }
  if (source.type === 'npm')
    return parseNpm(await get(`https://registry.npmjs.org/${source.package.replace('/', '%2f')}`, { fetchImpl }), source);
  throw new Skip(`unknown type ${source.type}`);
}

const sourceUrl = (s) =>
  s.url ?? (s.repo ? `https://github.com/${s.repo}${s.type === 'github-releases' ? '/releases' : s.path ? `/commits/HEAD/${s.path}` : '/commits'}` : `https://www.npmjs.com/package/${s.package}`);

/** Fetches every source in parallel; never throws for one bad source. */
export async function watch({ sources, state = {}, since, fetchImpl, env } = {}) {
  return Promise.all(sources.map(async (source) => {
    const base = { id: source.id, name: source.name, type: source.type, url: sourceUrl(source), affects: source.affects ?? [], note: source.note ?? '' };
    if (source.pinned) base.pinned = source.pinned;
    try {
      const items = await fetchSource(source, { fetchImpl, env });
      const saved = state[source.id];
      return { ...base, status: 'ok', latest: items[0] ?? saved ?? null, firstRun: !since && !saved, items: newSince(items, { state: saved, since }) };
    } catch (error) {
      if (!(error instanceof Skip)) return { ...base, status: 'skipped', reason: `error: ${error.message}`, items: [] };
      return { ...base, status: 'skipped', reason: error.message, items: [] };
    }
  }));
}

/** New state: newest item of each reachable source; skipped sources keep their old entry. */
export function nextState(results, oldState = {}, today = new Date().toISOString().slice(0, 10)) {
  const sources = { ...oldState };
  for (const r of results) if (r.status === 'ok' && r.latest) sources[r.id] = { id: r.latest.id, title: r.latest.title, date: r.latest.date };
  return { updated: today, sources };
}

export function render(results, { since, stateDate } = {}) {
  const fresh = results.filter((r) => r.items.length);
  const out = [`# Что нового для мозга ${since ? `с ${since.slice(0, 10)}` : `с последнего обновления состояния${stateDate ? ` (${stateDate})` : ''}`}`, ''];
  out.push(`Источников: ${results.length}, с новостями: ${fresh.length}, пропущено: ${results.filter((r) => r.status === 'skipped').length}.`, '');
  for (const r of fresh) {
    out.push(`## ${r.name} (${r.id}) — ${r.items.length} нов.`, `Затрагивает: ${r.affects.join(', ')}`);
    if (r.pinned) out.push(`Закреплён коммит: ${r.pinned}`);
    for (const i of r.items) out.push(`- ${i.date.slice(0, 10)}  ${i.title}  ${i.url}`);
    out.push('');
  }
  const quiet = results.filter((r) => r.status === 'ok' && !r.items.length);
  if (quiet.length) out.push(`Без новостей: ${quiet.map((r) => r.id).join(', ')}`, '');
  const first = results.filter((r) => r.firstRun);
  if (first.length) out.push(`Нет сохранённого состояния: ${first.map((r) => r.id).join(', ')} (запусти с --update-state)`, '');
  const skipped = results.filter((r) => r.status === 'skipped');
  if (skipped.length) out.push('## Пропущено', ...skipped.map((r) => `- ${r.id}: ${r.reason}`), '');
  return out.join('\n');
}

export function parseArgs(argv) {
  const opts = { json: false, updateState: false, since: null, sources: SOURCES_FILE, state: STATE_FILE };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--update-state') opts.updateState = true;
    else if (a === '--since' || a === '--sources' || a === '--state') {
      const v = argv[++i];
      if (!v) return { error: `${a} needs a value` };
      opts[a.slice(2)] = v;
    } else return { error: `unknown argument ${a}` };
  }
  if (opts.since) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(opts.since) || !iso(opts.since)) return { error: '--since must be YYYY-MM-DD' };
    opts.since = iso(opts.since);
  }
  return opts;
}

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);

async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) {
    console.error(`${opts.error}\nusage: brain-watch.mjs [--since YYYY-MM-DD] [--json] [--update-state] [--sources file] [--state file]`);
    return 2;
  }
  const { sources } = readJson(opts.sources, { sources: [] });
  const stateDoc = readJson(opts.state, { sources: {} });
  const results = await watch({ sources, state: stateDoc.sources ?? {}, since: opts.since });
  if (opts.json) console.log(JSON.stringify({ since: opts.since, stateUpdated: stateDoc.updated ?? null, results }, null, 2));
  else console.log(render(results, { since: opts.since, stateDate: stateDoc.updated }));
  if (opts.updateState) {
    const next = nextState(results, stateDoc.sources ?? {});
    writeFileSync(opts.state, `${JSON.stringify({ $comment: stateDoc.$comment, ...next }, null, 2)}\n`);
    console.error(`state saved: ${opts.state}`);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
