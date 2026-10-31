// Contract <-> marked code blocks in a kit file. A block sits between
//   // @contract <id> start   ...   // @contract <id> end
// <id> = <name> for the component itself (a cva definition or class strings inside cn(...)),
// <name>.<part> for a part with its own element, <name>.<prop> for a const map of one prop.
// Reading parses only literals (no eval). Pure Node 18+, no dependencies.
import { renderScope, splitClass, splitWords } from './classes.mjs';

// ---------- literal parser: strings, numbers, booleans, null, objects, arrays ----------

function skipSpace(text, i) {
  for (;;) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text.startsWith('//', i)) i = text.indexOf('\n', i) === -1 ? text.length : text.indexOf('\n', i);
    else if (text.startsWith('/*', i)) i = text.indexOf('*/', i) + 2;
    else return i;
  }
}

export function parseLiteral(text, start = 0) {
  let i = skipSpace(text, start);
  const ch = text[i];
  if (ch === '"' || ch === "'" || ch === '`') {
    let out = '';
    for (let j = i + 1; j < text.length; j++) {
      if (text[j] === '\\') out += text[++j];
      else if (text[j] === ch) return { value: out, end: j + 1 };
      else if (ch === '`' && text[j] === '$' && text[j + 1] === '{') throw new Error('template literal with ${} is not a class literal');
      else out += text[j];
    }
    throw new Error('unterminated string');
  }
  if (ch === '{' || ch === '[') {
    const isObj = ch === '{';
    const value = isObj ? {} : [];
    i++;
    for (;;) {
      i = skipSpace(text, i);
      if (text[i] === (isObj ? '}' : ']')) return { value, end: i + 1 };
      if (isObj) {
        let key;
        if (text[i] === '"' || text[i] === "'") ({ value: key, end: i } = parseLiteral(text, i));
        else {
          const m = /^[\w$-]+/.exec(text.slice(i));
          if (!m) throw new Error(`object key expected at ${i}`);
          key = m[0];
          i += key.length;
        }
        i = skipSpace(text, i);
        if (text[i] !== ':') throw new Error(`":" expected after ${key}`);
        const v = parseLiteral(text, i + 1);
        value[key] = v.value;
        i = v.end;
      } else {
        const v = parseLiteral(text, i);
        value.push(v.value);
        i = v.end;
      }
      i = skipSpace(text, i);
      if (text[i] === ',') i++;
    }
  }
  const m = /^(-?\d+(\.\d+)?|true|false|null)/.exec(text.slice(i));
  if (!m) throw new Error(`literal expected at "${text.slice(i, i + 30)}"`);
  return { value: JSON.parse(m[0]), end: i + m[0].length };
}

// ---------- markers ----------

const MARKER = /^([ \t]*)\/\/\s*@contract\s+([\w.-]+)\s+(start|end)\s*$/;

// { id: { start, end, indent, body } } with line indexes of the marker lines.
export function findBlocks(source) {
  const lines = source.split('\n');
  const blocks = {};
  const open = {};
  lines.forEach((line, i) => {
    const m = MARKER.exec(line);
    if (!m) return;
    const [, indent, id, kind] = m;
    if (kind === 'start') open[id] = { start: i, indent };
    else if (open[id]) {
      blocks[id] = { ...open[id], end: i, body: lines.slice(open[id].start + 1, i).join('\n') };
      delete open[id];
    }
  });
  return blocks;
}

export function replaceBlock(source, id, text) {
  const block = findBlocks(source)[id];
  if (!block) throw new Error(`no "// @contract ${id} start/end" markers`);
  const lines = source.split('\n');
  const body = text.split('\n').map((l) => (l ? block.indent + l : l));
  lines.splice(block.start + 1, block.end - block.start - 1, ...body);
  return lines.join('\n');
}

// ---------- reading a block into class sets per scope ----------

// cva block -> { kind, name, scopes: { base, 'prop=value', 'compound:<when json>' }, defaults }.
export function readBlock(body) {
  const cva = /const\s+(\w+)\s*=\s*cva\(/.exec(body);
  if (cva) {
    const base = parseLiteral(body, cva.index + cva[0].length);
    const comma = skipSpace(body, base.end);
    const next = body[comma] === ',' ? skipSpace(body, comma + 1) : -1;
    const config = next !== -1 && body[next] === '{' ? parseLiteral(body, next).value : {};
    const scopes = { base: splitWords(base.value) };
    for (const [prop, values] of Object.entries(config.variants ?? {}))
      for (const [value, cls] of Object.entries(values)) scopes[`${prop}=${value}`] = splitWords(cls);
    for (const c of config.compoundVariants ?? []) {
      const { className, class: klass, ...when } = c;
      scopes[`compound:${JSON.stringify(when)}`] = splitWords(className ?? klass);
    }
    return { kind: 'cva', name: cva[1], scopes, defaults: config.defaultVariants ?? {}, variants: config.variants ?? {} };
  }
  const map = /const\s+(\w+)\s*=\s*\{/.exec(body);
  if (map) {
    const obj = parseLiteral(body, map.index + map[0].length - 1).value;
    return { kind: 'map', name: map[1], scopes: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, splitWords(v)])) };
  }
  const strings = [];
  let i = skipSpace(body, 0);
  while (i < body.length) {
    const s = parseLiteral(body, i);
    strings.push(s.value);
    i = skipSpace(body, s.end);
    if (body[i] === ',') i = skipSpace(body, i + 1);
  }
  return { kind: 'classes', strings, scopes: { all: strings.flatMap(splitWords) } };
}

// ---------- contract -> blocks ----------

const camel = (name) => name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
export const exportName = (contract) => contract.code?.export ?? `${camel(contract.name)}Variants`;
const ownBlocks = (contract) => new Set(contract.code?.blocks ?? []);
const mapsOf = (contract) => contract.code?.maps ?? {};
const prefixesOf = (contract) => contract.code?.prefix ?? {};
const without = (scope, parts) => Object.fromEntries(Object.entries(scope ?? {}).filter(([p]) => !parts.has(p)));
const extraOf = (contract, key) => splitWords(contract.code?.extras?.[key]);

// Props rendered by the cva call (not by a const map, not through a parent prefix).
export const cvaProps = (contract) =>
  Object.keys(contract.props ?? {}).filter((p) => !(p in mapsOf(contract)) && !(p in prefixesOf(contract)));

// { id: { kind, scopes, defaults?, name? } } — the same shape readBlock returns.
export function contractBlocks(contract) {
  const own = ownBlocks(contract);
  const shape = contract.code?.shape ?? 'cva';
  const baseClasses = [...renderScope(without(contract.base, own), contract), ...splitWords(contract.code?.extra)];
  const blocks = {};
  const variantClasses = (prop, value, opts) => [
    ...renderScope(without(contract.variants?.[prop]?.[value], own), contract, opts),
    ...extraOf(contract, `${prop}=${value}`),
  ];
  if (shape === 'cva') {
    const scopes = { base: baseClasses };
    const variants = {};
    const defaults = {};
    for (const prop of cvaProps(contract)) {
      variants[prop] = {};
      for (const value of contract.props[prop].values) {
        scopes[`${prop}=${value}`] = variantClasses(prop, value);
        variants[prop][value] = scopes[`${prop}=${value}`].join(' ');
      }
      if (contract.props[prop].default !== undefined) defaults[prop] = contract.props[prop].default;
    }
    (contract.compound ?? []).forEach((c, i) => {
      const { when, ...scope } = c;
      scopes[`compound:${JSON.stringify(when)}`] = [...renderScope(scope, contract), ...extraOf(contract, `compound:${i}`)];
    });
    blocks[contract.name] = { kind: 'cva', name: exportName(contract), scopes, defaults, variants };
  } else {
    const strings = [baseClasses.join(' ')];
    for (const [prop, pattern] of Object.entries(prefixesOf(contract))) {
      for (const value of contract.props[prop].values) {
        const prefix = pattern.replace('{value}', value);
        const cls = variantClasses(prop, value).map((c) => `${prefix}:${c}`);
        if (cls.length) strings.push(cls.join(' '));
      }
    }
    blocks[contract.name] = { kind: 'classes', strings, scopes: { all: strings.flatMap(splitWords) } };
  }
  for (const part of own) {
    const strings = [[...renderScope({ [part]: contract.base?.[part] }, contract, { direct: part }), ...extraOf(contract, part)].join(' ')];
    blocks[`${contract.name}.${part}`] = { kind: 'classes', strings, scopes: { all: strings.flatMap(splitWords) } };
  }
  for (const [prop, map] of Object.entries(mapsOf(contract))) {
    const scopes = {};
    for (const value of contract.props[prop].values) scopes[value] = variantClasses(prop, value, { direct: map.part ?? 'root' });
    blocks[`${contract.name}.${prop}`] = { kind: 'map', name: map.const, scopes };
  }
  return blocks;
}

// ---------- blocks -> source text (prettier-like, 2 spaces, double quotes, no semicolons) ----------

const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
const str = (s) => JSON.stringify(s);

export function blockText(block) {
  if (block.kind === 'classes') return block.strings.map((s) => `${str(s)},`).join('\n');
  if (block.kind === 'map')
    return [`const ${block.name} = {`, ...Object.entries(block.scopes).map(([k, v]) => `  ${key(k)}: ${str(v.join(' '))},`), '} as const'].join('\n');
  const lines = [`const ${block.name} = cva(`, `  ${str(block.scopes.base.join(' '))},`];
  const compound = Object.entries(block.scopes).filter(([k]) => k.startsWith('compound:'));
  if (Object.keys(block.variants).length || compound.length) {
    lines.push('  {');
    if (Object.keys(block.variants).length) {
      lines.push('    variants: {');
      for (const [prop, values] of Object.entries(block.variants)) {
        lines.push(`      ${key(prop)}: {`);
        for (const [value, cls] of Object.entries(values)) lines.push(`        ${key(value)}: ${str(cls)},`);
        lines.push('      },');
      }
      lines.push('    },');
    }
    if (compound.length) {
      lines.push('    compoundVariants: [');
      for (const [k, cls] of compound) {
        const when = Object.entries(JSON.parse(k.slice('compound:'.length))).map(([p, v]) => `${key(p)}: ${str(v)}`);
        lines.push(`      { ${[...when, `className: ${str(cls.join(' '))}`].join(', ')} },`);
      }
      lines.push('    ],');
    }
    const defaults = Object.entries(block.defaults).map(([p, v]) => `${key(p)}: ${str(v)}`);
    if (defaults.length) lines.push(`    defaultVariants: { ${defaults.join(', ')} },`);
    lines.push('  },');
  }
  lines.push(')');
  return lines.join('\n');
}

// ---------- comparing generated blocks with the code ----------

// Differences between an expected block (from the contract) and the block read from the file, order-insensitive.
export function compareBlock(id, expected, actual) {
  if (!actual) return [`${id}: no "// @contract ${id} start/end" markers in the file`];
  if (expected.kind !== actual.kind) return [`${id}: contract renders ${expected.kind}, file has ${actual.kind}`];
  const diffs = [];
  if (expected.name && expected.name !== actual.name) diffs.push(`${id}: const ${actual.name} (contract: ${expected.name})`);
  for (const scope of new Set([...Object.keys(expected.scopes), ...Object.keys(actual.scopes)])) {
    const want = new Set(expected.scopes[scope] ?? []);
    const have = new Set(actual.scopes[scope] ?? []);
    const missing = [...want].filter((c) => !have.has(c));
    const extra = [...have].filter((c) => !want.has(c));
    if (!(scope in actual.scopes) && want.size) diffs.push(`${id} [${scope}]: missing in the file`);
    else if (!(scope in expected.scopes) && have.size) diffs.push(`${id} [${scope}]: not in the contract`);
    else if (missing.length || extra.length)
      diffs.push(`${id} [${scope}]:${missing.length ? ` contract has ${missing.join(' ')}` : ''}${extra.length ? `${missing.length ? ';' : ''} file has ${extra.join(' ')}` : ''}`);
  }
  if (expected.kind === 'cva' && JSON.stringify(expected.defaults) !== JSON.stringify(actual.defaults))
    diffs.push(`${id}: defaultVariants ${JSON.stringify(actual.defaults)} (contract: ${JSON.stringify(expected.defaults)})`);
  return diffs;
}

// All differences between a contract and the source text of its kit file.
export function checkSource(contract, source) {
  const found = findBlocks(source);
  const diffs = [];
  for (const [id, expected] of Object.entries(contractBlocks(contract))) {
    let actual = null;
    try {
      actual = found[id] ? readBlock(found[id].body) : null;
    } catch (error) {
      diffs.push(`${id}: cannot read the block (${error.message})`);
      continue;
    }
    diffs.push(...compareBlock(id, expected, actual));
  }
  return diffs;
}

// Keeps the class order of the code: unchanged classes stay where they were, a changed class takes the place of
// the class it replaces (same modifiers and utility, e.g. bg-primary -> bg-brand), new ones go last.
const slotOf = (cls) => {
  const { mods, util } = splitClass(cls);
  return `${mods.join(':')}|${util.replace(/-[^-]*$/, '').split('-')[0]}`;
};
export function keepOrder(old, next) {
  const want = new Set(next);
  const out = [];
  const left = next.filter((c) => !old.includes(c));
  for (const c of old) {
    if (want.has(c)) out.push(c);
    else {
      const i = left.findIndex((n) => slotOf(n) === slotOf(c));
      if (i !== -1) out.push(...left.splice(i, 1));
    }
  }
  return [...new Set([...out, ...left])];
}

function ordered(block, old) {
  if (!old || old.kind !== block.kind) return block;
  const scopes = Object.fromEntries(Object.entries(block.scopes).map(([k, v]) => [k, old.scopes[k] ? keepOrder(old.scopes[k], v) : v]));
  if (block.kind === 'classes') {
    const strings = block.strings.map((s) => keepOrder(old.scopes.all, splitWords(s)).join(' '));
    return { ...block, strings, scopes: { all: strings.flatMap(splitWords) } };
  }
  if (block.kind === 'cva') {
    const variants = Object.fromEntries(Object.entries(block.variants).map(([p, vals]) => [p, Object.fromEntries(Object.keys(vals).map((v) => [v, scopes[`${p}=${v}`].join(' ')]))]));
    return { ...block, scopes, variants };
  }
  return { ...block, scopes };
}

// Source with every block of the contract regenerated; the rest of the file is untouched.
export function writeSource(contract, source) {
  let out = source;
  const found = findBlocks(source);
  for (const [id, block] of Object.entries(contractBlocks(contract))) {
    let old = null;
    try {
      old = found[id] ? readBlock(found[id].body) : null;
    } catch {
      old = null;
    }
    if (old && compareBlock(id, block, old).length === 0) continue; // already in sync: keep the text as is
    out = replaceBlock(out, id, blockText(ordered(block, old)));
  }
  return out;
}
