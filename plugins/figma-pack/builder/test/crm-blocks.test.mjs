// «Собрать в Figma» for the CRM blocks (contracts/crm-*.json) in a file shaped like CRM UI KIT: no local
// variables or text styles, Foundation / Web components reached only as libraries (import by key).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma } from './figma-mock.mjs';
import { TOKEN_MAP } from '../core/token-map.js';
import { validateContract, partKind, parentOf } from '../core/contract.js';

const dir = new URL('../contracts/', import.meta.url);
const CRM = readdirSync(dir).filter((f) => f.startsWith('crm-')).map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const contract = (n) => CRM.find((c) => c.name === n);

// Every baked key is a published library item; badge variants come from the contracts themselves.
function library() {
  const variables = Object.entries(TOKEN_MAP.keys).map(([name, key]) => ({ key, name, type: /^(spacing|radius)\//.test(name) ? 'FLOAT' : 'COLOR' }));
  const styles = Object.entries(TOKEN_MAP.styleKeys).map(([name, key]) => ({ key, name, fontName: { family: 'Inter', style: 'Regular' } }));
  const components = CRM.flatMap((c) => Object.values(c.anatomy || {}).filter((a) => a.kind === 'instance').map((a) => ({ key: a.component.key, name: a.component.variant })));
  return { variables, styles, components };
}

async function crmKit() {
  const m = createFigma({ library: library() });
  globalThis.figma = m.figma;
  const { renderContract } = await import('../plugin/src/components.js');
  const { contractHandlers } = await import('../plugin/src/contracts.js');
  return { ...m, renderContract, handlers: contractHandlers(CRM) };
}

const varName = (m, ref) => m.vars.get(ref.id).name;
const fill = (m, node) => varName(m, node.fills[0].boundVariables.color);
const part = (root, name) => root.findOne((n) => n.name === name);

test('there are six CRM contracts, all for the CRM UI KIT page', () => {
  assert.deepEqual(CRM.map((c) => c.title).sort(), ['CRM / Application card', 'CRM / KPI card', 'CRM / Key-value row', 'CRM / List item', 'CRM / Timeline item', 'CRM / Transfer row']);
  for (const c of CRM) assert.equal(c.figma.page, '☰ CRM blocks');
});

test('each CRM block builds with every token bound to a library variable, nothing created or missing', async () => {
  for (const c of CRM) {
    const m = await crmKit();
    const res = await m.renderContract(c);
    assert.ok(!res.errors, `${c.name}: ${res.errors}`);
    const { report } = res;
    assert.equal(report.unbound, 0, `${c.name}: unbound ${JSON.stringify(report.missing)}`);
    assert.deepEqual(report.missing, [], c.name);
    assert.deepEqual(report.createdTokens, [], `${c.name}: no Brand placeholders in CRM UI KIT`);
    assert.deepEqual(report.missingComponents, [], c.name);
    assert.ok(report.bound > 5 && report.imported.length > 3, `${c.name}: bound ${report.bound}`);
    const page = m.figma.root.children.find((p) => p.name === '☰ CRM blocks');
    const comp = page.children.find((n) => n.type === 'COMPONENT');
    assert.equal(comp.name, c.title, 'a plain component, as the designers drew it (no variant set of one)');
    assert.equal(page.children.length, 1);
    for (const p of c.parts.filter((x) => x !== 'root')) assert.ok(part(comp, c.anatomy[p]?.layer || p), `${c.name}: part ${p}`);
    for (const t of comp.findAll((n) => n.type === 'TEXT' && !n.parent.mainComponent)) {
      assert.ok(t.textStyleId.startsWith('S:'), `${c.name}.${t.name}: library text style`);
      assert.ok(t.fills[0].boundVariables, `${c.name}.${t.name}: colour bound`);
    }
  }
});

test('Key-value row: 480 row, gap 16 / py 8 bound, label 180 muted, value fills', async () => {
  const m = await crmKit();
  await m.renderContract(contract('crm-key-value-row'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 480);
  assert.equal(comp.layoutMode, 'HORIZONTAL');
  assert.equal(varName(m, comp.boundVariables.itemSpacing), 'spacing/m-2-base');
  assert.equal(varName(m, comp.boundVariables.paddingTop), 'spacing/s-3');
  assert.equal(varName(m, comp.boundVariables.paddingLeft), 'spacing/none');
  const label = part(comp, 'Label');
  assert.equal(label.width, 180);
  assert.equal(label.characters, 'Ключ');
  assert.equal(fill(m, label), 'text/muted');
  assert.equal(part(comp, 'Value').layoutSizingHorizontal, 'FILL');
  assert.equal(fill(m, part(comp, 'Value')), 'text/default');
});

test('Application card: nested top row, radius/m, card surface, Badge-status instance in the footer', async () => {
  const m = await crmKit();
  const { report } = await m.renderContract(contract('crm-application-card'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 200);
  assert.equal(fill(m, comp), 'background/onsurface/0');
  assert.equal(varName(m, comp.boundVariables.topLeftRadius), 'radius/m');
  assert.equal(varName(m, comp.boundVariables.paddingLeft), 'spacing/s-1');
  assert.equal(varName(m, comp.boundVariables.itemSpacing), 'spacing/xs');
  const top = part(comp, 'Top');
  assert.deepEqual(top.children.map((n) => n.name), ['ID', 'Time'], 'designers\' layer names: Swap instance keeps overrides');
  assert.equal(top.primaryAxisAlignItems, 'SPACE_BETWEEN');
  const footer = part(comp, 'Footer');
  assert.equal(varName(m, footer.boundVariables.paddingTop), 'spacing/xs');
  assert.equal(footer.paddingBottom, 0);
  const badge = part(footer, 'Badge-status');
  assert.equal(badge.type, 'INSTANCE');
  assert.equal(badge.mainComponent.key, 'b68afd3e0714ecefd38ee21793292c14ae240015');
  assert.equal(badge.findOne((n) => n.type === 'TEXT').characters, 'SLA 25 мин');
  assert.equal(report.instances, 1);
});

test('Transfer row: 8 fixed cells with a right divider, bottom divider on the row, status badge', async () => {
  const m = await crmKit();
  await m.renderContract(contract('crm-transfer-row'));
  const comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(fill(m, comp), 'background/surface/light');
  assert.deepEqual([comp.strokeTopWeight, comp.strokeRightWeight, comp.strokeBottomWeight, comp.strokeLeftWeight], [0, 0, 1, 0]);
  assert.equal(varName(m, comp.strokes[0].boundVariables.color), 'border/divider/primary');
  const cells = comp.children;
  assert.deepEqual(cells.map((n) => n.width), [124, 156, 160, 170, 116, 124, 128, 138]);
  for (const cell of cells) {
    assert.equal(cell.strokeRightWeight, 1);
    assert.equal(varName(m, cell.boundVariables.paddingLeft), 'spacing/s-1');
  }
  assert.deepEqual(cells.map((n) => n.name), [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `TableCell ${i}`));
  const sender = cells[2].children[0];
  assert.equal(sender.name, 'TextContent');
  assert.equal(varName(m, sender.boundVariables.paddingTop), 'spacing/s-1');
  assert.equal(sender.children[0].name, 'Label');
  assert.equal(sender.children[0].characters, 'Бакыт Токтогулов');
  assert.equal(cells[7].children[0].type, 'INSTANCE');
});

test('KPI card and Timeline item keep the designers\' tokens', async () => {
  let m = await crmKit();
  await m.renderContract(contract('crm-kpi-card'));
  let comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(comp.width, 260);
  assert.equal(varName(m, comp.boundVariables.topLeftRadius), 'radius/l');
  assert.equal(varName(m, comp.boundVariables.paddingTop), 'spacing/m-1');
  assert.equal(fill(m, part(comp, 'Delta value')), 'text/positive');
  assert.equal(part(comp, 'Value').layoutSizingHorizontal, 'FIXED', 'HUG text as drawn, not stretched');

  m = await crmKit();
  await m.renderContract(contract('crm-timeline-item'));
  comp = m.figma.root.findOne((n) => n.type === 'COMPONENT');
  assert.equal(varName(m, comp.boundVariables.itemSpacing), 'spacing/s-1');
  const marker = part(comp, 'Marker');
  assert.equal(varName(m, marker.boundVariables.paddingTop), 'spacing/xs');
  assert.equal(varName(m, marker.boundVariables.paddingBottom), 'spacing/none');
  const dot = part(marker, 'Dot');
  assert.equal(dot.width, 12);
  assert.equal(fill(m, dot), 'border/accent/positive');
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

test('dist/code.js (the plugin the designer imports): «Собрать в Figma» builds every CRM block, all bound', async () => {
  const code = readFileSync(new URL('../plugin/dist/code.js', import.meta.url), 'utf8');
  const m = createFigma({ library: library() });
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
    const r = built.report;
    assert.ok(r.bound > 5 && r.unbound === 0 && !r.missing.length && !r.createdTokens.length && !r.missingComponents.length, `${c.name}: ${JSON.stringify(r)}`);  }
  const page = m.figma.root.children.find((p) => p.name === '☰ CRM blocks');
  assert.deepEqual(page.children.map((n) => `${n.type} ${n.name}`).sort(), crm.map((c) => `COMPONENT ${c.title}`).sort());
});
