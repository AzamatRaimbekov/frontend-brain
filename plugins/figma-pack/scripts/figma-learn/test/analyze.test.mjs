import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../analyze.mjs';
import { renderReport } from '../report-md.mjs';
import { parseFrameName, viewportOf } from '../walk.mjs';
import { columnType } from '../archetypes.mjs';
import { loadCatalog, loadTokens, nearestToken, libraryIndex, spacingToken } from '../library.mjs';
import { crawled } from './helpers.mjs';

const group = (report, id) => report.files.flatMap((f) => f.groups).find((g) => g.id === id);
const file = (report, name) => report.files.find((f) => f.name === name);

test('frame names, viewports and column types', () => {
  assert.deepEqual(parseFrameName('[draft] Кредиты / Список заявок / Empty / 1440'), { draft: true, flow: 'Кредиты', screen: 'Список заявок', state: 'empty', width: 1440, conventional: true });
  assert.equal(parseFrameName('Вход / Логин / Error / 393').state, 'error');
  assert.equal(parseFrameName('Main screen').screen, 'Main screen');
  assert.equal(parseFrameName('Main screen').conventional, false);
  assert.deepEqual([375, 768, 1440].map(viewportOf), ['mobile', 'tablet', 'desktop']);
  assert.deepEqual(['Сумма', 'Клиент', 'Дата', 'Статус', 'Комментарий'].map(columnType), ['money', 'person', 'date', 'status', 'text']);
});

test('archetypes: list, record, form, dashboard, login with their states and widths', async () => {
  const { report } = await crawled();
  assert.equal(report.totals.files, 3);
  assert.equal(report.totals.screens, 9);
  const list = group(report, 'Кредиты / Список заявок');
  assert.equal(list.archetype, 'list');
  assert.deepEqual(list.states.sort(), ['default', 'empty']);
  assert.deepEqual(list.viewports.sort(), ['desktop', 'mobile']);
  assert.equal(group(report, 'Кредиты / Карточка заявки').archetype, 'record');
  assert.equal(group(report, 'Клиенты / Новый клиент').archetype, 'form');
  assert.equal(group(report, 'Клиенты / Обзор').archetype, 'dashboard');
  const login = group(report, 'Вход / Логин');
  assert.equal(login.archetype, 'login');
  assert.deepEqual(login.states.sort(), ['default', 'error']);
  assert.deepEqual(Object.keys(report.archetypes).sort(), ['dashboard', 'form', 'list', 'login', 'record']);
  const listFrame = report.screens.find((s) => s.name === 'Кредиты / Список заявок / Default / 1440');
  assert.equal(listFrame.signature, 'header>tabs>toolbar>table>pagination');
  assert.deepEqual(listFrame.nav, ['Обзор', 'Заявки', 'Клиенты', 'Отчёты']);
});

test('component usage: map status beats catalog, local components, detached and unknown library pieces', async () => {
  const { report } = await crawled();
  const by = (name) => report.usage.components.find((u) => u.name === name);
  assert.equal(by('sideMenu').status, 'mapped', 'components map overrides catalog (partial)');
  assert.equal(by('FloatButton').status, 'missing');
  assert.equal(by('pagination/basic').status, 'mapped', 'not in the map: catalog code status');
  assert.equal(by('Old Icons/arrow').status, 'unknown');
  assert.deepEqual([by('CRM / KPI card').status, by('CRM / KPI card').count], ['local', 3]);
  assert.equal(report.usage.detached.topHeader, 1);
  const kinds = report.gaps.map((g) => `${g.kind}:${g.name}`);
  for (const k of ['code-missing:FloatButton', 'local-reused:CRM / KPI card', 'detached:topHeader', 'not-in-catalog:Old Icons/arrow', 'code-partial:button/default']) assert.ok(kinds.includes(k), k);
});

test('without the components map the code status comes from catalog.json', async () => {
  const { dir } = await crawled();
  const report = analyze(dir, { catalog: loadCatalog(), map: null, tokens: null });
  assert.equal(report.usage.components.find((u) => u.name === 'sideMenu').status, 'partial');
  assert.equal(report.sources.componentsMap, false);
  const bare = analyze(dir, {});
  assert.equal(bare.usage.components.find((u) => u.name === 'sideMenu').status, 'unknown');
});

test('token hygiene: raw hex with nearest token, unbound text, default names, raw spacing', async () => {
  const { report } = await crawled();
  const hex = Object.fromEntries(report.hygiene.rawHex.map((x) => [x.hex, x]));
  assert.equal(hex['#16a34a'].token.name, 'brand/bank/default');
  assert.equal(hex['#16a34a'].token.exact, true);
  assert.equal(hex['#123456'].token.exact, false);
  const clients = file(report, 'CRM Клиенты').hygiene;
  assert.equal(clients.unstyledTexts, 1);
  assert.deepEqual(clients.textExamples, ['Данные клиента']);
  assert.ok(clients.nameExamples.includes('Frame 12'));
  assert.ok(clients.rawSpacing > 0);
  assert.equal(clients.manualContainers, 1);
  assert.equal(file(report, 'Мобильный банк — Вход').hygiene.rawPaints, 0);
});

test('dev-readiness score ranks the clean file first and explains the parts', async () => {
  const { report } = await crawled();
  const auth = file(report, 'Мобильный банк — Вход').score;
  const credit = file(report, 'CRM Кредиты').score;
  const clients = file(report, 'CRM Клиенты').score;
  assert.deepEqual([auth.total, auth.grade], [100, 'A']);
  assert.ok(credit.total < auth.total && clients.total < credit.total, `${auth.total} > ${credit.total} > ${clients.total}`);
  assert.equal(clients.parts.readyForDev, 0);
  assert.equal(clients.parts.noDrafts, 0.5);
  assert.ok(credit.parts.instances < 1, 'detached topHeader lowers the instances part');
});

test('report.md has the overall picture, the kit backlog and a block per file', async () => {
  const { report } = await crawled();
  const md = renderReport(report);
  for (const s of ['## Типы экранов', '## Бэклог кита (топ)', '### CRM Клиенты', 'brand/bank/default', 'Дизайнеру поправить', 'нет секций Ready for dev']) assert.ok(md.includes(s), s);
});

test('library helpers: nearest token and spacing token', () => {
  const tokens = loadTokens();
  assert.equal(nearestToken('#16A34A'.toLowerCase(), tokens).exact, true);
  assert.equal(nearestToken('#000000', null), null);
  assert.equal(spacingToken(24, tokens), 'spacing/l-2');
  assert.equal(libraryIndex({}).status('x'), 'unknown');
});
