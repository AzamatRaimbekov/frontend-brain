// The full credit pipeline CRM (examples/credit-crm.spec.json): every section, block, state and viewport
// builds on the Figma mock, every link has a target, and the new CRM blocks draw what they promise.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { validateSpec, framePlan, normalizeSpec } from '../core/spec.js';
import { validateLinks, resolveLinks } from '../core/links.js';

const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
const types = new Set();
const walk = (blocks) => blocks.forEach((b) => { types.add(b.type); if (b.type === 'split') b.columns.forEach(walk); });
spec.screens.forEach((s) => walk(s.blocks));

test('the CRM covers every section of a credit pipeline and is valid', () => {
  assert.deepEqual([...validateSpec(spec), ...validateLinks(spec)], []);
  const navWithScreens = new Set(spec.screens.map((s) => s.nav).filter(Boolean));
  for (const n of spec.nav) assert.ok(navWithScreens.has(n.id), `section «${n.label}» has a screen`);
  for (const t of ['funnel', 'meters', 'score', 'decision', 'files', 'checks', 'comments', 'profile', 'breakdown']) assert.ok(types.has(t), `uses ${t}`);
  const links = resolveLinks(normalizeSpec(spec));
  const to = (from, on) => links.find((l) => l.from === from && l.on === on)?.to;
  assert.equal(to('dashboard', 'action:Отчёт'), 'reports', 'card header link');
  assert.equal(to('app-card', 'action:Решение'), 'uw-decision');
  assert.equal(to('underwriting', 'row:uw-decision'), 'uw-decision');
  assert.equal(to('client-card', 'row:loan-card'), 'loan-card');
});

test('builds every screen, state and viewport with a clean audit', async () => {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t)));
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { vars, radius } = await brand.modeVars();
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { auditFrames } = await import('../plugin/src/audit.js');
  const res = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', prototype: false });
  assert.equal(res.frames.length, framePlan(spec).length);
  const audit = await auditFrames(res.frames.map((f) => f.id));
  assert.equal(audit.ok, true, JSON.stringify(audit).slice(0, 600));
  const frame = async (screen, vp = 'desktop') => m.figma.getNodeByIdAsync(res.frames.find((f) => f.name === `[draft] ${screen} / default / ${vp === 'desktop' ? 1440 : 375}`).id);
  const d = await frame('Обзор');
  assert.ok(d.findOne((n) => n.name === 'Stage / Выдано'), 'funnel stage');
  assert.ok(d.findOne((n) => n.name === 'Meter / Андеррайтинг'), 'SLA meter');
  assert.equal(d.findAll((n) => n.name.startsWith('Slot / ')).length, 12, 'chart slots with hour labels');
  assert.equal(d.findAll((n) => n.name === 'Nav / Заявки').length, 1);
  assert.equal(d.findAll((n) => n.type === 'TEXT' && n.characters === 'Портфель').length, 1, 'nav group label once');
  const card = await frame('Заявка CL-240118');
  assert.ok(card.findOne((n) => n.name === 'Scale') && card.findOne((n) => n.name === 'Marker'), 'score gauge');
  assert.equal(card.findAll((n) => n.name.startsWith('File / ')).length, 5);
  assert.equal(card.findAll((n) => n.name.startsWith('Check / ')).length, 4);
  // Row alignment: the shorter single card stretches, the taller one keeps its content height.
  const wizard = await frame('Новая заявка');
  const [formCol, sideCol] = wizard.findOne((n) => n.name === 'Split').children;
  assert.notEqual(formCol.layoutSizingVertical, 'FILL', 'the tall form is never squashed to its neighbour');
  assert.equal(sideCol.layoutSizingVertical, 'FILL');
  assert.ok(formCol.height >= sideCol.children[0].height);
  const mob = await frame('Обзор', 'mobile');
  assert.ok(mob.width === 375 && mob.findOne((n) => n.name === 'Stage / Выдано'));
});
