#!/usr/bin/env node
// Kit code -> component contracts (mbank/component@1, figma-pack builder/docs/component-contract.md).
// Reads the blocks between // @contract <id> start/end in frontend-pack registry/mbank/components/*.tsx,
// turns classes that are contract properties into properties and keeps the rest in code.extra / code.extras,
// attaches the Figma component from references/components-map.json and writes figma-pack builder/contracts/<name>.json.
// Every contract is verified: it must render back to exactly the classes it was read from (order-insensitive).
// Usage: node contracts-extract.mjs [name...] [--stdout] [--json]      (exit 1 if a contract does not round-trip)
// Bootstrap tool: once contracts are the source, edit them and generate code (frontend-pack contract-to-code).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ENGINE, resolvePlugin } from './resolve-plugin.mjs';
import { parseCva, stripComments } from './code-index.mjs';

const FRONTEND = resolvePlugin('frontend-pack');
const FIGMA = resolvePlugin('figma-pack');
if (!FRONTEND || !FIGMA) throw new Error('contracts-extract needs figma-pack and frontend-pack installed');
const lib = (file) => import(pathToFileURL(join(FRONTEND, 'scripts', 'contract-to-code', file)).href);
const { readClasses, readTokens, splitWords, STATE_ORDER } = await lib('classes.mjs');
const { findBlocks, readBlock, checkSource } = await lib('blocks.mjs');

export const PATHS = {
  kit: join(FRONTEND, 'registry', 'mbank'),
  tokens: join(FRONTEND, 'registry', 'mbank', 'tokens.css'),
  out: join(FIGMA, 'builder', 'contracts'),
  map: join(ENGINE, 'references', 'components-map.json'),
};

const SVG = "[&_svg:not([class*='size-'])]";
// What the code cannot tell: Figma set, anatomy template, part selectors, state modifiers, maps and parent prefixes.
export const COMPONENTS = [
  { name: 'button', title: 'Button', file: 'button.tsx', figma: 'button/default', template: 'button-like', parts: { icon: SVG } },
  { name: 'badge', title: 'Badge', file: 'badge.tsx', figma: 'Badge-status', template: 'badge-like', parts: { icon: '[&>svg]' } },
  { name: 'input', title: 'Input', file: 'input.tsx', figma: 'input/default', template: 'input-like', parts: { placeholder: 'placeholder' } },
  { name: 'textarea', title: 'Textarea', file: 'textarea.tsx', figma: 'TextArea', template: 'input-like', parts: { placeholder: 'placeholder' } },
  { name: 'card', title: 'Card', file: 'card.tsx', template: 'card-like', blocks: ['header', 'title', 'description', 'content', 'footer'] },
  {
    name: 'checkbox', title: 'Checkbox', file: 'checkbox.tsx', figma: 'Switchers - Check', template: 'button-like',
    modifiers: { checked: 'data-[state=checked]', indeterminate: 'data-[state=indeterminate]' },
  },
  { name: 'switch', title: 'Switch', file: 'switch.tsx', template: 'button-like', modifiers: { checked: 'data-[state=checked]', unchecked: 'data-[state=unchecked]' } },
  { name: 'tabs-list', title: 'Tabs list', file: 'tabs.tsx', figma: 'segment', template: 'card-like' },
  {
    name: 'tabs-trigger', title: 'Tabs trigger', file: 'tabs.tsx', figma: 'Item / segmentButtons', template: 'button-like',
    parts: { icon: '[&_svg]' }, modifiers: { selected: 'data-[state=active]' },
    prefix: { variant: { pattern: 'group-data-[variant={value}]/tabs-list', values: ['segment', 'outline', 'line'], default: 'segment' } },
  },
  { name: 'alert', title: 'Alert', file: 'alert.tsx', figma: 'alert-text', template: 'card-like', parts: { icon: '[&>svg]' }, blocks: ['title'] },
  { name: 'avatar', title: 'Avatar', file: 'avatar.tsx', figma: 'Avatars', template: 'badge-like', blocks: ['fallback'] },
  { name: 'skeleton', title: 'Skeleton', file: 'skeleton.tsx', template: 'card-like' },
  {
    name: 'select-trigger', title: 'Select trigger', file: 'select.tsx', figma: 'input/dropdown', template: 'button-like',
    parts: { placeholder: 'data-[placeholder]' }, maps: { size: { const: 'triggerSizes', part: 'root', default: 'md' } },
  },
  { name: 'table-cell', title: 'Table cell', file: 'table.tsx', figma: 'TableCell', template: 'card-like' },
  {
    name: 'pagination', title: 'Pagination item', file: 'pagination.tsx', figma: 'item/pagintaion / buttons', template: 'button-like',
    parts: { icon: '[&_svg]' }, modifiers: { selected: 'aria-[current=page]' },
  },
  { name: 'progress', title: 'Progress', file: 'progress.tsx', figma: 'Progress bar / Determinate', template: 'card-like', maps: { tone: { const: 'indicatorTones', part: 'indicator', default: 'brand' } } },
];

const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) && !(Array.isArray(v) && !v.length) && v !== ''));

function figmaOf(map, name) {
  if (!name) return undefined;
  const entry = map.components.find((c) => c.figma === name && c.key);
  if (!entry) throw new Error(`components-map.json has no "${name}"`);
  return { name: entry.figma, key: entry.key, nodeId: entry.nodeId };
}

// One component config -> contract (not yet verified).
export function extract(cfg, { kit = PATHS.kit, tokens, map }) {
  const source = readFileSync(join(kit, 'components', cfg.file), 'utf8');
  const blocks = findBlocks(source);
  const root = blocks[cfg.name];
  if (!root) throw new Error(`${cfg.file}: no "// @contract ${cfg.name} start/end" markers`);
  const read = readBlock(root.body);
  const code = {
    file: cfg.file,
    shape: read.kind === 'cva' ? undefined : 'classes',
    export: read.kind === 'cva' ? read.name : undefined,
    template: cfg.template,
    parts: cfg.parts,
    modifiers: cfg.modifiers,
    prefix: cfg.prefix ? Object.fromEntries(Object.entries(cfg.prefix).map(([p, v]) => [p, v.pattern])) : undefined,
    maps: cfg.maps ? Object.fromEntries(Object.entries(cfg.maps).map(([p, v]) => [p, { const: v.const, part: v.part }])) : undefined,
    blocks: cfg.blocks,
    extra: undefined,
    extras: {},
  };
  const contract = { $schema: 'mbank/component@1', name: cfg.name, title: cfg.title, figma: figmaOf(map, cfg.figma), parts: [], props: {}, base: {}, variants: {}, compound: [], states: [], code };
  const take = (classes, opts) => readClasses(classes, contract, tokens, opts);
  const setVariant = (prop, value, classes, opts) => {
    const { scope, extra } = take(classes, opts);
    ((contract.variants[prop] ??= {})[value] = scope);
    if (extra.length) code.extras[`${prop}=${value}`] = extra.join(' ');
  };

  let baseClasses;
  if (read.kind === 'cva') {
    baseClasses = read.scopes.base;
    for (const [prop, values] of Object.entries(read.variants)) {
      contract.props[prop] = { values: Object.keys(values), default: read.defaults[prop] };
      for (const value of Object.keys(values)) setVariant(prop, value, read.scopes[`${prop}=${value}`]);
    }
    Object.entries(read.scopes).filter(([k]) => k.startsWith('compound:')).forEach(([k, classes], i) => {
      const { scope, extra } = take(classes);
      contract.compound.push({ when: JSON.parse(k.slice('compound:'.length)), ...scope });
      if (extra.length) code.extras[`compound:${i}`] = extra.join(' ');
    });
  } else {
    baseClasses = [];
    const scoped = {};
    for (const cls of read.scopes.all) {
      let hit = null;
      for (const [prop, p] of Object.entries(cfg.prefix ?? {}))
        for (const value of p.values) if (cls.startsWith(`${p.pattern.replace('{value}', value)}:`)) hit = { prop, value, prefix: p.pattern.replace('{value}', value) };
      if (hit) ((scoped[hit.prop] ??= {})[hit.value] ??= []).push(cls.slice(hit.prefix.length + 1));
      else baseClasses.push(cls);
    }
    for (const [prop, p] of Object.entries(cfg.prefix ?? {})) {
      contract.props[prop] = { values: p.values, default: p.default };
      for (const value of p.values) setVariant(prop, value, scoped[prop]?.[value] ?? []);
    }
  }
  const base = take(baseClasses);
  contract.base = base.scope;
  code.extra = base.extra.join(' ') || undefined;

  for (const [prop, m] of Object.entries(cfg.maps ?? {})) {
    const block = blocks[`${cfg.name}.${prop}`];
    if (!block) throw new Error(`${cfg.file}: no "// @contract ${cfg.name}.${prop}" markers`);
    const values = readBlock(block.body).scopes;
    contract.props[prop] = { values: Object.keys(values), default: m.default };
    for (const [value, classes] of Object.entries(values)) setVariant(prop, value, classes, { direct: m.part });
  }
  for (const part of cfg.blocks ?? []) {
    const block = blocks[`${cfg.name}.${part}`];
    if (!block) throw new Error(`${cfg.file}: no "// @contract ${cfg.name}.${part}" markers`);
    const { scope, extra } = take(readBlock(block.body).scopes.all, { direct: part });
    contract.base[part] = scope[part] ?? {};
    if (extra.length) code.extras[part] = extra.join(' ');
  }

  // parts and states actually used, in a stable order
  const scopes = [contract.base, ...Object.values(contract.variants).flatMap((v) => Object.values(v)), ...contract.compound];
  const parts = new Set(['root']);
  const states = new Set(['default']);
  for (const scope of scopes)
    for (const [part, props] of Object.entries(scope)) {
      if (part === 'when') continue;
      parts.add(part);
      for (const key of Object.keys(props)) if (key.includes(':')) states.add(key.split(':')[1]);
      if ('focus-ring' in props) states.add('focus');
    }
  const declared = ['root', ...Object.keys(cfg.parts ?? {}), ...(cfg.blocks ?? []), ...Object.values(cfg.maps ?? {}).map((m) => m.part)];
  contract.parts = [...new Set(declared)].filter((p) => parts.has(p));
  contract.states = STATE_ORDER.filter((s) => states.has(s));
  contract.code = compact(code);
  if (!contract.figma) delete contract.figma;
  if (!contract.compound.length) delete contract.compound;
  return contract;
}

// Extract + verify every configured component. [{ name, contract, diffs }]
export function extractAll({ names = [], kit = PATHS.kit } = {}) {
  const tokens = readTokens(PATHS.tokens);
  const map = JSON.parse(readFileSync(PATHS.map, 'utf8'));
  return COMPONENTS.filter((c) => !names.length || names.includes(c.name)).map((cfg) => {
    const contract = extract(cfg, { kit, tokens, map });
    const source = readFileSync(join(kit, 'components', cfg.file), 'utf8');
    const diffs = checkSource(contract, source);
    // Cross-check with the cva parser of code-index.mjs (used by components-map): same props and values.
    const cva = contract.code.export ? parseCva(stripComments(source))[contract.code.export] : null;
    for (const [prop, values] of Object.entries(cva ?? {}))
      if (JSON.stringify(values) !== JSON.stringify(contract.props[prop]?.values)) diffs.push(`code-index sees ${prop}=${values.join('|')}`);
    return { name: cfg.name, contract, diffs };
  });
}

export const contractText = (contract) => `${JSON.stringify(contract, null, 2)}\n`;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const names = argv.filter((a) => !a.startsWith('--'));
  const results = extractAll({ names });
  if (!argv.includes('--stdout')) mkdirSync(PATHS.out, { recursive: true });
  for (const r of results) {
    if (argv.includes('--stdout')) console.log(contractText(r.contract));
    else if (!r.diffs.length) writeFileSync(join(PATHS.out, `${r.name}.json`), contractText(r.contract));
    if (!argv.includes('--json')) console.log(r.diffs.length ? `FAIL  ${r.name}\n${r.diffs.map((d) => `  ${d}`).join('\n')}` : `ok    ${r.name}${argv.includes('--stdout') ? '' : `  -> ${join(PATHS.out, `${r.name}.json`)}`}`);
  }
  if (argv.includes('--json')) console.log(JSON.stringify(results.map(({ name, diffs }) => ({ name, diffs })), null, 2));
  process.exit(results.some((r) => r.diffs.length) ? 1 : 0);
}
