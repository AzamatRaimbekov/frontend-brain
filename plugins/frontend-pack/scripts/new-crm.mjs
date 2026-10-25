#!/usr/bin/env node
// Scaffolds a new Mbank CRM / admin panel: Vite + React + TS, the Mbank kit, all CRM blocks and
// templates/mbank-crm (layout, navigation, two Figma pages, MSW mocks, tests).
// Usage: node new-crm.mjs <dir> [--name "Mbank CRM"] [--kit package|copy] [--dry-run]
//   --kit package (default): the kit and widgets come from the @mdigital/mbank-ui package (KIT_PACKAGE)
//   --kit copy: kit sources are copied into src/shared with add-ui.mjs (to change them in the project)
// Refuses a non-empty <dir>. Needs network for npm. Pure Node 18+, no dependencies.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(SCRIPTS, '..', 'templates', 'mbank-crm');
const ADD_UI = join(SCRIPTS, 'add-ui.mjs');

// react-new-project (Vite) whitelist + the kit (radix-ui, cva, clsx, tailwind-merge, tw-animate-css) + MSW.
// Only what the template uses: no lucide-react (Mbank icons), no i18n, and react-hook-form +
// @hookform/resolvers come with the first form (resolvers@6 currently fails npm peer resolution
// in a fresh project, checked 2026-10-25), sonner with the first toast.
export const PACKAGES = [
  'tailwindcss', '@tailwindcss/vite', '@tanstack/react-query', '@tanstack/react-router', 'zod',
  'react-error-boundary',
  'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tw-animate-css',
];
// The kit as a package: one repository, updated by changing the tag. Private: npm needs git access to it.
export const KIT_PACKAGE = 'github:AzamatRaimbekov/mbank-ui#v0.1.0';
// Kit packages that the copy mode installs itself; the package mode gets them as dependencies of KIT_PACKAGE.
const COPY_ONLY = ['radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge'];
export const DEV_PACKAGES = [
  '@tanstack/react-query-devtools', '@tanstack/eslint-plugin-query', '@types/node',
  'vitest', '@testing-library/react', '@testing-library/user-event', '@testing-library/jest-dom', 'jsdom', 'msw',
];
// Vite scaffold files the template replaces or makes useless.
const REMOVE = ['src/App.tsx', 'src/App.css', 'src/assets'];

export function parseArgs(argv) {
  const opts = { dir: null, name: 'Mbank CRM', kit: 'package', dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--name' || arg.startsWith('--name=')) {
      const value = arg.includes('=') ? arg.slice('--name='.length) : argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--name needs a value');
      opts.name = value;
    } else if (arg === '--kit' || arg.startsWith('--kit=')) {
      const value = arg.includes('=') ? arg.slice('--kit='.length) : argv[++i];
      if (value !== 'package' && value !== 'copy') throw new Error('--kit is package or copy');
      opts.kit = value;
    } else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else if (opts.dir) throw new Error(`One directory only (got "${opts.dir}" and "${arg}")`);
    else opts.dir = arg;
  }
  if (!opts.help && !opts.dir) throw new Error('Name the project directory: node new-crm.mjs <dir>');
  return opts;
}

export function checkTarget(dir) {
  if (existsSync(dir) && readdirSync(dir).length > 0) throw new Error(`${dir} is not empty. Pick a new directory.`);
}

/** The ordered steps; each is a shell command or a local action. Pure: used by --dry-run and tests. */
export function planSteps(opts) {
  const dir = resolve(opts.dir);
  const cmd = (title, command, args, cwd = dir) => ({ title, kind: 'cmd', command, args, cwd });
  const act = (title, fn) => ({ title, kind: 'act', fn });
  const asPackage = opts.kit !== 'copy';
  const packages = asPackage ? [...PACKAGES.filter((p) => !COPY_ONLY.includes(p)), KIT_PACKAGE] : PACKAGES;
  return [
    cmd('Create the Vite app (ESLint, no prompts)', 'npx',
      ['-y', 'create-vite@latest', basename(dir), '--template', 'react-ts', '--eslint', '--no-interactive', '--no-immediate'],
      dirname(dir)),
    cmd('Install packages', 'npm', ['install', ...packages]),
    cmd('Install dev packages', 'npm', ['install', '-D', ...DEV_PACKAGES]),
    asPackage
      ? null
      : cmd('Add the Mbank kit and all CRM blocks', process.execPath, [ADD_UI, 'all', '--cwd', dir]),
    act('Copy templates/mbank-crm (layout, navigation, pages, mocks, tests, configs)', () => copyTemplate(dir)),
    asPackage ? act('Point the template at @mdigital/mbank-ui', () => usePackage(dir)) : null,
    act('Set the name, lang="ru" and npm scripts', () => patchProject(dir, opts.name)),
    cmd('Generate the MSW worker in public/', 'npx', ['-y', 'msw', 'init', 'public', '--save']),
  ].filter(Boolean);
}

function copyTemplate(dir) {
  for (const path of REMOVE) rmSync(join(dir, path), { recursive: true, force: true });
  cpSync(TEMPLATE, dir, { recursive: true, force: true });
}

/** Template imports of the copied kit -> the package entry points. Pure: used by tests. */
export function toPackageImports(source) {
  return source
    .replace(/(['"])@\/shared\/(ui\/[\w-]+|lib\/utils|components\/EmptyState)\1/g, '$1@mdigital/mbank-ui$1')
    .replace(/(['"])@\/shared\/components\/crm\/[\w-]+\1/g, '$1@mdigital/mbank-ui/crm$1')
    .replace('@import "./styles/mbank-tokens.css";', '@import "@mdigital/mbank-ui/styles.css";');
}

function usePackage(dir) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|css)$/.test(e.name) ? [join(d, e.name)] : []);
  for (const file of walk(join(dir, 'src'))) {
    const text = readFileSync(file, 'utf8');
    const next = toPackageImports(text);
    if (next !== text) writeFileSync(file, next);
  }
}

function patchProject(dir, name) {
  const html = join(dir, 'index.html');
  writeFileSync(html, readFileSync(html, 'utf8')
    .replace(/<html lang="[^"]*">/, '<html lang="ru">')
    .replace(/<title>[^<]*<\/title>/, `<title>${name.replace(/[<&]/g, '')}</title>`));
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.scripts = { ...pkg.scripts, typecheck: 'tsc -b', test: 'vitest run', 'test:watch': 'vitest' };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function run(opts, log = console.log) {
  checkTarget(resolve(opts.dir));
  const steps = planSteps(opts);
  steps.forEach((step, i) => {
    const shown = step.kind === 'cmd' ? `${step.command === process.execPath ? 'node' : step.command} ${step.args.join(' ')}` : '';
    log(`${opts.dryRun ? '[dry-run] ' : ''}${i + 1}/${steps.length} ${step.title}${shown ? `\n    $ ${shown}` : ''}`);
    if (opts.dryRun) return;
    if (step.kind === 'act') return step.fn();
    const result = spawnSync(step.command, step.args, { cwd: step.cwd, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Step failed: ${step.title} (exit ${result.status ?? result.error?.message})`);
  });
  log(`\n${opts.dryRun ? 'Plan for' : 'Created'} ${resolve(opts.dir)}. Next:
  cd ${opts.dir}
  npm run dev          # http://localhost:5173 — mock API (MSW); ?mock=empty|error|action-error for states
  npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build
Then: add pages from blocks (skill mbank-crm), edit src/app/navigation.ts, replace src/mocks with the real API.`);
  return steps;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 5).join('\n'));
    else run(opts);
  } catch (error) {
    console.error(`new-crm: ${error.message}`);
    process.exit(1);
  }
}
