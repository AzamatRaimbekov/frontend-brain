#!/usr/bin/env node
// Figma component -> code component map of the Mbank kit (mbank-design-system/references/components-map.json).
// Usage:
//   node components-map.mjs check                         validate the map against catalog.json and the kit code (exit 1 on errors)
//   node components-map.mjs report [--json]               coverage by kit and status, missing components = kit backlog
//   node components-map.mjs write-catalog                 fill catalog.json code.web and codeConnect from the map (idempotent)
//   node components-map.mjs code-connect --out <dir> [--include-partial]
//                                                         write @figma/code-connect files (*.figma.tsx); publishing is a human step
// Common options: --map <file> --catalog <file> --code <registry dir> (default: plugins/frontend-pack/registry/mbank).
// Pure Node 18+, no dependencies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DEFAULT_PACKAGES, indexCode, propInfo } from './code-index.mjs';
import { resolvePlugin } from './resolve-plugin.mjs';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');
// The map is the engine's own; the catalog belongs to figma-pack, the code to frontend-pack.
const FIGMA = resolvePlugin('figma-pack') ?? 'figma-pack (not installed)';
const FRONTEND = resolvePlugin('frontend-pack') ?? 'frontend-pack (not installed)';
export const DEFAULTS = {
  map: join(PLUGIN, 'references', 'components-map.json'),
  catalog: join(FIGMA, 'skills', 'mbank-design-system', 'references', 'catalog.json'),
  code: join(FRONTEND, 'registry', 'mbank'),
};
export const STATUSES = ['mapped', 'partial', 'missing', 'ignore', 'out-of-scope'];
const LINKED = new Set(['mapped', 'partial']);
const KITS = ['web', 'crm', 'mobile'];

export function parseArgs(argv) {
  const opts = { command: null, json: false, includePartial: false, out: null, ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--include-partial') opts.includePartial = true;
    else if (['--map', '--catalog', '--code', '--out'].includes(a)) {
      const v = argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`${a} needs a value`);
      opts[a.slice(2)] = resolve(v);
    } else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else if (!opts.command) opts.command = a;
    else throw new Error(`Unexpected argument ${a}`);
  }
  return opts;
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const entryId = (c) => c.key ?? `node:${c.nodeId ?? c.name}`;
const label = (e) => `${e.figma} (${e.key ?? e.nodeId})`;
// Code Connect variable for a code prop: variant -> variant, aria-invalid -> ariaInvalid, Button.variant -> buttonVariant.
export const varName = (prop) =>
  prop.split(/[.-]/).filter(Boolean).map((p, i) => (i ? p[0].toUpperCase() : p[0].toLowerCase()) + p.slice(1)).join('');

// Every place where an entry names a code component: the entry itself and each of its variants.
export function targets(entry) {
  if (!entry.variants?.length) return [{ ...entry, when: null }];
  return entry.variants.map((v) => ({ ...entry, ...v, props: v.props ?? entry.props, booleans: v.booleans ?? entry.booleans, text: v.text ?? entry.text, example: v.example ?? entry.example }));
}

function checkPropTarget(idx, t, codeProp, value, where, errors) {
  let component = t.component;
  let prop = codeProp;
  const dot = codeProp.match(/^([A-Z]\w*)\.([\w-]+)$/);
  if (dot) [, component, prop] = dot;
  const info = propInfo(idx, component, prop);
  if (!idx.components[component]) return errors.push(`${where}: component ${component} not found in code`);
  if (!info.known) return errors.push(`${where}: ${component} has no prop "${prop}"`);
  if (value !== undefined && info.values && !info.values.includes(value)) {
    errors.push(`${where}: ${component}.${prop} = ${JSON.stringify(value)} is not one of ${info.values.map((v) => JSON.stringify(v)).join(', ')}`);
  }
}

// Variables a code-connect example may read as props.<name>.
export function exampleVars(t) {
  const vars = new Set();
  for (const spec of Object.values(t.props ?? {})) {
    if (spec.prop) vars.add(varName(spec.as ?? spec.prop));
    for (const v of Object.values(spec.values ?? {})) if (v && typeof v === 'object') Object.keys(v).forEach((k) => vars.add(varName(k)));
  }
  for (const v of Object.values(t.booleans ?? {})) if (typeof v === 'string' && !v.startsWith('slot:')) vars.add(varName(v));
  for (const v of Object.values(t.text ?? {})) if (typeof v === 'string') vars.add(varName(v));
  return vars;
}

function checkTarget(idx, cat, t, errors) {
  const where = `${label(t)}${t.when ? ` [${JSON.stringify(t.when)}]` : ''}`;
  const pkg = idx.packages[t.import];
  if (!pkg) return errors.push(`${where}: unknown import "${t.import}"`);
  if (!pkg.exports.has(t.component)) return errors.push(`${where}: ${t.import} does not export ${t.component}`);
  const def = idx.components[t.component];
  const files = idx.registry[t.registry];
  if (!files) errors.push(`${where}: registry item "${t.registry}" not found in registry.json`);
  else if (def && !files.includes(def.file)) errors.push(`${where}: registry item "${t.registry}" does not contain ${def.file}`);
  for (const [figmaProp, value] of Object.entries(t.when ?? {})) {
    if (!cat.variantProps?.[figmaProp]?.includes(value)) errors.push(`${where}: variant ${figmaProp}=${value} not in the catalog`);
  }
  for (const [figmaProp, spec] of Object.entries(t.props ?? {})) {
    const values = cat.variantProps?.[figmaProp];
    if (!values) {
      errors.push(`${where}: Figma prop "${figmaProp}" not in the catalog`);
      continue;
    }
    if (!spec || !(typeof spec.prop === 'string' || spec.prop === null) || typeof spec.values !== 'object') {
      errors.push(`${where}: props["${figmaProp}"] needs { prop: <code prop> | null, values }`);
      continue;
    }
    for (const [figmaValue, codeValue] of Object.entries(spec.values)) {
      const w = `${where} ${figmaProp}=${figmaValue}`;
      if (!values.includes(figmaValue)) errors.push(`${w}: value not in the catalog (${values.join(' | ')})`);
      if (codeValue === null) continue;
      if (typeof codeValue === 'object') for (const [p, v] of Object.entries(codeValue)) checkPropTarget(idx, t, p, v, w, errors);
      else if (!spec.prop) errors.push(`${w}: a plain value needs "prop"`);
      else checkPropTarget(idx, t, spec.prop, codeValue, w, errors);
    }
    const unmapped = values.filter((v) => !(v in spec.values));
    if (unmapped.length) errors.push(`${where}: ${figmaProp} values without a decision: ${unmapped.join(', ')} (use null when code has no equivalent)`);
  }
  for (const [kind, type] of [['booleans', 'BOOLEAN'], ['text', 'TEXT']]) {
    for (const [figmaProp, target] of Object.entries(t[kind] ?? {})) {
      const w = `${where} ${kind}.${figmaProp}`;
      if (cat.properties?.[figmaProp] !== type) errors.push(`${w}: not a ${type} property in the catalog`);
      if (target === null || target.startsWith('slot:') || target === 'children' || (kind === 'text' && t.example)) continue;
      checkPropTarget(idx, t, target, kind === 'booleans' ? true : undefined, w, errors);
    }
  }
  if (t.example) {
    for (const [, tag] of t.example.matchAll(/<([A-Z]\w*)/g)) {
      if (!pkg.exports.has(tag) && !idx.packages['@mdigital/mbank-ui']?.exports.has(tag)) errors.push(`${where}: example uses ${tag}, not exported by the kit`);
    }
    const vars = exampleVars(t);
    for (const [, v] of t.example.matchAll(/props\.(\w+)/g)) if (!vars.has(v)) errors.push(`${where}: example reads props.${v}, which no Figma prop feeds`);
  }
}

// Validates the map; returns a list of error strings (empty = valid).
export function check(map, catalog, idx) {
  const errors = [];
  const byId = new Map(catalog.components.map((c) => [entryId(c), c]));
  const seen = new Set();
  for (const e of map.components ?? []) {
    const id = e.key ?? `node:${e.nodeId ?? e.figma}`;
    const cat = byId.get(id);
    if (!cat) {
      errors.push(`${label(e)}: not in the catalog`);
      continue;
    }
    if (seen.has(id)) errors.push(`${label(e)}: duplicate entry`);
    seen.add(id);
    if (cat.name !== e.figma) errors.push(`${label(e)}: Figma name is "${cat.name}" in the catalog`);
    if (cat.kit !== e.kit) errors.push(`${label(e)}: kit is "${cat.kit}" in the catalog`);
    if (!STATUSES.includes(e.status)) {
      errors.push(`${label(e)}: unknown status "${e.status}"`);
      continue;
    }
    if (LINKED.has(e.status)) targets(e).forEach((t) => checkTarget(idx, cat, t, errors));
    else if (e.component || e.variants) errors.push(`${label(e)}: status ${e.status} must not name a code component`);
    if (e.status === 'missing' && !e.proposal) errors.push(`${label(e)}: missing needs a one-line "proposal"`);
    if ((e.status === 'ignore' || e.status === 'out-of-scope') && !e.notes) errors.push(`${label(e)}: ${e.status} needs a reason in "notes"`);
    if (e.status === 'out-of-scope' && e.kit !== 'mobile') errors.push(`${label(e)}: out-of-scope is only for the mobile kit`);
  }
  for (const c of catalog.components) {
    if (!seen.has(entryId(c))) errors.push(`${c.name} (${c.key ?? c.nodeId}, ${c.kit}): catalog component without an entry in the map`);
  }
  return errors;
}

export function summarize(map, idx) {
  const counts = Object.fromEntries(KITS.map((k) => [k, Object.fromEntries(STATUSES.map((s) => [s, 0]))]));
  const backlog = new Map();
  const used = new Set();
  for (const e of map.components) {
    counts[e.kit][e.status]++;
    if (e.status === 'missing') {
      const b = backlog.get(e.proposal) ?? { proposal: e.proposal, kits: new Set(), figma: [] };
      b.kits.add(e.kit);
      b.figma.push(e.figma);
      backlog.set(e.proposal, b);
    }
    if (LINKED.has(e.status)) for (const t of targets(e)) for (const [, tag] of `<${t.component} ${t.example ?? ''}`.matchAll(/<([A-Z]\w*)/g)) used.add(tag);
  }
  // Root components of the code (Card for CardHeader, Board for BoardColumn) with no Figma entry using any part.
  const names = idx ? Object.keys(idx.components).filter((n) => !/Icon$/.test(n)) : [];
  const rootOf = (n) => names.filter((m) => n.startsWith(m) && idx.components[m].pkg === idx.components[n].pkg).sort((a, b) => a.length - b.length)[0];
  const usedRoots = new Set([...used].filter((n) => idx?.components[n]).map(rootOf));
  const unused = names.filter((n) => rootOf(n) === n && !usedRoots.has(n)).map((n) => `${n} (${idx.components[n].pkg})`);
  const missing = [...backlog.values()].map((b) => ({ ...b, kits: [...b.kits] })).sort((a, b) => b.figma.length - a.figma.length || a.proposal.localeCompare(b.proposal));
  return { counts, missing, codeWithoutFigma: unused };
}

export function renderReport(s) {
  const out = ['| kit | ' + STATUSES.join(' | ') + ' | total |', '|---|' + STATUSES.map(() => '---:|').join('') + '---:|'];
  for (const kit of KITS) {
    const row = s.counts[kit];
    out.push(`| ${kit} | ${STATUSES.map((st) => row[st]).join(' | ')} | ${Object.values(row).reduce((a, b) => a + b, 0)} |`);
  }
  out.push('', `Kit backlog (missing, ${s.missing.length} proposals):`);
  for (const m of s.missing) out.push(`- ${m.proposal} [${m.kits.join(', ')}] <- ${m.figma.join(', ')}`);
  if (s.codeWithoutFigma.length) out.push('', `Code without a Figma component: ${s.codeWithoutFigma.join(', ')}`);
  return out.join('\n');
}

// catalog.json keeps one component per line in Python json.dumps style; edit those lines in place.
const py = (v) => (v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(py).join(', ')}]` : `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(', ')}}`);

export function codeWeb(e) {
  if (!LINKED.has(e.status)) return null;
  const web = { status: e.status, import: e.import, component: e.component, registry: e.registry };
  if (e.variants?.length) web.variants = e.variants.map((v) => ({ when: v.when, component: v.component, registry: v.registry }));
  return web;
}

export function writeCatalog(text, map) {
  const byId = new Map(map.components.map((e) => [e.key ?? `node:${e.nodeId ?? e.figma}`, e]));
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, map.components.filter((e) => e.status === s).length]));
  let inComponents = false;
  const lines = text.split('\n').map((line) => {
    if (/^ {2}"components": \[/.test(line)) inComponents = true;
    else if (inComponents && /^ {2}\]/.test(line)) inComponents = false;
    let m = inComponents && line.match(/^(\s*)(\{.*\})(,?)$/);
    if (m) {
      const c = JSON.parse(m[2]);
      const e = byId.get(entryId(c));
      if (!e) return line;
      c.code = { ...(c.code ?? { web: null, rn: null, flutter: null }), web: codeWeb(e) };
      return `${m[1]}${py(c)}${m[3]}`;
    }
    m = line.match(/^( {2}"codeConnect": )(\{.*\})(,?)$/);
    if (m) {
      const cc = JSON.parse(m[2]);
      const linked = byStatus.mapped + byStatus.partial;
      const next = { ...cc, mapped: linked, published: cc.published ?? 0, byStatus, map: 'components-map.json' };
      return `${m[1]}${py(next)}${m[3]}`;
    }
    return line;
  });
  return lines.join('\n');
}

const fileKeyOf = (catalog, library) => catalog.libraries?.find((l) => l.name === library)?.fileKey;
export const nodeUrl = (fileKey, nodeId) => `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`;
const q = (s) => JSON.stringify(s);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'component';

// Code Connect source for one target; null when the component has nothing linkable.
export function connectSource(e, t, url) {
  const props = new Map();
  for (const [figmaProp, spec] of Object.entries(t.props ?? {})) {
    for (const [figmaValue, codeValue] of Object.entries(spec.values)) {
      if (codeValue === null) continue;
      const pairs = typeof codeValue === 'object' ? Object.entries(codeValue) : [[spec.as ?? spec.prop, codeValue]];
      for (const [codeProp, v] of pairs) {
        const key = varName(codeProp);
        const p = props.get(key) ?? { codeProp, figmaProp, values: {} };
        if (p.figmaProp !== figmaProp) continue; // one Figma prop per code prop: Code Connect cannot merge two
        p.values[figmaValue] = v;
        props.set(key, p);
      }
    }
  }
  const lines = [...props.entries()].map(([key, p]) => {
    const vals = Object.entries(p.values).map(([fv, cv]) => `      ${q(fv)}: ${q(cv)},`).join('\n');
    return `    ${key}: figma.enum(${q(p.figmaProp)}, {\n${vals}\n    }),`;
  });
  const attrs = [...props.entries()].filter(([, p]) => !p.codeProp.includes('.')).map(([key, p]) => `${p.codeProp}={props.${key}}`);
  let children = '';
  for (const [figmaProp, target] of Object.entries(t.booleans ?? {})) {
    if (!target || target.startsWith('slot:')) continue;
    lines.push(`    ${varName(target)}: figma.boolean(${q(figmaProp)}),`);
    if (!target.includes('.')) attrs.push(`${target}={props.${varName(target)}}`);
  }
  for (const [figmaProp, target] of Object.entries(t.text ?? {})) {
    if (!target || target.startsWith('slot:')) continue;
    lines.push(`    ${varName(target)}: figma.string(${q(figmaProp)}),`);
    if (target === 'children') children = '{props.children}';
    else if (!t.example) attrs.push(`${target}={props.${varName(target)}}`);
  }
  const tags = new Set([t.component]);
  for (const [, tag] of (t.example ?? '').matchAll(/<([A-Z]\w*)/g)) tags.add(tag);
  const example = t.example ?? (children ? `<${t.component}${attrs.map((a) => ` ${a}`).join('')}>${children}</${t.component}>` : `<${t.component}${attrs.map((a) => ` ${a}`).join('')} />`);
  const variant = t.when ? `\n  variant: ${py(t.when)},` : '';
  const slots = Object.entries(t.booleans ?? {}).filter(([, v]) => v?.startsWith('slot:')).map(([k, v]) => `${k} -> ${v.slice(5)}`);
  return [
    '// Generated by plugins/figma-pack/scripts/components-map.mjs from components-map.json. Do not edit by hand.',
    `// Figma: ${e.figma} (${e.library}, kit ${e.kit}), map status: ${e.status}${e.notes ? `. ${e.notes}` : ''}`,
    ...(slots.length ? [`// Slots: ${slots.join('; ')}`] : []),
    'import figma from "@figma/code-connect"',
    `import { ${[...tags].sort().join(', ')} } from ${q(t.import)}`,
    '',
    `figma.connect(${t.component}, ${q(url)}, {${variant}`,
    lines.length ? `  props: {\n${lines.join('\n')}\n  },` : '  props: {},',
    `  example: (${lines.length ? 'props' : ''}) => (\n    ${example}\n  ),`,
    '})',
    '',
  ].join('\n');
}

export function codeConnect(map, catalog, { includePartial = false } = {}) {
  const files = {};
  const byId = new Map(catalog.components.map((c) => [entryId(c), c]));
  for (const e of map.components) {
    if (!(e.status === 'mapped' || (includePartial && e.status === 'partial'))) continue;
    const cat = byId.get(e.key ?? `node:${e.nodeId}`);
    const fileKey = fileKeyOf(catalog, cat?.library);
    if (!cat?.nodeId || !fileKey) continue;
    const all = targets(e);
    all.forEach((t, i) => {
      const base = slug(e.figma);
      let name = `${base}${all.length > 1 ? `-${slug(t.component)}` : ''}`;
      if (files[`${name}.figma.tsx`]) name = `${name}-${cat.nodeId.replace(':', '-')}${i ? `-${i}` : ''}`;
      files[`${name}.figma.tsx`] = connectSource({ ...e, library: cat.library }, t, nodeUrl(fileKey, cat.nodeId));
    });
  }
  return files;
}

function main(argv) {
  const opts = parseArgs(argv);
  if (!opts.command || !['check', 'report', 'write-catalog', 'code-connect'].includes(opts.command)) {
    console.error('Usage: node components-map.mjs <check|report [--json]|write-catalog|code-connect --out <dir>> [--map f] [--catalog f] [--code dir]');
    return 2;
  }
  const map = readJson(opts.map);
  const catalogText = readFileSync(opts.catalog, 'utf8');
  const catalog = JSON.parse(catalogText);
  const idx = indexCode(opts.code, map.packages ?? DEFAULT_PACKAGES);
  if (opts.command === 'check') {
    const errors = check(map, catalog, idx);
    for (const err of errors) console.error(`error: ${err}`);
    const linked = map.components.filter((e) => LINKED.has(e.status)).length;
    console.log(errors.length ? `${errors.length} error(s)` : `ok: ${map.components.length} entries, ${linked} linked to code, catalog and code agree`);
    return errors.length ? 1 : 0;
  }
  if (opts.command === 'report') {
    const s = summarize(map, idx);
    console.log(opts.json ? JSON.stringify(s, null, 2) : renderReport(s));
    return 0;
  }
  const errors = check(map, catalog, idx);
  if (errors.length) {
    for (const err of errors) console.error(`error: ${err}`);
    console.error('The map is invalid; run check and fix it first.');
    return 1;
  }
  if (opts.command === 'write-catalog') {
    const next = writeCatalog(catalogText, map);
    JSON.parse(next);
    if (next === catalogText) console.log('catalog already up to date');
    else {
      writeFileSync(opts.catalog, next);
      console.log(`catalog updated: ${opts.catalog}`);
    }
    return 0;
  }
  if (!opts.out) throw new Error('code-connect needs --out <dir>');
  const files = codeConnect(map, catalog, opts);
  mkdirSync(opts.out, { recursive: true });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(opts.out, name), text);
  console.log(`${Object.keys(files).length} Code Connect file(s) in ${opts.out}. Publish: npx figma connect publish (needs a Figma seat with Code Connect access).`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 2;
  }
}

