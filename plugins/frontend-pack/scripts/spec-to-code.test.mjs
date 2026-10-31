// Tests for spec-to-code.mjs (no network, no npm: a fake project folder with the template copied in).
// Run: node --test plugins/frontend-pack/scripts/spec-to-code.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, plan, run } from './spec-to-code.mjs';
import { markerState } from './spec-to-code/util.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, '..', 'templates', 'mbank-crm');
const BUILDER = join(HERE, '..', '..', 'figma-pack', 'builder');
const SCRIPT = join(HERE, 'spec-to-code.mjs');

const SPEC = {
  project: 'Тест CRM',
  nav: [{ id: 'orders', label: 'Заказы' }, { id: 'help', label: 'Помощь', group: 'Прочее' }],
  screens: [
    {
      id: 'orders', title: 'Заказы', nav: 'orders', states: ['default', 'loading', 'empty', 'error'],
      empty: { title: 'Заказов нет' },
      blocks: [
        { type: 'header', title: 'Заказы', actions: ['+ Новый заказ'] },
        { type: 'toolbar', search: 'Поиск', filters: ['Статус'] },
        { type: 'table', rows: 5, columns: ['Номер:id', 'Клиент:person', 'Сумма:money', 'Статус:status'] },
        { type: 'pagination' },
        { type: 'sparkline', title: 'Неизвестный блок' },
      ],
    },
    {
      id: 'order-new', title: 'Новый заказ', nav: 'orders', states: ['default', 'error'],
      blocks: [{ type: 'form', title: 'Заказ', fields: [{ label: 'Клиент', required: true }, { label: 'Телефон', type: 'phone' }, { label: 'Город', type: 'select' }], submit: 'Создать' }],
    },
  ],
};

function project({ kit = 'copy' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-to-code-'));
  cpSync(TEMPLATE, dir, { recursive: true });
  const deps = kit === 'package' ? { '@mdigital/mbank-ui': 'github:x/y' } : {};
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'crm', dependencies: deps }));
  const specPath = join(dir, 'spec.json');
  writeFileSync(specPath, JSON.stringify(SPEC));
  return { dir, specPath, read: (p) => readFileSync(join(dir, p), 'utf8'), done: () => rmSync(dir, { recursive: true, force: true }) };
}
const quiet = () => {};

test('parseArgs: spec, --project, flags; rejects bad input', () => {
  assert.deepEqual(parseArgs(['s.json', '--project', 'crm', '--dry-run', '--force', '--only=apps']),
    { spec: 's.json', project: 'crm', dryRun: true, force: true, only: 'apps', help: false });
  assert.throws(() => parseArgs(['s.json']), /Usage/);
  assert.throws(() => parseArgs(['s.json', '--project']), /--project needs a value/);
  assert.throws(() => parseArgs(['s.json', '--project', 'x', '--nope']), /Unknown option/);
});

test('vendored spec core is the builder core (no drift)', () => {
  for (const name of ['spec', 'fake']) {
    const vendored = readFileSync(join(HERE, 'spec-to-code', `${name}.mjs`), 'utf8').replace(/\.mjs'/g, ".js'");
    assert.equal(vendored, readFileSync(join(BUILDER, 'core', `${name}.js`), 'utf8'), `${name}.mjs differs from figma-pack/builder/core/${name}.js`);
  }
});

test('generates route, page, UX.md, tests, feature and menu for a small spec', () => {
  const p = project();
  try {
    const result = run({ spec: p.specPath, project: p.dir }, quiet);
    for (const f of ['src/pages/orders/OrdersPage.tsx', 'src/pages/orders/UX.md', 'src/pages/orders/OrdersPage.test.tsx',
      'src/features/orders/api/orders.handlers.ts', 'src/features/orders/api/queries.ts', 'src/features/orders/ui/OrdersTable.tsx',
      'src/features/order-new/ui/OrderNewForm.tsx', 'src/features/order-new/lib/form.ts', 'src/mocks/lib.ts']) {
      assert.ok(existsSync(join(p.dir, f)), f);
    }
    const router = p.read('src/app/router.tsx');
    assert.match(router, /path: '\/orders',\n {2}validateSearch: ordersSearchSchema/);
    assert.match(router, /throw redirect\(\{ to: '\/orders' \}\)/);
    assert.match(p.read('src/app/navigation.ts'), /item\('help', 'Помощь', '\/help', LifeBuoyIcon\)/);
    assert.match(p.read('src/features/orders/api/queries.ts'), /ordersKeys = \{\n {2}all: \['orders'\] as const/);
    assert.match(p.read('src/mocks/handlers.ts'), /\.\.\.ordersHandlers, \.\.\.orderNewHandlers/);
    assert.match(p.read('src/pages/orders/UX.md'), /пусто: «Заказов нет»/);
    assert.equal(markerState(p.read('src/features/orders/ui/OrdersView.tsx')), 'generated');
    assert.ok(!existsSync(join(p.dir, 'src/features/applications')), 'untouched template demo removed');
    for (const step of result.steps.filter((s) => s.path.endsWith('.tsx') && !s.path.endsWith('.test.tsx') && s.content)) {
      assert.ok(step.content.split('\n').length - 1 <= 150, `${step.path} is over 150 lines`);
    }
    const again = plan(SPEC, { project: p.dir });
    assert.ok(again.steps.every((s) => s.action === 'unchanged'), 'second run changes nothing');
  } finally {
    p.done();
  }
});

test('package kit mode imports @mdigital/mbank-ui', () => {
  const p = project({ kit: 'package' });
  try {
    run({ spec: p.specPath, project: p.dir }, quiet);
    const table = p.read('src/features/orders/ui/OrdersTable.tsx');
    assert.match(table, /from '@mdigital\/mbank-ui'/);
    assert.doesNotMatch(table, /@\/shared\/ui\//);
    assert.match(p.read('src/features/orders/ui/OrdersHeader.tsx'), /import \{ PlusIcon \} from '@mdigital\/mbank-ui\/crm'/);
  } finally {
    p.done();
  }
});

test('unknown block type: warning and a TODO component, no crash', () => {
  const p = project();
  try {
    const out = [];
    run({ spec: p.specPath, project: p.dir }, (line) => out.push(line));
    assert.ok(out.some((l) => /warning: .*unknown block "sparkline" -> TODO component/.test(l)), out.join('\n'));
    const todo = p.read('src/features/orders/ui/OrdersSparkline.tsx');
    assert.match(todo, /TODO\(spec-to-code\): the spec block type "sparkline"/);
    assert.match(p.read('src/features/orders/ui/OrdersView.tsx'), /<OrdersSparkline \/>/);
  } finally {
    p.done();
  }
});

test('an edited generated file is kept; --force overwrites it; hand-edited template files are kept', () => {
  const p = project();
  try {
    writeFileSync(join(p.dir, 'src/app/AppHeader.tsx'), '// my header\n');
    run({ spec: p.specPath, project: p.dir }, quiet);
    assert.equal(p.read('src/app/AppHeader.tsx'), '// my header\n', 'hand-written file kept');
    const file = 'src/features/orders/ui/OrdersTable.tsx';
    writeFileSync(join(p.dir, file), `${p.read(file)}// my change\n`);
    assert.equal(markerState(p.read(file)), 'edited');
    const out = [];
    run({ spec: p.specPath, project: p.dir }, (line) => out.push(line));
    assert.match(p.read(file), /\/\/ my change\n$/);
    assert.ok(out.some((l) => l.includes(file) && l.includes('edited after generation')));
    run({ spec: p.specPath, project: p.dir, force: true }, quiet);
    assert.doesNotMatch(p.read(file), /my change/);
    assert.equal(markerState(p.read(file)), 'generated');
  } finally {
    p.done();
  }
});

test('--dry-run writes nothing; an edited demo file is kept', () => {
  const p = project();
  try {
    writeFileSync(join(p.dir, 'src/mocks/data/cards.ts'), 'export const mine = 1\n');
    const before = p.read('src/app/router.tsx');
    const result = run({ spec: p.specPath, project: p.dir, dryRun: true }, quiet);
    assert.equal(p.read('src/app/router.tsx'), before);
    assert.ok(!existsSync(join(p.dir, 'src/pages/orders')));
    assert.deepEqual(result.steps.find((s) => s.path === 'src/mocks/data/cards.ts')?.action, 'keep');
  } finally {
    p.done();
  }
});

test('--only generates one screen and routes only screens that exist', () => {
  const p = project();
  try {
    run({ spec: p.specPath, project: p.dir, only: 'order-new' }, quiet);
    assert.ok(existsSync(join(p.dir, 'src/pages/order-new/OrderNewPage.tsx')));
    assert.ok(!existsSync(join(p.dir, 'src/pages/orders')));
    const router = p.read('src/app/router.tsx');
    assert.match(router, /OrderNewPage/);
    assert.doesNotMatch(router, /OrdersPage/);
    assert.throws(() => plan(SPEC, { project: p.dir, only: 'nope' }), /no screen "nope"/);
  } finally {
    p.done();
  }
});

test('CLI: invalid spec exits 1 with paths; not a CRM project exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'spec-to-code-'));
  try {
    const bad = join(dir, 'bad.json');
    writeFileSync(bad, JSON.stringify({ project: 'x', screens: [{ id: 'a', blocks: [{ type: 'table' }] }] }));
    const r = spawnSync(process.execPath, [SCRIPT, bad, '--project', dir], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /screens\[0\]\.title: required/);
    mkdirSync(join(dir, 'empty'));
    const good = join(dir, 'good.json');
    writeFileSync(good, JSON.stringify(SPEC));
    const r2 = spawnSync(process.execPath, [SCRIPT, good, '--project', join(dir, 'empty')], { encoding: 'utf8' });
    assert.equal(r2.status, 1);
    assert.match(r2.stderr, /not a CRM made by new-crm/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
