// «Собрать в Figma» for the CRM blocks (contracts/crm-*.json) in a file with the «shadcn» variable
// collection: geometry as the designers drew it, every colour bound to a shadcn variable or reported,
// no variable outside the collection. Nested kit pieces (Badge-status, Avatar) come from a library by key.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { validateContract, partKind, parentOf, tokensUsed, splitToken } from '../core/contract.js';
import { COLOR_TOKENS, RADIUS_KEYS } from '../core/tokens.js';

const dir = new URL('../contracts/', import.meta.url);
const ALL = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const CRM = ALL.filter((c) => c.name.startsWith('crm-'));
const contract = (n) => CRM.find((c) => c.name === n);

// Only the nested component instances are library items (their keys live in the contracts).
function library() {
  const components = CRM.flatMap((c) => Object.values(c.anatomy || {}).filter((a) => a.kind === 'instance').map((a) => ({ key: a.component.key, name: a.component.variant })));
  return { variables: [], styles: [], components };
}

async function crmKit() {
  const m = createFigma({ library: library() });
  await seedKit(m.figma);
  const { renderContract } = await import('../plugin/src/components.js');
  const { contractHandlers } = await import('../plugin/src/contracts.js');
  return { ...m, renderContract, handlers: contractHandlers(CRM) };
}

const varName = (m, ref) => m.vars.get(ref.id).name;
const part = (root, name) => root.findOne((n) => n.name === name);

/** Colour and radius names a contract uses that are not shadcn tokens. */
function foreignTokens(c) {
  const used = tokensUsed(c);
  const colors = [...used.color].map((t) => splitToken(t).token).filter((t) => !COLOR_TOKENS.includes(t));
  const radius = [...used.radius].filter((r) => !RADIUS_KEYS.includes(r) && !['full', 'none', 'default'].includes(r));
  return [...colors, ...radius.map((r) => `radius:${r}`)];
}

test('there are six CRM contracts, all for the CRM UI KIT page', () => {
  assert.deepEqual(CRM.map((c) => c.title).sort(), ['CRM / Application card', 'CRM / KPI card', 'CRM / Key-value row', 'CRM / List item', 'CRM / Timeline item', 'CRM / Transfer row']);
  for (const c of CRM) assert.equal(c.figma.page, '☰ CRM blocks');
});

test('each CRM block builds; colours bind only to shadcn variables, other names are reported', async () => {
  for (const c of CRM) {
    const m = await crmKit();
    const res = await m.renderContract(c);
    assert.ok(!res.errors, `${c.name}: ${res.errors}`);
    const { report } = res;
    const foreign = foreignTokens(c);
    assert.deepEqual(report.missing.map((x) => (x.kind === 'color' ? x.token : `${x.kind}:${x.token}`)).sort(), [...new Set(foreign)].sort(), c.name);
    assert.deepEqual(report.createdTokens, [], `${c.name}: the collection was there`);
    assert.deepEqual(report.missingComponents, [], c.name);
    for (const v of m.vars.values()) assert.equal(m.cols.get(v.variableCollectionId).name, 'shadcn', `${c.name}: ${v.name} outside shadcn`);
    const page = m.figma.root.children.find((p) => p.name === '☰ CRM blocks');
    const comp = page.children.find((n) => n.type === 'COMPONENT');
    assert.equal(comp.name, c.title, 'a plain component, as the designers drew it (no variant set of one)');
    assert.equal(page.children.length, 1);
    for (const p of c.parts.filter((x) => x !== 'root')) assert.ok(part(comp, c.anatomy[p]?.layer || p), `${c.name}: part ${p}`);
    for (const t of comp.findAll((n) => n.type === 'TEXT' && !n.parent.mainComponent)) assert.ok(t.textStyleId, `${c.name}.${t.name}: text style`);
  }
});

test('every contract token is a shadcn name', () => {
  const bad = ALL.map((c) => [c.name, foreignTokens(c)]).filter(([, t]) => t.length);
  assert.deepEqual(bad, []);
});

test('Key-value row: 480 row, gap 16 / py 8 as numbers, label 180, value fills', async () => {
  const m = await crmKit();
  await m.renderContract(contract('crm-key-value-row'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 480);
  assert.equal(comp.layoutMode, 'HORIZONTAL');
  assert.equal(comp.itemSpacing, 16);
  assert.equal(comp.paddingTop, 8);
  const label = part(comp, 'Label');
  assert.equal(label.width, 180);
  assert.equal(label.characters, 'Ключ');
  assert.equal(part(comp, 'Value').layoutSizingHorizontal, 'FILL');
});

test('Application card: nested top row, Badge-status instance in the footer', async () => {
  const m = await crmKit();
  const { report } = await m.renderContract(contract('crm-application-card'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 200);
  const top = part(comp, 'Top');
  assert.deepEqual(top.children.map((n) => n.name), ['ID', 'Time'], 'designers\' layer names: Swap instance keeps overrides');
  assert.equal(top.primaryAxisAlignItems, 'SPACE_BETWEEN');
  const footer = part(comp, 'Footer');
  assert.equal(footer.paddingBottom, 0);
  const badge = part(footer, 'Badge-status');
  assert.equal(badge.type, 'INSTANCE');
  assert.equal(badge.mainComponent.key, contract('crm-application-card').anatomy.badge.component.key);
  assert.equal(badge.findOne((n) => n.type === 'TEXT').characters, 'SLA 25 мин');
  assert.equal(report.instances, 1);
});

test('Transfer row: 8 fixed cells with a right divider, bottom divider on the row, status badge', async () => {
  const m = await crmKit();
  await m.renderContract(contract('crm-transfer-row'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.deepEqual([comp.strokeTopWeight, comp.strokeRightWeight, comp.strokeBottomWeight, comp.strokeLeftWeight], [0, 0, 1, 0]);
  if (comp.strokes[0].boundVariables) assert.equal(m.cols.get(m.vars.get(comp.strokes[0].boundVariables.color.id).variableCollectionId).name, 'shadcn');
  const cells = comp.children;
  assert.deepEqual(cells.map((n) => n.width), [124, 156, 160, 170, 116, 124, 128, 138]);
  for (const cell of cells) assert.equal(cell.strokeRightWeight, 1);
  assert.deepEqual(cells.map((n) => n.name), [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `TableCell ${i}`));
  const sender = cells[2].children[0];
  assert.equal(sender.name, 'TextContent');
  assert.equal(sender.children[0].name, 'Label');
  assert.equal(sender.children[0].characters, 'Бакыт Токтогулов');
  assert.equal(cells[7].children[0].type, 'INSTANCE');
});

test('KPI card and Timeline item keep the designers\' geometry; radius binds to radius-<key>', async () => {
  let m = await crmKit();
  await m.renderContract(contract('crm-kpi-card'));
  let comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 260);
  if (comp.boundVariables.topLeftRadius) assert.match(varName(m, comp.boundVariables.topLeftRadius), /^radius-/);
  assert.equal(part(comp, 'Value').layoutSizingHorizontal, 'FIXED', 'HUG text as drawn, not stretched');

  m = await crmKit();
  await m.renderContract(contract('crm-timeline-item'));
  comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  const marker = part(comp, 'Marker');
  assert.equal(marker.paddingBottom, 0);
  assert.equal(part(marker, 'Dot').width, 12);
  assert.deepEqual(part(comp, 'Content').children.map((n) => n.name), ['Title', 'Meta']);
});

test('one button in «Компоненты»: contract-render builds it on its page; a re-run updates in place', async () => {
  const m = await crmKit();
  const first = await m.handlers['contract-render']({ name: 'crm-kpi-card' });
  const again = await m.handlers['contract-render']({ name: 'crm-kpi-card' });
  assert.equal(first.report.setId, again.report.setId);
  assert.equal(again.report.updated, 1);
  assert.equal(m.figma.currentPage.name, '☰ CRM blocks');
  const listed = again.contracts.find((x) => x.name === 'crm-kpi-card');
  assert.equal(listed.rendered, true);
  assert.deepEqual(listed.errors, []);
});

test('anatomy: kinds, parents and geometry are validated', () => {
  const card = contract('crm-application-card');
  assert.deepEqual(validateContract(card), []);
  assert.equal(partKind('id', card), 'text', 'anatomy kind beats the name guess');
  assert.equal(partKind('badge', card), 'instance');
  assert.equal(parentOf(card, 'time'), 'top');
  const bad = JSON.parse(JSON.stringify(card));
  bad.anatomy.id.parent = 'meta';
  bad.anatomy.top.width = -1;
  bad.anatomy.top.sides = ['middle'];
  bad.anatomy.badge.component = null;
  bad.anatomy.ghost = {};
  bad.anatomy.meta.layer = '';
  const text = validateContract(bad).join('\n');
  for (const re of [/anatomy\.id\.parent: «meta» должна стоять в parts раньше/, /anatomy\.top\.width/, /anatomy\.top\.sides/, /anatomy\.badge\.component/, /anatomy\.ghost: часть не объявлена/, /anatomy\.meta\.layer/]) assert.match(text, re);
});

test('dist/code.js (the plugin the designer imports): an empty file gets the shadcn collection and every CRM block', async () => {
  const code = readFileSync(new URL('../plugin/dist/code.js', import.meta.url), 'utf8');
  const m = createFigma({ library: library() });
  globalThis.figma = m.figma;
  const out = [];
  m.figma.ui.postMessage = (msg) => out.push(msg);
  new Function('figma', '__html__', code)(m.figma, '<html></html>');
  const ask = async (msg) => { await m.figma.ui.onmessage(msg); return out.at(-1); };
  const list = await ask({ type: 'contracts-list' });
  const crm = list.contracts.filter((c) => c.name.startsWith('crm-'));
  assert.equal(crm.length, CRM.length, 'crm-* contracts are bundled into dist (rebuild dist after adding one)');
  for (const c of crm) {
    const built = await ask({ type: 'contract-render', name: c.name, states: ['default'] });
    assert.equal(built.type, 'contract-render:done', JSON.stringify(built));
    assert.ok(built.report.bound > 0 && !built.report.missingComponents.length, `${c.name}: ${JSON.stringify(built.report)}`);
  }
  assert.deepEqual([...m.cols.values()].map((c) => c.name), ['shadcn'], 'the first build created the collection, nothing else');
  const page = m.figma.root.children.find((p) => p.name === '☰ CRM blocks');
  assert.deepEqual(page.children.map((n) => `${n.type} ${n.name}`).sort(), crm.map((c) => `COMPONENT ${c.title}`).sort());
});
