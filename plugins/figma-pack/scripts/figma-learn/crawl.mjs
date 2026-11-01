// crawl: Figma team/project/file -> JSON cache outside the repo (default ~/.cache/figma-learn/<teamId>/).
// Incremental by last_modified (state.json); small concurrency; per-file failures do not stop the crawl.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pool } from './api.mjs';
import { screenFrames } from './walk.mjs';

export const CACHE_ENV = 'FIGMA_LEARN_CACHE';
export const SINGLE_FILES = 'files'; // cache folder for --file crawls without --team

export const cacheRoot = (env = process.env) => env[CACHE_ENV] || join(homedir(), '.cache', 'figma-learn');
export const teamDir = (root, team) => join(root, String(team || SINGLE_FILES));
export const fileDir = (dir, key) => join(dir, 'files', key);

export const readJson = (path, fallback = null) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback);
export function writeJson(path, data) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 1) + '\n');
}

const NODE_BATCH = 25;

/** Optional endpoints (library_content:read) degrade to empty lists instead of failing the file. */
async function optional(client, path, pick, warn) {
  try {
    return pick(await client.get(path));
  } catch (error) {
    if (error.status === 403 || error.status === 404) {
      warn(`${path}: ${error.status}, skipped`);
      return [];
    }
    throw error;
  }
}

/** Downloads one file: structure (depth 3), full screen nodes in batches, published components, sets, styles. */
export async function fetchFile(client, key, dir, { maxFrames = 80, project = null, warn = () => {} } = {}) {
  const file = await client.get(`/v1/files/${key}?depth=3`);
  const screens = screenFrames(file.document).slice(0, maxFrames);
  const nodes = { nodes: {} };
  for (let i = 0; i < screens.length; i += NODE_BATCH) {
    const ids = screens.slice(i, i + NODE_BATCH).map((s) => s.id).join(',');
    const res = await client.get(`/v1/files/${key}/nodes?ids=${encodeURIComponent(ids)}`);
    Object.assign(nodes.nodes, res.nodes || {});
  }
  const components = await optional(client, `/v1/files/${key}/components`, (r) => r.meta?.components || [], warn);
  const componentSets = await optional(client, `/v1/files/${key}/component_sets`, (r) => r.meta?.component_sets || [], warn);
  const styles = await optional(client, `/v1/files/${key}/styles`, (r) => r.meta?.styles || [], warn);
  const out = fileDir(dir, key);
  writeJson(join(out, 'file.json'), file);
  writeJson(join(out, 'nodes.json'), nodes);
  writeJson(join(out, 'components.json'), components);
  writeJson(join(out, 'component_sets.json'), componentSets);
  writeJson(join(out, 'styles.json'), styles);
  const meta = {
    key, name: file.name, project, lastModified: file.lastModified, version: file.version,
    screens: screens.length, truncated: screenFrames(file.document).length > screens.length, fetchedAt: new Date().toISOString(),
  };
  writeJson(join(out, 'meta.json'), meta);
  return meta;
}

const unchanged = (state, key, lastModified, dir) =>
  lastModified && state.files[key]?.lastModified === lastModified && existsSync(join(fileDir(dir, key), 'nodes.json'));

/**
 * crawlTeam({ client, team, project, since, force, root, concurrency, maxFrames, log })
 * -> { dir, projects, fetched: [meta], skipped: [{key, name, reason}], failed: [{key, name, error}] }
 */
export async function crawlTeam({ client, team, project = null, since = null, force = false, root = cacheRoot(), concurrency = 2, maxFrames = 80, log = () => {} }) {
  const dir = teamDir(root, team);
  const state = readJson(join(dir, 'state.json'), { team, files: {} });
  const { projects = [] } = await client.get(`/v1/teams/${team}/projects`);
  const chosen = projects.filter((p) => !project || String(p.id) === String(project) || p.name === project);
  if (project && !chosen.length) throw new Error(`project ${project} not found in team ${team}`);
  const files = [];
  for (const p of chosen) {
    const res = await client.get(`/v1/projects/${p.id}/files`);
    for (const f of res.files || []) files.push({ ...f, project: { id: String(p.id), name: p.name } });
  }
  writeJson(join(dir, 'projects.json'), { team, crawledAt: new Date().toISOString(), projects: chosen, files });
  const sinceTime = since ? Date.parse(since) : null;
  const result = { dir, projects: chosen.length, fetched: [], skipped: [], failed: [] };
  await pool(files, concurrency, async (f) => {
    if (sinceTime && Date.parse(f.last_modified) < sinceTime) return result.skipped.push({ key: f.key, name: f.name, reason: 'older than --since' });
    if (!force && unchanged(state, f.key, f.last_modified, dir)) return result.skipped.push({ key: f.key, name: f.name, reason: 'unchanged' });
    try {
      log(`fetch ${f.name}`);
      const meta = await fetchFile(client, f.key, dir, { maxFrames, project: f.project, warn: log });
      state.files[f.key] = { name: f.name, project: f.project, lastModified: f.last_modified || meta.lastModified, fetchedAt: meta.fetchedAt };
      result.fetched.push(meta);
    } catch (error) {
      result.failed.push({ key: f.key, name: f.name, error: error.message });
    }
  });
  state.crawledAt = new Date().toISOString();
  writeJson(join(dir, 'state.json'), state);
  return result;
}

/** crawlFile({ client, key, team, force, root }) - one file with view access; skips when lastModified did not change. */
export async function crawlFile({ client, key, team = null, force = false, root = cacheRoot(), maxFrames = 80, log = () => {} }) {
  const dir = teamDir(root, team);
  const state = readJson(join(dir, 'state.json'), { team: team || SINGLE_FILES, files: {} });
  const result = { dir, projects: 0, fetched: [], skipped: [], failed: [] };
  const head = await client.get(`/v1/files/${key}?depth=1`);
  if (!force && unchanged(state, key, head.lastModified, dir)) {
    result.skipped.push({ key, name: head.name, reason: 'unchanged' });
    return result;
  }
  const project = state.files[key]?.project || null;
  const meta = await fetchFile(client, key, dir, { maxFrames, project, warn: log });
  state.files[key] = { name: meta.name, project, lastModified: meta.lastModified, fetchedAt: meta.fetchedAt };
  state.crawledAt = new Date().toISOString();
  writeJson(join(dir, 'state.json'), state);
  result.fetched.push(meta);
  return result;
}
