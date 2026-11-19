#!/usr/bin/env node
// Scaffolds a new Mbank WebView microservice (a page opened inside the Mbank mobile app): Vite + React + TS,
// shadcn tokens and kit primitives, the app bridge (token, language, theme, back, resume), i18n ru/ky/en,
// MSW mocks, a dev panel that plays the app, tests. Template: templates/mbank-webview.
// Usage: node new-webview.mjs <dir> [--name "Mbank Pay"] [--dry-run]
// Refuses a non-empty <dir>. Needs network for npm. Pure Node 18+, no dependencies.
import { spawnSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkTarget, DEV_PACKAGES, pinTypescript } from './new-crm.mjs';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(SCRIPTS, '..', 'templates', 'mbank-webview');
const ADD_UI = join(SCRIPTS, 'add-ui.mjs');

// react-new-project (Vite) whitelist: router, query, zod, i18n, error boundary; kit primitives need
// radix-ui, cva, clsx, tailwind-merge, tw-animate-css and the Geist font of the shadcn tokens.
export const PACKAGES = [
  'tailwindcss', '@tailwindcss/vite', '@tanstack/react-query', '@tanstack/react-router', 'zod',
  'react-error-boundary', 'i18next', 'react-i18next',
  'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tw-animate-css', '@fontsource-variable/geist',
];
// Kit items the template uses, copied into src/shared (tokens → src/styles/mbank-tokens.css).
export const KIT = ['tokens', 'utils', 'spinner', 'button', 'card', 'skeleton'];
const REMOVE = ['src/App.tsx', 'src/App.css', 'src/assets'];
export const VIEWPORT = 'width=device-width, initial-scale=1, viewport-fit=cover';

export function parseArgs(argv) {
  const opts = { dir: null, name: 'Mbank WebView', dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--name' || arg.startsWith('--name=')) {
      const value = arg.includes('=') ? arg.slice('--name='.length) : argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--name needs a value');
      opts.name = value;
    } else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else if (opts.dir) throw new Error(`One directory only (got "${opts.dir}" and "${arg}")`);
    else opts.dir = arg;
  }
  if (!opts.help && !opts.dir) throw new Error('Name the project directory: node new-webview.mjs <dir>');
  return opts;
}

/** The ordered steps; each is a shell command or a local action. Pure: used by --dry-run and tests. */
export function planSteps(opts) {
  const dir = resolve(opts.dir);
  const cmd = (title, command, args, cwd = dir) => ({ title, kind: 'cmd', command, args, cwd });
  const act = (title, fn) => ({ title, kind: 'act', fn });
  return [
    cmd('Create the Vite app (ESLint, no prompts)', 'npx',
      ['-y', 'create-vite@latest', basename(dir), '--template', 'react-ts', '--eslint', '--no-interactive', '--no-immediate'],
      dirname(dir)),
    act('Keep TypeScript in the range typescript-eslint supports', () => pinTypescript(dir)),
    cmd('Install packages', 'npm', ['install', ...PACKAGES]),
    cmd('Install dev packages', 'npm', ['install', '-D', ...DEV_PACKAGES]),
    cmd('Add shadcn tokens and kit primitives', process.execPath, [ADD_UI, ...KIT, '--cwd', dir]),
    act('Copy templates/mbank-webview (bridge, i18n, screens, mocks, tests, configs)', () => copyTemplate(dir)),
    act('Set the name, lang, WebView viewport and npm scripts', () => patchProject(dir, opts.name)),
    cmd('Generate the MSW worker in public/', 'npx', ['-y', 'msw', 'init', 'public', '--save']),
  ];
}

function copyTemplate(dir) {
  for (const path of REMOVE) rmSync(join(dir, path), { recursive: true, force: true });
  cpSync(TEMPLATE, dir, { recursive: true, force: true });
}

/** index.html for a WebView: Russian, the title, viewport-fit=cover for safe areas. Pure: used by tests. */
export function patchHtml(html, name) {
  return html
    .replace(/<html lang="[^"]*">/, '<html lang="ru">')
    .replace(/<title>[^<]*<\/title>/, `<title>${name.replace(/[<&]/g, '')}</title>`)
    .replace(/<meta name="viewport" content="[^"]*"\s*\/?>/, `<meta name="viewport" content="${VIEWPORT}" />`)
    .replace('</head>', '    <meta name="format-detection" content="telephone=no" />\n  </head>');
}

function patchProject(dir, name) {
  const html = join(dir, 'index.html');
  writeFileSync(html, patchHtml(readFileSync(html, 'utf8'), name));
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.scripts = {
    ...pkg.scripts,
    // --host: the phone on the same Wi-Fi opens http://<computer-ip>:5173 in the app's dev WebView.
    dev: 'vite --host',
    typecheck: 'tsc -b',
    test: 'vitest run',
    'test:watch': 'vitest',
  };
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
  npm run dev          # http://localhost:5173 — fake app (⚙ panel) + mock API; ?bridge=none|silent|expired, ?mock=error
  npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm test && npm run build
Then: pages from the kit (skill mbank-webview), the real bridge names in src/shared/bridge/transports.ts, the real API instead of src/mocks.`);
  return steps;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n'));
    else run(opts);
  } catch (error) {
    console.error(`new-webview: ${error.message}`);
    process.exit(1);
  }
}
