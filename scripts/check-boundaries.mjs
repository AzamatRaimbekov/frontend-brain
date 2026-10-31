#!/usr/bin/env node
// Plugin boundaries (docs/architecture.md): a file inside plugins/<name>/ must not reach another plugin
// through a relative path, because installed plugins live in separate versioned cache folders.
// Usage: node scripts/check-boundaries.mjs [--json]   (exit 1 on violations)
// Mentions by skill name (`frontend-pack:mbank-ui`) are allowed; paths like ../figma-pack/... are not.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEXT = /\.(md|mjs|js|cjs|json|ya?ml|ts|tsx|css)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
// ../ chains followed by a path segment; stops at quotes, brackets, spaces and markdown/template delimiters.
const REL = /(?:\.\.\/)+[\w@.-][^\s)'"`\]<>,;]*/g;

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, out);
    else if (TEXT.test(name)) out.push(path);
  }
  return out;
}

export function checkBoundaries(root = ROOT) {
  const pluginsDir = join(root, 'plugins');
  const plugins = readdirSync(pluginsDir).filter((n) => existsSync(join(pluginsDir, n, '.claude-plugin', 'plugin.json')));
  const violations = [];
  for (const plugin of plugins) {
    const pluginRoot = join(pluginsDir, plugin);
    for (const file of files(pluginRoot)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        // Paths built in code or relative to the plugin root: '..', 'figma-pack' and ../figma-pack/ anywhere.
        for (const other of plugins.filter((p) => p !== plugin)) {
          const named = new RegExp(`(?:\\.\\./|'\\.\\.',\\s*')${other}\\b`);
          if (named.test(line)) violations.push({ plugin, file: relative(root, file), line: i + 1, ref: line.trim().slice(0, 120), target: other });
        }
        for (const [ref] of line.matchAll(REL)) {
          if (plugins.some((p) => p !== plugin && ref.includes(`../${p}`))) continue; // reported above
          const target = resolve(dirname(file), ref.replace(/#.*$/, ''));
          if (target === pluginRoot || target.startsWith(pluginRoot + sep)) continue;
          const inRepo = relative(pluginsDir, target);
          const other = inRepo.startsWith('..') ? '(outside plugins/)' : inRepo.split(sep)[0];
          violations.push({ plugin, file: relative(root, file), line: i + 1, ref, target: other });
        }
      });
    }
  }
  return violations;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const violations = checkBoundaries();
  if (process.argv.includes('--json')) console.log(JSON.stringify(violations, null, 2));
  else if (!violations.length) console.log('ok: no plugin reaches into another plugin by a relative path');
  else {
    for (const v of violations) console.log(`${v.file}:${v.line}  ${v.ref}  -> ${v.target}`);
    console.log(`\n${violations.length} boundary violation(s); see docs/architecture.md`);
  }
  process.exit(violations.length ? 1 : 0);
}
