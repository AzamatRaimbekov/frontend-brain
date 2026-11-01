// The DS Builder + Mbank Tokens engine without UI, for the Figma MCP (use_figma): the agent loads it into the
// file in chunks (bundle.mjs) and calls globalThis.DS. Same code as the plugin and the widget, no copies.
import TOKENS from '../../skills/mbank-figma-patterns/references/tokens.json';
import CONTRACTS from 'ds:contracts';
import { buildModel, BRANDS } from '../../widget/core/model.js';
import { planAllBrands } from '../../widget/core/sync.js';
import { applyWrites } from '../../widget/src/figma-io.js';
import { modeVars } from '../plugin/src/brand.js';
import { screenVars } from '../plugin/src/tokens-resolve.js';
import { scanKit } from '../plugin/src/kit.js';
import { buildSpec } from '../plugin/src/screens.js';
import { renderContract } from '../plugin/src/components.js';
import { validateSpec } from '../core/spec.js';
import { validateLinks } from '../core/links.js';

/** Writes the Mbank tokens (every brand, light/dark) + project tokens as Figma variables. */
async function tokens({ extras = [], edits = {}, dryRun = false } = {}) {
  const plan = planAllBrands((b) => buildModel(TOKENS, { brand: b, edits, extras }), BRANDS, { all: true });
  const r = await applyWrites(plan.writes, { dryRun });
  return { created: r.created.length, updated: r.updated.length, aliased: r.aliased.length, raw: r.raw.length, errors: r.errors, collections: r.collectionsCreated };
}

/** Builds component sets from contracts (all, or names). */
async function components(names) {
  const out = [];
  for (const c of CONTRACTS.filter((x) => !names || names.includes(x.name))) {
    const res = await renderContract(c, {});
    out.push(res.errors ? { name: c.name, errors: res.errors } : { name: c.name, setId: res.report.setId, bound: res.report.bound, unbound: res.report.unbound });
  }
  return out;
}

/** Spec -> section pages + «Прототип». */
async function screens(spec, opts = {}) {
  const errors = [...validateSpec(spec), ...validateLinks(spec)];
  if (errors.length) return { errors };
  const { vars, radius } = await screenVars(await modeVars());
  const k = await scanKit();
  const res = await buildSpec(spec, { vars, radius, kit: k.kit, ...opts });
  return { frames: res.frames.length, sections: res.sections.map((s) => s.page + ' / ' + s.name), kit: Object.keys(k.kit), stats: res.stats };
}

globalThis.DS = { tokens, components, screens, contracts: CONTRACTS.map((c) => c.name) };
