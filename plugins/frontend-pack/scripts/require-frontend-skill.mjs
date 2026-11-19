#!/usr/bin/env node
// PreToolUse hook: no frontend code is written past the brain. In a React/Next/Vite project a .tsx/.jsx/.css
// file (or a .ts file under src/) can be written only after the session loaded a frontend-pack skill, so the
// team's architecture, UI kit and rules apply instead of the model's habits. Off: MDIGITAL_SKILL_GATE=off.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';

if (process.env.MDIGITAL_SKILL_GATE === 'off') process.exit(0);

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
// A new frontend project started from a bare CLI skips the team's scaffold, so the CLI is gated too.
const SCAFFOLD = /\b(npm|pnpm|yarn|bun)\s+(create|init)\s+(vite|next-app|react-app|@vitejs|astro|remix)|\bnpx\s+(create-(vite|next-app|react-app)|shadcn(@[\w.-]+)?\s+(init|create))|\bcreate-(vite|next-app|react-app)\b/;
const tool = payload?.tool_name;
let file = '';
if (tool === 'Bash') {
  if (!SCAFFOLD.test(String(payload?.tool_input?.command ?? ''))) process.exit(0);
} else if (['Write', 'Edit', 'MultiEdit'].includes(tool)) {
  file = String(payload?.tool_input?.file_path ?? '').replace(/\\/g, '/');
  if (!file) process.exit(0);
  const ext = extname(file);
  const isUi = ['.tsx', '.jsx', '.css', '.scss'].includes(ext) || (['.ts', '.js'].includes(ext) && /\/src\//.test(file));
  if (!isUi || /\.(test|spec|stories|d)\.[jt]sx?$/.test(file) || /\/node_modules\//.test(file)) process.exit(0);
} else process.exit(0);

// The nearest package.json above the file decides: a React, Next or Vite app is frontend.
// .tsx/.jsx with no package.json above is a React project being born: gated too.
function frontendProject(start) {
  if (!file) return true; // scaffold command
  const jsx = /\.[jt]sx$/.test(file);
  for (let dir = start, i = 0; i < 12; i += 1, dir = dirname(dir)) {
    const pkg = join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        const { dependencies = {}, devDependencies = {} } = JSON.parse(readFileSync(pkg, 'utf8'));
        return ['react', 'next', 'vite'].some((name) => name in dependencies || name in devDependencies);
      } catch {
        return false;
      }
    }
    if (dirname(dir) === dir) break;
  }
  return jsx;
}
if (!frontendProject(dirname(file))) process.exit(0);

// frontend-pack agents run inside the pipeline already.
if (String(payload?.agent_type ?? '').startsWith('frontend-pack:')) process.exit(0);

// Loaded = a Skill call or a /frontend-pack:… command in this transcript (or the parent session of a subagent).
const LOADED = /"skill"\s*:\s*"frontend-pack:[\w-]+"|<command-name>\/?frontend-pack:|\/frontend-pack\/skills\/[\w-]+\/SKILL\.md/;
function loaded(path) {
  try {
    return LOADED.test(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
const transcript = String(payload?.transcript_path ?? '');
if (!transcript) process.exit(0);
const own = loaded(transcript);
if (own === null) process.exit(0); // no transcript to read: never block blind
const parent = /\/subagents\//.test(transcript) ? loaded(transcript.replace(/\/subagents\/.*$/, '.jsonl')) : false;
if (own || parent) process.exit(0);

process.stderr.write(
  `Blocked: ${file ? basename(file) : 'creating a frontend project'} is frontend work, but the frontend brain is not loaded in this session. ` +
    'Call the Skill tool with skill "frontend-pack:frontend" first, announce its route line and build by its rules ' +
    '(project structure from react-architecture, UI from react-ui / shadcn / the Mbank kit, ui-copy, 150-line files). ' +
    'A new project follows react-new-project (or mbank-crm new-crm.mjs). Then repeat this step.\n',
);
process.exit(2);
