// Tokens split by platform (tokens-platforms.mjs): web and mobile in their own files, lossless back to tokens.json,
// a new platform (tablet) added by one command reaches tokens.json, its dist file and the spec viewports.
// Run: node --test plugins/figma-pack/scripts/tokens-platforms.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PATHS, split, merge, validate, build, addPlatform, readSources, dist, LEGACY } from './tokens-platforms.mjs';

const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

// A throwaway copy of the sources and generated files, so tests never write into the repo.
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'tokens-platforms-'));
  const paths = { tokens: join(root, 'tokens.json'), dir: join(root, 'tokens'), module: join(root, 'core', 'platforms.js') };
  cpSync(PATHS.tokens, paths.tokens);
  cpSync(PATHS.dir, paths.dir, { recursive: true });
  mkdirSync(join(root, 'core'));
  cpSync(PATHS.module, paths.module);
  return paths;
}

test('the repo files are built: tokens.json, dist and platforms.js match the platform sources', () => {
  const r = build({ check: true });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.stale, [], 'run: node plugins/figma-pack/scripts/tokens-platforms.mjs build');
});

test('web and mobile live in separate files with their own names; colours stay shared', () => {
  const { core, platforms } = readSources();
  const [web, mobile] = ['web', 'mobile'].map((id) => platforms.find((p) => p.id === id));
  assert.ok(core.theme.vars.length > 100 && core.brand, 'colours in core');
  assert.equal(core.webSpacing, undefined, 'no platform section in core');
  assert.deepEqual(Object.keys(web.sections), LEGACY.web.sections);
  assert.deepEqual(Object.keys(mobile.sections), ['mobileFoundation']);
  const radiusM = (p) => dist(core, p).radius.find((x) => x.name.startsWith('radius/m')).px;
  assert.equal(radiusM(web), 12, 'web radius/m');
  assert.equal(radiusM(mobile), 16, 'mobile radius/m: same name, other value');
  assert.equal(dist(core, mobile).spacing.find((x) => x.px === 16).name, 'paddings/default/m - 2');
  assert.equal(dist(core, web).spacing.find((x) => x.px === 16).name, 'spacing/m-2-base');
  assert.equal(web.textStyles[0].family, 'Inter Mbank');
  assert.equal(mobile.textStyles[0].family, 'Nunito');
});

test('split -> merge is lossless for the owner tokens.json', () => {
  const tokens = json(PATHS.tokens);
  const { core, platforms } = split(tokens);
  assert.deepEqual(merge(core, platforms), tokens);
  // A tokens.json written before the split (no "platforms") splits by the legacy table.
  const { platforms: _, ...old } = tokens;
  const back = merge(...Object.values(split(old)));
  delete back.platforms;
  assert.deepEqual(back, old);
});

test('add tablet --from web: new file, built into tokens.json, its own dist and spec viewport', async () => {
  const paths = sandbox();
  const { file, platform } = addPlatform('tablet', { title: 'Tablet', from: 'web', viewport: 'ipad:1024', paths });
  assert.ok(existsSync(file));
  assert.deepEqual(platform.viewports, { ipad: 1024 });
  assert.deepEqual(Object.keys(platform.sections), ['tabletBrandRadius', 'tabletBorderRadius', 'tabletRem', 'tabletWebSpacing'], 'sections renamed: unique in tokens.json');
  const r = build({ paths });
  assert.deepEqual(r.platforms, ['web', 'mobile', 'tablet']);
  const tokens = json(paths.tokens);
  assert.ok(tokens.tabletWebSpacing && tokens.webSpacing, 'web unchanged, tablet next to it');
  assert.equal(tokens.platforms.tablet.title, 'Tablet');
  assert.equal(tokens.textStyles.tablet.length, tokens.textStyles.web.length);
  assert.equal(json(join(paths.dir, 'dist', 'tablet.json')).spacing.find((x) => x.px === 16).name, 'spacing/m-2-base');
  const mod = await import(`${paths.module}?t=${Date.now()}`);
  assert.equal(mod.VIEWPORTS.ipad, 1024);
  assert.deepEqual(mod.PLATFORMS.tablet.viewports, ['ipad']);
  assert.equal(build({ check: true, paths }).ok, true, 'second build changes nothing');
  assert.throws(() => addPlatform('tablet', { paths }), /уже есть/);
  assert.throws(() => addPlatform('TV', { paths }), /латиница/);
  assert.throws(() => addPlatform('tv', { viewport: 'desktop:1920', paths }), /viewport «desktop» уже есть/);
});

test('validation explains mistakes in Russian', () => {
  const { core, platforms } = readSources();
  const bad = { ...platforms[0], id: 'tv', viewports: { tv: 50 }, sections: { theme: { vars: [] } }, scales: { spacing: { section: 'nope' } } };
  const errors = validate(core, [...platforms, bad]).join('\n');
  assert.match(errors, /ширина целым числом/);
  assert.match(errors, /раздел «theme» уже занят/);
  assert.match(errors, /ссылается на раздел «nope»/);
});

test('the spec takes platforms and viewports from the platform files', async () => {
  const { validateSpec, normalizeSpec, VIEWPORTS } = await import('../builder/core/spec.js');
  assert.equal(VIEWPORTS.mobile, 375);
  const spec = { project: 'P', platform: 'mobile', screens: [{ id: 'a', title: 'A', blocks: [{ type: 'header', title: 'A' }] }] };
  assert.deepEqual(validateSpec(spec), []);
  const n = normalizeSpec(spec);
  assert.deepEqual(n.screens[0].viewports, ['mobile']);
  assert.equal(n.screens[0].shell, 'mobile');
  assert.match(validateSpec({ ...spec, platform: 'watch' }).join(), /platform: web \| mobile/);
});
