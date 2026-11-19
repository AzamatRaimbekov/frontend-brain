#!/usr/bin/env node
// ds — tokens and specs from the terminal (used by Claude skills and CI).
import { readFileSync, writeFileSync } from 'node:fs';
import { validateTokens, contrastReport } from '../core/tokens.js';
import { toShadcnCss } from '../core/css.js';
import { validateSpec, framePlan, normalizeSpec } from '../core/spec.js';
import { resolveLinks, validateLinks } from '../core/links.js';

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

const HELP = `ds tokens css [tokens.json] [-o globals.css]   (default: the canonical shadcn-tokens.json)
ds tokens check [tokens.json]
ds spec check <spec.json>`;

// t: a tokens file in the canonical shape (shadcn/tokens@1); undefined = the canonical file itself.
function checkTokens(t) {
  const errors = t ? validateTokens(t) : [];
  if (errors.length) fail(`tokens invalid:\n  ${errors.join('\n  ')}`);
  const bad = contrastReport(t).filter((r) => !r.ok);
  for (const r of bad) console.error(`contrast ${r.mode}: ${r.fg} on ${r.bg} = ${r.ratio} (< ${r.min})`);
  return bad.length;
}

if (area === 'tokens' && cmd === 'css') {
  const t = args[0] ? read(args[0]) : undefined;
  if (t) checkTokens(t);
  out(toShadcnCss(t));
} else if (area === 'tokens' && cmd === 'check') {
  const bad = checkTokens(args[0] ? read(args[0]) : undefined);
  console.log(bad ? `${bad} contrast problem(s)` : 'ok: tokens valid, contrast AA in both themes');
  process.exit(bad ? 1 : 0);
} else if (area === 'spec' && cmd === 'check') {
  const spec = read(args[0]);
  const errors = [...validateSpec(spec), ...validateLinks(spec)];
  if (errors.length) fail(`spec invalid:\n  ${errors.join('\n  ')}`);
  const plan = framePlan(spec);
  console.log(`ok: ${spec.screens.length} screens -> ${plan.length} frames`);
  for (const f of plan) console.log(`  ${f.page} / ${f.name}`);
  // Prototype: links and screens no click reaches from the first screen.
  const links = resolveLinks(normalizeSpec(spec));
  const seen = new Set([spec.screens[0].id]);
  for (const id of seen) for (const l of links) if (l.from === id) seen.add(l.to);
  const lost = spec.screens.filter((s) => !seen.has(s.id)).map((s) => s.id);
  console.log(`links: ${links.length}${lost.length ? `; unreachable from ${spec.screens[0].id}: ${lost.join(', ')}` : ''}`);
} else {
  console.log(HELP);
  process.exit(area ? 1 : 0);
}
