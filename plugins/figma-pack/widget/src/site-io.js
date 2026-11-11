// Sandbox side of the site sync: reads the `shadcn` collection and writes the plan of figma.json into it
// (values converted from oklch()/#hex to Figma RGBA with alpha, radius to px; refs as aliases inside
// `shadcn`). Same variables are updated in place; nothing is deleted.
import { parseColor, rgbaToOklch } from '../core/oklch.js';
import { toPx, FIGMA_MODES } from '../core/model.js';
import { plainValue } from '../core/sync.js';
import { SITE_COLLECTION, SITE_MODES, planSig } from '../core/site.js';
import { loadShadcn, modeIdOf, resolve } from './figma-io.js';

const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';

/** A plan value -> what Figma stores: COLOR -> RGBA, FLOAT -> px number, STRING -> text; null when unreadable. */
export function toFigma(type, value) {
  if (value == null) return null;
  if (type === 'STRING') return String(value);
  return type === 'COLOR' ? parseColor(value) : toPx(value);
}

const cssOfRaw = (raw) => {
  if (raw && typeof raw === 'object' && 'r' in raw) return rgbaToOklch(raw);
  if (typeof raw === 'number') return `${raw}px`;
  return typeof raw === 'string' ? raw : null;
};

/** One mode of a variable as { sig, value, css }: ref to a shadcn variable or a value. */
async function readMode(v, modeId, mode, col) {
  const raw = v.valuesByMode[modeId];
  if (raw === undefined) return { sig: null, value: null, css: null };
  if (!isAlias(raw)) { const value = plainValue(raw); return { sig: planSig({ value }), value, css: cssOfRaw(raw) }; }
  const target = await figma.variables.getVariableByIdAsync(raw.id);
  if (!target) return { sig: null, value: null, css: null };
  const resolved = await resolve(raw, mode);
  const value = plainValue(resolved);
  // A ref inside shadcn stays a ref; an alias to any other collection counts as its value.
  if (target.variableCollectionId === col.id) return { sig: `ref:${target.name}`, value, css: `var(--${target.name})` };
  return { sig: value == null ? null : planSig({ value }), value, css: cssOfRaw(resolved) };
}

/** The `shadcn` collection now: { exists, current: { name: { type, scopes, light, dark } } }. */
export async function readShadcn() {
  const ix = await loadShadcn();
  if (!ix.col) return { exists: false, current: {} };
  const current = {};
  for (const [name, v] of ix.named) {
    current[name] = { type: v.resolvedType, scopes: v.scopes || [] };
    for (const m of SITE_MODES) current[name][m] = await readMode(v, modeIdOf(ix.col, m) || modeIdOf(ix.col, 'light'), m, ix.col);
  }
  return { exists: true, current };
}

function ensureCollection(ix, report) {
  if (ix.col) {
    if (!modeIdOf(ix.col, 'dark')) {
      try { ix.col.addMode(FIGMA_MODES.dark); report.modesAdded.push(FIGMA_MODES.dark); } catch (e) { report.errors.push(`Режим Dark не добавлен: ${e.message}. Нужен тариф с несколькими режимами.`); }
    }
    return ix.col;
  }
  const col = figma.variables.createVariableCollection(SITE_COLLECTION);
  col.renameMode(col.modes[0].modeId, FIGMA_MODES.light);
  try { col.addMode(FIGMA_MODES.dark); } catch (e) { report.errors.push(`Режим Dark не добавлен: ${e.message}. Нужен тариф с несколькими режимами.`); }
  report.collectionCreated = true;
  ix.col = col;
  return col;
}

/** Writes figma.json into the `shadcn` collection. Returns a report; nothing is deleted. */
export async function pullPlan(plan) {
  if (figma.editorType && figma.editorType !== 'figma') throw new Error('Переменные пишутся только в файле Figma Design (не FigJam)');
  const ix = await loadShadcn();
  const report = { collectionCreated: false, modesAdded: [], created: [], updated: [], refs: 0, unchanged: 0, extra: [], errors: [] };
  const col = ensureCollection(ix, report);
  const before = (await readShadcn()).current;
  const refs = [];
  const touch = (name) => { if (!report.created.includes(name) && !report.updated.includes(name)) report.updated.push(name); };
  for (const pv of plan.variables) {
    let v = ix.named.get(pv.name);
    if (v && v.resolvedType !== pv.type) { report.errors.push(`${pv.name}: в Figma тип ${v.resolvedType}, на сайте ${pv.type} — не тронут`); continue; }
    if (!v) {
      v = figma.variables.createVariable(pv.name, col, pv.type);
      ix.named.set(pv.name, v);
      report.created.push(pv.name);
    }
    if (pv.scopes) v.scopes = pv.scopes;
    v.setVariableCodeSyntax('WEB', pv.codeSyntax || `var(--${pv.name})`);
    for (const mode of SITE_MODES) {
      const modeId = modeIdOf(col, mode);
      if (!modeId) continue;
      const want = pv.values[mode];
      const had = before[pv.name] && before[pv.name][mode];
      if (!want) { report.errors.push(`${pv.name} (${mode}): нет значения`); continue; }
      if (want.ref) { refs.push({ v, pv, mode, modeId, want, had }); continue; }
      if (had && had.sig && had.sig === planSig(want)) { report.unchanged++; continue; }
      const value = toFigma(pv.type, want.value);
      if (value == null) { report.errors.push(`${pv.name} (${mode}): значение «${want.value}» не читается`); continue; }
      v.setValueForMode(modeId, value);
      if (had && had.sig) touch(pv.name);
    }
  }
  for (const r of refs) {
    if (r.had && r.had.sig === planSig(r.want)) { report.unchanged++; continue; }
    const target = ix.named.get(r.want.ref);
    if (target && target !== r.v) { r.v.setValueForMode(r.modeId, figma.variables.createVariableAlias(target)); report.refs++; }
    else {
      const value = toFigma(r.pv.type, r.want.value);
      if (value == null) { report.errors.push(`${r.pv.name} (${r.mode}): нет переменной ${r.want.ref} для ссылки`); continue; }
      r.v.setValueForMode(r.modeId, value);
    }
    if (r.had && r.had.sig) touch(r.pv.name);
  }
  const planned = new Set(plan.variables.map((x) => x.name));
  report.extra = [...ix.named.keys()].filter((n) => !planned.has(n));
  return report;
}
