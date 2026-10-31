#!/usr/bin/env node
// Builds the Mbank kit (registry/mbank) as an official shadcn registry, so projects install it with the shadcn CLI:
//   npx shadcn@latest registry add @mbank=<base-url>/{name}.json
//   npx shadcn@latest add @mbank/mbank @mbank/button @mbank/crm-kpi-card
// Output (default registry/mbank/r): registry.json + one <name>.json per item with file contents inline, plus the
// design system item "mbank" (type registry:base): tokens.css as cssVars (light/dark/theme) and css (brands, scales).
// Usage: node registry-build.mjs [--out <dir>] [--namespace @mbank] [--check]   (--check: exit 1 if r/ is stale)
// Pure Node 18+, no dependencies.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCss } from './tokens-build.mjs';

const KIT = join(dirname(fileURLToPath(import.meta.url)), '..', 'registry', 'mbank');
const SCHEMA_ITEM = 'https://ui.shadcn.com/schema/registry-item.json';
const SCHEMA_REGISTRY = 'https://ui.shadcn.com/schema/registry.json';

// Our sources import the kit through the project layout; the registry convention is @/registry/<name>/...,
// which the shadcn CLI rewrites to the aliases of components.json.
const IMPORTS = [
  [/(["'])@\/shared\/ui\//g, '$1@/registry/mbank/ui/'],
  [/(["'])@\/shared\/lib\/utils\1/g, '$1@/registry/mbank/lib/utils$1'],
  [/(["'])@\/shared\/components\/crm\//g, '$1@/registry/mbank/blocks/crm/'],
  [/(["'])@\/shared\/components\//g, '$1@/registry/mbank/components/'],
];
// target in registry/mbank/registry.json -> shadcn item/file type and registry path folder.
const KINDS = {
  ui: { type: 'registry:ui', folder: 'ui' },
  components: { type: 'registry:component', folder: 'components' },
  blocks: { type: 'registry:component', folder: 'blocks/crm' },
  lib: { type: 'registry:lib', folder: 'lib' },
};

export const rewriteImports = (code) => IMPORTS.reduce((text, [from, to]) => text.replace(from, to), code);

// tokens.css -> cssVars (only plain custom properties of :root, .dark and @theme) + css (everything else).
export function tokensToBase(cssText) {
  const blocks = parseCss(cssText);
  const vars = (key) =>
    Object.fromEntries([...(blocks.get(key) ?? new Map())].filter(([k]) => k.startsWith('--')).map(([k, v]) => [k.slice(2), v]));
  const css = {};
  for (const [key, decls] of blocks) {
    if ([':root', '.dark', '@theme inline', '@theme', '(top)'].includes(key)) continue;
    const path = key.split(' > ');
    let node = css;
    for (const part of path.slice(0, -1)) node = node[part] ??= {};
    // shadcn writes an at-rule inside a rule as a key with an empty body: { "@apply bg-background": {} }.
    node[path.at(-1)] = Object.fromEntries([...decls].map(([k, v]) => (k.startsWith('@') ? [`${k} ${v}`, {}] : [k, v])));
  }
  // Top-level at-rules without a body (@custom-variant dark ...) go to css as empty rules.
  for (const [at, rest] of blocks.get('(top)') ?? []) if (at.startsWith('@custom-variant')) css[`${at} ${rest}`] = {};
  // color-scheme is not a custom property: keep it as plain css next to the vars.
  for (const sel of [':root', '.dark']) {
    const scheme = blocks.get(sel)?.get('color-scheme');
    if (scheme) css[sel] = { ...css[sel], 'color-scheme': scheme };
  }
  return {
    cssVars: { theme: { ...vars('@theme'), ...vars('@theme inline') }, light: vars(':root'), dark: vars('.dark') },
    css,
  };
}

export function buildRegistry({ kit = KIT, namespace = '@mbank' } = {}) {
  const source = JSON.parse(readFileSync(join(kit, 'registry.json'), 'utf8'));
  // tokens = the design system item, installed once with `shadcn init`/`add @mbank/mbank`, not with every component.
  const deps = (names = []) => names.filter((n) => n !== 'tokens').map((n) => `${namespace}/${n}`);
  const items = [];
  for (const item of source.items) {
    if (item.name === 'tokens') continue; // becomes the registry:base item below
    const kind = KINDS[item.files[0].target];
    if (!kind) throw new Error(`${item.name}: unknown target ${item.files[0].target}`);
    items.push({
      $schema: SCHEMA_ITEM,
      name: item.name,
      type: kind.type,
      title: item.title ?? item.name,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: deps(item.registryDependencies),
      files: item.files.map((f) => {
        const target = KINDS[f.target] ?? kind;
        return {
          path: `registry/mbank/${target.folder}/${basename(f.path)}`,
          type: target.type,
          content: rewriteImports(readFileSync(join(kit, f.path), 'utf8')),
        };
      }),
    });
  }
  const tokens = source.items.find((i) => i.name === 'tokens');
  const base = {
    $schema: SCHEMA_ITEM,
    name: 'mbank',
    type: 'registry:base',
    title: 'Mbank design system',
    description: `${tokens.description}. Generated from tokens.css (Figma tokens.json + tokens.map.json).`,
    dependencies: ['tw-animate-css', 'class-variance-authority', 'clsx', 'tailwind-merge', 'radix-ui'],
    registryDependencies: [`${namespace}/utils`],
    ...tokensToBase(readFileSync(join(kit, 'tokens.css'), 'utf8')),
  };
  const registry = {
    $schema: SCHEMA_REGISTRY,
    name: 'mbank',
    homepage: 'https://github.com/AzamatRaimbekov/frontend-brain',
    items: [base, ...items].map(({ $schema, ...rest }) => ({ ...rest, files: rest.files?.map(({ content, ...f }) => f) })),
  };
  return { registry, items: [base, ...items] };
}

export function writeRegistry(out, built) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'registry.json'), `${JSON.stringify(built.registry, null, 2)}\n`);
  for (const item of built.items) writeFileSync(join(out, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
}

// Same file set and contents in two folders.
export function sameDir(a, b) {
  if (!existsSync(a) || !existsSync(b)) return false;
  const list = (d) => readdirSync(d).sort();
  const [x, y] = [list(a), list(b)];
  return x.length === y.length && x.every((n, i) => n === y[i] && readFileSync(join(a, n), 'utf8') === readFileSync(join(b, n), 'utf8'));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
  const out = opt('--out', join(KIT, 'r'));
  const built = buildRegistry({ namespace: opt('--namespace', '@mbank') });
  if (args.includes('--check')) {
    const tmp = join(dirname(out), '.r-check');
    writeRegistry(tmp, built);
    const ok = sameDir(tmp, out);
    rmSync(tmp, { recursive: true, force: true });
    console.log(ok ? 'registry r/ is up to date' : 'registry r/ is stale: run node scripts/registry-build.mjs');
    process.exit(ok ? 0 : 1);
  }
  writeRegistry(out, built);
  console.log(`${built.items.length} items -> ${out}`);
}
