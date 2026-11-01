// Board model of the Mbank Tokens widget: tokens.json (owner contract) + the baked CSS <-> Figma map
// + the team's edits and extra tokens -> rows the canvas board, the exports and "apply" read.
// Pure: no Figma API, runs in node:test and inside the widget sandbox.
import { TOKEN_MAP } from '../../builder/core/token-map.js';
import { customName } from '../../builder/core/naming.js';

export const BRANDS = ['bank', 'kassa', 'travel', 'artwin', 'koko'];
export const MODES = ['light', 'dark'];
export const THEME = '2.theme';
export const BRAND = '1.brand';

export const GROUPS = [
  { id: 'brand', label: 'Бренд' },
  { id: 'surface', label: 'Поверхности и текст' },
  { id: 'accent', label: 'Акценты' },
  { id: 'border', label: 'Границы' },
  { id: 'status', label: 'Статусы' },
  { id: 'supportive', label: 'Доп. палитра' },
  { id: 'radius', label: 'Радиусы' },
  { id: 'extra', label: 'Токены проекта' },
];

/** Which board group a CSS token (name without --) belongs to. */
export function groupOf(css, collection) {
  if (collection === BRAND || /^brand(-|$)/.test(css)) return 'brand';
  if (/^radius-/.test(css)) return 'radius';
  if (/^supportive-/.test(css)) return 'supportive';
  if (/^(status-|success|destructive|warning)/.test(css)) return 'status';
  if (/^(border|input|ring)/.test(css)) return 'border';
  if (/^(primary|secondary|soft-hover|soft$|soft-foreground-strong|ghost|outline|static|neutral|accent|overlay)/.test(css)) return 'accent';
  return 'surface';
}

// Figma mode names may contain look-alike Cyrillic letters (the "artwin" mode does).
const CYR_TO_LAT = { а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x', і: 'i' };
export const modeName = (name) => [...String(name).trim().toLowerCase()].map((ch) => CYR_TO_LAT[ch] || ch).join('');

/** Lower-case #rrggbb / #rrggbbaa (opaque alpha dropped); null when not a colour. */
export function normHex(value) {
  if (value == null) return null;
  let h = String(value).trim().toLowerCase().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) return null;
  return `#${h.length === 8 && h.endsWith('ff') ? h.slice(0, 6) : h}`;
}

const sameValue = (a, b) => {
  if (a == null || b == null) return a == b; // eslint-disable-line eqeqeq
  const ha = normHex(a);
  return ha ? ha === normHex(b) : String(a) === String(b);
};
export { sameValue };

/** Index of tokens.json: theme vars by name, brand vars by name, radius vars by name. */
export function indexSource(tokens) {
  const by = (list) => new Map((list || []).map((v) => [v.name, v]));
  return {
    tokens,
    theme: by(tokens.theme && tokens.theme.vars),
    brand: by(tokens.brand && tokens.brand.vars),
    brandModes: (tokens.brand && (tokens.brand.modes || tokens.brand.columns)) || BRANDS,
    radius: by(tokens.brandRadius && tokens.brandRadius.vars),
  };
}

/** Rows from the source only (no edits): one per mapped CSS token, for one brand. */
export function sourceRows(ix, brand = 'bank') {
  const rows = [];
  const bi = Math.max(0, ix.brandModes.indexOf(brand));
  for (const [css, m] of Object.entries(TOKEN_MAP.colors)) {
    if (!m.figma) continue; // code-only alias (card-foreground -> foreground)
    if (m.collection === BRAND) {
      const name = `brand/${m.figma}`;
      const src = ix.brand.get(name);
      const dark = ix.theme.get(`brand/${brand}/${m.figma}`);
      const light = src ? src.values[bi] : null;
      rows.push({
        key: `${brand}:${css}`, css, figma: name, collection: BRAND, kind: 'color', group: 'brand', brand,
        darkFigma: `brand/${brand}/${m.figma}`,
        source: { light, dark: dark ? dark.dark : light },
        note: dark ? null : `нет 2.theme brand/${brand}/${m.figma}: тёмное значение = светлое (G04)`,
      });
    } else {
      const src = ix.theme.get(m.figma);
      rows.push({
        key: css, css, figma: m.figma, collection: THEME, kind: 'color', group: groupOf(css, THEME),
        source: { light: src ? src.light : null, dark: src ? src.dark : null }, aliasLight: src ? src.aliasLight : null,
        note: src ? null : 'нет в tokens.json',
      });
    }
  }
  for (const [key, figma] of Object.entries(TOKEN_MAP.radius)) {
    const src = ix.radius.get(figma);
    const v = src ? Number(src.values[0]) : null;
    rows.push({ key: `radius-${key}`, css: `radius-${key}`, figma, collection: BRAND, kind: 'radius', group: 'radius', source: { light: v, dark: v }, note: src ? null : 'нет в tokens.json' });
  }
  return rows;
}

// 1.brand slot (default, hover…) -> its CSS token (brand, brand-hover…).
const SLOT_CSS = Object.fromEntries(Object.entries(TOKEN_MAP.colors).filter(([, m]) => m.collection === BRAND).map(([css, m]) => [m.figma, css]));

/** Figma variable of an extra token: custom/<prefix>/<role>. */
export function extraFigmaName(extra) {
  const prefix = extra.name.split('-')[0];
  return customName(prefix, extra.name);
}

/**
 * Full board model for one brand.
 * edits: { [row.key]: { light?, dark? } }, extras: [{ name, kind, light, dark, pairWith? }].
 */
export function buildModel(tokens, { brand = 'bank', edits = {}, extras = [] } = {}) {
  const ix = indexSource(tokens);
  const rows = sourceRows(ix, brand).map((r) => {
    // 2.theme brand/<product>/<slot> (e.g. --brand-kassa) is also the dark source of that brand's
    // 1.brand slot: it follows the brand edit, so one variable never gets two values.
    const m = /^brand\/(\w+)\/(.+)$/.exec(r.collection === THEME ? r.figma : '');
    if (m && SLOT_CSS[m[2]]) r = { ...r, derivedFrom: `${m[1]}:${SLOT_CSS[m[2]]}` };
    const e = edits[r.derivedFrom || r.key] || {};
    const light = e.light !== undefined ? e.light : r.source.light;
    const dark = e.dark !== undefined ? e.dark : r.source.dark;
    const edited = !sameValue(light, r.source.light) || !sameValue(dark, r.source.dark);
    return { ...r, light, dark, edited };
  });
  for (const x of extras) {
    rows.push({
      key: `extra:${x.name}`, css: x.name, figma: extraFigmaName(x), collection: THEME, kind: x.kind, group: 'extra',
      extra: true, pairWith: x.pairWith || null, source: { light: null, dark: null }, light: x.light, dark: x.dark || x.light, edited: true,
    });
  }
  return { brand, rows, ix };
}

export const rowsByCss = (rows) => new Map(rows.map((r) => [r.css, r]));

/** Resolves var(--x) chains to a value for one mode. */
export function resolveValue(value, mode, byCss, depth = 0) {
  const m = /^var\(--([\w-]+)\)$/.exec(String(value == null ? '' : value).trim());
  if (!m) return value;
  const target = byCss.get(m[1]);
  if (!target || depth > 8) return null;
  return resolveValue(target[mode], mode, byCss, depth + 1);
}

/** Group counters for the board header. */
export function counters(model, issues = []) {
  const base = model.rows.filter((r) => !r.extra);
  return {
    tokens: base.length,
    extras: model.rows.length - base.length,
    edited: base.filter((r) => r.edited).length,
    contrast: issues.filter((i) => !i.ok).length,
  };
}
