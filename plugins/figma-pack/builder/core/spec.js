// Screen spec: the compact JSON an AI writes from a ТЗ; the plugin builds it.
import { FIELD_TYPES, parseColumn } from './fake.js';
import { PLATFORMS, VIEWPORTS } from './platforms.js';

// Platforms and viewport widths come from the token platform files (tokens-platforms.mjs build).
export { PLATFORMS, VIEWPORTS };
export const STATES = ['default', 'loading', 'empty', 'error', 'no-access'];

// type -> required fields. Everything else is optional with sensible defaults.
export const BLOCKS = {
  header: ['title'],
  stats: ['items'],
  toolbar: [],
  table: ['columns'],
  pagination: [],
  tabs: ['items'],
  form: ['fields'],
  details: ['items'],
  kanban: ['columns'],
  chart: [],
  list: [],
  timeline: [],
  stepper: ['steps'],
  cards: ['items'],
  alert: ['text'],
  empty: [],
  login: [],
  split: ['columns'],
  // Credit pipeline CRM (blocks-crm.js)
  funnel: ['items'],
  meters: ['items'],
  score: ['value'],
  decision: ['items'],
  files: ['items'],
  checks: ['items'],
  comments: ['items'],
  profile: ['name'],
  breakdown: ['items'],
};

// Blocks that show data and therefore change in loading / empty states.
export const DATA_BLOCKS = ['stats', 'table', 'kanban', 'chart', 'list', 'timeline', 'cards', 'details', 'funnel', 'meters', 'score', 'files', 'checks', 'comments', 'breakdown'];

function checkBlock(b, path, errors) {
  if (!b || typeof b !== 'object') return errors.push(`${path}: block must be an object`);
  const req = BLOCKS[b.type];
  if (!req) return errors.push(`${path}.type: unknown "${b.type}" (use ${Object.keys(BLOCKS).join(', ')})`);
  for (const f of req) if (b[f] == null) errors.push(`${path}.${f}: required for ${b.type}`);
  if (b.type === 'table') {
    (b.columns || []).forEach((c, i) => {
      const { type } = parseColumn(c);
      if (!FIELD_TYPES.includes(type)) errors.push(`${path}.columns[${i}]: unknown field type "${type}"`);
    });
  }
  if (b.type === 'split') {
    if (!Array.isArray(b.columns) || b.columns.length < 2) errors.push(`${path}.columns: split needs 2+ columns of blocks`);
    else b.columns.forEach((col, i) => (col || []).forEach((x, j) => checkBlock(x, `${path}.columns[${i}][${j}]`, errors)));
  }
  if (b.type === 'stats') {
    (b.items || []).forEach((it, i) => {
      if (it && typeof it === 'object' && it.better != null && !['up', 'down'].includes(it.better)) errors.push(`${path}.items[${i}].better: up | down`);
    });
  }
  if (b.type === 'header' && b.period != null && !(Array.isArray(b.period) && b.period.length >= 2)) {
    errors.push(`${path}.period: 2+ labels, e.g. ["Сегодня", "Неделя", "Месяц", "Квартал"]`);
  }
  if (b.type === 'form') {
    (b.fields || []).forEach((f, i) => { if (!(typeof f === 'string' || f?.label)) errors.push(`${path}.fields[${i}]: needs a label`); });
  }
}

export function validateSpec(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return ['spec: not an object'];
  if (!spec.project) errors.push('project: required');
  if (!PLATFORMS[spec.platform || 'web']) errors.push(`platform: ${Object.keys(PLATFORMS).join(' | ')}`);
  for (const v of spec.viewports || []) if (!VIEWPORTS[v]) errors.push(`viewports: unknown "${v}"`);
  if (!Array.isArray(spec.screens) || !spec.screens.length) errors.push('screens: at least one screen');
  const navIds = new Set((spec.nav || []).map((n) => n.id));
  const ids = new Set();
  (spec.screens || []).forEach((s, i) => {
    const p = `screens[${i}]`;
    if (!s.id) errors.push(`${p}.id: required`);
    if (ids.has(s.id)) errors.push(`${p}.id: duplicate "${s.id}"`);
    ids.add(s.id);
    if (!s.title) errors.push(`${p}.title: required`);
    if (s.nav && !navIds.has(s.nav)) errors.push(`${p}.nav: "${s.nav}" is not in nav`);
    for (const st of s.states || []) if (!STATES.includes(st)) errors.push(`${p}.states: unknown "${st}"`);
    for (const v of s.viewports || []) if (!VIEWPORTS[v]) errors.push(`${p}.viewports: unknown "${v}"`);
    if (!Array.isArray(s.blocks) || !s.blocks.length) errors.push(`${p}.blocks: at least one block`);
    (s.blocks || []).forEach((b, j) => checkBlock(b, `${p}.blocks[${j}]`, errors));
  });
  return errors;
}

// KPI delta "+14% к вчера" -> { value: "+14%", label: "к вчера", tone }. The colour is about meaning,
// not sign: item.better "up" (default) or "down" ("−18 мин" to decision time is good). No sign -> neutral.
export function statDelta(item) {
  const raw = String(item?.delta ?? '').trim();
  if (!raw) return null;
  const at = raw.search(/\s(?=(к|за|от|vs|против|в сравнении)(\s|$))/i);
  const value = at > 0 ? raw.slice(0, at) : raw;
  const label = at > 0 ? raw.slice(at + 1) : '';
  const sign = /^[+▲↑]/.test(value) ? 'up' : /^[-−–▼↓]/.test(value) ? 'down' : null;
  const tone = item.tone || (!sign ? 'neutral' : sign === (item.better || 'up') ? 'positive' : 'negative');
  return { value, label, tone };
}

// Fills defaults so builders never branch on missing fields.
export function normalizeSpec(spec) {
  const platform = spec.platform || 'web';
  // The platform's first viewport is the default; a narrow one (phone) gets the mobile shell.
  const viewport = PLATFORMS[platform]?.viewports[0] || 'desktop';
  const phone = VIEWPORTS[viewport] < 600;
  // One Figma page per product section: the nav item's label unless the screen names its page.
  const section = (s) => (spec.nav || []).find((n) => n.id === s.nav)?.label;
  return {
    ...spec,
    platform,
    viewports: spec.viewports?.length ? spec.viewports : [viewport],
    nav: spec.nav || [],
    user: spec.user || { name: 'Айгуль Токтогулова', role: 'Менеджер' },
    screens: spec.screens.map((s) => ({
      shell: s.shell || (phone ? 'mobile' : spec.nav?.length ? 'sidebar' : 'plain'),
      page: s.page || section(s) || s.title,
      states: s.states?.length ? s.states : ['default'],
      ...s,
      viewports: s.viewports?.length ? s.viewports : spec.viewports?.length ? spec.viewports : [viewport],
    })),
  };
}

// One frame per screen x state x viewport; used for planning and progress.
export function framePlan(spec) {
  const n = normalizeSpec(spec);
  const out = [];
  for (const s of n.screens) for (const st of s.states) for (const v of s.viewports) {
    out.push({ screen: s.id, page: s.page, state: st, viewport: v, width: VIEWPORTS[v], name: `${s.title} / ${st} / ${VIEWPORTS[v]}` });
  }
  return out;
}
