// Tests for the credit pipeline CRM blocks of spec-to-code (funnel, meters, score, decision, files, checks,
// comments, profile, breakdown) and the full credit CRM spec that the figma-pack builder draws.
// Run: node --test plugins/frontend-pack/scripts/spec-to-code-crm.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { plan } from './spec-to-code.mjs';
import { buildModel, checkSpec } from './spec-to-code/model.mjs';
import { BLOCKS, DATA_BLOCKS } from './spec-to-code/spec.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, '..', 'templates', 'mbank-crm');
// Snapshot of figma-pack builder examples/credit-crm.spec.json (19 screens); refresh it when that spec changes.
const CREDIT = JSON.parse(readFileSync(join(HERE, 'spec-to-code', 'fixtures', 'credit-crm.spec.json'), 'utf8'));
const CRM = ['funnel', 'meters', 'score', 'decision', 'files', 'checks', 'comments', 'profile', 'breakdown'];

const SPEC = {
  project: 'Тест конвейер',
  nav: [{ id: 'app', label: 'Заявка', icon: 'inbox', badge: 24 }, { id: 'reports', label: 'Отчёты', icon: 'chart' }],
  screens: [{
    id: 'app', title: 'Заявка', nav: 'app',
    blocks: [
      { type: 'header', title: 'Заявка', period: ['Сегодня', 'Неделя', 'Месяц'], periodActive: 1 },
      { type: 'profile', name: 'Бакыт Асанов', meta: 'Клиент с 2019', badges: ['Активный'], actions: ['Позвонить', '+ Новая заявка → app'], items: [['Кредитов', '2'], ['Просрочки', 'нет']] },
      { type: 'chart', title: 'Решения по часам', series: ['Одобрено', 'Отказ'], labels: ['09', '10', '11'] },
      { type: 'funnel', title: 'Воронка', more: 'Отчёт → reports', items: [{ label: 'Поступило', value: '312', rate: '100%' }, { label: 'Выдано', value: '118', rate: '38%' }] },
      { type: 'meters', title: 'SLA', items: [{ label: 'Скоринг', value: '98%', percent: 98, tone: 'success' }, { label: 'Андеррайтинг', percent: 71, tone: 'danger', hint: '9 просрочено' }] },
      { type: 'score', value: 712, max: 850, grade: 'Низкий риск', items: [['Без просрочек', '+48'], ['ПДН 38%', '−12']] },
      { type: 'decision', items: [['Сумма', '450 000 с'], ['Ставка', '21,5%']], note: 'Условия предварительные.' },
      { type: 'files', items: [{ name: 'Паспорт.pdf', meta: '1,2 МБ', status: 'Проверен' }, 'Договор залога'] },
      { type: 'checks', items: [{ label: 'КИБ', result: 'Пройдена', status: 'ok' }, { label: 'Залог', status: 'wait' }] },
      { type: 'comments', items: [['Нурлан Исаков', 'сегодня, 10:05', 'Доход подтверждён.'], { who: 'Асель', text: 'Можно передавать.' }] },
      { type: 'breakdown', title: 'Портфель', items: [{ label: 'Ипотека', value: '0,86 млрд', share: '30%' }, { label: 'Карты', share: '10%' }] },
    ],
  }],
};

function generate(spec) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-to-code-crm-'));
  cpSync(TEMPLATE, dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'crm' }));
  try {
    const result = plan(spec, { project: dir });
    const files = new Map(result.steps.filter((s) => s.content).map((s) => [s.path, s.content]));
    return { ...result, files, file: (p) => { assert.ok(files.has(p), `${p} is generated`); return files.get(p); } };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('spec.mjs knows the credit CRM blocks (copy of figma-pack builder core/spec.js)', () => {
  for (const type of CRM) assert.ok(BLOCKS[type], type);
  for (const type of ['funnel', 'meters', 'score', 'files', 'checks', 'comments', 'breakdown']) assert.ok(DATA_BLOCKS.includes(type), type);
  assert.deepEqual(BLOCKS.score, ['value']);
  assert.deepEqual(BLOCKS.profile, ['name']);
  assert.match(checkSpec({ project: 'x', screens: [{ id: 'a', title: 'A', blocks: [{ type: 'funnel' }] }] }).errors.join('\n'), /funnel\.items|items: required for funnel/);
});

test('the full credit CRM spec validates and generates every block, no TODO components', () => {
  const { errors, warnings } = checkSpec(CREDIT);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  const used = new Set();
  const walk = (blocks) => blocks.forEach((b) => (b.type === 'split' ? b.columns.forEach(walk) : used.add(b.type)));
  CREDIT.screens.forEach((s) => walk(s.blocks));
  for (const type of CRM) assert.ok(used.has(type), `the spec uses ${type}`);
  const result = generate(CREDIT);
  assert.equal(result.model.screens.length, CREDIT.screens.length);
  assert.ok(!result.warnings.some((w) => /unknown block|TODO/.test(w)), result.warnings.join('\n'));
  for (const [path, content] of result.files) {
    assert.doesNotMatch(content, /the spec block type "/, `${path} is a TODO component`);
    if (/^src\/features\/.*\/ui\/.*\.tsx$/.test(path)) assert.ok(content.split('\n').length - 1 <= 150, `${path} is over 150 lines`);
  }
  assert.match(result.file('src/features/dashboard/ui/DashboardFunnel.tsx'), /<Link to="\/reports"/);
  assert.match(result.file('src/app/navigation.ts'), /item\('apps', 'Заявки', '\/apps', FileIcon, '24'\)/);
});

test('data blocks: schemas, fixtures from the spec items, status tones', () => {
  const { model, file } = generate(SPEC);
  const by = Object.fromEntries(model.screens[0].flat.map((b) => [b.type, b]));
  assert.deepEqual(by.funnel.fixture.map((x) => x.share), [1, 0.378]);
  assert.deepEqual(by.meters.fixture.map((x) => [x.tone, x.value]), [['success', '98%'], ['error', '71%']]);
  assert.deepEqual(by.score.fixture.factors.map((x) => x.good), [true, false]);
  assert.equal(by.files.fixture[1].name, 'Договор залога');
  assert.deepEqual(by.checks.fixture.map((x) => x.status), ['ok', 'wait']);
  assert.deepEqual(by.comments.fixture[1], { id: 'comment2', who: 'Асель', time: undefined, text: 'Можно передавать.' });
  assert.deepEqual(by.breakdown.fixture.map((x) => x.percent), [75, 25]);
  assert.deepEqual(by.chart.fixture.map((x) => [x.label, x.values.length]), [['09', 2], ['10', 2], ['11', 2]]);
  const schemas = file('src/features/app/api/schemas.ts');
  assert.match(schemas, /score: z\.object\(\{ value: z\.number\(\), max: z\.number\(\)/);
  assert.match(schemas, /status: z\.enum\(\['ok', 'warn', 'fail', 'wait'\]\)/);
  assert.match(schemas, /chart: z\.array\(z\.object\(\{ label: z\.string\(\), values: z\.array\(z\.number\(\)\) \}\)\)/);
  assert.doesNotMatch(schemas, /decision|profile/, 'decision and profile are static copy, not payload');
  const status = file('src/features/app/lib/status.ts');
  for (const [label, tone] of [['Низкий риск', 'success'], ['Проверен', 'success'], ['Активный', 'success']]) assert.match(status, new RegExp(`'${label}': '${tone}'`));
});

test('each CRM block renders sensible markup', () => {
  const { file } = generate(SPEC);
  const ui = (name) => file(`src/features/app/ui/App${name}.tsx`);
  const funnel = ui('Funnel');
  assert.match(funnel, /<Card role="region" aria-label=\{t\.title\} aria-busy=\{!data\}/);
  assert.match(funnel, /<ol aria-label=\{t\.label\}/);
  assert.match(funnel, /style=\{\{ width: `\$\{stage\.share \* 100\}%` \}\}/);
  assert.match(funnel, /<Link to="\/reports"[^>]*>\n\s*\{t\.more\}/);
  assert.match(ui('Meters'), /<Progress value=\{meter\.percent\} tone=\{meter\.tone\} aria-label=\{meter\.label\} \/>/);
  const score = ui('Score');
  assert.match(score, /role="img" aria-label=\{`\$\{t\.scale\}/);
  assert.match(score, /const ZONES = \[/);
  assert.match(score, /<Badge tone=\{statusTone\(data\.grade\)\}/);
  const decision = ui('Decision');
  assert.match(decision, /<dt className="text-caption text-muted-foreground">\{term\.label\}<\/dt>/);
  assert.match(decision, /variant="primary">\n\s*\{t\.actions\[0\]\.label\}/);
  assert.match(decision, /variant="destructive">\n\s*\{t\.actions\[2\]\.label\}/, 'default actions: Одобрить, На доработку, Отказать');
  assert.match(decision, /\{t\.note\}/);
  assert.doesNotMatch(decision, /data\b/);
  const files = ui('Files');
  assert.match(files, /<FileIcon className="size-4\.5" \/>/);
  assert.match(files, /<Badge tone=\{statusTone\(doc\.status\)\}>/);
  assert.match(files, /aria-label=\{`\$\{t\.actions\}: \$\{doc\.name\}`\}/);
  assert.match(ui('Checks'), /\{check\.result \?\? t\.status\[check\.status\]\}/);
  const comments = ui('Comments');
  assert.match(comments, /<form onSubmit=\{submit\}/);
  assert.match(comments, /<Input size="sm" aria-label=\{t\.field\} placeholder=\{t\.placeholder\}/);
  assert.match(comments, /type Comment = AppData\['comments'\]\[number\]/);
  const profile = ui('Profile');
  assert.match(profile, /<Card role="region" aria-label=\{t\.name\}/);
  assert.match(profile, /<AvatarFallback>\{t\.initials\}<\/AvatarFallback>/);
  assert.match(profile, /variant="outline">\n\s*\{t\.actions\[0\]\.label\}/, 'Позвонить: outline');
  assert.match(profile, /variant="primary">\n\s*\{t\.actions\[1\]\.label\}/, '+ Новая заявка: primary');
  assert.match(ui('Breakdown'), /style=\{\{ width: `\$\{part\.percent\}%` \}\}/);
  assert.match(ui('Chart'), /const SERIES = \[/);
  assert.match(ui('Header'), /useState<string>\(t\.periodActive\)/);
  const messages = file('src/features/app/lib/messages.ts');
  assert.match(messages, /initials: 'БА'/);
  assert.match(messages, /periodActive: 'Неделя'/);
  assert.match(messages, /more: 'Отчёт'/);
  const page = file('src/pages/app/AppPage.test.tsx');
  assert.match(page, /findAllByRole\('region', \{ name: m\.blocks\.funnel\.title \}\)/);
  assert.match(page, /within\(score\)\.findAllByText\('712'\)/);
  assert.match(file('src/app/navigation.ts'), /badge: badge && createElement\(Badge, \{ size: 'sm', tone: 'neutral' \}, badge\)/);
});
