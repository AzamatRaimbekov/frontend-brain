// Links between screens: what a click on a nav item, row, action or form button opens.
// Builders tag clickable nodes with a key ("nav:apps", "action:Новая заявка", "row:app-card",
// "back", "submit", "cancel"); resolveLinks maps (screen, key) -> target screen from the spec.

const ARROW = /\s*(?:→|->)\s*([\w-]+)\s*$/;

// "+ Новая заявка → app-new" | { label, to } -> { label: "+ Новая заявка", to: "app-new" }
export function parseAction(a) {
  if (a && typeof a === 'object') return { label: String(a.label ?? ''), to: a.to || null };
  const s = String(a ?? '');
  const m = s.match(ARROW);
  return m ? { label: s.slice(0, m.index), to: m[1] } : { label: s, to: null };
}

// Button text and link key of an action: no "+", no "→ target".
export const actionLabel = (a) => parseAction(a).label.replace(/^\+\s*/, '').trim();
export const isPrimaryAction = (a) => parseAction(a).label.trim().startsWith('+');

const LISTS = ['table', 'list', 'kanban', 'cards'];
const KINDS = ['nav', 'action', 'row', 'back', 'submit', 'cancel', 'text'];

export function walkBlocks(blocks, fn) {
  for (const b of blocks || []) {
    if (!b || typeof b !== 'object') continue;
    fn(b);
    if (b.type === 'split') for (const col of b.columns || []) walkBlocks(col, fn);
  }
}

// Explicit link "on": a key ("action:Экспорт", "nav:apps", "submit") or any visible text.
export function linkKey(on) {
  const s = String(on ?? '').trim();
  const kind = s.split(':')[0];
  if (KINDS.includes(s) || (s.includes(':') && KINDS.includes(kind))) return s;
  return `text:${s.replace(/^\+\s*/, '')}`;
}

/** All targets a spec names, with where they come from — for the validator. */
export function linkTargets(spec) {
  const out = [];
  const act = (a, path) => { const { to } = parseAction(a); if (to) out.push({ path, to }); };
  (spec.screens || []).forEach((s, i) => {
    const p = `screens[${i}]`;
    if (s.parent) out.push({ path: `${p}.parent`, to: s.parent });
    if (s.empty?.action) act(s.empty.action, `${p}.empty.action`);
    walkBlocks(s.blocks, (b) => {
      const bp = `${p}.${b.type}`;
      if (b.link) out.push({ path: `${bp}.link`, to: b.link });
      if (b.to) out.push({ path: `${bp}.to`, to: b.to });
      if (b.cancelTo) out.push({ path: `${bp}.cancelTo`, to: b.cancelTo });
      for (const it of b.type === 'cards' ? b.items || [] : []) if (it?.link) out.push({ path: `${bp}.items.link`, to: it.link });
      for (const a of b.actions || []) act(a, `${bp}.actions`);
      if (b.action) act(b.action, `${bp}.action`);
      if (b.more) act(b.more, `${bp}.more`);
    });
  });
  (spec.links || []).forEach((l, i) => {
    out.push({ path: `links[${i}].from`, to: l?.from });
    out.push({ path: `links[${i}].to`, to: l?.to });
  });
  return out;
}

// Link errors; spec.js stays link-free (frontend-pack copies it), so callers add these to validateSpec.
export function validateLinks(spec) {
  const errors = [];
  if (!spec || !Array.isArray(spec.screens)) return errors;
  if (spec.links != null && !Array.isArray(spec.links)) return ['links: array of { from, on, to }'];
  const ids = new Set(spec.screens.map((s) => s?.id));
  (spec.links || []).forEach((l, i) => { if (!l?.on) errors.push(`links[${i}].on: required (text on the screen or a key like "action:Экспорт")`); });
  for (const t of linkTargets(spec)) if (!ids.has(t.to)) errors.push(`${t.path}: unknown screen "${t.to}"`);
  return errors;
}

/**
 * Resolves every link of a normalized spec: [{ from, on, to, auto }]. Derived:
 * nav item -> first screen of that nav; rows/cards -> block `link`; actions -> "→ id"
 * (a "+" action without a target -> the only form screen of the same nav); breadcrumbs/back ->
 * screen `parent` or the first screen of its nav; form submit/cancel -> `to` or the parent;
 * login submit -> `to` or the first nav screen. Top-level `links` override and add.
 */
export function resolveLinks(spec) {
  const screens = spec.screens;
  const first = {};
  for (const s of screens) if (s.nav && !first[s.nav]) first[s.nav] = s.id;
  const parentOf = (s) => s.parent || (s.nav && first[s.nav] !== s.id ? first[s.nav] : null);
  const hasForm = (s) => { let f = false; walkBlocks(s.blocks, (b) => { if (b.type === 'form') f = true; }); return f; };
  const formIn = (s) => {
    const c = screens.filter((x) => x.id !== s.id && x.nav && x.nav === s.nav && hasForm(x));
    return c.length === 1 ? c[0].id : null;
  };
  const home = first[spec.nav[0]?.id] || screens.find((s) => s.shell !== 'plain')?.id || null;
  const map = new Map();

  for (const s of screens) {
    const put = (on, to) => { if (to && to !== s.id && !map.has(`${s.id}|${on}`)) map.set(`${s.id}|${on}`, { from: s.id, on, to, auto: true }); };
    const action = (a) => {
      const { to } = parseAction(a);
      put(`action:${actionLabel(a)}`, to || (isPrimaryAction(a) ? formIn(s) : null));
    };
    if (s.shell !== 'plain') for (const n of spec.nav) put(`nav:${n.id}`, first[n.id]);
    put('back', parentOf(s));
    if (s.empty?.action) action(s.empty.action);
    walkBlocks(s.blocks, (b) => {
      if (LISTS.includes(b.type) && b.link) put(`row:${b.link}`, b.link);
      if (b.type === 'cards') for (const it of b.items || []) if (it?.link) put(`row:${it.link}`, it.link);
      for (const a of b.actions || []) action(a);
      if (b.action && ['empty', 'alert'].includes(b.type)) action(b.action);
      if (b.more) action(b.more); // «Все заявки → apps» in a card header
      if (b.type === 'form') { put('submit', b.to || parentOf(s)); put('cancel', b.cancelTo || b.to || parentOf(s)); }
      if (b.type === 'login') put('submit', b.to || home);
    });
  }
  for (const l of spec.links || []) map.set(`${l.from}|${linkKey(l.on)}`, { from: l.from, on: linkKey(l.on), to: l.to, auto: false });
  return [...map.values()];
}
