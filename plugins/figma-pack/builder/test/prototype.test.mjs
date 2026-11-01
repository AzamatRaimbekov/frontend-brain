// Links between screens and the Figma prototype: section pages + the «Прототип» page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { normalizeSpec, validateSpec } from '../core/spec.js';
import { resolveLinks, parseAction, actionLabel, validateLinks } from '../core/links.js';

const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
const clone = (x) => JSON.parse(JSON.stringify(x));
const to = (links, from, on) => links.find((l) => l.from === from && l.on === on)?.to;

async function build(opts = {}, s = spec) {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t)));
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { vars, radius } = await brand.modeVars();
  const { buildSpec } = await import('../plugin/src/screens.js');
  const run = (o) => buildSpec(s, { vars, radius, kit: {}, font: 'Inter', ...o });
  return { ...m, run, res: await run(opts) };
}

const page = (m, name) => m.figma.root.children.find((p) => p.name === name);
const tagged = (frame, key) => frame.findAll((n) => n.getPluginData('mbank-link') === key);
const dest = (node) => node.reactions[0]?.actions[0]?.destinationId;
const protoFrames = (m) => page(m, 'Прототип').children.filter((n) => n.type === 'FRAME');

test('action syntax: "→ id" target, label without "+" and arrow', () => {
  assert.deepEqual(parseAction('+ Новый клиент → client-new'), { label: '+ Новый клиент', to: 'client-new' });
  assert.deepEqual(parseAction('Экспорт'), { label: 'Экспорт', to: null });
  assert.deepEqual(parseAction({ label: 'Конвейер', to: 'pipeline' }), { label: 'Конвейер', to: 'pipeline' });
  assert.equal(actionLabel('+ Новая заявка -> app-new'), 'Новая заявка');
});

test('links derived from nav, rows, actions, breadcrumbs, forms and login; explicit links win', () => {
  const links = resolveLinks(normalizeSpec(spec));
  assert.equal(to(links, 'login', 'submit'), 'dashboard', 'login -> first nav screen');
  assert.equal(to(links, 'app-card', 'nav:clients'), 'clients', 'nav item -> first screen of that nav');
  assert.equal(to(links, 'apps', 'nav:apps'), undefined, 'no link to itself');
  assert.equal(to(links, 'apps', 'row:app-card'), 'app-card', 'table rows -> block link');
  assert.equal(to(links, 'pipeline', 'row:app-card'), 'app-card', 'kanban cards -> block link');
  assert.equal(to(links, 'apps', 'action:Конвейер'), 'pipeline');
  assert.equal(to(links, 'clients', 'action:Новый клиент'), 'client-new');
  assert.equal(to(links, 'app-card', 'back'), 'apps', 'breadcrumbs -> list of the same nav');
  assert.equal(to(links, 'client-new', 'submit'), 'clients');
  assert.equal(to(links, 'client-new', 'cancel'), 'clients');
  assert.equal(to(links, 'dashboard', 'text:Экспорт'), 'reports', 'explicit link by visible text');

  // "+" action without a target -> the only form screen of the same nav.
  const s = clone(spec);
  s.screens.find((x) => x.id === 'clients').blocks[0].actions = ['+ Новый клиент'];
  assert.equal(to(resolveLinks(normalizeSpec(s)), 'clients', 'action:Новый клиент'), 'client-new');
});

test('page defaults to the nav section, explicit page stays', () => {
  const n = normalizeSpec(spec);
  assert.equal(n.screens.find((s) => s.id === 'pipeline').page, 'Заявки');
  assert.equal(n.screens.find((s) => s.id === 'login').page, 'Вход');
  assert.equal(n.screens.find((s) => s.id === 'clients').page, 'Клиенты');
});

test('validator rejects links to unknown screens', () => {
  assert.deepEqual([...validateSpec(spec), ...validateLinks(spec)], []);
  const s = clone(spec);
  s.links.push({ from: 'apps', on: 'Экспорт', to: 'nowhere' }, { from: 'ghost', on: 'x', to: 'apps' }, { from: 'apps', to: 'apps' });
  s.screens.find((x) => x.id === 'apps').blocks[3].link = 'app-cart';
  s.screens.find((x) => x.id === 'clients').blocks[0].actions = ['+ Новый клиент → client-neww'];
  s.screens.find((x) => x.id === 'client-new').blocks[1].to = 'client';
  const errors = validateLinks(s).join('\n');
  assert.deepEqual(validateSpec(s), [], 'the core validator stays link-free');
  for (const bad of ['"nowhere"', '"ghost"', '"app-cart"', '"client-neww"', '"client"']) assert.match(errors, new RegExp(`unknown screen ${bad}`));
  assert.match(errors, /links\[3\]\.on: required/);
});

test('«Прототип» page: one frame per screen per flow, reactions to frames on the same page, flows start at login', async () => {
  const { figma, res } = await build();
  const n = normalizeSpec(spec);
  const frames = protoFrames({ figma });
  const desktop = n.screens.filter((s) => s.viewports.includes('desktop'));
  const mobile = n.screens.filter((s) => s.viewports.includes('mobile'));
  assert.equal(frames.length, desktop.length + mobile.length, 'pipeline is desktop-only');
  assert.equal(res.prototype.frames.length, frames.length);
  assert.deepEqual(res.prototype.missing, []);
  const ids = new Set(frames.map((f) => f.id));
  let wired = 0;
  for (const f of frames) for (const node of f.findAll((x) => x.reactions.length)) {
    assert.ok(ids.has(dest(node)), `${f.name}/${node.name} -> a frame on the prototype page`);
    assert.equal(node.reactions[0].trigger.type, 'ON_CLICK');
    assert.equal(node.reactions[0].actions[0].navigation, 'NAVIGATE');
    wired++;
  }
  assert.equal(wired, res.prototype.wired);
  const byKey = (vp) => Object.fromEntries(frames.filter((f) => f.getPluginData('mbank-screen').endsWith(`|${vp}`)).map((f) => [f.getPluginData('mbank-screen').split('|')[1], f]));
  const d = byKey('desktop');
  assert.equal(dest(tagged(d.apps, 'row:app-card')[0]), d['app-card'].id, 'table row -> card');
  assert.equal(tagged(d.apps, 'row:app-card').length, 8, 'every row');
  assert.equal(dest(tagged(d.pipeline, 'row:app-card')[0]), d['app-card'].id, 'kanban card -> card');
  assert.equal(dest(tagged(d['app-card'], 'nav:apps')[0]), d.apps.id, 'sidebar item');
  assert.equal(dest(tagged(d['app-card'], 'back')[0]), d.apps.id, 'breadcrumbs');
  assert.equal(dest(tagged(d.clients, 'action:Новый клиент')[0]), d['client-new'].id, 'primary action');
  assert.equal(dest(tagged(d['client-new'], 'submit')[0]), d.clients.id);
  assert.equal(dest(tagged(d['client-new'], 'cancel')[0]), d.clients.id);
  assert.equal(dest(tagged(d.login, 'submit')[0]), d.dashboard.id);
  assert.equal(dest(d.dashboard.findOne((x) => x.reactions.length && x.findOne?.((t) => t.characters === 'Экспорт'))), d.reports.id, 'explicit link by text');
  const mob = byKey('mobile');
  assert.equal(dest(tagged(mob.apps, 'row:app-card')[0]), mob['app-card'].id, 'mobile list rows');
  const flows = page({ figma }, 'Прототип').flowStartingPoints;
  assert.deepEqual(flows.map((f) => f.name), ['Кредитный конвейер', 'Кредитный конвейер · mobile']);
  assert.equal(flows[0].nodeId, d.login.id);
});

test('section pages link their own default frames; other states stay static', async () => {
  const { figma } = await build();
  const p = page({ figma }, 'Заявки');
  const frames = p.findAll((n) => n.type === 'FRAME' && n.getPluginData('mbank-screen'));
  const get = (id, state, vp) => frames.find((f) => f.getPluginData('mbank-screen') === `Кредитный конвейер|${id}|${state}|${vp}`);
  assert.equal(dest(tagged(get('apps', 'default', 'desktop'), 'row:app-card')[0]), get('app-card', 'default', 'desktop').id);
  assert.equal(dest(tagged(get('apps', 'default', 'mobile'), 'row:app-card')[0]), get('app-card', 'default', 'mobile').id);
  assert.equal(tagged(get('apps', 'loading', 'desktop'), 'row:app-card')[0].reactions.length, 0);
  assert.equal(tagged(get('apps', 'default', 'desktop'), 'nav:clients')[0].reactions.length, 0, 'clients live on another page');
  assert.deepEqual(p.flowStartingPoints.map((f) => f.name), ['Кредитный конвейер · Заявки', 'Кредитный конвейер · Заявки · mobile']);
});

test('rebuild is idempotent: the prototype page and flows are replaced, not duplicated', async () => {
  const b = await build();
  const before = protoFrames(b).length;
  const flows = page(b, 'Прототип').flowStartingPoints.length;
  await b.run({});
  await b.run({ only: ['apps'] });
  assert.equal(protoFrames(b).length, before);
  assert.equal(page(b, 'Прототип').children.filter((n) => n.type === 'TEXT').length, 2 + 2 * 5, 'flow + section labels once');
  assert.equal(page(b, 'Прототип').flowStartingPoints.length, flows);
  assert.equal(page(b, 'Заявки').flowStartingPoints.length, 2);
  const p = page(b, 'Заявки');
  const apps = p.findAll((n) => n.getPluginData('mbank-screen') === 'Кредитный конвейер|apps|default|desktop');
  assert.equal(apps.length, 1);
  const card = p.findAll((n) => n.getPluginData('mbank-screen') === 'Кредитный конвейер|app-card|default|desktop')[0];
  assert.equal(dest(tagged(apps[0], 'row:app-card')[0]), card.id, 'links re-wired after a partial rebuild');
});

test('prototype: false skips links and the page', async () => {
  const { figma, res } = await build({ prototype: false });
  assert.equal(page({ figma }, 'Прототип'), undefined);
  assert.equal(res.prototype, undefined);
});

