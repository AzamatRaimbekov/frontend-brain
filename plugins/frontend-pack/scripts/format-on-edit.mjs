#!/usr/bin/env node
// Formats the file the agent just wrote with the project's own Prettier (config + .prettierignore),
// so code is always written in the team style (templates/*/.prettierrc.json), not only after `npm run format`.
// Used by lint-on-edit.mjs before ESLint (one hook: no race between the formatter and the linter);
// also runs alone: `node format-on-edit.mjs <file>` or as a hook with the tool payload on stdin.
// Runs only when the project has a Prettier config and a local node_modules/.bin/prettier.
// Quiet on success; never blocks work. Disable per project with MDIGITAL_FORMAT_HOOK=off.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const FORMAT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.md', '.html', '.yml', '.yaml']);
const SKIP = [/[\\/]node_modules[\\/]/, /[\\/](dist|build|\.next|coverage)[\\/]/, /routeTree\.gen\.ts$/, /\.d\.ts$/];
const CONFIG = /^(\.prettierrc(\.(json|ya?ml|json5|js|cjs|mjs|toml))?|prettier\.config\.(js|cjs|mjs|ts))$/;

function hasPrettierKey(dir) {
  try {
    return 'prettier' in JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  } catch {
    return false;
  }
}

/** Nearest folder with a Prettier config (file or "prettier" in package.json), or null. */
export function findPrettierRoot(start) {
  for (let dir = start; ; dir = dirname(dir)) {
    if (readdirSync(dir).some((name) => CONFIG.test(name)) || hasPrettierKey(dir)) return dir;
    if (dirname(dir) === dir) return null;
  }
}

/** Formats one file in place; returns 'formatted' | 'skipped' | 'failed'. Never throws. */
export function formatFile(file) {
  if (process.env.MDIGITAL_FORMAT_HOOK === 'off') return 'skipped';
  if (!file || !FORMAT_EXTENSIONS.has(extname(file)) || SKIP.some((re) => re.test(file)) || !existsSync(file)) return 'skipped';
  const root = findPrettierRoot(dirname(file));
  if (!root) return 'skipped';
  const bin = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'prettier.cmd' : 'prettier');
  if (!existsSync(bin)) return 'skipped'; // dependencies not installed yet
  const result = spawnSync(bin, ['--write', '--ignore-unknown', '--log-level', 'warn', file], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30_000,
    shell: process.platform === 'win32',
  });
  return result.error || result.status !== 0 ? 'failed' : 'formatted';
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let file = process.argv[2];
  if (!file) {
    try {
      file = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.file_path;
    } catch {
      process.exit(0);
    }
  }
  formatFile(file);
  process.exit(0); // a syntax error is reported by ESLint / tsc, not by the formatter
}
