// Widget actions shared by the property menu and the iframe UI. `store` wraps the synced state:
// { brand, setBrand, scan, setScan, setReport, prefix, setPrefix, edits, extras, bindings } (maps are useSyncedMap).
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
  if (!opts.dryRun) {
    store.setReport(report);
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

export function generatePreview(hex) {
  const slots = generateBrand(hex);
  return { hex, slots: BRAND_SLOTS.map((s) => ({ slot: s, light: slots.light[s], dark: slots.dark[s] })) };
}

export function applyGenerated(store, brand, hex) {
  const edits = brandEdits(modelOf(store, brand).rows, brand, generateBrand(hex));
  for (const [k, v] of Object.entries(edits)) store.edits.set(k, v);
  return Object.keys(edits).length;
}

export function contractView(store, name) {
  const base = CONTRACTS.find((c) => c.name === name);
  if (!base) return null;
  const mine = store.bindings.values().filter((b) => b.contract === name);
  const contract = applyBindings(base, mine);
  return { name, title: contract.title || name, rows: bindingTable(contract), errors: validateContract(contract), edited: mine.length };
}

export function setBinding(store, { contract, rowId, path, key, value }) {
  store.bindings.set(bindingKey(contract, rowId), { contract, path, key, value: isEmpty(value) ? null : value });
}

export function resetBindings(store, contract) {
  for (const k of store.bindings.keys()) if (k.startsWith(`${contract}|`)) store.bindings.delete(k);
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
  const contracts = editedContracts(CONTRACTS, state.bindings);
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
    contracts: CONTRACTS.map((c) => ({ name: c.name, title: c.title || c.name })),
  };
}
