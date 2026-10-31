#!/usr/bin/env node
// Generates the React frontend of a CRM made by new-crm.mjs from the same screen spec that the
// figma-pack builder plugin draws in Figma: per screen a route, page + UX.md + tests, a feature folder
// (zod schemas, query keys, MSW handlers with spec data, one component per block) and the menu from spec.nav.
// Usage: node spec-to-code.mjs <spec.json> --project <dir> [--dry-run] [--force] [--only <screenId>]
//   --dry-run  print the plan, write nothing
//   --force    also overwrite files edited after generation or written by hand
//   --only     regenerate one screen (+ router, menu and mock list for the screens already present)
// Generated files start with an "@generated spec-to-code <hash>" line; an edited file is kept.
// Pure Node 18+, no dependencies.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toPackageImports } from './new-crm.mjs';
import { appFiles } from './spec-to-code/app.mjs';
import { featureFiles, screenCtx } from './spec-to-code/feature.mjs';
import { applyPlan, planDemoRemoval, planWrites } from './spec-to-code/files.mjs';
import { buildModel, checkSpec } from './spec-to-code/model.mjs';
import { pageFiles } from './spec-to-code/page.mjs';

const TEMPLATE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'templates', 'mbank-crm');
export const MAX_COMPONENT_LINES = 150;

export function parseArgs(argv) {
  const opts = { spec: null, project: null, dryRun: false, force: false, only: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = (name) => {
      const v = arg.includes('=') ? arg.slice(name.length + 1) : argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`${name} needs a value`);
      return v;
    };
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--project' || arg.startsWith('--project=')) opts.project = value('--project');
    else if (arg === '--only' || arg.startsWith('--only=')) opts.only = value('--only');
    else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else if (opts.spec) throw new Error(`One spec only (got "${opts.spec}" and "${arg}")`);
    else opts.spec = arg;
  }
  if (!opts.help && (!opts.spec || !opts.project)) throw new Error('Usage: spec-to-code.mjs <spec.json> --project <dir> [--dry-run] [--force] [--only <screenId>]');
  return opts;
}

/** Package mode (default of new-crm) imports the kit from @mdigital/mbank-ui, copy mode from src/shared. */
export function kitMapper(project) {
  const pkgPath = join(project, 'package.json');
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {};
  const asPackage = Boolean({ ...pkg.dependencies, ...pkg.devDependencies }['@mdigital/mbank-ui']);
  return { asPackage, kit: asPackage ? (mod) => toPackageImports(`'${mod}'`).slice(1, -1) : (mod) => mod };
}

/** Everything spec-to-code would do; pure apart from reading the project. */
export function plan(spec, opts) {
  const project = resolve(opts.project);
  const { errors, warnings } = checkSpec(spec);
  if (errors.length) throw new Error(`spec is invalid:\n  ${errors.join('\n  ')}`);
  if (!existsSync(join(project, 'src', 'app')) || !existsSync(join(project, 'package.json'))) {
    throw new Error(`${project} is not a CRM made by new-crm.mjs (no package.json or src/app)`);
  }
  const model = buildModel(spec);
  if (opts.only && !model.screens.some((s) => s.id === opts.only)) throw new Error(`--only: no screen "${opts.only}" in the spec (${model.screens.map((s) => s.id).join(', ')})`);
  const { kit, asPackage } = kitMapper(project);
  const exists = (s) => existsSync(join(project, 'src', 'pages', s.dir, `${s.pascal}Page.tsx`));
  const screens = model.screens.filter((s) => !opts.only || s.id === opts.only || exists(s));
  const files = [];
  for (const s of screens) {
    if (opts.only && s.id !== opts.only) continue;
    files.push(...featureFiles(s, screenCtx(s, model, kit)), ...pageFiles(s, model));
  }
  files.push(...appFiles(model, screens, kit));
  const long = files.filter((f) => f.path.endsWith('.tsx') && !f.path.endsWith('.test.tsx') && f.content.split('\n').length - 1 > MAX_COMPONENT_LINES - 1);
  for (const f of long) model.warnings.push(`${f.path}: over ${MAX_COMPONENT_LINES} lines, split it`);
  const sameOpts = { force: opts.force, templateDir: TEMPLATE, toPackage: toPackageImports };
  const steps = planWrites(project, files, sameOpts);
  steps.push(...planDemoRemoval(project, new Set(files.map((f) => f.path)), sameOpts));
  return { project, model, steps, warnings: [...warnings, ...model.warnings], asPackage };
}

const LABEL = { create: '+', update: '~', overwrite: '!', delete: '-', skip: '=', keep: '=', unchanged: ' ' };

export function run(opts, log = console.log) {
  const spec = JSON.parse(readFileSync(resolve(opts.spec), 'utf8'));
  const result = plan(spec, opts);
  const { steps, warnings } = result;
  for (const step of steps.filter((s) => s.action !== 'unchanged')) {
    log(`${LABEL[step.action]} ${step.action.padEnd(9)} ${step.path}${step.note ? `  (${step.note})` : ''}`);
  }
  const count = (a) => steps.filter((s) => s.action === a).length;
  log(`\n${opts.dryRun ? '[dry-run] ' : ''}${result.model.screens.length} screens, kit: ${result.asPackage ? '@mdigital/mbank-ui' : 'src/shared (copy)'} — ` +
    `${count('create')} new, ${count('update') + count('overwrite')} updated, ${count('unchanged')} unchanged, ${count('skip')} kept (edited), ${count('delete')} demo files removed`);
  for (const w of warnings) log(`warning: ${w}`);
  if (count('skip')) log('Kept files were edited after generation: merge by hand or rerun with --force.');
  if (!opts.dryRun) {
    applyPlan(result.project, steps);
    log(`\nNext, in ${result.project}:\n  npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build\n  npm run dev   # ?mock=empty | error | no-access | action-error open the other states`);
  }
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 10).join('\n'));
    else run(opts);
  } catch (error) {
    console.error(`spec-to-code: ${error.message}`);
    process.exit(1);
  }
}
