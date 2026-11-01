// Import of a pasted tokens.json into board state, and component-contract binding edits.
import { cssVar } from '../../builder/core/naming.js';
import { bindingRows, setBinding, validateContract } from '../../builder/core/contract.js';
import { buildModel, indexSource, normHex, sameValue } from './model.js';

/**
 * Pasted tokens.json -> board state relative to the bundled source.
 * -> { edits, extras, changed, errors }; edits/extras replace the widget's maps.
 */
export function importTokens(source, text) {
  let data;
  try { data = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { return { errors: [`Не JSON: ${e.message}`] }; }
  if (data && String(data.format || '').startsWith('mbank-figma-raw/')) {
    return { errors: ['Это сырой дамп read-tokens.js: сначала tokens-build.mjs --from, затем вставьте tokens.json'] };
  }
  if (!data || !data.theme || !Array.isArray(data.theme.vars) || !data.brand || !Array.isArray(data.brand.vars)) {
    return { errors: ['Нужен tokens.json Mbank: есть theme.vars и brand.vars'] };
  }
  const edits = {};
  let changed = 0;
  for (const brand of indexSource(data).brandModes) {
    const before = buildModel(source, { brand }).rows;
    const after = new Map(buildModel(data, { brand }).rows.map((r) => [r.key, r]));
    for (const r of before) {
      const a = after.get(r.key);
      if (!a || a.light == null || r.derivedFrom) continue; // derived rows follow their brand edit
      if (sameValue(a.light, r.light) && sameValue(a.dark, r.dark)) continue;
      if (edits[r.key]) continue; // theme rows repeat per brand
      edits[r.key] = { light: a.light, dark: a.dark };
      changed++;
    }
  }
  const known = new Set(source.theme.vars.map((v) => v.name));
  const extras = data.theme.vars
    .filter((v) => v.name.startsWith('custom/') && !known.has(v.name))
    .map((v) => {
      const color = normHex(v.light) !== null;
      const name = cssVar(v.name).slice(2);
      return { name, kind: color ? 'color' : /radius/.test(name) ? 'radius' : 'size', light: color ? normHex(v.light) : Number(v.light), dark: color ? normHex(v.dark) : Number(v.dark) };
    });
  return { edits, extras, changed, errors: [] };
}

export const bindingKey = (contract, rowId) => `${contract}|${rowId}`;

/** Contract with the widget's binding edits applied: edits [{ path, key, value }]. */
export function applyBindings(contract, edits = []) {
  return edits.reduce((c, e) => setBinding(c, e.path, e.key, e.value), contract);
}

/** Binding table of one contract for the UI (colour and radius rows). */
export function bindingTable(contract) {
  return bindingRows(contract)
    .filter((r) => r.kind === 'color' || r.kind === 'radius')
    .map((r) => ({ id: r.id, source: r.source, part: r.part, prop: r.prop, state: r.state, kind: r.kind, value: r.value, path: r.path, key: r.key }));
}

/** Contracts the team changed in the widget: [{ name, contract, errors }]. */
export function editedContracts(bundled, bindingEdits) {
  const byContract = {};
  for (const e of bindingEdits) (byContract[e.contract] = byContract[e.contract] || []).push(e);
  return bundled
    .filter((c) => byContract[c.name])
    .map((c) => {
      const next = applyBindings(c, byContract[c.name]);
      return { name: c.name, contract: next, errors: validateContract(next) };
    });
}
