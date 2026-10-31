// Small helpers for spec-to-code: names, literals, imports, generated-file marker.
import { createHash } from 'node:crypto';

const RU = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ң: 'ng', ө: 'o', ү: 'u',
};

export const translit = (s) => String(s).toLowerCase().replace(/[а-яёңөү]/g, (ch) => RU[ch] ?? '');
const words = (s) => translit(s).split(/[^a-z0-9]+/).filter(Boolean);

export const pascal = (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
export const camel = (s) => { const p = pascal(s); return p && p[0].toLowerCase() + p.slice(1); };
export const kebab = (s) => words(s).join('-');

/** A JS identifier for a label ("Сумма" -> "summa"), unique inside `taken`. */
export function keyOf(label, taken, fallback = 'field') {
  let base = camel(label) || fallback;
  if (/^\d/.test(base)) base = `${fallback}${base}`;
  let key = base;
  for (let i = 2; taken.has(key); i++) key = `${base}${i}`;
  taken.add(key);
  return key;
}

/** TS/JS string literal in the template style (single quotes). */
export function q(value) {
  const s = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  return `'${s}'`;
}

/** Pretty object literal (JSON with single-quoted strings and bare keys). */
export function lit(value, indent = '') {
  const next = `${indent}  `;
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const flat = value.map((v) => lit(v, next));
    const line = `[${flat.join(', ')}]`;
    return line.length + indent.length < 110 && !line.includes('\n') ? line : `[\n${flat.map((v) => `${next}${v},`).join('\n')}\n${indent}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (!entries.length) return '{}';
    const parts = entries.map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k)}: ${lit(v, next)}`);
    const line = `{ ${parts.join(', ')} }`;
    return line.length + indent.length < 110 && !line.includes('\n') ? line : `{\n${parts.map((p) => `${next}${p},`).join('\n')}\n${indent}}`;
  }
  return typeof value === 'string' ? q(value) : String(value);
}

/** Collects imports and prints them sorted: packages, then @/..., then relative. */
export class Imports {
  constructor(mapModule = (m) => m) {
    this.mapModule = mapModule;
    this.mods = new Map();
  }
  add(mod, ...names) {
    const m = this.mapModule(mod);
    if (!this.mods.has(m)) this.mods.set(m, new Set());
    for (const n of names) this.mods.get(m).add(n);
    return this;
  }
  type(mod, ...names) {
    return this.add(mod, ...names.map((n) => `type ${n}`));
  }
  toString() {
    const rank = (m) => (m.startsWith('.') ? 2 : m.startsWith('@/') ? 1 : 0);
    const bare = (n) => n.replace(/^type /, '');
    return [...this.mods.entries()]
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
      .map(([m, set]) => {
        const names = [...set].sort((a, b) => bare(a).localeCompare(bare(b), 'en', { sensitivity: 'base' }));
        if (!names.length) return `import '${m}'`;
        const allTypes = names.every((n) => n.startsWith('type '));
        const list = allTypes ? names.map(bare) : names;
        return `import ${allTypes ? 'type ' : ''}{ ${list.join(', ')} } from '${m}'`;
      })
      .join('\n');
  }
}

// Generated-file marker: first line carries a hash of the rest, so an edited file is detected.
export const MARK = '@generated spec-to-code';
const hash = (body) => createHash('sha256').update(body).digest('hex').slice(0, 12);

export function withMarker(path, body) {
  const note = `${MARK} ${hash(body)} — edits are kept on regeneration; delete the file or use --force to regenerate`;
  return path.endsWith('.md') ? `<!-- ${note} -->\n${body}` : `// ${note}\n${body}`;
}

/** 'generated' (untouched), 'edited' (marker, hash differs) or 'manual' (no marker). */
export function markerState(text) {
  const nl = text.indexOf('\n');
  const first = nl < 0 ? text : text.slice(0, nl);
  const m = first.match(/@generated spec-to-code ([0-9a-f]{12})/);
  if (!m) return 'manual';
  return hash(text.slice(nl + 1)) === m[1] ? 'generated' : 'edited';
}
