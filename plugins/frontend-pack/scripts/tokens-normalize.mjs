// Normalises read-tokens.js dumps (figma-pack mbank-figma-patterns/references/read-tokens.js, format
// "mbank-figma-raw/1", one per library file) into the tokens.json shape, and diffs two tokens.json objects.
// Used by tokens-build.mjs --from <raw.json>. Pure Node 18+, no dependencies.

// Collection -> tokens.json section. By collection name first, then by variable name prefix
// (Web components collections are known only by their variables).
const BY_PREFIX = [
  ['spacing/', 'webSpacing'],
  ['rem/', 'rem'],
  ['border-radius/', 'borderRadius'],
  ['inner-radius-segment/', 'borderRadius'],
];
const SINGLE = ['brandRadius', 'borderRadius', 'rem', 'mobileFoundation', 'webSpacing'];

// Figma mode names may contain look-alike Cyrillic letters (the "artwin" mode does).
const HOMOGLYPHS = { а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x', і: 'i' };
export const modeName = (name) => [...String(name).trim().toLowerCase()].map((ch) => HOMOGLYPHS[ch] ?? ch).join('');

const byte = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0');

/** "#ABC", "#aabbccff", {r,g,b,a} (0..1) -> "#aabbcc" or "#aabbcc80". */
export function colorHex(value) {
  if (value && typeof value === 'object') return `#${byte(value.r)}${byte(value.g)}${byte(value.b)}${value.a === undefined || value.a >= 1 ? '' : byte(value.a)}`;
  let h = String(value).trim().toLowerCase().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) throw new Error(`Not a colour: ${JSON.stringify(value)}`);
  return `#${h.length === 8 && h.endsWith('ff') ? h.slice(0, 6) : h}`;
}

const valueOf = (v, type) => (v == null ? null : type === 'COLOR' ? colorHex(v) : String(typeof v === 'number' ? Number(v.toFixed(4)) : v));

/** Accepts the use_figma result as an object, a JSON string, { result } or an array of dumps. */
export function unwrap(raw) {
  if (typeof raw === 'string') return unwrap(JSON.parse(raw));
  if (Array.isArray(raw)) return raw.flatMap(unwrap);
  if (raw && raw.format === undefined && raw.result !== undefined) return unwrap(raw.result);
  if (!raw || !String(raw.format).startsWith('mbank-figma-raw/')) throw new Error('Not a read-tokens.js dump (format "mbank-figma-raw/1" expected)');
  return [raw];
}

function sectionFor(coll, variable) {
  const name = coll.name.trim();
  if (name === '2.theme') return 'theme';
  if (name === '1.brand') return variable.type === 'COLOR' ? 'brand' : 'brandRadius';
  if (name === 'foundation') return 'mobileFoundation';
  return BY_PREFIX.find(([p]) => variable.name.startsWith(p))?.[1] ?? null;
}

const effectString = (effects) => {
  const list = (effects ?? []).filter((e) => e.visible !== false);
  if (!list.length) return 'none';
  const n = (x) => Number(Number(x).toFixed(2));
  return `${list[0].type} ${list.map((e) => `${n(e.x)},${n(e.y)} r${n(e.radius)}${e.spread ? ` s${n(e.spread)}` : ''}`).join(' + ')}`;
};

/**
 * Dumps -> { tokens, updated, skipped, warnings }. Sections the dumps do not contain are kept from `previous`
 * (with their key order); `fonts` always comes from `previous`.
 */
export function normalizeRaw(raws, previous = {}) {
  const dumps = raws.flatMap(unwrap);
  const fresh = {};
  const skipped = new Set();
  const warnings = [];
  const push = (section, init, item) => {
    fresh[section] ??= init();
    const list = Array.isArray(fresh[section]) ? fresh[section] : fresh[section].vars;
    if (!list.some((x) => x.name === item.name)) list.push(item); // a library may publish a style twice: keep the first
  };
  for (const dump of dumps) {
    for (const w of dump.warnings ?? []) warnings.push(`${dump.file?.name ?? dump.kit}: ${w}`);
    for (const coll of dump.collections ?? []) {
      const modes = coll.modes.map(modeName);
      const rawModes = coll.modes;
      for (const v of coll.variables) {
        const section = sectionFor(coll, v);
        if (!section) { skipped.add(coll.name); continue; }
        const val = (i) => valueOf(v.values[rawModes[i]], v.type);
        if (section === 'theme') {
          const li = Math.max(0, modes.indexOf('light'));
          const di = modes.includes('dark') ? modes.indexOf('dark') : 1;
          push('theme', () => ({ collection: coll.name, key: coll.key, modes: ['light', 'dark'], vars: [] }),
            { name: v.name, key: v.key, light: val(li), dark: val(di), aliasLight: v.alias?.[rawModes[li]] ?? null });
        } else if (section === 'brand') {
          push('brand', () => ({ columns: modes, vars: [], modes }), { name: v.name, key: v.key, values: modes.map((_, i) => val(i)) });
        } else {
          const all = rawModes.map((_, i) => val(i));
          if (new Set(all).size > 1) warnings.push(`${coll.name} ${v.name}: modes differ (${all.join(' | ')}), kept the first`);
          const name = section === 'mobileFoundation' && v.name.startsWith('radius/') ? `${v.name} (mobile)` : v.name;
          push(section, () => ({ columns: ['value'], vars: [] }), { name, key: v.key, values: [all[0]] });
        }
      }
    }
    const kit = dump.kit === 'mobile' || dump.kit === 'web' ? dump.kit : (dump.textStyles ?? []).some((s) => s.name.startsWith('font/')) ? 'web' : 'mobile';
    for (const s of dump.textStyles ?? []) {
      push(`textStyles.${kit}`, () => [], { name: s.name, key: s.key, family: s.family, style: s.style, size: s.size, lineHeight: s.lineHeight });
    }
    for (const s of dump.effectStyles ?? []) push(`effectStyles.${kit}`, () => [], { name: s.name, key: s.key, effects: effectString(s.effects) });
  }

  const tokens = {};
  const updated = Object.keys(fresh);
  const files = [...new Set(dumps.map((d) => d.file?.name).filter(Boolean))];
  const date = dumps.map((d) => d.readAt).filter(Boolean).sort().pop()?.slice(0, 10) ?? 'unknown date';
  const order = [...new Set([...Object.keys(previous), 'source', 'theme', 'brand', ...SINGLE, 'textStyles', 'effectStyles'])];
  for (const key of order) {
    if (key === 'source') tokens.source = `read-tokens.js via use_figma: ${files.join(', ') || 'unnamed file'} (${date})`;
    else if (key === 'textStyles' || key === 'effectStyles') {
      const kits = { ...(previous[key] ?? {}) };
      for (const kit of ['mobile', 'web']) if (fresh[`${key}.${kit}`]) kits[kit] = fresh[`${key}.${kit}`];
      if (Object.keys(kits).length) tokens[key] = kits;
    } else if (fresh[key]) tokens[key] = fresh[key];
    else if (previous[key] !== undefined) tokens[key] = previous[key];
  }
  return { tokens, updated, skipped: [...skipped], warnings };
}

const entries = (tokens, section) => {
  const s = section.split('.').reduce((o, k) => (o == null ? o : o[k]), tokens);
  return s == null ? null : Array.isArray(s) ? s : s.vars ?? null;
};
const fieldsOf = (v) => Object.keys(v).filter((k) => k !== 'name' && k !== 'key');
const show = (x) => (Array.isArray(x) ? x.join(' ') : String(x));

/** What changed between two tokens.json objects: { changed: [{ section, name, field, before, after }], added, removed }. */
export function diffTokens(before, after) {
  const out = { changed: [], added: [], removed: [] };
  const sections = ['theme', 'brand', ...SINGLE, 'textStyles.mobile', 'textStyles.web', 'effectStyles.mobile', 'effectStyles.web'];
  for (const section of sections) {
    const a = entries(before, section) ?? [];
    const b = entries(after, section) ?? [];
    const old = new Map(a.map((v) => [v.name, v]));
    const now = new Map(b.map((v) => [v.name, v]));
    for (const [name, v] of now) {
      const o = old.get(name);
      if (!o) { out.added.push({ section, name }); continue; }
      for (const f of new Set([...fieldsOf(o), ...fieldsOf(v)])) {
        if (show(o[f]) !== show(v[f])) out.changed.push({ section, name, field: f, before: show(o[f]), after: show(v[f]) });
      }
    }
    for (const name of old.keys()) if (!now.has(name)) out.removed.push({ section, name });
  }
  return out;
}
