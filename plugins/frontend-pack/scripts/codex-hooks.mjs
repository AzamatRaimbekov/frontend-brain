#!/usr/bin/env node
// Translate Codex apply_patch events for the existing Claude hook checks.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const phase = process.argv[2];
if (!['pre', 'post'].includes(phase)) process.exit(1);

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
if (payload?.tool_name !== 'apply_patch') process.exit(0);
const patch = payload?.tool_input?.command;
if (typeof patch !== 'string') process.exit(0);

const cwd = payload.cwd ?? process.cwd();
const changes = [];
let current;
for (const line of patch.split('\n')) {
  const header = line.match(/^\*\*\* (Add|Update|Delete) File: (.+)$/);
  if (header) {
    current = { kind: header[1], file: resolve(cwd, header[2]), added: [], removed: [] };
    changes.push(current);
  } else if (current && line.startsWith('*** Move to: ')) {
    current.file = resolve(cwd, line.slice('*** Move to: '.length));
    current.moved = true;
  } else if (line === '*** End Patch') {
    current = undefined;
  } else if (current && line.startsWith('+')) {
    current.added.push(line.slice(1));
  } else if (current && line.startsWith('-')) {
    current.removed.push(line.slice(1));
  }
}

const scripts = dirname(fileURLToPath(import.meta.url));
const addedFiles = new Set(changes.filter((c) => c.kind === 'Add').map((c) => c.file));
let status = 0;
for (const change of changes) {
  if (change.kind === 'Delete') continue;
  let script;
  let input;
  let args = [];
  if (phase === 'pre') {
    if (change.kind !== 'Add' && !change.moved) continue;
    // A patch may create the brief and its page together.
    if (addedFiles.has(join(dirname(change.file), 'UX.md'))) continue;
    script = 'check-ux-brief.mjs';
    input = { tool_name: 'Write', tool_input: { file_path: change.file } };
  } else {
    script = 'check-file-size.mjs';
    args = ['--hook'];
    const asText = (lines) => lines.length ? `${lines.join('\n')}\n` : '';
    input = {
      tool_name: change.kind === 'Add' ? 'Write' : 'Edit',
      tool_input: {
        file_path: change.file,
        old_string: asText(change.removed),
        new_string: asText(change.added),
      },
    };
  }
  const result = spawnSync(process.execPath, [join(scripts, script), ...args], {
    input: JSON.stringify(input), encoding: 'utf8', cwd,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    process.stderr.write(`Frontend hook failed: ${result.error.message}\n`);
    status = Math.max(status, 1);
  } else if (result.status !== 0) {
    status = Math.max(status, result.status ?? 1);
  }
}
process.exit(status);
