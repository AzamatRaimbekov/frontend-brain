// Sandbox side of the site sync: reads the `shadcn` collection and writes the plan of figma.json into it.
// Aliases go to Foundation variables imported by library key (or the local copy in a Foundation file);
// without the library a plain value is written and reported. Same variables are updated in place.
import { hexToRgb } from '../../builder/core/color.js';
import { importByKey } from '../../builder/plugin/src/library-import.js';
import { modeName, normHex } from '../core/model.js';
import { plainValue } from '../core/sync.js';
import { SITE_COLLECTION, SITE_MODES, planSig } from '../core/site.js';

const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';
const rgba = (hex) => { const { r, g, b, a } = hexToRgb(hex); return { r, g, b, a }; };

async function localIndex() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const col = cols.find((c) => c.name.trim() === SITE_COLLECTION) || null;
  const byCol = (c) => new Map(vars.filter((v) => v.variableCollectionId === c.id).map((v) => [v.name, v]));
  return { cols, vars, col, named: col ? byCol(col) : new Map(), byCol };
}

const modeIds = (col) => {
  const out = {};
  for (const m of SITE_MODES) { const hit = col.modes.find((x) => modeName(x.name) === m); if (hit) out[m] = hit.modeId; }
  if (!out.light) out.light = col.modes[0].modeId;
  return out;
};

async function resolveValue(value, depth = 0) {
  if (!isAlias(value)) return plainValue(value);
  if (depth > 10) return null;
  const t = await figma.variables.getVariableByIdAsync(value.id);
  if (!t) return null;
  const c = await figma.variables.getVariableCollectionByIdAsync(t.variableCollectionId);
  const modeId = c ? c.defaultModeId : Object.keys(t.valuesByMode || {})[0];
  return modeId && t.valuesByMode && modeId in t.valuesByMode ? resolveValue(t.valuesByMode[modeId], depth + 1) : null;
}

/** One mode of a variable as { sig, value }: ref to a shadcn variable, alias to another one, or a value. */
async function readMode(v, modeId, col) {
  const raw = v.valuesByMode[modeId];
  if (raw === undefined) return { sig: null, value: null };
  if (!isAlias(raw)) { const value = plainValue(raw); return { sig: planSig({ value }), value }; }
  const target = await figma.variables.getVariableByIdAsync(raw.id);
  if (!target) return { sig: null, value: null };
  if (target.variableCollectionId === col.id) return { sig: `ref:${target.name}`, value: await resolveValue(raw) };
  return { sig: `alias:${target.name}`, value: await resolveValue(raw) };
}

/** The `shadcn` collection now: { exists, current: { name: { type, scopes, light, dark } } }. */
export async function readShadcn() {
  const ix = await localIndex();
  if (!ix.col) return { exists: false, current: {} };
  const ids = modeIds(ix.col);
  const current = {};
  for (const [name, v] of ix.named) {
    current[name] = { type: v.resolvedType, scopes: v.scopes || [] };
    for (const m of SITE_MODES) current[name][m] = await readMode(v, ids[m] || ids.light, ix.col);
  }
  return { exists: true, current };
}

function ensureCollection(ix, report) {
  if (ix.col) {
    if (!ix.col.modes.some((m) => modeName(m.name) === 'dark')) {
      try { ix.col.addMode('dark'); report.modesAdded.push('dark'); } catch (e) { report.errors.push(`Режим dark не добавлен: ${e.message}. Нужен тариф с несколькими режимами.`); }
    }
    return ix.col;
  }
  const col = figma.variables.createVariableCollection(SITE_COLLECTION);
  col.renameMode(col.modes[0].modeId, 'light');
  try { col.addMode('dark'); } catch (e) { report.errors.push(`Режим dark не добавлен: ${e.message}. Нужен тариф с несколькими режимами.`); }
  report.collectionCreated = true;
  ix.col = col;
  return col;
}

// Foundation variable: from the connected library by key, else the local copy (in Foundation itself).
async function aliasTarget(ix, alias, cache) {
  const id = `${alias.collection}/${alias.name}`;
  if (cache.has(id)) return cache.get(id);
  let v = null;
  if (alias.key && figma.variables.importVariableByKeyAsync) v = await importByKey(() => figma.variables.importVariableByKeyAsync(alias.key));
  if (!v) {
    const c = ix.cols.find((x) => x.name.trim() === alias.collection);
    v = (c && ix.byCol(c).get(alias.name)) || null;
  }
  cache.set(id, v);
  return v;
}

const writeRaw = (v, modeId, type, value) => v.setValueForMode(modeId, type === 'COLOR' ? rgba(normHex(value) || '#000000') : Number(value));

/** Writes figma.json into the `shadcn` collection. Returns a report; nothing is deleted. */
export async function pullPlan(plan) {
  if (figma.editorType && figma.editorType !== 'figma') throw new Error('Переменные пишутся только в файле Figma Design (не FigJam)');
  const ix = await localIndex();
  const report = { collectionCreated: false, modesAdded: [], created: [], updated: [], aliased: 0, refs: 0, raw: [], unchanged: 0, extra: [], errors: [] };
  const col = ensureCollection(ix, report);
  const ids = modeIds(col);
  const before = (await readShadcn()).current;
  const cache = new Map();
  const refs = [];
  for (const pv of plan.variables) {
    let v = ix.named.get(pv.name);
    if (v && v.resolvedType !== pv.type) { report.errors.push(`${pv.name}: в Figma тип ${v.resolvedType}, на сайте ${pv.type} — не тронут`); continue; }
    if (!v) {
      v = figma.variables.createVariable(pv.name, col, pv.type);
      v.scopes = pv.scopes || [];
      ix.named.set(pv.name, v);
      report.created.push(pv.name);
    }
    if (pv.codeSyntax) v.setVariableCodeSyntax('WEB', pv.codeSyntax);
    for (const mode of SITE_MODES) {
      const modeId = ids[mode];
      if (!modeId) continue;
      const want = pv.values[mode];
      const had = before[pv.name] && before[pv.name][mode];
      if (want.ref) { refs.push({ v, pv, mode, modeId, want, had }); continue; }
      if (had && had.sig === planSig(want)) { report.unchanged++; continue; }
      const target = want.alias ? await aliasTarget(ix, want.alias, cache) : null;
      if (target) { v.setValueForMode(modeId, figma.variables.createVariableAlias(target)); report.aliased++; }
      else {
        if (want.value == null) { report.errors.push(`${pv.name} (${mode}): нет значения`); continue; }
        if (had && had.sig === planSig({ value: want.value })) { report.unchanged++; continue; }
        writeRaw(v, modeId, pv.type, want.value);
        if (want.alias) report.raw.push(`${pv.name} (${mode}): ${want.value} — библиотека «${want.alias.collection}» не подключена`);
      }
      if (had && had.sig && !report.created.includes(pv.name) && !report.updated.includes(pv.name)) report.updated.push(pv.name);
    }
  }
  for (const r of refs) {
    if (r.had && r.had.sig === planSig(r.want)) { report.unchanged++; continue; }
    const target = ix.named.get(r.want.ref);
    if (target && target !== r.v) { r.v.setValueForMode(r.modeId, figma.variables.createVariableAlias(target)); report.refs++; }
    else writeRaw(r.v, r.modeId, r.pv.type, r.want.value);
    if (r.had && r.had.sig && !report.created.includes(r.pv.name) && !report.updated.includes(r.pv.name)) report.updated.push(r.pv.name);
  }
  const planned = new Set(plan.variables.map((x) => x.name));
  report.extra = [...ix.named.keys()].filter((n) => !planned.has(n));
  return report;
}
