// Tools of the design-system MCP server (server.mjs): one source for every frontend agent —
// tokens (values light/dark + Figma variable), kit components (registry, contract, Figma mapping),
// and a project check/sync against the current tokens. Data comes from installed frontend-pack
// (tokens.css, tokens.map.json, registry/mbank, contracts) and the engine's components-map.json.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePlugin } from '../scripts/resolve-plugin.mjs';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

export function sources(frontend = resolvePlugin('frontend-pack')) {
  if (!frontend) throw new Error('frontend-pack is not installed (claude plugin install frontend-pack@frontend-brain)');
  const kit = join(frontend, 'registry', 'mbank');
  return {
    kit,
    tokensCss: join(kit, 'tokens.css'),
    tokensMap: join(kit, 'tokens.map.json'),
    registry: join(kit, 'r'),
    contracts: join(kit, 'contracts'),
    componentsMap: join(ENGINE, 'references', 'components-map.json'),
  };
}

// :root / .dark custom properties of tokens.css -> { name: { light, dark } }.
export function parseTokens(css) {
  const out = {};
  const block = (selector) => {
    const m = css.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`));
    return m ? m[1].replace(/\/\*[\s\S]*?\*\//g, '') : '';
  };
  for (const [mode, sel] of [['light', ':root'], ['dark', '.dark']]) {
    for (const [, name, value] of block(sel).matchAll(/--([\w-]+):\s*([^;]+);/g)) (out[name] ??= {})[mode] = value.trim();
  }
  return out;
}

// tokens.map.json entries -> { cssVar: figma variable name } (best effort over the map's shapes).
function figmaNames(map) {
  const names = {};
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    const css = node.css ?? node.var ?? node.name;
    const figma = node.figma ?? node.light?.figma ?? node.source;
    if (typeof css === 'string' && typeof figma === 'string') names[css.replace(/^--/, '')] = figma;
    Object.values(node).forEach(visit);
  };
  visit(map);
  return names;
}

export function tokens({ query = '', src = sources() } = {}) {
  const values = parseTokens(readFileSync(src.tokensCss, 'utf8'));
  const figma = existsSync(src.tokensMap) ? figmaNames(readJson(src.tokensMap)) : {};
  const q = query.toLowerCase();
  return Object.entries(values)
    .filter(([name]) => !q || name.includes(q) || (figma[name] ?? '').toLowerCase().includes(q))
    .map(([name, v]) => ({ name, light: v.light ?? null, dark: v.dark ?? v.light ?? null, figma: figma[name] ?? null, tailwind: `bg-${name} / text-${name} / border-${name}` }));
}

export function components({ src = sources() } = {}) {
  const registry = readJson(join(src.registry, 'registry.json'));
  const map = existsSync(src.componentsMap) ? readJson(src.componentsMap) : {};
  const entries = Array.isArray(map) ? map : (map.entries ?? map.components ?? Object.values(map));
  return registry.items.map((item) => {
    const linked = entries.filter((e) => e?.registry === item.name || e?.component?.toLowerCase?.() === item.name.replace(/-/g, ''));
    return {
      name: item.name,
      type: item.type,
      description: item.description ?? '',
      contract: existsSync(join(src.contracts, `${item.name}.json`)),
      figma: linked.map((e) => `${e.name ?? e.figma ?? '?'} (${e.status})`),
    };
  });
}

export function component({ name, src = sources() }) {
  const file = join(src.registry, `${name}.json`);
  if (!existsSync(file)) throw new Error(`Unknown component "${name}". List: ds_components`);
  const item = readJson(file);
  const contractFile = join(src.contracts, `${name}.json`);
  return {
    name,
    install: {
      package: item.type === 'registry:base' ? '@import "@mdigital/mbank-ui/styles.css";' : `import { … } from "@mdigital/mbank-ui${item.files?.[0]?.path.includes('/blocks/') ? '/crm' : ''}"`,
      shadcn: `npx shadcn@latest add @mbank/${name}`,
      copy: `node <frontend-pack>/scripts/add-ui.mjs ${name}`,
    },
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    contract: existsSync(contractFile) ? readJson(contractFile) : null,
    files: (item.files ?? []).map((f) => ({ path: f.path, content: f.content })),
  };
}

// Colours and sizes that bypass the tokens: hex, arbitrary values, default Tailwind palette, inline styles.
const RULES = [
  [/#[0-9a-fA-F]{3,8}\b/g, 'hex colour: use a token class (ds_tokens)'],
  [/\b(?:bg|text|border|ring|fill|stroke|from|to|via)-\[(?:#|rgb|hsl|oklch|color-mix)[^\]]*\]/g, 'arbitrary colour: use a token'],
  [/\b(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g, 'Tailwind palette colour: not an Mbank token'],
  [/style=\{\{[^}]*(?:color|background)[^}]*\}\}/g, 'inline colour style'],
];
const CODE = /\.(tsx|ts|jsx|js|css)$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'build', 'coverage'].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (CODE.test(name)) out.push(path);
  }
  return out;
}

// Finds the project's copy of the Mbank tokens (copy mode) and the files that bypass tokens.
export function checkProject({ path, src = sources() }) {
  const root = join(path, 'src');
  if (!existsSync(root)) throw new Error(`${path} has no src/ folder`);
  const current = readFileSync(src.tokensCss, 'utf8');
  const issues = [];
  let tokensFile = null;
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(path, file);
    if (file.endsWith('.css') && text.includes('--brand-ghost') && text.includes('@theme inline')) {
      tokensFile = rel;
      continue; // the tokens file itself is checked by comparison below
    }
    text.split('\n').forEach((line, i) => {
      for (const [re, why] of RULES) for (const m of line.matchAll(re)) issues.push({ file: rel, line: i + 1, found: m[0], why });
    });
  }
  const pkg = existsSync(join(path, 'package.json')) ? readJson(join(path, 'package.json')) : {};
  const kitPackage = pkg.dependencies?.['@mdigital/mbank-ui'] ?? null;
  const tokensStatus = tokensFile
    ? readFileSync(join(path, tokensFile), 'utf8') === current ? 'up to date' : 'outdated: run ds_sync_project'
    : kitPackage ? `from package ${kitPackage} (update the tag to get new tokens)` : 'not found';
  return { tokens: { file: tokensFile, status: tokensStatus }, issues, summary: `${issues.length} place(s) bypass the tokens` };
}

export function syncProject({ path, write = false, src = sources() }) {
  const check = checkProject({ path, src });
  if (!check.tokens.file) return { changed: false, note: `no tokens file to sync (${check.tokens.status})` };
  if (check.tokens.status === 'up to date') return { changed: false, note: 'tokens are up to date' };
  if (write) writeFileSync(join(path, check.tokens.file), readFileSync(src.tokensCss, 'utf8'));
  return { changed: write, file: check.tokens.file, note: write ? 'tokens replaced with the current design system' : 'dry run: pass write=true to replace' };
}
