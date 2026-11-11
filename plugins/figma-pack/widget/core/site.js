// Site <-> Figma sync logic of the widget (pure, node:test). The design-system site (apps/ds-configurator)
// serves figma.json (ds-configurator/figma-plan@2): the plan of the `shadcn` collection (modes Light/Dark,
// variables named as the shadcn CSS tokens: 31 colours, radius + derived radius-*, font-sans / font-heading;
// values = { value: #hex | px | family, css, ref? }). Derived (editable: false) variables are never pushed.
// Here: comparable signatures, the sync status and the token document a push sends back. A project changes
// values of the shadcn names only: names the site does not know are never sent.
import { colorKey } from './oklch.js';
import { toPx, MODES } from './model.js';

export const SITE_COLLECTION = 'shadcn';
export const SITE_MODES = MODES;
export const PROJECT_ID = /^[a-z][a-z0-9-]{1,39}$/;

export const STATUS = {
  never: { label: 'не синхронизировано', tone: 'neutral' },
  same: { label: 'совпадает', tone: 'success' },
  'site-newer': { label: 'на сайте новее', tone: 'info' },
  'figma-newer': { label: 'в Figma новее', tone: 'warning' },
  conflict: { label: 'конфликт', tone: 'error' },
};

/** "http://localhost:8797/" -> "http://localhost:8797"; null when not an http(s) origin. */
export function siteOrigin(url) {
  const m = /^(https?):\/\/([a-z0-9.-]+(?::\d{1,5})?)\/?$/i.exec(String(url || '').trim());
  return m ? `${m[1].toLowerCase()}://${m[2].toLowerCase()}` : null;
}

/** Comparable plain form of a value: 8-bit colour "#rrggbb[aa]", px number as a string, else the text. */
export function plain(value) {
  if (value == null) return '';
  if (typeof value === 'number') return String(value);
  const c = colorKey(value);
  if (c) return c;
  const px = toPx(value);
  return px === null ? String(value) : String(px);
}

/** Signature of a plan value: ref:<shadcn name> | value:<plain>. */
export function planSig(v) {
  if (!v) return null;
  if (v.ref) return `ref:${v.ref}`;
  if (v.value == null) return null;
  return `value:${plain(v.value)}`;
}

/** What `pull` should leave in Figma: { name: { light, dark } } of signatures. */
export function planSignatures(plan) {
  const out = {};
  for (const v of plan.variables) out[v.name] = { light: planSig(v.values.light), dark: planSig(v.values.dark) };
  return out;
}

/** Names whose signature differs between two snapshots { name: { light: { sig } | sig, dark } }. */
export function changedNames(before, after) {
  const sig = (x) => (x && typeof x === 'object' ? x.sig : x) || null;
  const names = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...names].filter((n) => SITE_MODES.some((m) => sig(before?.[n]?.[m]) !== sig(after?.[n]?.[m]))).sort();
}

/**
 * Status of the file against the site.
 * state: what the last pull/push left ({ version, snapshot }) or null; current: readShadcn().current.
 */
export function syncStatus(siteVersion, state, current) {
  if (!state || !state.snapshot) return { status: 'never', figmaChanges: Object.keys(current || {}) };
  const figmaChanges = changedNames(state.snapshot, current);
  const siteNewer = siteVersion !== state.version;
  const status = siteNewer && figmaChanges.length ? 'conflict' : siteNewer ? 'site-newer' : figmaChanges.length ? 'figma-newer' : 'same';
  return { status, figmaChanges };
}

// cur: { sig, value, css } as site-io readMode returns it. A font variable holds a family name in Figma
// ("Inter"): CSS gets a font-family list ('Inter', sans-serif) unless it already is one.
const cssOf = (cur, kind) => {
  if (cur.sig && cur.sig.startsWith('ref:')) return `var(--${cur.sig.slice(4)})`;
  if (cur.css == null) return null;
  if (kind === 'font' && !/[,'"]/.test(cur.css)) return `'${cur.css}', sans-serif`;
  return cur.css;
};

/** The base value of a mode (what the site has without this project's override), else the planned one. */
const baseOf = (v, mode) => (v.base && v.base[mode]) || v.values[mode];

/**
 * Token document of a push: every shadcn variable whose Figma value differs from the base becomes an
 * override (oklch() / px / var(--ref)); names the plan does not have are skipped. Returns { tokens, skipped }.
 */
export function pushPayload(plan, current) {
  const overrides = {};
  const skipped = [];
  const known = new Set(plan.variables.map((v) => v.name));
  for (const v of plan.variables) {
    if (v.editable === false || v.derived) continue; // radius-sm… follow radius on the site
    const cur = current[v.name];
    if (!cur) { // removed in Figma: the site keeps what it had
      if (v.overridden) skipped.push(`${v.name}: переменной нет в Figma, правка на сайте оставлена`);
      continue;
    }
    const entry = {};
    for (const mode of SITE_MODES) {
      const now = cur[mode];
      if (!now || now.sig === planSig(baseOf(v, mode))) continue;
      const css = cssOf(now, v.kind);
      if (css) entry[mode] = css;
      else skipped.push(`${v.name} (${mode}): значение не прочиталось (ссылка на переменную без значения)`);
    }
    // Single-value tokens (radius, font-*): the site takes `light` only.
    if (v.kind && v.kind !== 'color' && Object.keys(entry).length) overrides[v.name] = { light: entry.light || entry.dark };
    else if (Object.keys(entry).length) overrides[v.name] = entry;
  }
  for (const name of Object.keys(current)) {
    if (!known.has(name)) skipped.push(`${name}: такого токена shadcn нет — имена не добавляются, не отправлен`);
  }
  return { tokens: { overrides, source: 'figma' }, skipped };
}
