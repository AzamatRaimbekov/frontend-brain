// «Сайт»: the built widget (dist/code.js) on the Figma mock against a fake design-system site:
// pull creates/updates the `shadcn` collection (aliases to Foundation by library key, refs, values),
// push sends overrides + custom tokens with If-Match, statuses and the version conflict.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { boot, openWindow, hex, MANIFEST } from './helpers.mjs';
import { pushPayload, syncStatus, siteOrigin } from '../core/site.js';

const KEYS = { bg: 'k-bg', primary: 'k-primary', radius: 'k-radius' };
const LIBRARY = { variables: [
  { key: KEYS.bg, name: 'background/surface/light', type: 'COLOR' },
  { key: KEYS.primary, name: 'accent/primary/default', type: 'COLOR' },
  { key: KEYS.radius, name: 'radius/m', type: 'FLOAT' },
] };
const alias = (collection, name, key) => ({ collection, name, key });

// figma.json as apps/ds-configurator serves it, for a site document { version, overrides, custom }.
function planOf(doc) {
  const base = [
    { name: 'background', kind: 'color', type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL'], light: { value: '#ffffff', alias: alias('2.theme', 'background/surface/light', KEYS.bg) }, dark: { value: '#0e0f11', alias: alias('2.theme', 'background/surface/light', KEYS.bg) } },
    { name: 'primary', kind: 'color', type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL'], light: { value: '#fddb2b', alias: alias('2.theme', 'accent/primary/default', KEYS.primary) }, dark: { value: '#f7c21c', alias: alias('2.theme', 'accent/primary/default', KEYS.primary) } },
    { name: 'ring', kind: 'color', type: 'COLOR', scopes: ['STROKE_COLOR'], light: { value: '#fddb2b', ref: 'primary' }, dark: { value: '#f7c21c', ref: 'primary' } },
    { name: 'radius', kind: 'radius', type: 'FLOAT', scopes: ['CORNER_RADIUS'], light: { value: 12, alias: alias('1.brand', 'radius/m', KEYS.radius) }, dark: { value: 12, alias: alias('1.brand', 'radius/m', KEYS.radius) } },
  ];
  const variables = base.map((b) => {
    const o = doc.overrides[b.name] || {};
    const val = (m) => (o[m] ? (/^var/.test(o[m]) ? { value: null, ref: o[m].slice(6, -1) } : { value: b.type === 'FLOAT' ? parseFloat(o[m]) : o[m] }) : b[m]);
    return { name: b.name, kind: b.kind, type: b.type, scopes: b.scopes, codeSyntax: `var(--${b.name})`, custom: false, overridden: !!(o.light || o.dark), values: { light: val('light'), dark: val('dark') }, base: { light: b.light, dark: b.dark } };
  });
  for (const t of doc.custom) variables.push({ name: t.name, kind: t.kind, type: t.kind === 'color' ? 'COLOR' : 'FLOAT', scopes: [], codeSyntax: `var(--${t.name})`, custom: true, overridden: false, values: { light: { value: t.light }, dark: { value: t.dark } }, base: null });
  return { collection: 'shadcn', modes: ['light', 'dark'], project: 'demo', version: doc.version, brand: 'bank', prefix: 'mb', variables };
}

function fakeSite() {
  const site = { doc: { version: 1, overrides: {}, custom: [{ name: 'mb-promo', kind: 'color', light: '#fef3c7', dark: '#451a03' }] }, puts: [], syncs: [] };
  site.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname;
    const reply = (status, body) => ({ ok: status < 400, status, text: async () => JSON.stringify(body) });
    if (path === '/api/projects/demo/tokens' && (init.method || 'GET') === 'GET') return reply(200, site.doc);
    if (path === '/api/projects/demo/figma.json') return reply(200, planOf(site.doc));
    if (init.headers['X-Write-Key'] !== 'dsk_secret') return reply(403, { error: 'Ключ записи не подходит к проекту' });
    if (path === '/api/projects/demo/figma/sync') { site.syncs.push(JSON.parse(init.body)); return reply(200, {}); }
    if (path === '/api/projects/demo/tokens' && init.method === 'PUT') {
      const body = JSON.parse(init.body);
      site.puts.push({ ifMatch: init.headers['If-Match'], body });
      if (init.headers['If-Match'] !== `"${site.doc.version}"`) return reply(409, { error: 'Конфликт', current: site.doc });
      site.doc = { version: site.doc.version + 1, overrides: body.overrides, custom: body.custom };
      return reply(200, { tokens: site.doc, diff: {} });
    }
    return reply(404, { error: 'нет' });
  };
  return site;
}

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

async function connected(opts = { library: LIBRARY }) {
  const site = fakeSite();
  globalThis.fetch = site.fetch;
  const m = boot(null, opts);
  const store = new Map();
  m.figma.clientStorage = { getAsync: async (k) => store.get(k), setAsync: async (k, v) => { store.set(k, v); } };
  const ui = await openWindow(m.w, 'site');
  await ui.send('ready');
  const r = await ui.send('site-connect', { url: 'http://localhost:8797/', project: 'demo', key: 'dsk_secret' });
  return { m, ui, site, store, connect: r.done.site };
}

const shadcn = (m) => {
  const col = [...m.cols.values()].find((c) => c.name === 'shadcn');
  const vars = new Map([...m.vars.values()].filter((v) => v.variableCollectionId === col.id).map((v) => [v.name, v]));
  const mode = (n) => col.modes.find((x) => x.name === n).modeId;
  return { col, vars, mode };
};

test('manifest allows the site; site helpers', () => {
  assert.ok(MANIFEST.networkAccess.allowedDomains.includes('http://localhost:8797'));
  assert.equal(siteOrigin('http://LOCALHOST:8797/'), 'http://localhost:8797');
  assert.equal(siteOrigin('ftp://x'), null);
  assert.equal(syncStatus(1, null, {}).status, 'never');
});

test('connect, pull: shadcn collection with Foundation aliases, refs and values; idempotent', async () => {
  const { m, ui, site, store, connect } = await connected();
  assert.equal(connect.status, 'never');
  assert.deepEqual(JSON.parse(m.figma.root.getPluginData('site:conn')), { url: 'http://localhost:8797', project: 'demo' });
  assert.equal(store.get('site-key:http://localhost:8797|demo'), 'dsk_secret', 'key only in clientStorage');
  assert.ok(!m.figma.root.getPluginData('site:conn').includes('dsk_'));

  let r = await ui.send('site-pull');
  const rep = r.done.report;
  assert.equal(rep.collectionCreated, true);
  assert.deepEqual(rep.created.sort(), ['background', 'mb-promo', 'primary', 'radius', 'ring']);
  assert.equal(rep.aliased, 6, 'background, primary, radius x light/dark from the library');
  assert.equal(rep.refs, 2);
  assert.equal(r.done.site.status, 'same');
  assert.deepEqual(site.syncs.map((s) => [s.from, s.version]), [['site', 1]]);
  const { col, vars, mode } = shadcn(m);
  assert.deepEqual(col.modes.map((x) => x.name), ['light', 'dark']);
  const bg = vars.get('background').valuesByMode[mode('dark')];
  assert.equal(m.vars.get(bg.id).key, KEYS.bg, 'alias to the imported Foundation variable');
  assert.equal(vars.get('ring').valuesByMode[mode('light')].id, vars.get('primary').id, 'ring -> shadcn/primary');
  assert.equal(hex(vars.get('mb-promo').valuesByMode[mode('dark')]), '#451a03');
  assert.equal(vars.get('primary').codeSyntax.WEB, 'var(--primary)');
  assert.deepEqual(vars.get('radius').scopes, ['CORNER_RADIUS']);

  const count = m.vars.size;
  r = await ui.send('site-pull');
  assert.equal(r.done.report.created.length + r.done.report.updated.length, 0, 'second pull changes nothing');
  assert.equal(r.done.report.unchanged, 10);
  assert.equal(m.vars.size, count, 'no new variables');
});

test('without the library: plain values, each reported', async () => {
  const { m, ui } = await connected({});
  const r = await ui.send('site-pull');
  assert.equal(r.done.report.aliased, 0);
  assert.equal(r.done.report.raw.length, 6);
  const { vars, mode } = shadcn(m);
  assert.equal(hex(vars.get('primary').valuesByMode[mode('light')]), '#fddb2b');
  assert.equal(vars.get('radius').valuesByMode[mode('light')], 12);
  assert.equal(r.done.site.status, 'same');
});

test('designer edits in Figma: «в Figma новее», push with If-Match, then «совпадает»', async () => {
  const { m, ui, site } = await connected();
  await ui.send('site-pull');
  const { col, vars, mode } = shadcn(m);
  vars.get('primary').setValueForMode(mode('light'), { r: 0x7c / 255, g: 0x3a / 255, b: 0xed / 255, a: 1 });
  const extra = m.figma.variables.createVariable('mb-card', col, 'FLOAT');
  extra.scopes = ['CORNER_RADIUS'];
  extra.setValueForMode(mode('light'), 20);
  extra.setValueForMode(mode('dark'), 20);
  m.figma.variables.createVariable('Bad Name', col, 'COLOR').setValueForMode(mode('light'), { r: 0, g: 0, b: 0, a: 1 });
  let r = await ui.send('site-status');
  assert.equal(r.done.site.status, 'figma-newer');
  assert.deepEqual(r.done.site.figmaChanges, ['Bad Name', 'mb-card', 'primary']);

  r = await ui.send('site-push');
  const put = site.puts.at(-1);
  assert.equal(put.ifMatch, '"1"');
  assert.deepEqual(put.body.overrides, { primary: { light: '#7c3aed' } }, 'only the changed mode, dark stays the Mbank alias');
  assert.deepEqual(put.body.custom.map((t) => [t.name, t.kind, t.light]), [['mb-promo', 'color', '#fef3c7'], ['mb-card', 'radius', '20px']]);
  assert.equal(put.body.source, 'figma');
  assert.ok(r.done.push.skipped.some((s) => s.startsWith('Bad Name')));
  assert.equal(r.done.push.version, 2);
  assert.equal(r.done.site.status, 'same');
});

test('both sides changed: conflict on push, pull refuses without force, force takes the site', async () => {
  const { m, ui, site } = await connected();
  await ui.send('site-pull');
  const { vars, mode } = shadcn(m);
  vars.get('primary').setValueForMode(mode('light'), { r: 1, g: 0, b: 0, a: 1 });
  site.doc = { ...site.doc, version: 2, overrides: { primary: { light: '#16a34a' } } }; // edited on the site meanwhile
  let r = await ui.send('site-status');
  assert.equal(r.done.site.status, 'conflict');
  r = await ui.send('site-push');
  assert.deepEqual({ conflict: r.done.push.conflict, site: r.done.push.siteVersion, local: r.done.push.localVersion }, { conflict: true, site: 2, local: 1 });
  await assert.rejects(ui.send('site-pull'), /неотправленные правки.*primary/);
  r = await ui.send('site-pull', { force: true });
  assert.equal(hex(vars.get('primary').valuesByMode[mode('light')]), '#16a34a');
  assert.equal(r.done.site.status, 'same');
  assert.equal(r.done.site.localVersion, 2);
});

test('pushPayload: a value equal to the base is not an override; refs become var()', () => {
  const plan = planOf({ version: 1, overrides: {}, custom: [] });
  const cur = {
    primary: { type: 'COLOR', light: { sig: 'value:#fddb2b', value: '#fddb2b' }, dark: { sig: 'alias:accent/primary/default', value: null } },
    ring: { type: 'COLOR', light: { sig: 'ref:background', value: '#ffffff' }, dark: { sig: 'ref:primary', value: '#f7c21c' } },
  };
  const { tokens } = pushPayload(plan, cur);
  assert.deepEqual(tokens.overrides, { ring: { light: 'var(--background)' } });
});
