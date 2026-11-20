#!/usr/bin/env node
// Creates a new Mbank WebView service from the TEAM template templates/webview-mbank-service
// (the team's webview-mbank-service: Base UI + shadcn names, Redux Toolkit, react-router-dom, i18next,
// MBankBridge, Inter Mbank, its own AGENTS.md / AGENT_FEEDBACK.md / docs/webview-app-builder rules).
// The template is copied as is — no own scaffold, no kit swap — then renamed, git-initialised and installed.
// Usage: node new-webview-service.mjs <dir> [--name "Оплата штрафов"] [--template <dir>] [--dry-run]
// Pure Node 18+, no dependencies.
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkTarget } from './new-crm.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const TEMPLATE = join(ROOT, 'templates', 'webview-mbank-service');
// Build output, caches and local state of the template author never go into a new project.
export const EXCLUDE = ['node_modules', 'dist', '.git', '.claude-flow', 'tsconfig.tsbuildinfo', '.DS_Store'];

export function parseArgs(argv) {
  const opts = { dir: null, name: null, template: TEMPLATE, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`${arg.split('=')[0]} needs a value`);
      return v;
    };
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--name' || arg.startsWith('--name=')) opts.name = value();
    else if (arg === '--template' || arg.startsWith('--template=')) opts.template = resolve(value());
    else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else if (opts.dir) throw new Error(`One directory only (got "${opts.dir}" and "${arg}")`);
    else opts.dir = arg;
  }
  if (!opts.help && !opts.dir) throw new Error('Name the project directory: node new-webview-service.mjs <dir>');
  return opts;
}

/** npm package name from the folder: lowercase, dashes. */
export const packageName = (dir) =>
  basename(resolve(dir)).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'webview-service';

/** Copy filter: skips EXCLUDE entries at any depth of the template. */
export function keep(template, src) {
  const rel = relative(template, src);
  return !rel || !rel.split(sep).some((part) => EXCLUDE.includes(part));
}

function patchProject(dir, name) {
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = packageName(dir);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  if (name) {
    const html = join(dir, 'index.html');
    if (existsSync(html)) writeFileSync(html, readFileSync(html, 'utf8').replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`));
  }
}

const hasYarn = () => spawnSync('yarn', ['--version'], { encoding: 'utf8' }).status === 0;

export function planSteps(opts) {
  const dir = resolve(opts.dir);
  const cmd = (title, command, args) => ({ title, kind: 'cmd', command, args, cwd: dir });
  const act = (title, fn) => ({ title, kind: 'act', fn });
  // The template is a yarn project (yarn.lock; its lint script calls yarn). npm only when yarn is missing.
  const install = existsSync(join(opts.template, 'yarn.lock')) && (opts.dryRun || hasYarn())
    ? cmd('Install dependencies (yarn, template lock file)', 'yarn', ['install'])
    : cmd('Install dependencies (npm)', 'npm', ['install']);
  return [
    act(`Copy the team template ${relative(process.cwd(), opts.template) || opts.template}`, () =>
      cpSync(opts.template, dir, { recursive: true, filter: (src) => keep(opts.template, src) })),
    act('Set the package name and <title>', () => patchProject(dir, opts.name)),
    cmd('Start git (husky hooks need it before install)', 'git', ['init', '-q']),
    install,
    cmd('Typecheck', 'npx', ['tsc', '--noEmit']),
  ];
}

export function run(opts, log = console.log) {
  if (!existsSync(join(opts.template, 'package.json'))) throw new Error(`No template at ${opts.template}`);
  const dir = resolve(opts.dir);
  if (!opts.dryRun) checkTarget(dir);
  const steps = planSteps(opts);
  for (const step of steps) {
    log(`• ${step.title}`);
    if (step.kind === 'cmd') log(`    $ ${step.command} ${step.args.join(' ')}`);
    if (opts.dryRun) continue;
    if (step.kind === 'act') step.fn();
    else {
      const res = spawnSync(step.command, step.args, { cwd: step.cwd, stdio: 'inherit', shell: process.platform === 'win32' });
      if (res.status !== 0) throw new Error(`${step.title} failed (${step.command} exit ${res.status})`);
    }
  }
  if (!opts.dryRun) {
    log(`\nCreated ${dir} from the team template. Next:`);
    log(`  cd ${basename(dir)}`);
    log('  yarn dev                 # read AGENTS.md, AGENT_FEEDBACK.md and docs/webview-app-builder first');
    log('  yarn lint && yarn build  # the template checks: tsc, eslint, prettier, design tokens');
  }
  return steps;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n'));
    else run(opts);
  } catch (error) {
    console.error(`new-webview-service: ${error.message}`);
    process.exit(1);
  }
}
