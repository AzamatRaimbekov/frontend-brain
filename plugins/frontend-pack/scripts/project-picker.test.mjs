// Tests for project-picker.mjs: argument parsing, validation and the real local server driven with fetch.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parseArgs, renderPage, startPicker, validateChoice } from './project-picker.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'picker-'));

test('parseArgs reads options and rejects junk', () => {
  const opts = parseArgs(['--parent', '/tmp', '--name=crm-1', '--timeout', '5', '--no-open']);
  assert.equal(opts.parent, '/tmp');
  assert.equal(opts.name, 'crm-1');
  assert.equal(opts.timeout, 5);
  assert.equal(opts.open, false);
  assert.throws(() => parseArgs(['--timeout', '-1']), /positive/);
  assert.throws(() => parseArgs(['--what']), /Unknown/);
});

test('validateChoice accepts a kind and a clean folder, returns the create command', () => {
  const parent = tmp();
  const choice = validateChoice({ type: 'webview', name: 'pay-qr' }, parent);
  assert.equal(choice.dir, join(parent, 'pay-qr'));
  assert.match(choice.create[1], /new-webview\.mjs$/);
  assert.match(validateChoice({ type: 'crm', name: 'crm' }, parent).create[1], /new-crm\.mjs$/);
});

test('validateChoice rejects unknown kinds, bad names and non-empty folders', () => {
  const parent = tmp();
  assert.throws(() => validateChoice({ type: 'site', name: 'a' }, parent), /тип/);
  for (const name of ['', 'My App', '../up', 'a/b', '-x']) {
    assert.throws(() => validateChoice({ type: 'crm', name }, parent), /Папка/);
  }
  mkdirSync(join(parent, 'busy'));
  writeFileSync(join(parent, 'busy', 'x'), '');
  assert.throws(() => validateChoice({ type: 'crm', name: 'busy' }, parent), /не пустая/);
});

test('renderPage fills the key and escapes the folder name', () => {
  const html = renderPage('{{KEY}}|{{NAME}}|{{KEY}}', { key: 'abc', name: '"><x' });
  assert.equal(html, 'abc|&#34;&#62;&#60;x|abc');
});

test('server: key required, page and tokens served, a valid POST resolves the choice', async () => {
  const parent = tmp();
  const picker = await startPicker({ parent, timeout: 5, template: '<p>{{KEY}}</p>' });
  const base = picker.url.split('?')[0];
  const key = new URL(picker.url).searchParams.get('k');
  assert.equal((await fetch(base)).status, 403);
  assert.equal(await (await fetch(picker.url)).text(), `<p>${key}</p>`);
  assert.match(await (await fetch(`${base}tokens.css?k=${key}`)).text(), /--background/);
  const post = (body) => fetch(`${base}choose?k=${key}`, { method: 'POST', body: JSON.stringify(body) });
  const bad = await post({ type: 'crm', name: 'Bad Name' });
  assert.equal(bad.status, 400);
  assert.match((await bad.json()).error, /Папка/);
  assert.equal((await post({ type: 'webview', name: 'wallet' })).status, 200);
  const choice = await picker.result;
  assert.equal(choice.type, 'webview');
  assert.equal(choice.dir, join(parent, 'wallet'));
});

test('server: no answer before the timeout resolves null', async () => {
  const picker = await startPicker({ parent: tmp(), timeout: 0.05, template: 'x' });
  assert.equal(await picker.result, null);
});
