#!/usr/bin/env node
// Generates registry/mbank/tokens.css from the Figma variables (figma-pack tokens.json) and the mapping
// registry/mbank/tokens.map.json (CSS var -> Figma variable + collection/mode, or a marked override).
// Usage:
//   node tokens-build.mjs                       write tokens.css
//   node tokens-build.mjs --check [--strict]    exit 1 + a diff list when tokens.css is out of date
//   node tokens-build.mjs --from <raw.json> [--from <raw2.json>]   read-tokens.js dumps -> tokens.json, then build
//   options: --tokens <tokens.json> --map <tokens.map.json> --out <tokens.css> --json
// Figma variables the map does not use are reported as info; --strict makes them a failure
// (except names matching map.ignore). With --check, --from only checks and writes nothing.
// Pure Node 18+, no dependencies.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { normalizeRaw, diffTokens } from './tokens-normalize.mjs';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULTS = {
  // Copy of the figma-pack contract; design-engine sync-contracts keeps it equal to the owner.
  tokens: join(PLUGIN, 'registry', 'mbank', 'tokens.json'),
  map: join(PLUGIN, 'registry', 'mbank', 'tokens.map.json'),
  out: join(PLUGIN, 'registry', 'mbank', 'tokens.css'),
};
// Sections of tokens.json that hold web tokens; unused names in them are reported.
export const SCANNED = ['theme', 'brand', 'brandRadius', 'webSpacing', 'textStyles.web', 'effectStyles.web'];
const WIDTH = 120; // max line length of compact blocks
const COLLECTION_LABEL = { theme: '2.theme', brand: '1.brand', brandRadius: '1.brand radius' };

// ---- resolving Figma values ----

function section(tokens, collection) {
  const s = collection.split('.').reduce((o, k) => (o == null ? o : o[k]), tokens);
  if (!s) throw new Error(`tokens.json has no section "${collection}"`);
  return s;
}

/** Value of one Figma variable or style: { collection, figma, mode } -> string or style object. */
export function lookup(tokens, { collection = 'theme', figma, mode }, used) {
  const s = section(tokens, collection);
  const list = Array.isArray(s) ? s : s.vars;
  const v = list.find((x) => x.name === figma);
  if (!v) throw new Error(`Figma variable "${figma}" not found in tokens.json ${collection}`);
  used?.add(`${collection}\u0000${figma}`);
  if (Array.isArray(s)) return v; // text / effect style
  if (collection === 'theme') {
    if (!(mode in v)) throw new Error(`"${figma}" has no mode "${mode}"`);
    return v[mode];
  }
  const modes = s.modes ?? s.columns ?? [];
  const i = modes.length > 1 ? modes.indexOf(mode) : 0;
  if (i < 0) throw new Error(`${collection} has no mode "${mode}" (modes: ${modes.join(', ')})`);
  return v.values[i];
}

const label = (src) => (src.literal ? 'literal' : `${COLLECTION_LABEL[src.collection] ?? src.collection} ${src.figma}${src.mode ? ` (${src.mode})` : ''}`);

/** One declaration from a token entry for a mode: { prop, value, src, note, todo } or null (not emitted). */
function declFor(token, mode, ctx, groupDark) {
  const override = token[mode];
  if (override === false || (mode === 'dark' && override === undefined && groupDark === false)) return null;
  const o = override && typeof override === 'object' ? override : {};
  // An overridden Figma variable must still exist: the override documents what it replaces.
  if (token.figma && (o.value !== undefined || o.figma)) lookup(ctx.tokens, { collection: token.collection ?? 'theme', figma: token.figma, mode: token.mode ?? mode }, ctx.used);
  const todo = o.gap ? `TODO(${o.gap}): ${o.note}` : null;
  const literal = o.value ?? token.value;
  if (literal !== undefined && !o.figma) {
    return { prop: token.css, value: literal, src: { literal: true, gap: o.gap }, note: o.gap ? null : token.note ?? null, todo };
  }
  const src = {
    collection: o.collection ?? token.collection ?? 'theme',
    figma: o.figma ?? token.figma,
    mode: o.mode ?? token.mode ?? (token.collection && token.collection !== 'theme' ? undefined : mode),
  };
  let value = lookup(ctx.tokens, src, ctx.used);
  if (token.unit) value = `${value}${token.unit}`;
  return { prop: token.css, value, src, note: token.note ?? (o.figma ? null : src.figma), todo };
}

// Expands { from: "brand", mode } into the 12 brand tokens: light from 1.brand, dark from 2.theme brand/<mode>/*.
function brandTokens(map, mode) {
  return map.brand.tokens.map((t) => ({
    css: t.css,
    light: { collection: 'brand', figma: `brand/${t.figma}`, mode },
    dark: { collection: 'theme', figma: `brand/${mode}/${t.figma}`, mode: 'dark' },
  }));
}

const groupTokens = (map, g) => (g.from === 'brand' ? brandTokens(map, g.mode) : g.tokens);

// ---- building the model ----

/** Builds the CSS model: { blocks: [{ selector, compact, comment, items: [comment | decl] }], used, spacing }. */
export function buildModel(tokens, map) {
  const ctx = { tokens, used: new Set() };
  const blocks = [];
  const rootItems = (mode) => {
    const items = [];
    for (const g of map.root) {
      const decls = groupTokens(map, g).map((t) => declFor(t, mode, ctx, g.dark)).filter(Boolean).map((d) => ({ ...d, packed: g.compact }));
      if (!decls.length) continue;
      const comment = mode === 'dark' ? g.darkComment ?? g.comment : g.comment;
      if (comment) items.push({ comment });
      items.push(...decls);
    }
    return items;
  };
  blocks.push({ selector: ':root', items: rootItems('light') });
  blocks.push({ selector: '.dark', compact: true, items: rootItems('dark') });

  const b = map.brand;
  for (const mode of b.modes) {
    blocks.push({ selector: `[data-brand="${mode}"]`, compact: true, comment: mode === b.modes[0] ? b.comment : undefined,
      items: b.tokens.map((t) => declFor({ ...t, collection: 'brand', figma: `brand/${t.figma}`, mode }, 'light', ctx)) });
  }
  for (const mode of b.modes) {
    const over = b.darkOverrides?.[mode];
    const items = b.tokens.map((t) => {
      const src = over?.collection === 'brand'
        ? { collection: 'brand', figma: `brand/${t.figma}`, mode: over.mode }
        : { collection: 'theme', figma: `brand/${mode}/${t.figma}`, mode: 'dark' };
      return declFor({ css: t.css, ...src, dark: { ...src, gap: over?.gap, note: over?.note } }, 'dark', ctx);
    });
    const note = over ?? b.darkNotes?.[mode];
    blocks.push({ selector: `.dark[data-brand="${mode}"], .dark [data-brand="${mode}"]`, compact: true,
      items: [...(note ? [{ comment: `TODO(${note.gap}): ${note.note}` }] : []), ...items.map((d) => ({ ...d, todo: null }))] });
  }

  const ti = map.themeInline;
  const inline = [declFor(ti.font, 'light', ctx)];
  for (const g of map.root) {
    if (g.utilities === false) continue;
    for (const t of groupTokens(map, g)) {
      if (t.utility === false) continue;
      const name = t.css.slice(2);
      inline.push({ prop: `--color-${name}`, value: `var(--${name})`, src: { literal: true } });
    }
  }
  inline.push({ comment: ti.aliasesComment });
  for (const a of ti.aliases) {
    if (a.figma) lookup(tokens, { collection: 'theme', figma: a.figma, mode: 'light' }, ctx.used);
    inline.push({ prop: a.css, value: a.value, src: { literal: true }, note: a.figma ?? null });
  }
  inline.push({ comment: ti.shadowsComment });
  for (const s of ti.shadows) {
    const style = lookup(tokens, { collection: 'effectStyles.web', figma: s.style }, ctx.used);
    inline.push({ prop: s.css, value: shadowCss(style.effects, ti.shadowColor), src: { collection: 'effectStyles.web', figma: s.style }, note: s.style });
  }
  blocks.push({ selector: '@theme inline', comment: ti.comment, items: inline });

  const th = map.theme;
  const scale = [];
  for (const r of th.radius) scale.push(declFor({ ...r, collection: 'brandRadius', unit: 'px' }, 'light', ctx));
  for (const t of th.text) {
    const st = lookup(tokens, { collection: 'textStyles.web', figma: t.style }, ctx.used);
    for (const extra of t.alsoStyles ?? []) lookup(tokens, { collection: 'textStyles.web', figma: extra }, ctx.used);
    const src = { collection: 'textStyles.web', figma: t.style };
    scale.push({ prop: t.css, value: `${st.size}px`, src, note: t.note ?? t.style,
      extra: [{ prop: `${t.css}--line-height`, value: `${st.lineHeight}px`, src }] });
  }
  blocks.push({ selector: '@theme', comment: th.comment, items: scale });
  return { blocks, used: ctx.used, spacing: spacingComment(tokens, map, ctx.used) };
}

/** "DROP_SHADOW 0,3 r6 + 0,11 r11" -> "0 3px 6px var(--shadow-color), 0 11px 11px var(--shadow-color)". */
export function shadowCss(effects, color) {
  const px = (n) => (Number(n) === 0 ? '0' : `${Number(n)}px`);
  return effects.replace(/^DROP_SHADOW\s+/, '').split('+').map((part) => {
    const m = part.trim().match(/^(-?[\d.]+),(-?[\d.]+)\s+r([\d.]+)(?:\s+s(-?[\d.]+))?$/);
    if (!m) throw new Error(`Unsupported effect "${effects}"`);
    return [px(m[1]), px(m[2]), px(m[3]), ...(m[4] ? [px(m[4])] : []), color].join(' ');
  }).join(', ');
}

function spacingComment(tokens, map, used) {
  const vars = section(tokens, 'webSpacing').vars;
  const on = [];
  const off = [];
  for (const v of vars) {
    used.add(`webSpacing\u0000${v.name}`);
    const px = Number(v.values[0]);
    if (!px) continue;
    (px % 4 === 0 ? on : off).push({ name: v.name.replace(/^spacing\//, ''), px });
  }
  const list = on.map((s) => `${s.name} ${s.px} = ${s.px / 4}`);
  const lines = [map.spacing.intro];
  for (let i = 0; i < list.length; i += 6) lines.push(list.slice(i, i + 6).join(', ') + (i + 6 < list.length ? ',' : '.'));
  for (const s of off) lines.push(`spacing/${s.name} (${s.px}px) is off-grid (${map.spacing.offGridGap}): use ${s.px / 4} only if a design needs it.`);
  return lines;
}

// ---- rendering ----

const comment = (text, indent) => {
  const [first, ...rest] = text.split('\n');
  return `${indent}/* ${first}${rest.map((l) => `\n${indent}   ${l}`).join('')} */`;
};

export function render(model, map, tokens) {
  const out = ['/*', ...map.header.map((l) => (l ? ` * ${l}` : ' *')), ` * Figma read: ${tokens.source}`, ' */', ''];
  out.push(...map.preamble, '');
  for (const block of model.blocks) {
    if (block.comment) out.push(comment(block.comment, ''));
    out.push(`${block.selector.replace(/, \./g, ',\n.')} {`);
    let line = '';
    let count = 0;
    const flush = () => { if (line) out.push(line); line = ''; };
    for (const item of block.items) {
      if (item.comment || item.todo) flush();
      if (item.comment) { out.push(comment(item.comment, '  ')); continue; }
      if (item.todo) out.push(comment(item.todo, '  '));
      const decl = [item, ...(item.extra ?? [])].map((d) => `${d.prop}: ${d.value};`).join(' ');
      if (block.compact || item.packed) { // several declarations per line; provenance is in the map
        if (line && (line.length + decl.length + 1 > WIDTH || (typeof item.packed === 'number' && count === item.packed))) flush();
        count = line ? count + 1 : 1;
        line = line ? `${line} ${decl}` : `  ${decl}`;
        continue;
      }
      flush();
      out.push(item.note ? `${`  ${decl}`.padEnd(38)} /* ${item.note} */` : `  ${decl}`);
    }
    flush();
    out.push('}', '');
  }
  out.push(comment(model.spacing.join('\n'), ''), '', ...map.epilogue);
  return `${out.join('\n')}\n`;
}

// ---- parsing a tokens.css for --check ----

const normSelector = (s) => s.split(',').map((p) => p.trim().replace(/\s+/g, ' ')).join(', ');

/** CSS text -> Map(selector -> Map(prop -> value)). Nested blocks get "outer > inner" keys. */
export function parseCss(text) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = new Map();
  const add = (key, stmt) => {
    const s = stmt.trim().replace(/\s+/g, ' ');
    if (!s) return;
    const at = s.startsWith('@');
    const i = at ? s.indexOf(' ') : s.indexOf(':');
    if (!out.has(key)) out.set(key, new Map());
    out.get(key).set(at ? s.slice(0, i) : s.slice(0, i).trim(), s.slice(i + 1).trim());
  };
  const walk = (from, to, key) => {
    let start = from;
    for (let i = from; i < to; i++) {
      if (src[i] === ';') { add(key, src.slice(start, i)); start = i + 1; }
      else if (src[i] === '{') {
        let depth = 1;
        let j = i + 1;
        for (; j < to && depth; j++) depth += src[j] === '{' ? 1 : src[j] === '}' ? -1 : 0;
        const sel = normSelector(src.slice(start, i));
        walk(i + 1, j - 1, key === '(top)' ? sel : `${key} > ${sel}`);
        i = j - 1;
        start = j;
      }
    }
    add(key, src.slice(start, to));
  };
  walk(0, src.length, '(top)');
  return out;
}

/** Semantic diff of two tokens.css texts; provenance from the model. */
export function compareCss(expectedText, actualText, model) {
  const exp = parseCss(expectedText);
  const act = parseCss(actualText);
  const srcOf = new Map();
  for (const b of model?.blocks ?? []) for (const d of b.items.flatMap((i) => [i, ...(i.extra ?? [])])) if (d.prop) srcOf.set(`${normSelector(b.selector)}\u0000${d.prop}`, d.src);
  const diffs = [];
  for (const sel of new Set([...exp.keys(), ...act.keys()])) {
    const e = exp.get(sel) ?? new Map();
    const a = act.get(sel) ?? new Map();
    for (const prop of new Set([...e.keys(), ...a.keys()])) {
      if (e.get(prop) === a.get(prop)) continue;
      const src = srcOf.get(`${sel}\u0000${prop}`);
      diffs.push({ selector: sel, css: prop, figma: src ? label(src) : null, expected: e.get(prop) ?? null, actual: a.get(prop) ?? null });
    }
  }
  return diffs;
}

// "font/*-md" -> /^font\/.*-md$/; a pattern without * is a prefix.
const glob = (p) => new RegExp(`^${p.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}${p.includes('*') ? '$' : ''}`);

export function unusedNames(tokens, used, ignore = []) {
  const out = [];
  for (const collection of SCANNED) {
    let s;
    try { s = section(tokens, collection); } catch { continue; }
    for (const v of Array.isArray(s) ? s : s.vars) {
      if (used.has(`${collection}\u0000${v.name}`)) continue;
      out.push({ collection, name: v.name, ignored: ignore.some((p) => glob(p).test(v.name)) });
    }
  }
  return out;
}

// ---- CLI ----

export function parseArgs(argv) {
  const opts = { ...DEFAULTS, from: [], check: false, strict: false, json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--json') opts.json = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (['--tokens', '--map', '--out', '--from'].includes(a.split('=')[0])) {
      const [key, inline] = a.slice(2).split(/=(.*)/s);
      const value = inline ?? argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`--${key} needs a value`);
      if (key === 'from') opts.from.push(resolve(value));
      else opts[key] = resolve(value);
    } else throw new Error(`Unknown argument ${a}`);
  }
  return opts;
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Runs the whole build; returns a report object (never exits). */
export function run(opts) {
  const report = { ok: true, mode: opts.check ? 'check' : 'write', strict: opts.strict, out: opts.out, errors: [], diffs: [], unused: [], tokensChanges: null, written: [] };
  let tokens = readJson(opts.tokens);
  const map = readJson(opts.map);
  if (opts.from.length) {
    const { tokens: next, updated, skipped, warnings } = normalizeRaw(opts.from.map(readJson), tokens);
    const kept = Object.keys(tokens).filter((k) => !['source', 'fonts'].includes(k) && !updated.some((u) => u.split('.')[0] === k));
    report.tokensChanges = { ...diffTokens(tokens, next), updated, kept, skipped, warnings };
    tokens = next;
    // Same layout as the Full-seat read (1-space indent, no final newline), so a PR diff shows only real changes.
    if (!opts.check) { writeFileSync(opts.tokens, JSON.stringify(tokens, null, 1)); report.written.push(opts.tokens); }
  }
  let model;
  let css;
  try {
    model = buildModel(tokens, map);
    css = render(model, map, tokens);
  } catch (err) {
    report.ok = false;
    report.errors.push(err.message);
    return report;
  }
  report.unused = unusedNames(tokens, model.used, map.ignore);
  if (opts.strict && report.unused.some((u) => !u.ignored)) report.ok = false;
  if (opts.check) {
    const current = existsSync(opts.out) ? readFileSync(opts.out, 'utf8') : '';
    report.diffs = compareCss(css, current, model);
    report.formattingOnly = !report.diffs.length && current !== css;
    if (report.diffs.length || report.formattingOnly) report.ok = false;
  } else {
    writeFileSync(opts.out, css);
    report.written.push(opts.out);
  }
  return report;
}

export function format(report) {
  const lines = [];
  for (const e of report.errors) lines.push(`error: ${e}`);
  const ch = report.tokensChanges;
  if (ch) {
    lines.push(`tokens.json from Figma: ${ch.changed.length} changed, ${ch.added.length} added, ${ch.removed.length} removed${ch.kept.length ? `; kept from the old file: ${ch.kept.join(', ')}` : ''}`);
    for (const c of ch.changed) lines.push(`  ~ ${c.section} ${c.name}${c.field ? ` [${c.field}]` : ''}: ${c.before} -> ${c.after}`);
    for (const c of ch.added) lines.push(`  + ${c.section} ${c.name}`);
    for (const c of ch.removed) lines.push(`  - ${c.section} ${c.name}`);
    if (ch.skipped.length) lines.push(`  collections not mapped to tokens.json: ${ch.skipped.join(', ')}`);
    for (const w of ch.warnings) lines.push(`  warning: ${w}`);
  }
  if (report.diffs.length) {
    lines.push(`tokens.css is out of date: ${report.diffs.length} difference(s). Run tokens-build.mjs (without --check).`);
    for (const d of report.diffs) {
      lines.push(`  ${d.selector}  ${d.css}${d.figma ? `  <- ${d.figma}` : ''}`);
      lines.push(`      expected ${d.expected ?? '(absent)'}  actual ${d.actual ?? '(absent)'}`);
    }
  } else if (report.formattingOnly) lines.push('tokens.css has the same declarations but differs in comments/formatting. Run tokens-build.mjs.');
  else if (report.mode === 'check' && !report.errors.length) lines.push('tokens.css is up to date.');
  const open = report.unused.filter((u) => !u.ignored);
  if (open.length) {
    lines.push(`${report.strict ? 'error' : 'info'}: ${open.length} Figma variable(s)/style(s) not used by tokens.map.json (--strict fails on them; map.ignore silences a prefix):`);
    const by = {};
    for (const u of open) (by[u.collection] ??= []).push(u.name);
    for (const [c, names] of Object.entries(by)) lines.push(`  ${c}: ${names.join(', ')}`);
  }
  for (const w of report.written) lines.push(`wrote ${w}`);
  return lines.join('\n');
}

export function main(argv) {
  let opts;
  try { opts = parseArgs(argv); } catch (err) {
    console.error(`${err.message}\nusage: tokens-build.mjs [--check] [--strict] [--json] [--from <raw.json>] [--tokens <file>] [--map <file>] [--out <file>]`);
    return 2;
  }
  if (opts.help) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n')); return 0; }
  let report;
  try { report = run(opts); } catch (err) { report = { ok: false, errors: [err.message], diffs: [], unused: [], written: [] }; }
  console.log(opts.json ? JSON.stringify(report, null, 2) : format(report));
  return report.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
