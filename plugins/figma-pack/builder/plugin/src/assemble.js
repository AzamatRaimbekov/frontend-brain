// Before screens are built, every bundled contract the spec needs gets its component set in the file, so the
// screens are assembled from instances (place.js) instead of drawn by hand. Missing sets are rendered onto the
// «Components» page with the same logic as «Собрать все компоненты» (contracts.js), then the kit sheet is re-laid.
import { normalizeSpec } from '../../core/spec.js';
import { validateContract } from '../../core/contract.js';
import { renderContract, componentsPage, PAGE } from './components.js';
import { allContracts, putContract } from './contracts.js';
import { kitSheet } from './kit-sheet.js';
import { contractRegistry } from './place.js';

// Block type -> contracts its builder places (blocks-ui.js, blocks-data.js, blocks-crm.js).
export const BLOCK_CONTRACTS = {
  header: ['breadcrumb-item', 'button', 'badge', 'tabs-list', 'tabs-trigger'],
  toolbar: ['search-input', 'input', 'filter-chip', 'button'],
  table: ['table-head', 'table-cell', 'badge', 'avatar', 'checkbox'],
  pagination: ['pagination', 'button'],
  tabs: ['tabs-list', 'tabs-trigger'],
  form: ['input', 'select-trigger', 'textarea', 'date-picker-trigger', 'checkbox', 'radio', 'button'],
  stepper: ['stepper-step'],
  alert: ['alert', 'button'],
  empty: ['empty-state', 'button'],
  login: ['input', 'button', 'alert'],
  stats: ['crm-kpi-card'],
  details: ['crm-key-value-row'],
  timeline: ['crm-timeline-item'],
  list: ['crm-list-item', 'avatar', 'badge'],
  kanban: ['crm-application-card', 'badge', 'avatar'],
  cards: ['badge'],
  meters: ['progress'],
  score: ['badge'],
  decision: ['button'],
  files: ['badge'],
  comments: ['avatar', 'input', 'button'],
  profile: ['avatar', 'badge', 'button'],
};
const SHELL_CONTRACTS = { sidebar: ['nav-item', 'search-input', 'input', 'avatar', 'badge'], mobile: ['tabbar-item'] };
const STATE_CONTRACTS = { loading: ['skeleton'], empty: ['empty-state', 'button'], error: ['alert', 'empty-state', 'button'], 'no-access': ['empty-state', 'button'] };

/** Contract names the spec's screens place, in a stable order. */
export function neededContracts(rawSpec) {
  const spec = normalizeSpec(rawSpec);
  const out = new Set();
  const walk = (blocks) => blocks.forEach((b) => {
    for (const n of BLOCK_CONTRACTS[b.type] || []) out.add(n);
    if (b.type === 'split') b.columns.forEach(walk);
  });
  for (const s of spec.screens) {
    walk(s.blocks);
    for (const n of SHELL_CONTRACTS[s.shell] || []) out.add(n);
    if (s.shell === 'sidebar' && s.viewports.includes('mobile')) out.add('search-input');
    for (const st of s.states) for (const n of STATE_CONTRACTS[st] || []) out.add(n);
  }
  return [...out].sort();
}

const pageOfNode = (n) => { let p = n; while (p && p.type !== 'PAGE') p = p.parent; return p; };
const strip = ({ example, ...c }) => c;

/**
 * Renders the bundled contracts the spec needs that have no set in the file yet.
 * opts: { font, create (missing colour tokens -> Brand placeholders; default false) }.
 * Returns { built: [names], failed: [names], present: [names], sets } — sets is the fresh registry.
 */
export async function ensureContracts(spec, bundled, opts = {}) {
  const sets = await contractRegistry();
  const all = allContracts(bundled);
  const needed = neededContracts(spec);
  // sets that embed other kit components (Tabs list -> Tabs trigger) go last, as in «Собрать все компоненты»
  const usesKit = (c) => Object.values(c.anatomy || {}).some((a) => a && a.kind === 'instance');
  const todo = needed.filter((n) => !sets[n] && all.has(n)).map((n) => all.get(n).contract).sort((a, b) => usesKit(a) - usesKit(b));
  const built = [];
  const failed = [];
  for (const contract of todo) {
    if (validateContract(contract).length) { failed.push(contract.name); continue; }
    const c = { ...contract, figma: { ...(contract.figma || {}), page: PAGE } };
    const res = await renderContract(c, { font: opts.font, create: opts.create === true });
    if (res.errors) { failed.push(c.name); continue; }
    putContract({ ...strip(res.contract), ...(c.edited ? { edited: true } : {}) });
    built.push(c.name);
  }
  const fresh = built.length ? await contractRegistry() : sets;
  if (built.length) {
    // lay the whole «Components» page out again, so the new sets do not pile up at the origin
    const page = await componentsPage(PAGE);
    const items = [];
    for (const [name, ref] of Object.entries(fresh)) {
      const node = await figma.getNodeByIdAsync(ref.id);
      if (node && pageOfNode(node) === page && all.has(name)) items.push({ contract: all.get(name).contract, setId: ref.id });
    }
    await kitSheet(page, items);
  }
  return { built, failed, present: needed.filter((n) => sets[n]), unknown: needed.filter((n) => !fresh[n]), sets: fresh };
}
