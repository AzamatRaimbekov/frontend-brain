// The DS Builder engine without UI, for the Figma MCP (use_figma): the agent loads it into the
// file in chunks (bundle.mjs) and calls globalThis.DS. Same code as the plugin, no copies.
import CONTRACTS from 'ds:contracts';
import { modeVars, ensureShadcn } from '../plugin/src/variables.js';
import { screenVars } from '../plugin/src/tokens-resolve.js';
import { scanKit } from '../plugin/src/kit.js';
import { buildSpec } from '../plugin/src/screens.js';
import { renderContract } from '../plugin/src/components.js';
import { validateSpec } from '../core/spec.js';
import { validateLinks } from '../core/links.js';

/** Creates / completes the «shadcn» variable collection (Light/Dark, canonical values); reset rewrites values. */
async function tokens({ reset = false } = {}) {
  const r = await ensureShadcn({ reset });
  return { created: r.created.length, reset: r.reset, collection: r.collection };
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
  await ensureShadcn();
  const { vars, radius } = await screenVars(await modeVars());
  const k = await scanKit();
  const res = await buildSpec(spec, { vars, radius, kit: k.kit, ...opts });
  return { frames: res.frames.length, sections: res.sections.map((s) => s.page + ' / ' + s.name), kit: Object.keys(k.kit), stats: res.stats };
}

globalThis.DS = { tokens, components, screens, contracts: CONTRACTS.map((c) => c.name) };
