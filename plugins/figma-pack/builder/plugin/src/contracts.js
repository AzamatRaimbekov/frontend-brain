// «Компоненты» tab: contract storage and message handlers.
// Contracts come from the build (builder/contracts/*.json) and from the file itself: imported,
// created or edited contracts live in document plugin data (one key per contract), so the whole
// team sees them in this Figma file. Edited bundled contracts shadow the bundled copy. The store is the
// document sharedPluginData namespace "mbank" (shared-contracts.js), so the Mbank Tokens widget sees the same
// contracts; keys written by older builds into this plugin's private data are still read.
import { validateContract, bindingRows, setBinding, variantList, SCHEMA } from '../../core/contract.js';
import { newContract, TEMPLATES } from '../../core/contract-templates.js';
import { renderContract, componentsPage, findSet, pageOf, PAGE } from './components.js';
import { listVariables } from './tokens-resolve.js';
import { resetLibraryImports } from './library-import.js';
import { sharedContracts, putSharedContract, dropSharedContract } from './shared-contracts.js';

const PREFIX = 'contract:';
const GRID_GAP = 160;
const ROW_WIDTH = 4000;

// Component sets in rows, short ones first: small ones share a row, a wide set starts its own.
function layoutAll(nodes) {
  let x = GRID_GAP;
  let y = GRID_GAP;
  let rowH = 0;
  for (const n of [...nodes].sort((a, b) => a.height - b.height || a.name.localeCompare(b.name))) { // small first, the tall Button last
    if (x > GRID_GAP && x + n.width > ROW_WIDTH) { x = GRID_GAP; y += rowH + GRID_GAP; rowH = 0; }
    n.x = x;
    n.y = y;
    x += n.width + GRID_GAP;
    rowH = Math.max(rowH, n.height);
  }
}

function stored() {
  const out = {};
  for (const key of figma.root.getPluginDataKeys().filter((k) => k.startsWith(PREFIX))) {
    try { out[key.slice(PREFIX.length)] = JSON.parse(figma.root.getPluginData(key)); } catch (e) { /* broken entry */ }
  }
  return { ...out, ...sharedContracts() };
}

export function putContract(c) {
  putSharedContract(c);
  figma.root.setPluginData(PREFIX + c.name, ''); // the shared copy replaces the private one
}

export function allContracts(bundled) {
  const out = new Map();
  for (const c of bundled) out.set(c.name, { contract: c, source: c.example ? 'example' : 'bundled' });
  for (const [name, c] of Object.entries(stored())) out.set(name, { contract: c, source: out.has(name) ? 'edited' : 'file' });
  return out;
}

function get(bundled, name) {
  const hit = allContracts(bundled).get(name);
  if (!hit) throw new Error(`Нет контракта «${name}»`);
  return hit.contract;
}

const strip = ({ example, ...c }) => c; // build-time flag, not part of the contract

async function summary(bundled) {
  const pageNamed = (name) => figma.root.children.find((p) => p.name === name);
  const list = [...allContracts(bundled).values()];
  // dynamic-page files: a page must be loaded before findOne on it
  for (const name of new Set(list.map(({ contract }) => pageOf(contract)))) { const p = pageNamed(name); if (p && p.loadAsync) await p.loadAsync(); }
  return list.map(({ contract: c, source }) => ({
    name: c.name, title: c.title || c.name, source, errors: validateContract(c),
    variants: validateContract(c).length ? 0 : variantList(c).length,
    rendered: !!(pageNamed(pageOf(c)) && findSet(pageNamed(pageOf(c)), c)),
  }));
}

async function render(c, m) {
  const res = await renderContract(c, { font: m.font, prune: m.prune, create: m.create });
  if (res.errors) return res;
  putContract(strip(res.contract));
  const node = await figma.getNodeByIdAsync(res.report.setId);
  if (node && m.focus !== false) {
    await figma.setCurrentPageAsync(await componentsPage(pageOf(c)));
    figma.viewport.scrollAndZoomIntoView([node]);
  }
  return res;
}

/** Handlers for code.js; bundled = contracts baked in at build time. */
export function contractHandlers(bundled) {
  return {
    async 'contracts-list'() { return { contracts: await summary(bundled), templates: Object.entries(TEMPLATES).map(([id, t]) => ({ id, title: t.title })) }; },
    async 'contract-import'(m) {
      const list = Array.isArray(m.json) ? m.json : [m.json];
      const errors = {};
      for (const c of list) {
        const e = validateContract(c);
        if (e.length) errors[c?.name || '?'] = e;
        else putContract(strip(c));
      }
      return { errors, contracts: await summary(bundled) };
    },
    async 'contract-render'(m) {
      let c = get(bundled, m.name);
      if (m.states) c = { ...c, states: m.states };
      const res = await render(c, m);
      return { ...res, contracts: await summary(bundled) };
    },
    // New project: every component on one page (PAGE), laid out in a grid; again = update in place.
    async 'contract-render-all'(m) {
      resetLibraryImports();
      const done = [];
      const failed = [];
      for (const { contract } of allContracts(bundled).values()) {
        if (validateContract(contract).length) { failed.push(contract.name); continue; }
        const c = { ...contract, figma: { ...(contract.figma || {}), page: PAGE } };
        const res = await render(c, { ...m, focus: false });
        if (res.errors) failed.push(c.name); else done.push(res.report.setId);
      }
      const page = await componentsPage(PAGE);
      const nodes = (await Promise.all(done.map((id) => figma.getNodeByIdAsync(id)))).filter(Boolean);
      layoutAll(nodes);
      await figma.setCurrentPageAsync(page);
      if (nodes.length) figma.viewport.scrollAndZoomIntoView(nodes);
      return { built: nodes.length, failed, page: page.name, contracts: await summary(bundled) };
    },
    async 'contract-rows'(m) {
      const c = get(bundled, m.name);
      return { name: c.name, contract: c, rows: bindingRows(c), vars: await listVariables() };
    },
    async 'contract-bind'(m) {
      const c = setBinding(get(bundled, m.name), m.path, m.key, m.value);
      const errors = validateContract(c);
      if (errors.length) return { errors };
      putContract(strip(c));
      const page = await componentsPage(pageOf(c));
      const res = findSet(page, c) ? await render(c, { ...m, focus: false }) : { contract: c };
      return { name: c.name, rows: bindingRows(res.contract || c), report: res.report, contract: res.contract || c };
    },
    async 'contract-new'(m) {
      const c = newContract(m);
      if (allContracts(bundled).has(c.name) && !m.replace) throw new Error(`Контракт «${c.name}» уже есть`);
      putContract(c);
      const res = await render(c, m);
      return { ...res, contracts: await summary(bundled) };
    },
    async 'contract-reset'(m) {
      figma.root.setPluginData(PREFIX + m.name, '');
      dropSharedContract(m.name);
      return { contracts: await summary(bundled) };
    },
    async 'contract-export'(m) {
      const all = [...allContracts(bundled).values()].map((x) => strip(x.contract));
      const list = m.name ? all.filter((c) => c.name === m.name) : all;
      return { schema: SCHEMA, contracts: list };
    },
    async 'vars-list'() { return { vars: await listVariables() }; },
  };
}
