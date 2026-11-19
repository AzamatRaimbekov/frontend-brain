#!/usr/bin/env node
// PreToolUse hook: a new page file cannot be created until its UX brief exists.
// Vite:    src/pages/<route>/<Name>Page.tsx  needs  src/pages/<route>/UX.md
// Next.js: src/app/**/page.tsx               needs  UX.md in the same folder
// Disable per project with MDIGITAL_UX_BRIEF=off.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

if (process.env.MDIGITAL_UX_BRIEF === 'off') process.exit(0);

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const file = payload?.tool_input?.file_path;
if (payload?.tool_name !== 'Write' || !file || existsSync(file)) process.exit(0); // only new files

const normalized = file.replace(/\\/g, '/');
const isVitePage = /\/src\/pages\/.+\.(t|j)sx$/.test(normalized);
const isNextPage = /\/(src\/)?app\/(.+\/)?page\.(t|j)sx$/.test(normalized);
if (!isVitePage && !isNextPage) process.exit(0);

const brief = join(dirname(file), 'UX.md');
if (existsSync(brief)) process.exit(0);

process.stderr.write(
  `Blocked: ${basename(file)} is a new page, but ${brief} does not exist. ` +
    'Follow the react-page-ux skill: write that UX.md first. Pipeline vibe (default): 5 lines - goal, primary action, ' +
    'blocks, states, mobile - and create the page right away without waiting. Team mode: the full brief, shown to the user.\n',
);
process.exit(2);
