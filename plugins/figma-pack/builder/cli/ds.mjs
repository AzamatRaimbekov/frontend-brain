#!/usr/bin/env node
// ds — tokens and specs from the terminal (used by Claude skills and CI).
import { readFileSync, writeFileSync } from 'node:fs';
import { generateTokens, validateTokens, contrastReport } from '../core/tokens.js';
import { toShadcnCss } from '../core/css.js';
import { validateSpec, framePlan } from '../core/spec.js';

const [, , area, cmd, ...rest] = process.argv;
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('-')) flags[rest[i].replace(/^-+/, '')] = rest[i + 1]?.startsWith('-') || rest[i + 1] == null ? true : rest[++i];
  else args.push(rest[i]);
}
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const out = (text) => (flags.o ? (writeFileSync(flags.o, text), console.error(`-> ${flags.o}`)) : process.stdout.write(text));
const fail = (msg) => { console.error(msg); process.exit(1); };

const HELP = `ds tokens new --name <project> --brand <#hex> [--neutral neutral|zinc|slate|stone|gray|tinted] [--font "Inter"] [--radius 10] [-o tokens.json]
ds tokens css <tokens.json> [-o globals.css]
ds tokens check <tokens.json>
ds spec check <spec.json>`;

function checkTokens(t) {
  const errors = validateTokens(t);
  if (errors.length) fail(`tokens invalid:\n  ${errors.join('\n  ')}`);
  const bad = contrastReport(t).filter((r) => !r.ok);
  for (const r of bad) console.error(`contrast ${r.mode}: ${r.fg} on ${r.bg} = ${r.ratio} (< ${r.min})`);
  return bad.length;
}

if (area === 'tokens' && cmd === 'new') {
  if (!flags.brand) fail('--brand #hex is required');
  const t = generateTokens({ name: flags.name, brand: flags.brand, neutral: flags.neutral, font: flags.font, radius: flags.radius });
  checkTokens(t);
  out(`${JSON.stringify(t, null, 2)}\n`);
} else if (area === 'tokens' && cmd === 'css') {
  const t = read(args[0]);
  checkTokens(t);
  out(toShadcnCss(t));
} else if (area === 'tokens' && cmd === 'check') {
  const bad = checkTokens(read(args[0]));
  console.log(bad ? `${bad} contrast problem(s)` : 'ok: tokens valid, contrast AA in both themes');
  process.exit(bad ? 1 : 0);
} else if (area === 'spec' && cmd === 'check') {
  const spec = read(args[0]);
  const errors = validateSpec(spec);
  if (errors.length) fail(`spec invalid:\n  ${errors.join('\n  ')}`);
  const plan = framePlan(spec);
  console.log(`ok: ${spec.screens.length} screens -> ${plan.length} frames`);
  for (const f of plan) console.log(`  ${f.page} / ${f.name}`);
} else {
  console.log(HELP);
  process.exit(area ? 1 : 0);
}
