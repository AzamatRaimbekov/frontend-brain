// Site <-> Figma sync logic of the widget (pure, node:test). The design-system site (apps/ds-configurator)
// serves figma.json: the plan of the `shadcn` collection (modes light/dark, variables named as the CSS
// tokens, values = alias to a Foundation variable | ref to another shadcn variable | plain value).
// Here: comparable signatures, the sync status and the token document a push sends back.
import { normHex } from './model.js';

export const SITE_COLLECTION = 'shadcn';
export const SITE_MODES = ['light', 'dark'];
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

const plain = (value) => {
  if (typeof value === 'number') return String(value);
  return normHex(value) || (value == null ? '' : String(value));
};

/** Signature of a plan value: alias:<Foundation name> | ref:<shadcn name> | value:<hex or number>. */
export function planSig(v) {
  if (!v) return null;
  if (v.alias) return `alias:${v.alias.name}`;
  if (v.ref) return `ref:${v.ref}`;
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

const cssOf = (cur, kind) => {
  if (cur.sig && cur.sig.startsWith('ref:')) return `var(--${cur.sig.slice(4)})`;
  if (cur.value == null) return null;
  if (kind === 'color' || typeof cur.value === 'string') return normHex(cur.value);
  return `${Number(cur.value)}px`;
};

const sameAsBase = (cur, base) => !!cur && !!base && (cur.sig === planSig(base) || (!base.ref && base.value != null && plain(cur.value) === plain(base.value)));

const kindOf = (cur, planned) => {
  if (planned) return planned.kind;
  if (cur.type === 'COLOR') return 'color';
  return (cur.scopes || []).includes('CORNER_RADIUS') || /radius/.test(cur.name || '') ? 'radius' : 'size';
};

/**
 * Token document of a push: base tokens whose Figma value differs from the Mbank base become
 * overrides; every other variable named <prefix>-<role> is a custom token. Returns { tokens, skipped }.
 */
export function pushPayload(plan, current) {
  const byName = new Map(plan.variables.map((v) => [v.name, v]));
  const overrides = {};
  const custom = [];
  const skipped = [];
  for (const v of plan.variables) {
    if (v.custom) continue;
    const cur = current[v.name];
    if (!cur) { // removed in Figma: the site keeps what it had
      if (v.overridden) skipped.push(`${v.name}: переменной нет в Figma, правка на сайте оставлена`);
      continue;
    }
    const entry = {};
    for (const mode of SITE_MODES) {
      if (sameAsBase(cur[mode], v.base && v.base[mode])) continue;
      const css = cssOf(cur[mode], v.kind);
      if (css) entry[mode] = css;
      else skipped.push(`${v.name} (${mode}): значение не прочиталось (ссылка на переменную без значения)`);
    }
    if (Object.keys(entry).length) overrides[v.name] = entry;
  }
  const own = new RegExp(`^${plan.prefix}-[a-z0-9]+(-[a-z0-9]+)*$`);
  for (const [name, cur] of Object.entries(current)) {
    const planned = byName.get(name);
    if (planned && !planned.custom) continue;
    if (!own.test(name)) { skipped.push(`${name}: свой токен должен называться ${plan.prefix}-<роль> — не отправлен`); continue; }
    const kind = kindOf({ ...cur, name }, planned);
    const light = cssOf(cur.light, kind);
    const dark = cssOf(cur.dark || cur.light, kind) || light;
    if (!light) { skipped.push(`${name}: значение не прочиталось`); continue; }
    custom.push({ name, kind, light, dark, ...(planned && planned.pairWith ? { pairWith: planned.pairWith } : {}) });
  }
  return { tokens: { brand: plan.brand, prefix: plan.prefix, overrides, custom, source: 'figma' }, skipped };
}
