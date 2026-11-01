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
import { kitSheet } from './kit-sheet.js';
import { sharedContracts, putSharedContract, dropSharedContract } from './shared-contracts.js';

const PREFIX = 'contract:';

// Leftovers of an interrupted build: our sets of the same contracts on other pages, unused by any instance.
async function dropStrays(page, names) {
  let removed = 0;
  await figma.loadAllPagesAsync();
  for (const other of figma.root.children.filter((p) => p !== page)) {
    for (const n of other.findAll((x) => (x.type === 'COMPONENT_SET' || x.type === 'COMPONENT') && names.includes(x.getPluginData('mbank-contract')))) {
      const parts = n.type === 'COMPONENT_SET' ? n.children : [n];
      let used = false;
      for (const p of parts) if ((await p.getInstancesAsync()).length) { used = true; break; }
      if (!used) { n.remove(); removed++; }
    }
  }
  return removed;
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
  for (const [name, c] of Object.entries(stored())) {
    const own = out.get(name);
    // A copy saved by a plain build (only figma ids) must not freeze an old version of a bundled contract:
    // the bundled one wins unless the copy was really edited (binding, import).
    if (own && !c.edited) out.set(name, { contract: { ...own.contract, figma: { ...(own.contract.figma || {}), ...(c.figma || {}) } }, source: own.source });
    else out.set(name, { contract: c, source: own ? 'edited' : 'file' });
  }
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
  putContract({ ...strip(res.contract), ...(c.edited ? { edited: true } : {}) });
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
        else putContract({ ...strip(c), edited: true });
      }
      return { errors, contracts: await summary(bundled) };
    },
    async 'contract-render'(m) {
      let c = get(bundled, m.name);
      if (m.states) c = { ...c, states: m.states, edited: true }; // chosen states are an edit of the contract
      const res = await render(c, m);
      return { ...res, contracts: await summary(bundled) };
    },
    // New project: every component on one page (PAGE), laid out in a grid; again = update in place.
    async 'contract-render-all'(m) {
      resetLibraryImports();
      const done = [];
      const failed = [];
      const missing = new Set();
      // sets that embed other kit components (anatomy kind "instance", e.g. Tabs list) go last
      const usesKit = (c) => Object.values(c.anatomy || {}).some((a) => a && a.kind === 'instance');
      const list = [...allContracts(bundled).values()].sort((a, b) => usesKit(a.contract) - usesKit(b.contract));
      for (const { contract } of list) {
        if (validateContract(contract).length) { failed.push(contract.name); continue; }
        const c = { ...contract, figma: { ...(contract.figma || {}), page: PAGE } };
        const res = await render(c, { ...m, focus: false });
        if (res.errors) failed.push(c.name); else done.push({ contract: res.contract, setId: res.report.setId });
        for (const x of (res.report && res.report.missing) || []) missing.add(`${x.kind}:${x.token}`);
      }
      const page = await componentsPage(PAGE);
      const removed = await dropStrays(page, done.map((d) => d.contract.name));
      const sections = await kitSheet(page, done);
      await figma.setCurrentPageAsync(page);
      if (sections.length) figma.viewport.scrollAndZoomIntoView(sections);
      return { built: done.length, failed, removed, missing: [...missing], page: page.name, contracts: await summary(bundled) };
    },
    async 'contract-rows'(m) {
      const c = get(bundled, m.name);
      return { name: c.name, contract: c, rows: bindingRows(c), vars: await listVariables() };
    },
    async 'contract-bind'(m) {
      const c = { ...setBinding(get(bundled, m.name), m.path, m.key, m.value), edited: true };
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
