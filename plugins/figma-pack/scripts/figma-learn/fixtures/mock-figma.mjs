// Fake Figma REST API over the fixtures: a fetch() replacement for tests. No network.
// mockFigma({ fail: { '<path prefix>': [429, 429] }, edit(team, files) }) -> { fetch, calls, token }
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FIXTURES = HERE;
export const loadTeam = () => JSON.parse(readFileSync(join(HERE, 'team.json'), 'utf8'));
export const loadFile = (key) => JSON.parse(readFileSync(join(HERE, `file-${key}.json`), 'utf8'));

function truncate(node, depth) {
  if (!node.children) return node;
  if (depth <= 0) { const { children, ...rest } = node; return rest; }
  return { ...node, children: node.children.map((c) => truncate(c, depth - 1)) };
}

function find(node, id) {
  if (node.id === id) return node;
  for (const c of node.children || []) { const hit = find(c, id); if (hit) return hit; }
  return null;
}

const json = (status, body, headers = {}) => ({
  ok: status >= 200 && status < 300, status,
  headers: { get: (h) => headers[h.toLowerCase()] ?? null },
  json: async () => body,
});

export function mockFigma({ fail = {}, team = loadTeam(), token = 'figd_test_token_never_printed' } = {}) {
  const calls = [];
  const files = {};
  for (const list of Object.values(team.files)) for (const f of list) files[f.key] = loadFile(f.key);
  const queue = Object.fromEntries(Object.entries(fail).map(([k, v]) => [k, [...v]]));
  async function fetch(url, init = {}) {
    const u = new URL(url);
    const path = u.pathname + u.search;
    calls.push(path);
    if (init.headers?.['X-Figma-Token'] !== token) return json(403, { status: 403, err: 'Invalid token' });
    for (const [prefix, codes] of Object.entries(queue)) {
      if (path.startsWith(prefix) && codes.length) {
        const status = codes.shift();
        return json(status, { status, err: 'Rate limit exceeded' }, status === 429 ? { 'retry-after': '2' } : {});
      }
    }
    let m;
    if ((m = u.pathname.match(/^\/v1\/teams\/(\w+)\/projects$/))) {
      return m[1] === team.id ? json(200, { name: 'Team', projects: team.projects }) : json(404, { status: 404 });
    }
    if ((m = u.pathname.match(/^\/v1\/projects\/(\w+)\/files$/))) return json(200, { name: 'P', files: team.files[m[1]] || [] });
    if ((m = u.pathname.match(/^\/v1\/files\/(\w+)(\/[a-z_]+)?$/))) {
      const file = files[m[1]];
      if (!file) return json(404, { status: 404 });
      const listed = Object.values(team.files).flat().find((f) => f.key === m[1]);
      const lastModified = listed?.last_modified || file.lastModified;
      const local = Object.entries(file.components).filter(([, c]) => !c.remote);
      if (m[2] === '/nodes') {
        const nodes = {};
        for (const id of (u.searchParams.get('ids') || '').split(',')) {
          const document = find(file.document, id);
          nodes[id] = document ? { document, components: file.components, componentSets: file.componentSets, styles: file.styles } : null;
        }
        return json(200, { name: file.name, lastModified, nodes });
      }
      if (m[2] === '/components') return json(200, { status: 200, meta: { components: local.map(([id, c]) => ({ key: c.key, file_key: m[1], node_id: id, name: c.name, description: c.description || '' })) } });
      if (m[2] === '/component_sets') return json(200, { status: 200, meta: { component_sets: [] } });
      if (m[2] === '/styles') return json(200, { status: 200, meta: { styles: [] } });
      if (m[2]) return json(404, { status: 404 });
      const depth = Number(u.searchParams.get('depth') || 99);
      return json(200, { ...file, lastModified, document: truncate(file.document, depth) });
    }
    return json(404, { status: 404, err: 'Not found' });
  }
  return { fetch, calls, token, team };
}
