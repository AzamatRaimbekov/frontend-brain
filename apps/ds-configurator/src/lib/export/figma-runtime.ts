// Body of the use_figma script (runs inside Figma, Plugin API). Same API style as figma-pack
// read-tokens.js and the Brand layer in figma-pack builder/plugin/src/brand.js: collection "Brand",
// one mode per brand, variables color/light/<token> and color/dark/<token>; the theme collection
// (2.theme or the shadcn kit's Mode) aliases them per light/dark mode when LINK_THEME is true.
// Expects `DS` and `LINK_THEME` declared before it (see figma-script.ts).
export const FIGMA_RUNTIME = String.raw`
const report = { collection: DS.collection, mode: DS.brand, created: 0, written: 0, linked: 0, themeCollection: null, missingInTheme: [], warnings: [] };
const cols = await figma.variables.getLocalVariableCollectionsAsync();
let brand = cols.find((c) => c.name === DS.collection);
if (!brand) {
  brand = figma.variables.createVariableCollection(DS.collection);
  brand.renameMode(brand.modes[0].modeId, DS.brand);
}
let modeId = (brand.modes.find((m) => m.name === DS.brand) || {}).modeId;
if (!modeId) modeId = brand.addMode(DS.brand);

const all = await figma.variables.getLocalVariablesAsync();
const named = (col) => new Map(all.filter((v) => v.variableCollectionId === col.id).map((v) => [v.name, v]));
const inBrand = named(brand);
const themeCol = cols.find((c) => DS.themeCollections.includes(c.name)) || null;
const linking = LINK_THEME && !!themeCol;

function ensure(name, type, scopes) {
  let v = inBrand.get(name);
  if (v && v.resolvedType !== type) throw new Error('Brand/' + name + ' is ' + v.resolvedType + ', expected ' + type);
  const isNew = !v;
  if (isNew) {
    v = figma.variables.createVariable(name, brand, type);
    inBrand.set(name, v);
    report.created++;
  }
  v.scopes = scopes;
  return { v, isNew };
}

// New variables get the value in every brand mode, so other brands inherit until they override it.
function write(name, type, value, scopes, css) {
  const { v, isNew } = ensure(name, type, scopes);
  for (const m of isNew ? brand.modes : [{ modeId }]) v.setValueForMode(m.modeId, value);
  if (css) v.setVariableCodeSyntax('WEB', 'var(--' + css + ')');
  report.written++;
  return v;
}

const brandVars = [];
for (const c of DS.colors) {
  const scopes = linking ? [] : c.scopes; // linked: designers pick theme tokens, Brand stays out of pickers
  const light = write('color/light/' + c.name, 'COLOR', c.light, scopes, c.name);
  const dark = write('color/dark/' + c.name, 'COLOR', c.dark, scopes, c.name);
  brandVars.push({ c, light, dark });
}
for (const f of DS.floats) write(f.figma, 'FLOAT', f.value, f.scopes, f.css);

if (LINK_THEME && !themeCol) report.warnings.push('No theme collection (' + DS.themeCollections.join(' / ') + '): Brand written, nothing linked');
if (linking) {
  report.themeCollection = themeCol.name;
  const pick = (re, i) => (themeCol.modes.find((m) => re.test(m.name)) || themeCol.modes[i] || themeCol.modes[0]).modeId;
  const lightId = pick(/light/i, 0);
  const darkId = pick(/dark/i, 1);
  const inTheme = named(themeCol);
  for (const { c, light, dark } of brandVars) {
    let tv = inTheme.get(c.figma || c.name);
    if (!tv && !c.extra) { report.missingInTheme.push(c.figma || c.name); continue; }
    if (!tv) {
      tv = figma.variables.createVariable(c.name, themeCol, 'COLOR');
      inTheme.set(c.name, tv);
      report.created++;
    }
    tv.setValueForMode(lightId, figma.variables.createVariableAlias(light));
    tv.setValueForMode(darkId, figma.variables.createVariableAlias(dark));
    tv.scopes = c.scopes;
    tv.setVariableCodeSyntax('WEB', 'var(--' + c.name + ')');
    report.linked++;
  }
}
return report;
`
