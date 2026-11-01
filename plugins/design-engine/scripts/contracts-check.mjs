#!/usr/bin/env node
// Validates component contracts (mbank/component@1, figma-pack builder/docs/component-contract.md):
// schema, every token exists in frontend-pack tokens.css, props.values <-> variants, states have a code modifier,
// the contract renders to code, and figma {name, key} exists in references/components-map.json.
// code.kind "block" (hand-written blocks such as CRM / KPI card): tokens, parts and anatomy are checked, the
// cva render is skipped; a figma component without a key yet needs a "planned" map entry naming the contract.
// Usage: node contracts-check.mjs [--dir <contracts dir>] [--json]   (default: figma-pack builder/contracts; exit 1 on errors)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ENGINE, resolvePlugin } from './resolve-plugin.mjs';

const FRONTEND = resolvePlugin('frontend-pack');
const FIGMA = resolvePlugin('figma-pack');
if (!FRONTEND || !FIGMA) throw new Error('contracts-check needs figma-pack and frontend-pack installed');
const lib = (file) => import(pathToFileURL(join(FRONTEND, 'scripts', 'contract-to-code', file)).href);
const { PROPERTIES, STATE_MODIFIERS, readTokens, validValue } = await lib('classes.mjs');
const { contractBlocks } = await lib('blocks.mjs');
const { isBlock } = await lib('block.mjs');

export const DEFAULTS = {
  dir: join(FIGMA, 'builder', 'contracts'),
  tokens: join(FRONTEND, 'registry', 'mbank', 'tokens.css'),
  map: join(ENGINE, 'references', 'components-map.json'),
};
const SCHEMA = 'mbank/component@1';
const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const sameKeys = (a, b) => a.length === b.length && a.every((k) => b.includes(k));

// { errors: [], warnings: [] } for one contract object.
export function checkContract(c, { tokens, map, file = `${c?.name}.json` }) {
  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(`${file}: ${msg}`);
  if (!isObj(c)) return { errors: [`${file}: not a JSON object`], warnings };
  if (c.$schema !== SCHEMA) err(`$schema must be "${SCHEMA}"`);
  if (!NAME.test(c.name ?? '')) err('name must be kebab-case');
  else if (file.endsWith('.json') && file !== `${c.name}.json`) err(`name "${c.name}" does not match the file name`);
  if (typeof c.title !== 'string' || !c.title) err('title is required');
  if (!Array.isArray(c.parts) || c.parts[0] !== 'root') err('parts must be an array starting with "root"');
  if (!isObj(c.props)) err('props must be an object');
  if (!isObj(c.base)) err('base must be an object');
  if (!isObj(c.variants)) err('variants must be an object');
  if (!Array.isArray(c.states) || !c.states.includes('default')) err('states must include "default"');
  if (!isObj(c.code) || typeof c.code.file !== 'string') err('code.file is required');
  if (errors.length) return { errors, warnings };
  if (isBlock(c)) {
    if (!/^blocks\/.+\.tsx$/.test(c.code.file)) err('code.file of a block contract is blocks/<dir>/<Name>.tsx');
    if (typeof c.code.slot !== 'string' || !NAME.test(c.code.slot)) err('code.slot (kebab-case data-slot of the root) is required for a block contract');
    for (const p of c.code.inline ?? []) if (!c.parts.includes(p)) err(`code.inline: part "${p}" is not in parts`);
  }
  for (const [part, a] of Object.entries(c.anatomy ?? {})) {
    if (!c.parts.includes(part)) err(`anatomy: part "${part}" is not in parts`);
    else if (a?.parent !== undefined && !c.parts.includes(a.parent)) err(`anatomy.${part}.parent: no part "${a.parent}"`);
  }

  const modifiers = { ...STATE_MODIFIERS, ...(c.code.modifiers ?? {}) };
  for (const s of c.states) if (s !== 'default' && !modifiers[s]) err(`state "${s}" has no code modifier (code.modifiers)`);
  const scope = (where, obj) => {
    if (!isObj(obj)) return err(`${where} must be an object`);
    for (const [part, props] of Object.entries(obj)) {
      if (!c.parts.includes(part)) err(`${where}: part "${part}" is not in parts`);
      if (!isObj(props)) {
        err(`${where}.${part} must be an object`);
        continue;
      }
      for (const [key, value] of Object.entries(props)) {
        const [prop, state, more] = key.split(':');
        if (more !== undefined || !(prop in PROPERTIES)) err(`${where}.${part}: unknown property "${key}"`);
        else if (state && !c.states.includes(state)) err(`${where}.${part}.${key}: state "${state}" is not in states`);
        else if (!validValue(prop, value, tokens))
          err(`${where}.${part}.${key} = ${JSON.stringify(value)}: ${PROPERTIES[prop] === 'color' ? 'no such colour token in tokens.css' : `invalid ${PROPERTIES[prop]} value`}`);
      }
    }
  };
  scope('base', c.base);

  // props.values <-> variants
  const props = Object.keys(c.props);
  if (!sameKeys(props, Object.keys(c.variants))) err(`variants (${Object.keys(c.variants).join(', ')}) must describe exactly the props (${props.join(', ')})`);
  for (const [prop, def] of Object.entries(c.props)) {
    if (!isObj(def) || !Array.isArray(def.values) || !def.values.length || new Set(def.values).size !== def.values.length) {
      err(`props.${prop}.values must be a non-empty list of unique values`);
      continue;
    }
    if (def.default !== undefined && !def.values.includes(def.default)) err(`props.${prop}.default "${def.default}" is not in values`);
    const described = Object.keys(c.variants[prop] ?? {});
    for (const v of def.values) if (!described.includes(v)) err(`props.${prop}: value "${v}" has no variants.${prop}.${v}`);
    for (const v of described) if (!def.values.includes(v)) err(`variants.${prop}.${v} is not in props.${prop}.values`);
    for (const v of described) scope(`variants.${prop}.${v}`, c.variants[prop][v]);
  }
  (c.compound ?? []).forEach((comp, i) => {
    const { when, ...rest } = comp ?? {};
    if (!isObj(when) || !Object.keys(when).length) err(`compound[${i}].when is required`);
    else for (const [p, v] of Object.entries(when)) if (!c.props[p]?.values?.includes(v)) err(`compound[${i}].when.${p} = "${v}" is not a prop value`);
    scope(`compound[${i}]`, rest);
  });

  if (!errors.length && !isBlock(c)) {
    try {
      contractBlocks(c);
    } catch (error) {
      err(`does not render to code: ${error.message}`);
    }
  }
  if (c.figma && !c.figma.key) {
    // Not in the library yet (built by DS Builder, then published): tracked by a planned map entry.
    const entry = map.components.find((e) => e.contract === c.name);
    if (!entry) err(`figma "${c.figma.name}" has no key and no components-map entry with contract "${c.name}"`);
    else if (entry.figma !== c.figma.name) err(`figma.name "${c.figma.name}" != components-map "${entry.figma}"`);
  } else if (c.figma) {
    const entry = map.components.find((e) => e.key && e.key === c.figma.key);
    if (!entry) err(`figma.key ${c.figma.key} is not in components-map.json`);
    else if (entry.figma !== c.figma.name) err(`figma.name "${c.figma.name}" != components-map "${entry.figma}"`);
  } else warnings.push(`${file}: no figma component (new in the design system or not mapped yet)`);
  return { errors, warnings };
}

export function checkDir({ dir = DEFAULTS.dir, tokens = DEFAULTS.tokens, map = DEFAULTS.map } = {}) {
  const ctx = { tokens: readTokens(tokens), map: JSON.parse(readFileSync(map, 'utf8')) };
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  const report = { dir, contracts: files.length, errors: [], warnings: [] };
  if (!files.length) report.errors.push(`${dir}: no contracts`);
  for (const file of files) {
    let c;
    try {
      c = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    } catch (error) {
      report.errors.push(`${file}: invalid JSON (${error.message})`);
      continue;
    }
    const r = checkContract(c, { ...ctx, file });
    report.errors.push(...r.errors);
    report.warnings.push(...r.warnings);
  }
  return report;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const report = checkDir({ dir: argv.includes('--dir') ? argv[argv.indexOf('--dir') + 1] : DEFAULTS.dir });
  if (argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const e of report.errors) console.log(`error  ${e}`);
    for (const w of report.warnings) console.log(`warn   ${w}`);
    console.log(`${report.contracts} contract(s), ${report.errors.length} error(s), ${report.warnings.length} warning(s)`);
  }
  process.exit(report.errors.length ? 1 : 0);
}
