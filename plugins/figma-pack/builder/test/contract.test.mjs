// Pure contract logic (core/contract.js, core/contract-templates.js) on the fixture contracts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateContract, variantList, resolveStyle, layoutFor, bindingTarget, bindingRows, setBinding,
  diffVariants, splitKey, splitToken, tokensUsed, partKind,
} from '../core/contract.js';
import { newContract, parseProps, TEMPLATES } from '../core/contract-templates.js';

const load = (n) => JSON.parse(readFileSync(new URL(`./fixtures/contracts/${n}.json`, import.meta.url)));
const button = load('button');
const badge = load('badge');
const input = load('input');

test('fixtures are valid contracts; bad ones are explained', () => {
  for (const c of [button, badge, input]) assert.deepEqual(validateContract(c), [], c.name);
  const bad = setBinding(button, ['base', 'root'], 'bg', '#ff0000');
  assert.match(validateContract(bad).join('\n'), /только имя токена/);
  const noVariant = JSON.parse(JSON.stringify(button));
  delete noVariant.variants.size.lg;
  assert.match(validateContract(noVariant).join('\n'), /variants\.size\.lg: не описан/);
  assert.match(validateContract(setBinding(button, ['base', 'root'], 'colour', 'x')).join('\n'), /неизвестное свойство/);
  assert.match(validateContract(setBinding(button, ['base', 'nope'], 'bg', 'x')).join('\n'), /не объявлена/);
  assert.match(validateContract(setBinding(button, ['base', 'root'], 'bg:pressed', 'x')).join('\n'), /неизвестное состояние/);
});

test('variant list = props x states, state only when there are several', () => {
  const b = variantList(button);
  assert.equal(b.length, 4 * 3 * 5);
  assert.equal(b[0].name, 'variant=primary, size=sm, state=default');
  assert.equal(new Set(b.map((v) => v.name)).size, b.length);
  assert.equal(variantList(badge).length, 3 * 2 * 2);
  assert.equal(variantList(badge)[0].name, 'tone=neutral, fill=ghost, size=sm');
  assert.equal(variantList(input).length, 3 * 4);
});

test('resolved style: layers, state suffixes, compound, focus ring, disabled', () => {
  const hover = resolveStyle(button, { variant: 'primary', size: 'md' }, 'hover');
  assert.equal(hover.root.bg, 'primary-hover');
  assert.equal(hover.root.height, 11);
  assert.equal(hover.root.radius, 'md');
  assert.equal(hover.root['focus-ring'], undefined, 'ring only in focus');
  assert.equal(resolveStyle(button, { variant: 'primary', size: 'md' }, 'focus').root['focus-ring'], 'ring/50');
  assert.equal(resolveStyle(button, { variant: 'outline', size: 'sm' }, 'disabled').root.opacity, 50);
  assert.equal(resolveStyle(button, { variant: 'outline', size: 'sm' }, 'default').icon.size, 4, 'size overrides base icon size');
  const solid = resolveStyle(badge, { tone: 'success', fill: 'solid', size: 'sm' });
  assert.equal(solid.root.bg, 'status-success', 'compound wins');
  assert.equal(solid.root.fg, 'status-filled-foreground');
  assert.equal(resolveStyle(badge, { tone: 'success', fill: 'ghost', size: 'sm' }).root.bg, 'status-success-muted');
  const dis = resolveStyle(input, { size: 'lg' }, 'disabled');
  assert.equal(dis.root.border, 'input-disabled');
  assert.equal(dis.root.px, 4);
  assert.equal(dis.placeholder.fg, 'disabled-foreground');
  assert.equal(dis.root.opacity, undefined, 'explicit disabled styles: no implicit opacity');
  const plain = { ...badge, states: ['default', 'disabled'] };
  assert.equal(resolveStyle(plain, { tone: 'neutral', fill: 'ghost', size: 'sm' }, 'disabled').root.opacity, 50);
});

test('layout mapping and binding targets', () => {
  const l = layoutFor({ layout: 'row', align: 'center', gap: 2, px: 4, height: 11 });
  assert.deepEqual([l.layoutMode, l.counterAxisAlignItems, l.itemSpacing, l.paddingLeft, l.paddingTop, l.height, l.counterAxisSizingMode],
    ['HORIZONTAL', 'CENTER', 8, 16, 0, 44, 'FIXED']);
  const col = layoutFor({ layout: 'column', height: 10, size: undefined });
  assert.equal(col.primaryAxisSizingMode, 'FIXED');
  assert.equal(layoutFor({ size: 5 }).width, 20);
  assert.equal(layoutFor({ px: 1.5 }).paddingLeft, 6);
  assert.deepEqual(bindingTarget('px').fields, ['paddingLeft', 'paddingRight']);
  assert.equal(bindingTarget('bg').field, 'fills');
  assert.equal(bindingTarget('radius').fields.length, 4);
  assert.equal(bindingTarget('text').kind, 'textStyle');
  assert.deepEqual(splitKey('border:focus'), { prop: 'border', state: 'focus' });
  assert.deepEqual(splitToken('ring/30'), { token: 'ring', opacity: 0.3 });
  assert.deepEqual([partKind('root'), partKind('label'), partKind('icon'), partKind('content')], ['root', 'text', 'icon', 'frame']);
});

test('binding rows and setBinding round trip', () => {
  const rows = bindingRows(button);
  const r = rows.find((x) => x.source === 'variant=primary' && x.key === 'bg:hover');
  assert.deepEqual([r.part, r.prop, r.state, r.value, r.kind], ['root', 'bg', 'hover', 'primary-hover', 'color']);
  const next = setBinding(button, r.path, r.key, 'brand-hover');
  assert.equal(next.variants.variant.primary.root['bg:hover'], 'brand-hover');
  assert.equal(button.variants.variant.primary.root['bg:hover'], 'primary-hover', 'immutable');
  const added = setBinding(button, ['variants', 'variant', 'ghost', 'root'], 'fg:disabled', 'disabled-foreground');
  assert.ok(bindingRows(added).some((x) => x.key === 'fg:disabled' && x.source === 'variant=ghost'));
  assert.equal(setBinding(next, r.path, r.key, null).variants.variant.primary.root['bg:hover'], undefined);
  assert.ok(bindingRows(badge).some((x) => x.source === 'fill=solid + tone=neutral' && x.value === 'status-neutral'));
  const used = tokensUsed(button);
  assert.ok(used.color.has('ring') && used.color.has('primary-hover'));
  assert.ok(used.space.has(11) && used.radius.has('md'));
});

test('diff for update in place matches names regardless of order and spacing', () => {
  const wanted = variantList(input);
  const existing = [
    { id: 'a', name: 'state=default,size=sm' },
    { id: 'b', name: 'size=old, state=default' },
  ];
  const d = diffVariants(existing, wanted);
  assert.equal(d.keep.length, 1);
  assert.equal(d.keep[0].id, 'a');
  assert.equal(d.create.length, wanted.length - 1);
  assert.deepEqual(d.stale.map((s) => s.id), ['b']);
});

test('new contract from every anatomy template is valid', () => {
  assert.deepEqual(parseProps('variant = primary, Secondary; size=sm,md'), { variant: ['primary', 'secondary'], size: ['sm', 'md'] });
  for (const template of Object.keys(TEMPLATES)) {
    const c = newContract({ name: `My ${template}`, template, props: 'tone=a,b; size=sm,lg' });
    assert.deepEqual(validateContract(c), [], template);
    assert.equal(c.variants.size.lg.root.height, 14);
    assert.equal(variantList(c).length, 4 * c.states.length);
  }
  assert.throws(() => newContract({ name: 'x', template: 'nope' }), /Нет шаблона/);
});
