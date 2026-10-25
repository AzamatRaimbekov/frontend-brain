#!/usr/bin/env node
// Copies Mbank UI kit components and CRM blocks (plugins/frontend-pack/registry/mbank) into a React project.
// Usage: node add-ui.mjs <name...|all|blocks> [--dir src/shared/ui] [--components-dir src/shared/components]
//        [--blocks-dir src/shared/components/crm] [--lib-dir src/shared/lib] [--tokens src/styles/mbank-tokens.css]
//        [--cwd .] [--dry-run] [--force]
//        node add-ui.mjs --list   ("all" = every kit item and block, "blocks" = every block)
// Never overwrites an existing file without --force. Pure Node 18+, no dependencies.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'registry', 'mbank');
const DEFAULTS = {
  dir: 'src/shared/ui',
  'components-dir': 'src/shared/components',
  'blocks-dir': 'src/shared/components/crm',
  'lib-dir': 'src/shared/lib',
  tokens: 'src/styles/mbank-tokens.css',
  cwd: '.',
};
const CSS_ENTRIES = ['src/index.css', 'src/app/globals.css', 'app/globals.css', 'src/styles/globals.css'];

export function parseArgs(argv) {
  const opts = { ...DEFAULTS, names: [], dryRun: false, force: false, list: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split('=', 2);
      if (!(key in DEFAULTS)) throw new Error(`Unknown option --${key}`);
      const value = inline ?? argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`--${key} needs a value`);
      opts[key] = value;
    } else opts.names.push(arg);
  }
  return opts;
}

export function loadRegistry(dir = REGISTRY_DIR) {
  const registry = JSON.parse(readFileSync(join(dir, 'registry.json'), 'utf8'));
  return new Map(registry.items.map((item) => [item.name, item]));
}

/** Requested items plus their registryDependencies, dependencies first. */
export function resolveItems(names, items) {
  const order = [];
  const seen = new Set();
  const visit = (name, from) => {
    const item = items.get(name);
    if (!item) throw new Error(`Unknown item "${name}"${from ? ` (required by ${from})` : ''}. Run with --list.`);
    if (seen.has(name)) return;
    seen.add(name);
    for (const dep of item.registryDependencies ?? []) visit(dep, name);
    order.push(item);
  };
  const blocks = [...items.values()].filter(isBlock).map((item) => item.name);
  const wanted = names.flatMap((name) => (name === 'all' ? [...items.keys()] : name === 'blocks' ? blocks : [name]));
  for (const name of wanted) visit(name);
  return order;
}

export const isBlock = (item) => item.type === 'registry:block';

function targetPath(file, opts, root) {
  const name = basename(file.path);
  if (file.target === 'tokens') return resolve(root, opts.tokens);
  const dir = { ui: opts.dir, components: opts['components-dir'], blocks: opts['blocks-dir'], lib: opts['lib-dir'] }[file.target];
  if (!dir) throw new Error(`Unknown target "${file.target}" for ${file.path}`);
  return resolve(root, dir, name);
}

function projectDependencies(root) {
  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
}

function importPath(fromDir, file) {
  const rel = relative(fromDir, file).split(sep).join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

// shadcn init writes :root/.dark/@theme inline after the imports; they override mbank-tokens.css.
const SHADCN_THEME = /--primary\s*:|oklch\(|@theme\s+inline/;

export function cssImportHint(root, tokensFile) {
  const entry = CSS_ENTRIES.map((p) => join(root, p)).find((p) => existsSync(p));
  if (!entry) {
    const rel = importPath(join(root, 'src'), tokensFile);
    return `No global CSS found (${CSS_ENTRIES.join(', ')}). In your global CSS (paths relative to src/):\n` +
      `@import "tailwindcss";\n@import "tw-animate-css";\n@import "${rel}";`;
  }
  const text = readFileSync(entry, 'utf8');
  const where = relative(root, entry);
  const lines = [];
  if (text.includes(basename(tokensFile))) lines.push(`${where} already imports ${basename(tokensFile)}.`);
  else {
    const anim = text.includes('tw-animate-css') ? '' : '@import "tw-animate-css";\n';
    lines.push(`Add to ${where} after @import "tailwindcss":\n${anim}@import "${importPath(dirname(entry), tokensFile)}";`);
  }
  if (SHADCN_THEME.test(text)) {
    lines.push(`WARNING: ${where} still has a shadcn theme (--primary / oklch( / @theme inline). It overrides the Mbank tokens.`,
      'Delete the :root, .dark, @theme inline, @custom-variant dark and @layer base blocks; keep only the imports.');
  }
  return lines.join('\n');
}

export function run(opts, log = console.log) {
  const items = loadRegistry();
  if (opts.list) {
    const all = [...items.values()];
    for (const item of all.filter((i) => !isBlock(i))) log(`${item.name.padEnd(18)} ${item.description}`);
    log('\nBlocks (CRM / admin, installed into --blocks-dir; "blocks" installs all):');
    for (const item of all.filter(isBlock)) log(`${item.name.padEnd(18)} ${item.description}`);
    return { written: [], skipped: [], missing: [] };
  }
  if (opts.names.length === 0) throw new Error('Name at least one item (or "all"). Run with --list.');
  const root = resolve(opts.cwd);
  const plan = resolveItems(opts.names, items);
  const written = [];
  const skipped = [];
  const prefix = opts.dryRun ? '[dry-run] ' : '';

  for (const item of plan) {
    for (const file of item.files) {
      const dest = targetPath(file, opts, root);
      const shown = relative(root, dest);
      if (existsSync(dest) && !opts.force) {
        skipped.push(shown);
        log(`${prefix}skip   ${shown} (exists; --force to overwrite)`);
        continue;
      }
      const verb = existsSync(dest) ? 'over' : 'write';
      log(`${prefix}${verb.padEnd(6)} ${shown}`);
      written.push(shown);
      if (!opts.dryRun) {
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, readFileSync(join(REGISTRY_DIR, file.path)));
      }
    }
  }

  const deps = [...new Set(plan.flatMap((item) => item.dependencies ?? []))].sort();
  const have = projectDependencies(root);
  const missing = have ? deps.filter((d) => !have.has(d)) : deps;
  log('');
  log(missing.length ? `Install missing packages:\nnpm install ${missing.join(' ')}` : 'All npm dependencies are already in package.json.');
  log('');
  log(cssImportHint(root, resolve(root, opts.tokens)));

  const utils = resolve(root, opts['lib-dir'], 'utils.ts');
  if (skipped.includes(relative(root, utils)) && !readFileSync(utils, 'utf8').includes('caption')) {
    log('\nNote: your utils.ts keeps plain tailwind-merge. Use registry/mbank/lib/utils.ts (extendTailwindMerge)');
    log('so text-2xs / text-caption / text-md are not dropped next to text-<color> classes.');
  }
  if (plan.some(isBlock) && opts.dir !== DEFAULTS.dir)
    log(`\nNote: blocks import kit components from "@/shared/ui/*". With --dir ${opts.dir} fix those imports.`);
  log('\nImports use "@/shared/lib/utils": make sure tsconfig paths and the bundler alias map "@/" to src/.');
  return { written, skipped, missing };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n'));
    else run(opts);
  } catch (error) {
    console.error(`add-ui: ${error.message}`);
    process.exit(1);
  }
}
