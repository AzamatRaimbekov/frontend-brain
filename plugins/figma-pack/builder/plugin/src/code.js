// Plugin entry: routes UI messages to the brand layer, the kit scanner and the builder.
import { inspect, setupBrand, rollbackBrand, addBrand, removeBrand, readBrand, applyBrand, addCustomToken, listCustom, resolveCustom, modeVars, loadIndex, C } from './brand.js';
import { scanKit } from './kit.js';
import { buildSpec } from './screens.js';
import { auditFrames } from './audit.js';
import { validateSpec } from '../../core/spec.js';
import { validateLinks } from '../../core/links.js';
import { toShadcnCss } from '../../core/css.js';
import { COLOR_TOKENS } from '../../core/tokens.js';
import { contractHandlers } from './contracts.js';
import { screenVars } from './tokens-resolve.js';
// Built in by scripts/build.mjs from builder/contracts/*.json (fixtures until the extractor lands).
import BUNDLED_CONTRACTS from 'ds:contracts';

figma.showUI(__html__, { width: 520, height: 720, themeColors: true });

let kitCache = null;
const post = (type, data) => figma.ui.postMessage({ type, ...data });

async function kit() {
  if (!kitCache) kitCache = await scanKit();
  return kitCache;
}

// Resolved brand values -> tokens.json shape, plus project tokens for CSS.
async function exportTokens(brand, style) {
  const table = await readBrand(brand, style);
  const colors = { light: {}, dark: {} };
  for (const r of table.rows) if (r.hex) colors[r.theme][r.token] = r.hex;
  const ix = await loadIndex();
  const custom = await resolveCustom(brand, style);
  const radiusVar = ix.named[C.style].get('radius/lg');
  const sm = ix.col[C.style].modes.find((m) => m.name === style) || ix.col[C.style].modes[0];
  const missing = COLOR_TOKENS.filter((t) => !colors.light[t] || !colors.dark[t]);
  return {
    $schema: 'ds-builder/tokens@1', name: brand, style: sm.name,
    font: { sans: table.font || 'Inter', mono: 'Geist Mono' },
    radius: radiusVar ? radiusVar.valuesByMode[sm.modeId] : 10,
    colors, custom, missing,
  };
}

const handlers = {
  async init() { return { status: await inspect() }; },
  async setup(m) { const report = await setupBrand(m); return { report, status: await inspect() }; },
  async rollback() { const r = await rollbackBrand(); return { report: r, status: await inspect() }; },
  async 'add-brand'(m) { await addBrand(m.name); return { status: await inspect() }; },
  async 'remove-brand'(m) { await removeBrand(m.name); return { status: await inspect() }; },
  async 'read-brand'(m) { return { table: await readBrand(m.brand, m.style) }; },
  async 'apply-brand'(m) { const rows = await applyBrand(m.brand, m.tokens, m.keys, { reset: m.reset, snap: m.snap }); return { rows, table: await readBrand(m.brand, m.style) }; },
  async 'add-token'(m) { const t = await addCustomToken(m.token); return { token: t, custom: await listCustom() }; },
  async 'list-custom'() { return { custom: await listCustom() }; },
  async 'scan-kit'() { kitCache = null; const k = await kit(); return { kit: k.kit, count: k.components.length, components: k.components }; },
  async 'export-css'(m) {
    const tokens = await exportTokens(m.brand, m.style);
    return { tokens, css: toShadcnCss(tokens) };
  },
  async build(m) {
    const errors = [...validateSpec(m.spec), ...validateLinks(m.spec)];
    if (errors.length) return { errors };
    const { vars, radius } = await screenVars(await modeVars());
    const k = await kit();
    const res = await buildSpec(m.spec, { vars, radius, kit: k.kit, font: m.font, brand: m.brand, style: m.style, theme: m.theme, only: m.only },
      (done, total, label) => post('progress', { done, total, label }));
    const audit = await auditFrames(res.frames.map((f) => f.id));
    const first = res.sections[0] && (await figma.getNodeByIdAsync(res.sections[0].id));
    if (first) {
      // The build ends on the «Прототип» page; come back to the first built section.
      let page = first.parent;
      while (page && page.type !== 'PAGE') page = page.parent;
      if (page) await figma.setCurrentPageAsync(page);
      figma.viewport.scrollAndZoomIntoView([first]);
    }
    return { result: res, audit };
  },
  ...contractHandlers(BUNDLED_CONTRACTS),
};

figma.ui.onmessage = async (m) => {
  const fn = handlers[m.type];
  if (!fn) return;
  try {
    post(`${m.type}:done`, await fn(m));
  } catch (e) {
    post('error', { for: m.type, message: String(e && e.message ? e.message : e) });
  }
};
