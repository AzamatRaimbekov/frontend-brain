// «Сайт»: the built widget (dist/code.js) on the Figma mock against a fake design-system site:
// pull creates/updates the `shadcn` collection (oklch values -> Figma RGBA with alpha, refs inside shadcn,
// radius in px), push sends value overrides of the shadcn names with If-Match, statuses and the conflict.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { boot, openWindow, hex, MANIFEST } from './helpers.mjs';
import { pushPayload, syncStatus, siteOrigin } from '../core/site.js';

// figma.json as apps/ds-configurator serves it (ds-configurator/figma-plan@2), for a site document
// { version, overrides }: value = resolved #hex / px / family, css = the raw CSS value, ref = var(--other).
const BASE = [
  { name: 'background', kind: 'color', type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL'], light: { value: '#ffffff', css: 'oklch(1 0 0)' }, dark: { value: '#0a0a0a', css: 'oklch(0.145 0 0)' } },
  { name: 'primary', kind: 'color', type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL'], light: { value: '#171717', css: 'oklch(0.205 0 0)' }, dark: { value: '#e5e5e5', css: 'oklch(0.922 0 0)' } },
  { name: 'border', kind: 'color', type: 'COLOR', scopes: ['STROKE_COLOR'], light: { value: '#e5e5e5', css: 'oklch(0.922 0 0)' }, dark: { value: '#ffffff1a', css: 'oklch(1 0 0 / 10%)' } },
  { name: 'ring', kind: 'color', type: 'COLOR', scopes: ['STROKE_COLOR'], light: { ref: 'primary', value: '#171717', css: 'var(--primary)' }, dark: { ref: 'primary', value: '#e5e5e5', css: 'var(--primary)' } },
  { name: 'radius', kind: 'radius', type: 'FLOAT', scopes: ['CORNER_RADIUS'], light: { value: 10, css: '0.625rem' }, dark: { value: 10, css: '0.625rem' } },
  { name: 'radius-sm', kind: 'radius', type: 'FLOAT', scopes: ['CORNER_RADIUS'], editable: false, derived: true, light: { value: 6, css: 'calc(var(--radius) * 0.6)' }, dark: { value: 6, css: 'calc(var(--radius) * 0.6)' } },
  { name: 'font-sans', kind: 'font', type: 'STRING', scopes: ['FONT_FAMILY'], light: { value: 'Geist', css: "'Geist Variable', sans-serif" }, dark: { value: 'Geist', css: "'Geist Variable', sans-serif" } },
  { name: 'font-heading', kind: 'font', type: 'STRING', scopes: ['FONT_FAMILY'], light: { value: 'Geist', css: 'var(--font-sans)', ref: 'font-sans' }, dark: { value: 'Geist', css: 'var(--font-sans)', ref: 'font-sans' } },
];

const px = (css) => (/rem$/.test(css) ? parseFloat(css) * 16 : parseFloat(css));
function planOf(doc) {
  const variables = BASE.map((b) => {
    const o = doc.overrides[b.name] || {};
    const val = (m) => {
      const css = o[m] || (m === 'dark' && b.kind !== 'color' && o.light);
      if (!css) return b[m];
      if (/^var/.test(css)) return { ref: css.slice(6, -1), value: null, css };
      return { value: b.kind === 'radius' ? px(css) : b.kind === 'font' ? css : css, css };
    };
    return { name: b.name, kind: b.kind, type: b.type, scopes: b.scopes, codeSyntax: `var(--${b.name})`, editable: b.editable !== false, ...(b.derived ? { derived: true } : {}),
      overridden: !!(o.light || o.dark), values: { light: val('light'), dark: val('dark') }, base: { light: b.light, dark: b.dark } };
  });
  return { $schema: 'ds-configurator/figma-plan@2', collection: 'shadcn', modes: ['Light', 'Dark'], project: 'demo', version: doc.version, variables };
}

function fakeSite() {
  const site = { doc: { version: 1, overrides: {} }, puts: [], syncs: [] };
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
      site.doc = { version: site.doc.version + 1, overrides: body.overrides };
      return reply(200, { tokens: site.doc, diff: {} });
    }
    return reply(404, { error: 'нет' });
  };
  return site;
}

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

async function connected(opts = {}) {
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

test('connect, pull: shadcn collection (Light, Dark) with oklch values, alpha, refs and px; idempotent', async () => {
  const { m, ui, site, store, connect } = await connected();
  assert.equal(connect.status, 'never');
  assert.deepEqual(JSON.parse(m.figma.root.getPluginData('site:conn')), { url: 'http://localhost:8797', project: 'demo' });
  assert.equal(store.get('site-key:http://localhost:8797|demo'), 'dsk_secret', 'key only in clientStorage');
  assert.ok(!m.figma.root.getPluginData('site:conn').includes('dsk_'));

  let r = await ui.send('site-pull');
  const rep = r.done.report;
  assert.equal(rep.collectionCreated, true);
  assert.deepEqual(rep.created.sort(), ['background', 'border', 'font-heading', 'font-sans', 'primary', 'radius', 'radius-sm', 'ring']);
  assert.equal(rep.refs, 4, 'ring -> primary, font-heading -> font-sans');
  assert.deepEqual(rep.errors, []);
  assert.equal(r.done.site.status, 'same');
  assert.deepEqual(site.syncs.map((s) => [s.from, s.version]), [['site', 1]]);
  const { col, vars, mode } = shadcn(m);
  assert.deepEqual(col.modes.map((x) => x.name), ['Light', 'Dark']);
  assert.equal(hex(vars.get('background').valuesByMode[mode('Dark')]), '#0a0a0a');
  assert.equal(hex(vars.get('border').valuesByMode[mode('Dark')]), '#ffffff1a', 'alpha kept');
  assert.equal(vars.get('ring').valuesByMode[mode('Light')].id, vars.get('primary').id, 'ring -> shadcn/primary');
  assert.equal(vars.get('primary').codeSyntax.WEB, 'var(--primary)');
  assert.deepEqual(vars.get('radius').scopes, ['CORNER_RADIUS']);
  assert.equal(vars.get('radius').valuesByMode[mode('Light')], 10);
  assert.equal(vars.get('radius-sm').valuesByMode[mode('Dark')], 6);
  assert.equal(vars.get('font-sans').valuesByMode[mode('Light')], 'Geist');
  assert.equal(vars.get('font-heading').valuesByMode[mode('Light')].id, vars.get('font-sans').id);

  const count = m.vars.size;
  r = await ui.send('site-pull');
  assert.equal(r.done.report.created.length + r.done.report.updated.length, 0, 'second pull changes nothing');
  assert.equal(r.done.report.unchanged, 16);
  assert.equal(m.vars.size, count, 'no new variables');
});

test('designer edits in Figma: «в Figma новее», push of the changed value as oklch with If-Match, then «совпадает»', async () => {
  const { m, ui, site } = await connected();
  await ui.send('site-pull');
  const { col, vars, mode } = shadcn(m);
  vars.get('primary').setValueForMode(mode('Light'), { r: 0x7c / 255, g: 0x3a / 255, b: 0xed / 255, a: 1 });
  vars.get('radius').setValueForMode(mode('Light'), 12);
  vars.get('radius').setValueForMode(mode('Dark'), 12);
  vars.get('radius-sm').setValueForMode(mode('Light'), 8); // derived: never pushed
  vars.get('font-sans').setValueForMode(mode('Light'), 'Inter');
  vars.get('font-sans').setValueForMode(mode('Dark'), 'Inter');
  m.figma.variables.createVariable('brand', col, 'COLOR').setValueForMode(mode('Light'), { r: 0, g: 0, b: 0, a: 1 });
  let r = await ui.send('site-status');
  assert.equal(r.done.site.status, 'figma-newer');
  assert.deepEqual(r.done.site.figmaChanges, ['brand', 'font-sans', 'primary', 'radius', 'radius-sm']);

  r = await ui.send('site-push');
  const put = site.puts.at(-1);
  assert.equal(put.ifMatch, '"1"');
  assert.deepEqual(put.body, { overrides: { primary: { light: 'oklch(0.541 0.247 293.009)' }, radius: { light: '12px' }, 'font-sans': { light: "'Inter', sans-serif" } }, source: 'figma' }, 'only changed modes; no derived, no custom tokens');
  assert.ok(r.done.push.skipped.some((s) => s.startsWith('brand: такого токена shadcn нет')));
  assert.equal(r.done.push.version, 2);
  assert.equal(r.done.site.status, 'same');
  // The site serves the override back: the next pull keeps the Figma value.
  r = await ui.send('site-pull');
  assert.equal(hex(vars.get('primary').valuesByMode[mode('Light')]), '#7c3aed');
});

test('both sides changed: conflict on push, pull refuses without force, force takes the site', async () => {
  const { m, ui, site } = await connected();
  await ui.send('site-pull');
  const { vars, mode } = shadcn(m);
  vars.get('primary').setValueForMode(mode('Light'), { r: 1, g: 0, b: 0, a: 1 });
  site.doc = { ...site.doc, version: 2, overrides: { primary: { light: '#1447e6', dark: 'oklch(0.922 0 0)' } } }; // edited on the site meanwhile
  let r = await ui.send('site-status');
  assert.equal(r.done.site.status, 'conflict');
  r = await ui.send('site-push');
  assert.deepEqual({ conflict: r.done.push.conflict, site: r.done.push.siteVersion, local: r.done.push.localVersion }, { conflict: true, site: 2, local: 1 });
  await assert.rejects(ui.send('site-pull'), /неотправленные правки.*primary/);
  r = await ui.send('site-pull', { force: true });
  assert.equal(hex(vars.get('primary').valuesByMode[mode('Light')]), '#1447e6');
  assert.equal(r.done.site.status, 'same');
  assert.equal(r.done.site.localVersion, 2);
});

test('pushPayload: a value equal to the base (other notation) is not an override; refs become var()', () => {
  const plan = planOf({ version: 1, overrides: {} });
  const cur = {
    primary: { type: 'COLOR', light: { sig: 'value:#171717', value: '#171717', css: 'oklch(0.205 0 0)' }, dark: { sig: 'value:#e5e5e5', value: '#e5e5e5', css: 'oklch(0.922 0 0)' } },
    'radius-sm': { type: 'FLOAT', light: { sig: 'value:99', value: 99, css: '99px' }, dark: { sig: 'value:99', value: 99, css: '99px' } },
    ring: { type: 'COLOR', light: { sig: 'ref:background', value: '#ffffff', css: 'var(--background)' }, dark: { sig: 'ref:primary', value: '#e5e5e5', css: 'var(--primary)' } },
  };
  const { tokens, skipped } = pushPayload(plan, cur);
  assert.deepEqual(tokens.overrides, { ring: { light: 'var(--background)' } });
  assert.deepEqual(skipped, []);
});
