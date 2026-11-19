// Body of the use_figma script (runs inside Figma, Plugin API). Writes PLAN (figma.json shape) into
// the local collection `shadcn` with modes Light and Dark: creates missing variables, updates values,
// scopes and code syntax of existing ones by name; deletes nothing. Raw values only, no aliases.
// Expects `PLAN` declared before it (see figma-script.ts).
export const FIGMA_RUNTIME = String.raw`
const report = { collection: PLAN.collection, created: 0, written: 0, modesAdded: [], skipped: [] };
const cols = await figma.variables.getLocalVariableCollectionsAsync();
let col = cols.find((c) => c.name === PLAN.collection);
if (!col) {
  col = figma.variables.createVariableCollection(PLAN.collection);
  col.renameMode(col.modes[0].modeId, PLAN.modes[0]);
}
const modeIds = PLAN.modes.map((name, i) => {
  const hit = col.modes.find((m) => m.name.toLowerCase() === name.toLowerCase());
  if (hit) return hit.modeId;
  report.modesAdded.push(name);
  return col.addMode(name);
});
const keys = ['light', 'dark'];
const all = await figma.variables.getLocalVariablesAsync();
const byName = new Map(all.filter((v) => v.variableCollectionId === col.id).map((v) => [v.name, v]));

function hexToRgba(hex) {
  const h = hex.replace('#', '');
  const n = (i) => Math.round((parseInt(h.slice(i, i + 2), 16) / 255) * 10000) / 10000;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

for (const pv of PLAN.variables) {
  let v = byName.get(pv.name);
  if (v && v.resolvedType !== pv.type) { report.skipped.push(pv.name + ': in Figma ' + v.resolvedType + ', planned ' + pv.type); continue; }
  if (!v) {
    v = figma.variables.createVariable(pv.name, col, pv.type);
    byName.set(pv.name, v);
    report.created++;
  }
  v.scopes = pv.scopes;
  v.setVariableCodeSyntax('WEB', pv.codeSyntax);
  modeIds.forEach((modeId, i) => {
    const pvv = pv.values[keys[i]];
    if (!pvv || pvv.value === null) { report.skipped.push(pv.name + ' (' + keys[i] + '): no value'); return; }
    v.setValueForMode(modeId, pv.type === 'COLOR' ? hexToRgba(pvv.value) : pvv.value);
  });
  report.written++;
}
return report;
`
