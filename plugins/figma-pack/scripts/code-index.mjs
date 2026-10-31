// Reads the Mbank kit code (plugins/frontend-pack/registry/mbank) without a TypeScript compiler:
// exported names per package, cva variants, and the props of every function component with their
// allowed values when they are finite (cva variants, string-literal unions, booleans, keyof typeof).
// Used by components-map.mjs. Pure Node 18+, no dependencies.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Default package layout of @mdigital/mbank-ui: package -> directories under the registry root.
export const DEFAULT_PACKAGES = { '@mdigital/mbank-ui': ['components', 'lib'], '@mdigital/mbank-ui/crm': ['blocks/crm'] };
// Props that every DOM-backed or Radix-backed component accepts natively.
export const NATIVE_PROPS = new Set(['disabled', 'checked', 'aria-invalid', 'type', 'open', 'placeholder', 'orientation', 'side', 'align', 'required', 'readOnly', 'value', 'defaultValue', 'asChild']);

const OPEN = '{([<';
const CLOSE = '})]>';

// Index of the bracket that closes the one at `start` (strings and comments skipped); -1 when unbalanced.
export function matchBracket(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') i = skipString(text, i);
    else if (ch === '/' && text[i + 1] === '/') i = text.indexOf('\n', i) === -1 ? text.length : text.indexOf('\n', i);
    else if (ch === '/' && text[i + 1] === '*') i = text.indexOf('*/', i) + 1;
    else if (ch === '=' && text[i + 1] === '>') i++;
    else if (OPEN.includes(ch)) depth++;
    else if (CLOSE.includes(ch)) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function skipString(text, i) {
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === '\\') j++;
    else if (text[j] === q) return j;
  }
  return text.length;
}

// Removes // and /* */ comments (strings kept), so apostrophes in comments do not break parsing.
export function stripComments(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = skipString(text, i);
      out += text.slice(i, end + 1);
      i = end;
    } else if (ch === '/' && text[i + 1] === '/' && text[i - 1] !== ':') {
      const nl = text.indexOf('\n', i);
      i = (nl === -1 ? text.length : nl) - 1;
    } else if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 1;
    } else out += ch;
  }
  return out;
}

// Splits at `sep` characters that sit at bracket depth 0 (outside strings).
export function splitTop(text, seps) {
  const out = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') i = skipString(text, i);
    else if (ch === '=' && text[i + 1] === '>') i++;
    else if (OPEN.includes(ch)) depth++;
    else if (CLOSE.includes(ch)) depth--;
    else if (depth === 0 && seps.includes(ch)) {
      out.push(text.slice(last, i));
      last = i + 1;
    }
  }
  out.push(text.slice(last));
  return out.map((s) => s.trim()).filter(Boolean);
}

// Keys (and value text) of an object literal body `{ a: ..., "b-c": ... }`.
export function objectEntries(body) {
  const inner = body.trim().replace(/^\{/, '').replace(/\}\s*(as const)?$/, '');
  const out = [];
  for (const part of splitTop(inner, ',;\n')) {
    const m = part.match(/^(?:readonly\s+)?(?:"([^"]+)"|'([^']+)'|([\w$-]+))(\?)?\s*:\s*([\s\S]*)$/);
    if (m) out.push({ key: m[1] ?? m[2] ?? m[3], optional: Boolean(m[4]), value: m[5].trim() });
  }
  return out;
}

const literalUnion = (text) => {
  const parts = splitTop(text, '|');
  if (!parts.length || !parts.every((p) => /^(["'])[^"']*\1$/.test(p))) return null;
  return parts.map((p) => p.slice(1, -1));
};

// Text of `type Name = ...` (multi-line, until the statement ends) or null.
function typeAliasText(source, name) {
  const re = new RegExp(`(?:^|\\n)(?:export\\s+)?type\\s+${name}(?:<[^=]*>)?\\s*=\\s*`);
  const m = re.exec(source);
  if (!m) return null;
  let i = m.index + m[0].length;
  const start = i;
  let depth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === '`') i = skipString(source, i);
    else if (ch === '=' && source[i + 1] === '>') i++;
    else if (OPEN.includes(ch)) depth++;
    else if (CLOSE.includes(ch)) depth--;
    else if (ch === '\n' && depth === 0) {
      const sofar = source.slice(start, i).trim();
      const next = source.slice(i + 1).trimStart();
      if (!/[&|=]$/.test(sofar) && !/^[&|]/.test(next)) break;
    }
  }
  return source.slice(start, i).trim();
}

function parseCva(source) {
  const out = {};
  for (const m of source.matchAll(/const\s+(\w+)\s*=\s*cva\(/g)) {
    const open = source.indexOf('(', m.index + m[0].length - 1);
    const call = source.slice(open, matchBracket(source, open) + 1);
    const vi = call.search(/variants\s*:\s*\{/);
    if (vi === -1) continue;
    const bo = call.indexOf('{', vi);
    const groups = objectEntries(call.slice(bo, matchBracket(call, bo) + 1));
    out[m[1]] = Object.fromEntries(groups.map((g) => [g.key, objectEntries(g.value).map((v) => v.key)]));
  }
  return out;
}

function parseConstObjects(source) {
  const out = {};
  for (const m of source.matchAll(/const\s+(\w+)\s*=\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    out[m[1]] = objectEntries(source.slice(open, matchBracket(source, open) + 1)).map((e) => e.key);
  }
  return out;
}

function parseExports(source) {
  const names = new Set();
  for (const m of source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+(?:type|interface)\s+(\w+)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }
  return names;
}

// Param type text of every `function Name(...)` and `const Name = (...) =>` in the file.
function parseFunctions(source) {
  const out = {};
  for (const m of source.matchAll(/(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*=\s*)\s*(<)?/g)) {
    const name = m[1] ?? m[2];
    let i = m.index + m[0].length;
    if (m[3]) i = matchBracket(source, i - 1) + 1;
    while (/\s/.test(source[i])) i++;
    if (source[i] !== '(') continue;
    const params = source.slice(i + 1, matchBracket(source, i));
    const first = splitTop(params, ',')[0] ?? '';
    let j = 0;
    if (first.startsWith('{')) j = matchBracket(first, 0) + 1;
    else j = (first.match(/^\w+/) ?? [''])[0].length;
    const rest = first.slice(j).trim();
    out[name] = rest.startsWith(':') ? rest.slice(1).trim() : '';
  }
  return out;
}

// Turns a TS prop type into its finite value list (strings or booleans) or null (free value).
function resolveValues(type, file, idx) {
  const t = type.trim();
  if (t === 'boolean') return [true, false];
  const lit = literalUnion(t);
  if (lit) return lit;
  let m = t.match(/^keyof typeof (\w+)$/);
  if (m) return file.consts[m[1]] ?? null;
  m = t.match(/^(?:NonNullable<)?VariantProps<typeof (\w+)>\["(\w+)"\]>?$/);
  if (m) return file.cva[m[1]]?.[m[2]] ?? null;
  m = t.match(/^(?:NonNullable<)?React\.ComponentProps<typeof (\w+)>\["(\w+)"\]>?$/);
  if (m) return { ref: `${m[1]}.${m[2]}` };
  if (/^\w+$/.test(t) && idx.aliases[t]) return resolveValues(idx.aliases[t].text, idx.aliases[t].file, idx);
  return null;
}

// Props of a type expression: { props: {name: values|null}, native: bool, inherits: [names] }.
function propsOfType(type, file, idx, seen = new Set()) {
  const res = { props: {}, native: false, inherits: [] };
  for (const raw of splitTop(type, '&')) {
    let part = raw.trim();
    let omit = [];
    const om = part.match(/^Omit<([\s\S]*)>$/);
    if (om) {
      const [inner, keys] = splitTop(om[1], ',');
      part = inner;
      omit = (keys ?? '').split('|').map((k) => k.trim().replace(/^["']|["']$/g, ''));
    }
    let sub = null;
    if (part.startsWith('{')) {
      for (const e of objectEntries(part)) res.props[e.key] = resolveValues(e.value, file, idx);
      continue;
    }
    let m = part.match(/^VariantProps<typeof (\w+)>$/);
    if (m) {
      for (const [k, v] of Object.entries(file.cva[m[1]] ?? {})) res.props[k] = v;
      continue;
    }
    m = part.match(/^React\.ComponentProps<(?:typeof )?([\w."]+)>$/);
    if (m) {
      if (/^[A-Z]\w*$/.test(m[1])) res.inherits.push({ name: m[1], omit });
      else res.native = true;
      continue;
    }
    m = part.match(/^(\w+)(?:<.*>)?$/);
    if (m && !seen.has(m[1])) {
      const text = typeAliasText(file.source, m[1]);
      if (text) sub = propsOfType(text, file, idx, new Set([...seen, m[1]]));
    }
    if (sub) {
      for (const k of omit) delete sub.props[k];
      Object.assign(res.props, sub.props);
      res.native ||= sub.native;
      res.inherits.push(...sub.inherits);
    }
  }
  return res;
}

const walk = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => /\.(tsx?|mts)$/.test(n)).sort().map((n) => join(dir, n)) : []);

// Builds the index of the registry: packages, components (with props) and registry items.
export function indexCode(codeDir, packages = DEFAULT_PACKAGES) {
  const idx = { packages: {}, components: {}, aliases: {}, registry: {} };
  const files = [];
  for (const [pkg, dirs] of Object.entries(packages)) {
    idx.packages[pkg] = { exports: new Set(), files: [] };
    for (const dir of dirs) {
      for (const path of walk(join(codeDir, dir))) {
        const source = stripComments(readFileSync(path, 'utf8'));
        const rel = path.slice(codeDir.length + 1).split('\\').join('/');
        const file = { path: rel, pkg, source, cva: parseCva(source), consts: parseConstObjects(source), exports: parseExports(source) };
        files.push(file);
        idx.packages[pkg].files.push(rel);
        for (const name of file.exports) idx.packages[pkg].exports.add(name);
        for (const m of source.matchAll(/(?:^|\n)(?:export\s+)?type\s+(\w+)\s*=/g)) idx.aliases[m[1]] = { text: typeAliasText(source, m[1]), file };
      }
    }
  }
  for (const file of files) {
    for (const [name, type] of Object.entries(parseFunctions(file.source))) {
      if (!file.exports.has(name) || idx.components[name]) continue;
      idx.components[name] = { file: file.path, pkg: file.pkg, ...propsOfType(type, file, idx) };
    }
  }
  // Inherited props (React.ComponentProps<typeof Button>) and refs (Badge.tone) resolve last.
  const resolve = (name, seen = new Set()) => {
    const c = idx.components[name];
    if (!c || seen.has(name)) return c;
    seen.add(name);
    for (const { name: base, omit } of c.inherits) {
      const b = resolve(base, seen);
      if (!b) continue;
      for (const [k, v] of Object.entries(b.props)) if (!(k in c.props) && !omit.includes(k)) c.props[k] = v;
      c.native ||= b.native;
    }
    c.inherits = [];
    return c;
  };
  for (const name of Object.keys(idx.components)) resolve(name);
  for (const c of Object.values(idx.components)) {
    for (const [k, v] of Object.entries(c.props)) {
      if (v && v.ref) {
        const [n, p] = v.ref.split('.');
        c.props[k] = idx.components[n]?.props[p] ?? null;
      }
    }
  }
  const registryFile = join(codeDir, 'registry.json');
  if (existsSync(registryFile)) {
    for (const item of JSON.parse(readFileSync(registryFile, 'utf8')).items ?? []) {
      idx.registry[item.name] = (item.files ?? []).map((f) => (typeof f === 'string' ? f : f.path));
    }
  }
  return idx;
}

// Allowed values of a component prop: { known: bool, values: array|null }.
export function propInfo(idx, component, prop) {
  const c = idx.components[component];
  if (!c) return { known: false, values: null };
  if (prop in c.props) return { known: true, values: c.props[prop] };
  if (c.native && NATIVE_PROPS.has(prop)) return { known: true, values: null };
  return { known: false, values: null };
}
