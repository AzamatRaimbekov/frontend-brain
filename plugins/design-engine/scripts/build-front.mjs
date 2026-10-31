#!/usr/bin/env node
// One command of the engine: screen spec -> running Mbank CRM frontend.
//   1. spec check (figma-pack builder ds.mjs)      2. new-crm.mjs when the folder has no project (frontend-pack)
//   3. spec-to-code.mjs (frontend-pack)            4. project checks: typecheck, lint, test, build
//   5. optional: dev server (--dev)
// Usage: node build-front.mjs <spec.json> --project <dir> [--name "Mbank CRM"] [--kit package|copy]
//        [--force] [--skip-checks] [--dev [--port 5173]] [--dry-run] [--json]
// Stops at the first failed step and prints its output tail. Pure Node 18+, no dependencies.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolvePlugin } from './resolve-plugin.mjs';

const CHECKS = ['typecheck', 'lint', 'test', 'build'];
const tail = (text, n = 15) => text.trim().split('\n').slice(-n).join('\n');

export function parseArgs(argv) {
  const opts = { spec: null, project: null, name: null, kit: null, port: '5173', force: false, skipChecks: false, dev: false, dryRun: false, json: false };
  const flags = { '--force': 'force', '--skip-checks': 'skipChecks', '--dev': 'dev', '--dry-run': 'dryRun', '--json': 'json' };
  const values = { '--project': 'project', '--name': 'name', '--kit': 'kit', '--port': 'port' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (flags[arg]) opts[flags[arg]] = true;
    else if (values[arg]) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      opts[values[arg]] = value;
    } else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else if (!opts.spec) opts.spec = arg;
    else throw new Error(`Unexpected argument ${arg}`);
  }
  if (!opts.spec || !opts.project) throw new Error('Usage: build-front.mjs <spec.json> --project <dir>');
  if (opts.kit && !['package', 'copy'].includes(opts.kit)) throw new Error('--kit is package or copy');
  return opts;
}

// The ordered steps for these options; each is [id, command, args, cwd].
export function plan(opts, { figma, frontend }) {
  const spec = resolve(opts.spec);
  const project = resolve(opts.project);
  const hasProject = existsSync(join(project, 'package.json'));
  const steps = [['spec-check', process.execPath, [join(figma, 'builder', 'cli', 'ds.mjs'), 'spec', 'check', spec], process.cwd()]];
  if (!hasProject) {
    if (existsSync(project) && readdirSync(project).length) throw new Error(`${project} is not empty and has no package.json`);
    const scaffold = [join(frontend, 'scripts', 'new-crm.mjs'), project];
    if (opts.name) scaffold.push('--name', opts.name);
    if (opts.kit) scaffold.push('--kit', opts.kit);
    steps.push(['scaffold', process.execPath, scaffold, process.cwd()]);
  }
  const generate = [join(frontend, 'scripts', 'spec-to-code.mjs'), spec, '--project', project];
  if (opts.force) generate.push('--force');
  steps.push(['generate', process.execPath, generate, process.cwd()]);
  if (!opts.skipChecks) for (const check of CHECKS) steps.push([check, 'npm', ['run', check, '--silent'], project]);
  return steps;
}

export function run(opts, { exec = spawnSync, resolver = resolvePlugin } = {}) {
  const figma = resolver('figma-pack');
  const frontend = resolver('frontend-pack');
  if (!figma || !frontend) return { ok: false, steps: [], error: `not installed: ${[!figma && 'figma-pack', !frontend && 'frontend-pack'].filter(Boolean).join(', ')}` };
  const steps = plan(opts, { figma, frontend });
  if (opts.dryRun) return { ok: true, steps: steps.map(([id, cmd, args, cwd]) => ({ id, command: [cmd, ...args].join(' '), cwd, status: 'planned' })) };
  // new-crm.mjs runs create-vite in the parent folder, which must exist.
  mkdirSync(dirname(resolve(opts.project)), { recursive: true });
  const done = [];
  for (const [id, cmd, args, cwd] of steps) {
    const started = Date.now();
    const r = exec(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1', FORCE_COLOR: '0' } });
    const step = { id, status: r.status === 0 ? 'ok' : 'failed', seconds: Math.round((Date.now() - started) / 100) / 10, output: tail(`${r.stdout ?? ''}${r.stderr ?? ''}`, r.status === 0 ? 3 : 25) };
    done.push(step);
    if (step.status === 'failed') return { ok: false, steps: done, error: `${id} failed` };
  }
  return { ok: true, steps: done, project: resolve(opts.project) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const result = run(opts);
  if (opts.json) console.log(JSON.stringify(result, null, 2));
  else {
    for (const s of result.steps) console.log(`${s.status.padEnd(8)} ${s.id}${s.seconds !== undefined ? ` (${s.seconds}s)` : ''}${s.command ? `  ${s.command}` : ''}${s.status === 'failed' || s.status === 'ok' ? `\n${s.output.replace(/^/gm, '         ')}` : ''}`);
    console.log(result.ok ? `\nready: ${result.project ?? opts.project}` : `\nstopped: ${result.error}`);
  }
  if (!result.ok) process.exit(1);
  if (opts.dev && !opts.dryRun) spawn('npm', ['run', 'dev', '--', '--port', opts.port], { cwd: resolve(opts.project), stdio: 'inherit' });
}
