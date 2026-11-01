// Widget actions shared by the property menu and the iframe UI. `store` wraps the synced state:
// { brand, setBrand, scan, setScan, setReport, setPropagation, prefix, setPrefix, widgetId, edits, extras, bindings }
// (maps are useSyncedMap).
import TOKENS from '../../skills/mbank-figma-patterns/references/tokens.json';
import CONTRACTS from 'mbank:contracts';
import { buildModel, BRANDS, GROUPS, normHex, sameValue } from '../core/model.js';
import { contrastIssues, validateExtra, normalizeExtra } from '../core/checks.js';
import { generateBrand, brandEdits, BRAND_SLOTS } from '../core/brand-gen.js';
import { fileStatus, planAllBrands } from '../core/sync.js';
import { exportTokensJson, rawDump, registryBase, tokensCss, syncCommands } from '../core/exports.js';
import { importTokens, bindingKey, bindingTable, applyBindings, editedContracts } from '../core/io.js';
import { validateContract } from '../../builder/core/contract.js';
import { scanFile, applyWrites } from './figma-io.js';
import { sharedContract, sharedContracts, putSharedContract, dropSharedContract } from '../../builder/plugin/src/shared-contracts.js';
import { componentStatus, updateComponent, insertInstance, propagation } from './components-io.js';

export { TOKENS, CONTRACTS };

/** Plain board state from the synced maps. */
export function readState(store, brand = store.brand) {
  return {
    brand,
    edits: Object.fromEntries(store.edits.entries()),
    extras: store.extras.values(),
    bindings: store.bindings.values(),
  };
}

export const modelOf = (store, brand) => buildModel(TOKENS, readState(store, brand));

export async function scan(store) {
  const snapshot = await scanFile();
  store.setScan(snapshot);
  return snapshot;
}

/** Writes the board to the file's variables (every brand). opts: { all, dryRun }. */
export async function apply(store, opts = {}) {
  const state = readState(store);
  const plan = planAllBrands((b) => buildModel(TOKENS, { ...state, brand: b }), BRANDS, opts);
  const report = await applyWrites(plan.writes, opts);
  report.skipped = plan.skipped;
  report.at = new Date().toISOString();
  // Components bound to the changed variables follow them by themselves: the report shows where.
  const css = new Set(plan.writes.filter((w) => report.changed.includes(`${w.collection}/${w.name}`)).map((w) => w.css));
  report.propagation = { ...(await propagation(fileContracts(store), css, report.changed)), at: report.at, dryRun: !!opts.dryRun };
  if (!opts.dryRun) {
    store.setReport(report);
    // Synced state stays small: the full list of variables is in the window's report.
    store.setPropagation({ ...report.propagation, variables: report.changed.slice(0, 20), variableCount: report.changed.length });
    await scan(store);
  }
  return report;
}

const isEmpty = (v) => v == null || String(v).trim() === '';

/** Edits one board row; values equal to the source remove the edit. Returns errors. */
export function setToken(store, brand, { key, light, dark }) {
  const row = modelOf(store, brand).rows.find((r) => r.key === key);
  if (!row || row.extra) return [`Нет токена ${key}`];
  if (row.derivedFrom) return [`--${row.css} меняется вместе с брендом: правьте ${row.derivedFrom.replace(':', ' → --')}`];
  const norm = (v) => {
    if (isEmpty(v)) return undefined;
    if (row.kind !== 'color') return Number.isFinite(Number(v)) ? Number(v) : NaN;
    return normHex(v) || (/^var\(--[\w-]+\)$/.test(String(v).trim()) ? String(v).trim() : NaN);
  };
  const next = { light: norm(light), dark: norm(dark) };
  const errors = Object.entries(next).filter(([, v]) => Number.isNaN(v)).map(([m]) => `${m}: ${row.kind === 'color' ? 'нужен #hex или var(--токен)' : 'нужно число px'}`);
  if (errors.length) return errors;
  if (next.light === undefined) next.light = row.source.light;
  if (next.dark === undefined) next.dark = row.source.dark;
  if (sameValue(next.light, row.source.light) && sameValue(next.dark, row.source.dark)) store.edits.delete(key);
  else store.edits.set(key, next);
  return [];
}

export function addExtra(store, token) {
  const taken = new Set(modelOf(store).rows.map((r) => r.css));
  const errors = validateExtra(token, store.prefix, taken);
  if (!errors.length) store.extras.set(token.name, normalizeExtra(token));
  return errors;
}

/** Changes the values of an existing project token (same checks as adding it). */
export function setExtra(store, token) {
  const old = store.extras.get(token.name);
  if (!old) return [`Нет токена проекта ${token.name}`];
  const next = { ...old, ...token, kind: old.kind };
  const taken = new Set(modelOf(store).rows.map((r) => r.css).filter((c) => c !== token.name));
  const errors = validateExtra(next, store.prefix, taken);
  if (!errors.length) store.extras.set(token.name, normalizeExtra(next));
  return errors;
}

export function generatePreview(hex) {
  const slots = generateBrand(hex);
  return { hex, slots: BRAND_SLOTS.map((s) => ({ slot: s, light: slots.light[s], dark: slots.dark[s] })) };
}

export function applyGenerated(store, brand, hex) {
  const edits = brandEdits(modelOf(store, brand).rows, brand, generateBrand(hex));
  for (const [k, v] of Object.entries(edits)) store.edits.set(k, v);
  return Object.keys(edits).length;
}

// A contract as the file has it: the shared copy (edited here or in DS Builder) or the bundled one.
const fileContract = (name) => {
  const saved = sharedContract(name);
  const own = CONTRACTS.find((c) => c.name === name) || null;
  // a copy saved by a build (figma ids only) does not freeze an older version of the bundled contract
  if (saved && own && !saved.edited) return { ...own, figma: { ...(own.figma || {}), ...(saved.figma || {}) } };
  return saved || own;
};

const mineOf = (store, name) => store.bindings.values().filter((b) => b.contract === name);

/** The contract with this file's binding edits: what the component in the file is built from. */
export function contractOf(store, name) {
  const base = fileContract(name);
  return base ? applyBindings(base, mineOf(store, name)) : null;
}

/** Every contract of the file (bundled, edited, created in DS Builder) with the widget's edits. */
export function fileContracts(store, { valid = true } = {}) {
  const names = [...new Set([...CONTRACTS.map((c) => c.name), ...Object.keys(sharedContracts())])];
  return names.map((n) => contractOf(store, n)).filter((c) => c && (!valid || !validateContract(c).length));
}

export function contractView(store, name) {
  const contract = contractOf(store, name);
  if (!contract) return null;
  return { name, title: contract.title || name, rows: bindingTable(contract), errors: validateContract(contract), edited: mineOf(store, name).length };
}

export function setBinding(store, { contract, rowId, path, key, value, kind }) {
  const val = isEmpty(value) ? null : kind === 'space' ? Number(value) : value;
  if (kind === 'space' && val !== null && !(val >= 0)) return [`Отступ — шаг сетки 4 px числом (2 = 8 px), а не «${value}»`];
  const edit = { contract, path, key, value: val };
  store.bindings.set(bindingKey(contract, rowId), edit);
  // Shared with DS Builder: its «Компоненты» tab builds the same contract from the same document data.
  const base = fileContract(contract);
  if (base) putSharedContract({ ...applyBindings(base, [edit]), edited: true });
  return [];
}

export function resetBindings(store, contract) {
  for (const k of store.bindings.keys()) if (k.startsWith(`${contract}|`)) store.bindings.delete(k);
  dropSharedContract(contract);
}

// Project tokens of the board as the component update needs them: css name -> 2.theme custom/* variable.
const extrasOf = (store) => modelOf(store).rows.filter((r) => r.extra).map((r) => ({ css: r.css, figma: r.figma, kind: r.kind }));

export async function componentInfo(store, name) {
  const c = contractOf(store, name);
  return c ? componentStatus(c) : null;
}

/** «Обновить компонент в файле» (build: «Собрать компонент»): re-render in place + where it reached. */
export async function updateInFile(store, name, { build = false } = {}) {
  if (figma.editorType && figma.editorType !== 'figma') throw new Error('Компоненты обновляются только в файле Figma Design (не FigJam)');
  const c = contractOf(store, name);
  if (!c) throw new Error(`Нет контракта «${name}»`);
  const errors = validateContract(c);
  if (errors.length) throw new Error(`Контракт с ошибками: ${errors.join('; ')}`);
  const res = await updateComponent(c, extrasOf(store), { build });
  if (res.needsBuild) return res;
  store.setPropagation({
    kind: build && res.built ? 'build' : 'component', at: new Date().toISOString(), variables: [], setsUpdated: 1, instances: res.instances,
    components: [{ name: res.name, title: res.title, inFile: true, instances: res.instances, pages: res.pages, variants: res.variants, kept: res.kept }],
  });
  return res;
}

export async function insertComponent(store, name) {
  const c = contractOf(store, name);
  if (!c) throw new Error(`Нет контракта «${name}»`);
  return insertInstance(c, store.widgetId);
}

export function importInto(store, text) {
  const res = importTokens(TOKENS, text);
  if (res.errors.length) return res;
  for (const k of store.edits.keys()) store.edits.delete(k);
  for (const [k, v] of Object.entries(res.edits)) store.edits.set(k, v);
  for (const k of store.extras.keys()) store.extras.delete(k);
  for (const x of res.extras) store.extras.set(x.name, x);
  return res;
}

/** Files for "Sync with code" + the commands to run in the repo. */
export function exportsOf(store, brand) {
  const state = readState(store, brand);
  const json = exportTokensJson(TOKENS, state);
  const model = buildModel(TOKENS, state);
  // Contracts edited in this file by the widget or by DS Builder (both write the shared copy).
  const contracts = editedContracts(CONTRACTS.map((c) => sharedContract(c.name) || c), state.bindings, (c) => !!sharedContract(c.name));
  const files = [
    { name: 'tokens.json', mime: 'application/json', text: JSON.stringify(json, null, 1) },
    { name: 'mbank-tokens-raw.json', mime: 'application/json', text: `${JSON.stringify(rawDump(json), null, 1)}\n` },
    { name: `registry-mbank-${brand}.json`, mime: 'application/json', text: `${JSON.stringify(registryBase(model), null, 2)}\n` },
    { name: `tokens-${brand}.css`, mime: 'text/css', text: tokensCss(model) },
    ...contracts.map((c) => ({ name: `${c.name}.json`, mime: 'application/json', text: `${JSON.stringify(c.contract, null, 2)}\n`, errors: c.errors })),
  ];
  return { files, commands: syncCommands({ contracts: contracts.map((c) => c.name) }) };
}

/** Everything the iframe shows. */
export function uiState(store, brand) {
  const model = modelOf(store, brand);
  const issues = contrastIssues(model.rows);
  const status = fileStatus(model.rows, store.scan);
  const rows = model.rows.map((r) => ({
    key: r.key, css: r.css, figma: r.figma, collection: r.collection, kind: r.kind, group: r.group, extra: !!r.extra,
    light: r.light, dark: r.dark, source: r.source, edited: r.edited, note: r.note, status: status.byKey[r.key], derivedFrom: r.derivedFrom || null,
  }));
  return {
    brand, brands: BRANDS, groups: GROUPS, prefix: store.prefix, rows,
    issues: issues.filter((i) => !i.ok), totals: status.totals,
    scan: store.scan ? { scannedAt: store.scan.scannedAt, count: store.scan.count, collections: store.scan.collections } : null,
    contracts: fileContracts(store, { valid: false }).map((c) => ({ name: c.name, title: c.title || c.name })),
    propagation: store.propagation || null,
  };
}
