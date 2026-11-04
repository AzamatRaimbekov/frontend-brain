#!/usr/bin/env node
// Platform split of the Mbank tokens: colours are shared, spacing / radius / fonts / text and effect styles
// differ per platform (Web components vs Mobile KIT use other names and values). Sources, one file each:
//   tokens/core.json              shared: theme colours (2.theme), brands (1.brand), fonts known to MCP
//   tokens/platforms/<id>.json    one platform: title, Figma library, font, viewports, its sections, scales, styles
// Generated (never edit by hand):
//   tokens.json                   every platform merged back into the owner contract shape (all old readers keep working)
//   tokens/dist/<id>.json         one ready file per platform: colours + spacing/radius scales + styles
//   builder/core/platforms.js     platform ids and viewport widths for the screen spec (spec.js)
// Usage:
//   node tokens-platforms.mjs list
//   node tokens-platforms.mjs build [--check]        platform files -> tokens.json, dist, platforms.js
//   node tokens-platforms.mjs split                  tokens.json -> core + platform files (after tokens-build --from)
//   node tokens-platforms.mjs add <id> [--title T] [--from <id>] [--viewport name:width] [--font F] [--library L]
// Pure Node 18+, no dependencies.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PATHS = {
  tokens: join(PLUGIN, 'skills/mbank-figma-patterns/references/tokens.json'),
  dir: join(PLUGIN, 'skills/mbank-figma-patterns/references/tokens'),
  module: join(PLUGIN, 'builder/core/platforms.js'),
};
const STYLE_KEYS = ['textStyles', 'effectStyles'];
const ID = /^[a-z][a-z0-9-]*$/;

// Platforms of a tokens.json written before the split (no "platforms" key): what each one owns.
export const LEGACY = {
  web: {
    title: 'Web', order: 1, figmaLibrary: 'Web components', viewports: { desktop: 1440, tablet: 768 },
    sections: ['brandRadius', 'borderRadius', 'rem', 'webSpacing'],
    scales: { spacing: { section: 'webSpacing', prefix: 'spacing/' }, radius: { section: 'brandRadius', prefix: 'radius/' } },
  },
  mobile: {
    title: 'Mobile', order: 2, figmaLibrary: 'Mobile KIT', viewports: { mobile: 375 },
    sections: ['mobileFoundation'],
    scales: { spacing: { section: 'mobileFoundation', prefix: 'paddings/default/' }, radius: { section: 'mobileFoundation', prefix: 'radius/' } },
  },
};

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, data) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, `${JSON.stringify(data, null, 1)}\n`); };
const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id);
const META = ['title', 'order', 'figmaLibrary', 'viewports', 'sections', 'scales'];
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

/** tokens.json -> { core, platforms: [platform file] }. Keeps fields of existing platform files that tokens.json lacks. */
export function split(tokens, existing = {}) {
  const metas = tokens.platforms ?? LEGACY;
  const platforms = Object.entries(metas).map(([id, meta]) => {
    const prev = existing[id] ?? {};
    const sections = Object.fromEntries((meta.sections ?? []).filter((s) => tokens[s] !== undefined).map((s) => [s, tokens[s]]));
    return {
      $schema: 'mbank/platform@1', id, ...pick({ ...prev, ...meta }, META.filter((k) => k !== 'sections')),
      font: tokens.fonts?.[id] ?? prev.font ?? null,
      sections,
      textStyles: tokens.textStyles?.[id] ?? [],
      effectStyles: tokens.effectStyles?.[id] ?? [],
    };
  }).sort(byOrder);
  const owned = new Set(['platforms', ...STYLE_KEYS, ...platforms.flatMap((p) => Object.keys(p.sections))]);
  const core = { $schema: 'mbank/tokens-core@1' };
  for (const [k, v] of Object.entries(tokens)) {
    if (owned.has(k)) continue;
    core[k] = k === 'fonts' ? Object.fromEntries(Object.entries(v).filter(([f]) => !metas[f])) : v;
  }
  return { core, platforms };
}

/** Problems of a platform set, in Russian (shown to the designer / CI). */
export function validate(core, platforms) {
  const errors = [];
  const seen = { id: new Set(), section: new Set(Object.keys(core)), viewport: new Map() };
  for (const p of platforms) {
    const at = `platforms/${p.id}.json`;
    if (!ID.test(p.id || '')) errors.push(`${at}: id — латиница в нижнем регистре, цифры и дефис`);
    if (seen.id.has(p.id)) errors.push(`${at}: платформа «${p.id}» уже есть`);
    seen.id.add(p.id);
    if (!p.title) errors.push(`${at}: нужен title`);
    const vps = Object.entries(p.viewports ?? {});
    if (!vps.length) errors.push(`${at}: нужен хотя бы один viewport, например {"mobile": 375}`);
    for (const [name, width] of vps) {
      if (!ID.test(name)) errors.push(`${at}: viewport «${name}» — латиница в нижнем регистре`);
      if (!Number.isInteger(width) || width < 200 || width > 4000) errors.push(`${at}: viewport «${name}» — ширина целым числом от 200 до 4000`);
      if (seen.viewport.has(name)) errors.push(`${at}: viewport «${name}» уже есть у платформы «${seen.viewport.get(name)}»`);
      else seen.viewport.set(name, p.id);
    }
    for (const s of Object.keys(p.sections ?? {})) {
      if (seen.section.has(s) || STYLE_KEYS.includes(s) || s === 'platforms') errors.push(`${at}: раздел «${s}» уже занят (core или другая платформа)`);
      seen.section.add(s);
      if (!Array.isArray(p.sections[s]?.vars)) errors.push(`${at}: раздел «${s}» — нужен {"columns": [...], "vars": [...]}`);
    }
    for (const [kind, sc] of Object.entries(p.scales ?? {})) {
      if (!p.sections?.[sc.section]) errors.push(`${at}: шкала ${kind} ссылается на раздел «${sc.section}», его нет`);
    }
  }
  return errors;
}

/** core + platform files -> tokens.json (owner contract shape + "platforms" meta). */
export function merge(core, platforms) {
  const { $schema, ...rest } = core;
  const list = [...platforms].sort(byOrder);
  const tokens = {};
  for (const [k, v] of Object.entries(rest)) {
    tokens[k] = k === 'fonts' ? { ...v, ...Object.fromEntries(list.filter((p) => p.font).map((p) => [p.id, p.font])) } : v;
  }
  for (const p of list) Object.assign(tokens, p.sections);
  for (const key of STYLE_KEYS) tokens[key] = Object.fromEntries(list.map((p) => [p.id, p[key] ?? []]));
  tokens.platforms = Object.fromEntries(list.map((p) => [p.id, { ...pick(p, META.filter((k) => k !== 'sections')), sections: Object.keys(p.sections ?? {}) }]));
  return tokens;
}

const num = (v) => { const n = Number(String(v).replace(/px$/, '')); return Number.isFinite(n) ? n : null; };
/** Scale of a platform: [{ px, name, key }] by value, from the section variables with the prefix. */
export function scale(p, kind) {
  const sc = p.scales?.[kind];
  const vars = sc ? p.sections?.[sc.section]?.vars ?? [] : [];
  return vars.filter((v) => !sc.prefix || v.name.startsWith(sc.prefix))
    .map((v) => ({ px: num(v.values?.[0]), name: v.name, key: v.key }))
    .filter((x) => x.px !== null && x.px >= 0)
    .sort((a, b) => a.px - b.px);
}

/** One ready file per platform for its developers and generators. */
export function dist(core, p) {
  return {
    $schema: 'mbank/platform-tokens@1',
    note: 'Сгенерировано tokens-platforms.mjs build из tokens/core.json и tokens/platforms/*.json, не править руками',
    id: p.id, title: p.title, figmaLibrary: p.figmaLibrary ?? null, font: p.font ?? null, viewports: p.viewports,
    colors: {
      modes: core.theme?.modes ?? [],
      theme: (core.theme?.vars ?? []).map((v) => ({ name: v.name, light: v.light, dark: v.dark })),
      brands: core.brand?.modes ?? [],
      brand: (core.brand?.vars ?? []).map((v) => ({ name: v.name, values: v.values })),
    },
    spacing: scale(p, 'spacing'),
    radius: scale(p, 'radius'),
    textStyles: p.textStyles ?? [],
    effectStyles: p.effectStyles ?? [],
  };
}

/** builder/core/platforms.js: spec.js reads platform ids and viewport widths from here (copied to frontend-pack). */
export function moduleText(platforms) {
  const list = [...platforms].sort(byOrder);
  const P = Object.fromEntries(list.map((p) => [p.id, { title: p.title, viewports: Object.keys(p.viewports) }]));
  const V = Object.fromEntries(list.flatMap((p) => Object.entries(p.viewports)));
  return `// Generated by figma-pack/scripts/tokens-platforms.mjs build from skills/mbank-figma-patterns/references/tokens/platforms/*.json.
// Do not edit: add a platform with \`node tokens-platforms.mjs add <id>\`, then build.
export const PLATFORMS = ${JSON.stringify(P, null, 2)};

export const VIEWPORTS = ${JSON.stringify(V)};
`;
}

export function readSources(dir = PATHS.dir) {
  const core = readJson(join(dir, 'core.json'));
  const pdir = join(dir, 'platforms');
  const platforms = existsSync(pdir) ? readdirSync(pdir).filter((f) => f.endsWith('.json')).map((f) => readJson(join(pdir, f))) : [];
  return { core, platforms: platforms.sort(byOrder) };
}

/** Everything build writes: { path: text }. */
export function outputs(core, platforms, paths = PATHS) {
  const files = { [paths.tokens]: `${JSON.stringify(merge(core, platforms), null, 1)}` };
  for (const p of platforms) files[join(paths.dir, 'dist', `${p.id}.json`)] = `${JSON.stringify(dist(core, p), null, 1)}\n`;
  files[paths.module] = moduleText(platforms);
  return files;
}

export function build({ check = false, paths = PATHS } = {}) {
  const { core, platforms } = readSources(paths.dir);
  const errors = validate(core, platforms);
  if (errors.length) return { ok: false, errors, stale: [] };
  const files = outputs(core, platforms, paths);
  const distDir = join(paths.dir, 'dist');
  const extra = existsSync(distDir) ? readdirSync(distDir).map((f) => join(distDir, f)).filter((f) => !files[f]) : [];
  const stale = [...Object.entries(files).filter(([p, text]) => !existsSync(p) || readFileSync(p, 'utf8') !== text).map(([p]) => p), ...extra];
  if (!check) {
    for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); }
    for (const p of extra) rmSync(p);
  }
  return { ok: check ? stale.length === 0 : true, errors: [], stale, platforms: platforms.map((p) => p.id) };
}

export function splitFiles({ paths = PATHS } = {}) {
  const pdir = join(paths.dir, 'platforms');
  const existing = existsSync(pdir) ? Object.fromEntries(readdirSync(pdir).filter((f) => f.endsWith('.json')).map((f) => { const p = readJson(join(pdir, f)); return [p.id, p]; })) : {};
  const tokens = readJson(paths.tokens);
  const { core, platforms } = split(tokens, existing);
  // A platform added by file but not yet built into tokens.json stays as it is.
  for (const [id, p] of Object.entries(existing)) if (!platforms.some((x) => x.id === id)) platforms.push(p);
  writeJson(join(paths.dir, 'core.json'), core);
  for (const p of platforms) writeJson(join(pdir, `${p.id}.json`), p);
  const back = merge(core, platforms);
  const { platforms: _, ...a } = back;
  const { platforms: __, ...b } = tokens;
  return { platforms: platforms.map((p) => p.id), lossless: isDeepStrictEqual(a, b) };
}

/** New platform file: empty scales and styles, or a copy of another platform's (--from) to rename later. */
export function addPlatform(id, { title, from, viewport, font, library, paths = PATHS } = {}) {
  const pdir = join(paths.dir, 'platforms');
  const file = join(pdir, `${id}.json`);
  if (!ID.test(id || '')) throw new Error(`id «${id}»: латиница в нижнем регистре, цифры и дефис (например tablet, desktop-app)`);
  if (existsSync(file)) throw new Error(`Платформа «${id}» уже есть: ${file}`);
  const { platforms } = readSources(paths.dir);
  const base = from ? platforms.find((p) => p.id === from) : null;
  if (from && !base) throw new Error(`Нет платформы «${from}» (есть: ${platforms.map((p) => p.id).join(', ')})`);
  const [vName, vWidth] = String(viewport || `${id}:${base ? Object.values(base.viewports)[0] : 1280}`).split(':');
  const prefixed = (name) => `${id}${name[0].toUpperCase()}${name.slice(1)}`; // webSpacing -> tabletWebSpacing: sections stay unique
  const sections = base ? Object.fromEntries(Object.entries(base.sections).map(([k, v]) => [prefixed(k), v])) : {};
  const scales = base ? Object.fromEntries(Object.entries(base.scales ?? {}).map(([k, v]) => [k, { ...v, section: prefixed(v.section) }])) : {};
  const p = {
    $schema: 'mbank/platform@1', id, title: title || id[0].toUpperCase() + id.slice(1),
    order: Math.max(0, ...platforms.map((x) => x.order ?? 0)) + 1,
    figmaLibrary: library ?? base?.figmaLibrary ?? null, viewports: { [vName]: Number(vWidth) },
    scales, font: font ?? base?.font ?? null, sections,
    textStyles: base ? base.textStyles : [], effectStyles: base ? base.effectStyles : [],
  };
  const errors = validate(readSources(paths.dir).core, [...platforms, p]);
  if (errors.length) throw new Error(errors.join('\n'));
  writeJson(file, p);
  return { file, platform: p };
}

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); out[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; } else out._.push(argv[i]);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = args(process.argv.slice(2));
  const cmd = a._[0];
  try {
    if (cmd === 'list') {
      for (const p of readSources().platforms) console.log(`${p.id.padEnd(10)} ${p.title.padEnd(10)} ${Object.entries(p.viewports).map(([n, w]) => `${n} ${w}`).join(', ').padEnd(26)} ${p.figmaLibrary ?? '—'} · шрифт ${p.font ?? '—'} · ${Object.keys(p.sections).length} разделов`);
    } else if (cmd === 'build') {
      const r = build({ check: !!a.check });
      if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
      if (a.check) { if (!r.ok) { console.error(`Устарело, запусти build:\n${r.stale.join('\n')}`); process.exit(1); } console.log('Платформы токенов в порядке'); }
      else console.log(`Собрано: ${r.platforms.join(', ')}${r.stale.length ? ` · обновлено файлов ${r.stale.length}` : ' · без изменений'}`);
    } else if (cmd === 'split') {
      const r = splitFiles();
      console.log(`Разложено по файлам: ${r.platforms.join(', ')} · без потерь: ${r.lossless ? 'да' : 'НЕТ'}`);
      if (!r.lossless) process.exit(1);
    } else if (cmd === 'add') {
      const r = addPlatform(a._[1], { title: a.title, from: a.from, viewport: a.viewport, font: a.font, library: a.library });
      console.log(`Создано: ${r.file}\nДальше: заполни разделы и шкалы, затем node tokens-platforms.mjs build`);
    } else {
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 16).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
