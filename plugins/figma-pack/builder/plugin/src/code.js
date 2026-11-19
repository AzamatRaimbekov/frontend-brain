// Plugin entry: routes UI messages to the shadcn variables, the kit scanner and the builder.
import { inspect, ensureShadcn, readShadcn, modeVars } from './variables.js';
import { scanKit } from './kit.js';
import { buildSpec } from './screens.js';
import { auditFrames } from './audit.js';
import { validateSpec } from '../../core/spec.js';
import { validateLinks } from '../../core/links.js';
import { toShadcnCss } from '../../core/css.js';
import { contractHandlers } from './contracts.js';
import { screenVars } from './tokens-resolve.js';
// Built in by scripts/build.mjs from builder/contracts/*.json (fixtures until the extractor lands).
import BUNDLED_CONTRACTS from 'ds:contracts';
import EXAMPLE_SPEC from '../../examples/credit-crm.spec.json';
import { startBridge } from './bridge.js';
import { ensureContracts } from './assemble.js';

// Menu commands (manifest "menu") run without the window: an agent or a designer starts them from Plugins → DS Builder.
const COMMAND = figma.command && figma.command !== 'open' ? figma.command : null;
if (COMMAND !== 'bridge') figma.showUI(__html__, { width: 520, height: 720, themeColors: true, visible: !COMMAND });

let kitCache = null;
const post = (type, data) => figma.ui.postMessage({ type, ...data });

async function kit() {
  if (!kitCache) kitCache = await scanKit();
  return kitCache;
}

// «Экземпляры 812, нарисовано вручную 14 (progress 14) · по ролям: …» for the window and the menu command.
function screensReport(res) {
  const s = res.stats;
  const hand = (res.handDrawn || []).map((x) => `${x.role} ${x.count}`).join(', ');
  const built = res.components && res.components.built.length ? ` · собраны компоненты: ${res.components.built.join(', ')}` : '';
  return `Экземпляры компонентов ${s.instances}, нарисовано вручную ${s.fallbacks}${hand ? ` (${hand})` : ''}${built} · по ролям (экземпляры/вручную): ${res.roles}`;
}

const handlers = {
  async init() { return { status: await inspect() }; },
  async 'tokens-apply'(m) { const report = await ensureShadcn({ reset: !!m.reset }); return { report, status: await inspect(), tokens: await readShadcn() }; },
  async 'tokens-read'() { return { tokens: await readShadcn() }; },
  async 'scan-kit'() { kitCache = null; const k = await kit(); return { kit: k.kit, count: k.components.length, components: k.components }; },
  async 'export-css'() {
    const tokens = await readShadcn();
    return { tokens, css: toShadcnCss(tokens) };
  },
  async build(m) {
    const errors = [...validateSpec(m.spec), ...validateLinks(m.spec)];
    if (errors.length) return { errors };
    await ensureShadcn(); // the screens bind to the shadcn variables: create what is missing (canonical values)
    const { vars, radius } = await screenVars(await modeVars());
    // components: false = use only the sets already in the file; otherwise build the missing contract sets first
    const components = m.components === false ? null : await ensureContracts(m.spec, BUNDLED_CONTRACTS, { font: m.font, create: m.create });
    if (components && components.built.length) kitCache = null;
    const k = await kit();
    const res = await buildSpec(m.spec, { vars, radius, kit: k.kit, font: m.font, theme: m.theme, only: m.only, contracts: components ? components.sets : undefined },
      (done, total, label) => post('progress', { done, total, label }));
    res.components = components && { built: components.built, failed: components.failed, unknown: components.unknown };
    res.report = screensReport(res);
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

if (COMMAND !== 'bridge') figma.ui.onmessage = async (m) => {
  const fn = handlers[m.type];
  if (!fn) return;
  try {
    post(`${m.type}:done`, await fn(m));
  } catch (e) {
    post('error', { for: m.type, message: String(e && e.message ? e.message : e) });
  }
};

const COMMANDS = {
  async 'render-all'() {
    const r = await handlers['contract-render-all']({ create: false });
    return `Компоненты: ${r.built} на странице «${r.page}»${r.failed.length ? `, не собраны: ${r.failed.join(', ')}` : ''}${r.missing.length ? ` · нет токенов (${r.missing.length}): ${r.missing.slice(0, 8).join(', ')}` : ' · все токены найдены'}`;
  },
  async 'build-example'() {
    const r = await handlers.build({ spec: EXAMPLE_SPEC, theme: 'light' });
    if (r.errors) return `Спека с ошибками: ${r.errors.slice(0, 3).join('; ')}`;
    return `Экраны: ${r.result.frames.length} фреймов, ${r.result.sections.length} экранов · ${r.result.report}`;
  },
};

if (COMMAND === 'bridge') {
  startBridge({ ...handlers, 'render-all': () => handlers['contract-render-all']({ create: false }) });
} else if (COMMAND) {
  (async () => {
    try {
      const msg = await COMMANDS[COMMAND]();
      console.log(`[DS Builder] ${msg}`);
      figma.closePlugin(msg);
    } catch (e) {
      figma.closePlugin(`Ошибка: ${String(e && e.message ? e.message : e)}`);
    }
  })();
}
