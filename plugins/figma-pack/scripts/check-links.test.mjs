// Verifies that every relative Markdown link inside plugins/figma-pack resolves to an existing file.
// Usage: node --test plugins/figma-pack/scripts/check-links.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');

function markdownFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) markdownFiles(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

test('figma-pack has markdown files to check', () => {
  assert.ok(markdownFiles(PLUGIN).length > 10);
});

test('relative links inside figma-pack resolve', () => {
  const broken = [];
  for (const file of markdownFiles(PLUGIN)) {
    const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:, skill:
      if (!existsSync(join(dirname(file), decodeURIComponent(target)))) broken.push(`${relative(PLUGIN, file)} -> ${target}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('skill folders have SKILL.md with matching name', () => {
  for (const skill of readdirSync(join(PLUGIN, 'skills'))) {
    const text = readFileSync(join(PLUGIN, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^---\\n(.*\\n)*?name: ${skill}\\n`), `${skill}: name`);
  }
});
