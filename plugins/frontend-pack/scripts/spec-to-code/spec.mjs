// Screen spec: the compact JSON an AI writes from a ТЗ; the plugin builds it.
import { FIELD_TYPES, parseColumn } from './fake.mjs';

export const VIEWPORTS = { desktop: 1440, tablet: 768, mobile: 375 };
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
};

// Blocks that show data and therefore change in loading / empty states.
export const DATA_BLOCKS = ['stats', 'table', 'kanban', 'chart', 'list', 'timeline', 'cards', 'details'];

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
  if (b.type === 'form') {
    (b.fields || []).forEach((f, i) => { if (!(typeof f === 'string' || f?.label)) errors.push(`${path}.fields[${i}]: needs a label`); });
  }
}

export function validateSpec(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return ['spec: not an object'];
  if (!spec.project) errors.push('project: required');
  if (!['web', 'mobile'].includes(spec.platform || 'web')) errors.push('platform: web | mobile');
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

// Fills defaults so builders never branch on missing fields.
export function normalizeSpec(spec) {
  const platform = spec.platform || 'web';
  return {
    ...spec,
    platform,
    viewports: spec.viewports?.length ? spec.viewports : [platform === 'mobile' ? 'mobile' : 'desktop'],
    nav: spec.nav || [],
    user: spec.user || { name: 'Айгуль Токтогулова', role: 'Менеджер' },
    screens: spec.screens.map((s) => ({
      shell: s.shell || (platform === 'mobile' ? 'mobile' : spec.nav?.length ? 'sidebar' : 'plain'),
      page: s.page || s.title,
      states: s.states?.length ? s.states : ['default'],
      ...s,
      viewports: s.viewports?.length ? s.viewports : spec.viewports?.length ? spec.viewports : [platform === 'mobile' ? 'mobile' : 'desktop'],
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
