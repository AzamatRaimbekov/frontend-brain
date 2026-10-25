#!/usr/bin/env node
// PostToolUse hook: lint the file the agent just wrote with the project's own ESLint and feed
// the errors back, so the rules in eslint.config.* are enforced on every edit, not only in CI.
// Runs only when the project has eslint.config.* and a local node_modules/.bin/eslint.
// Reports errors only (warnings stay quiet). Disable per project with MDIGITAL_LINT_HOOK=off.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP = [/[\\/]node_modules[\\/]/, /[\\/](dist|build|\.next|coverage)[\\/]/, /routeTree\.gen\.ts$/, /\.d\.ts$/];
const TIMEOUT_MS = 45_000;

if (process.env.MDIGITAL_LINT_HOOK === 'off') process.exit(0);

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
const file = payload?.tool_input?.file_path;
if (!file || !EXTENSIONS.has(extname(file)) || SKIP.some((re) => re.test(file)) || !existsSync(file)) process.exit(0);

// The project root is the nearest folder with an ESLint flat config.
function findRoot(start) {
  for (let dir = start; ; dir = dirname(dir)) {
    if (readdirSync(dir).some((name) => /^eslint\.config\.(js|mjs|cjs|ts|mts|cts)$/.test(name))) return dir;
    if (dirname(dir) === dir) return null;
  }
}
const root = findRoot(dirname(file));
if (!root) process.exit(0);
const bin = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
if (!existsSync(bin)) process.exit(0); // dependencies not installed: nothing to enforce yet

const result = spawnSync(bin, ['--quiet', '--format', 'stylish', file], {
  cwd: root,
  encoding: 'utf8',
  timeout: TIMEOUT_MS,
  shell: process.platform === 'win32',
});
if (result.error || result.status === 0) process.exit(0); // a broken or slow linter never blocks work
// ESLint exits 1 for lint errors and 2 for a config/crash; report both, the second as a setup problem.
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
const rel = relative(root, file);
process.stderr.write(
  result.status === 1
    ? `ESLint found errors in ${rel}. Fix them in this file before moving on; the rules come from the project's ` +
        `eslint.config (react-architecture references/eslint-config.md). If a rule truly does not apply, ` +
        `disable it on that line with // eslint-disable-next-line <rule> -- <reason>.\n\n${output}\n`
    : `ESLint could not lint ${rel} (config or plugin error). Check eslint.config before relying on lint:\n\n${output}\n`,
);
process.exit(2); // exit code 2 feeds stderr back to the agent
