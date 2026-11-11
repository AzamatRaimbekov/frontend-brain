// Widget actions shared by the property menu and the iframe UI. `store` wraps the synced state:
// { scan, setScan, setReport, edits } (edits is a useSyncedMap: name -> { light?, dark? }).
import TOKENS from '../../skills/ds-tokens/references/shadcn-tokens.json';
import { buildModel, GROUPS, normValue, sameValue } from '../core/model.js';
import { contrastIssues } from '../core/checks.js';
import { fileStatus, planWrites } from '../core/sync.js';
import { exportTokensJson, registryTheme, tokensCss, syncCommands } from '../core/exports.js';
import { importTokens } from '../core/io.js';
import { scanFile, applyWrites } from './figma-io.js';

export { TOKENS };

/** Plain board state from the synced map. */
export const readState = (store) => ({ edits: Object.fromEntries(store.edits.entries()) });

export const modelOf = (store) => buildModel(TOKENS, readState(store));

export async function scan(store) {
  const snapshot = await scanFile();
  store.setScan(snapshot);
  return snapshot;
}

/** Writes the board to the `shadcn` variables. opts: { all, dryRun }. */
export async function apply(store, opts = {}) {
  const plan = planWrites(modelOf(store), { ...opts, snapshot: store.scan });
  const report = await applyWrites(plan.writes, opts);
  report.skipped = plan.skipped;
  report.at = new Date().toISOString();
  if (!opts.dryRun) {
    store.setReport(report);
    await scan(store);
  }
  return report;
}

/** Edits the values of one token; values equal to the source remove the edit. Names are never added. */
export function setToken(store, { key, light, dark }) {
  const row = modelOf(store).rows.find((r) => r.key === key);
  if (!row) return [`Нет токена ${key}: набор shadcn фиксирован, свои имена не добавляются`];
  const next = { light: normValue(row.kind, light), dark: row.kind === 'radius' ? undefined : normValue(row.kind, dark) };
  const errors = Object.entries(next).filter(([, v]) => Number.isNaN(v))
    .map(([m]) => `${m}: ${row.kind === 'color' ? 'нужен цвет oklch(L C H) или #hex' : 'нужна длина в rem или px'}`);
  if (errors.length) return errors;
  if (next.light === undefined) next.light = row.source.light;
  if (row.kind === 'radius') delete next.dark;
  else if (next.dark === undefined) next.dark = row.source.dark;
  const same = sameValue(next.light, row.source.light, row.kind) && (row.kind === 'radius' || sameValue(next.dark, row.source.dark, row.kind));
  if (same) store.edits.delete(key);
  else store.edits.set(key, next);
  return [];
}

export function importInto(store, text) {
  const res = importTokens(TOKENS, text);
  if (res.errors.length) return res;
  for (const k of store.edits.keys()) store.edits.delete(k);
  for (const [k, v] of Object.entries(res.edits)) store.edits.set(k, v);
  return res;
}

/** Files for "Sync with code" + what to do with them. */
export function exportsOf(store) {
  const state = readState(store);
  const model = modelOf(store);
  const files = [
    { name: 'shadcn-tokens.json', mime: 'application/json', text: `${JSON.stringify(exportTokensJson(TOKENS, state), null, 2)}\n` },
    { name: 'tokens.css', mime: 'text/css', text: tokensCss(TOKENS, model) },
    { name: 'shadcn-theme.json', mime: 'application/json', text: `${JSON.stringify(registryTheme(TOKENS, model), null, 2)}\n` },
  ];
  return { files, commands: syncCommands() };
}

/** Everything the iframe shows. */
export function uiState(store) {
  const model = modelOf(store);
  const issues = contrastIssues(model.rows);
  const status = fileStatus(model.rows, store.scan);
  const rows = model.rows.map((r) => ({
    key: r.key, name: r.name, kind: r.kind, group: r.group, light: r.light, dark: r.dark, source: r.source, edited: r.edited, status: status.byKey[r.key],
  }));
  return {
    groups: GROUPS, rows,
    issues: issues.filter((i) => !i.ok), totals: status.totals,
    scan: store.scan ? { scannedAt: store.scan.scannedAt, count: store.scan.count, exists: store.scan.exists } : null,
  };
}
