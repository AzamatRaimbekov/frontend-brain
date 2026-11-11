// oklch() <-> sRGB / Figma RGBA: reference values are Tailwind v4 / shadcn neutral colours in hex.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOklch, parseColor, colorKey, rgbaToOklch, rgbaToHex, inGamut, contrastRatio, composite } from '../core/oklch.js';

const REF = {
  'oklch(1 0 0)': '#ffffff',
  'oklch(0.985 0 0)': '#fafafa',
  'oklch(0.97 0 0)': '#f5f5f5',
  'oklch(0.922 0 0)': '#e5e5e5',
  'oklch(0.87 0 0)': '#d4d4d4',
  'oklch(0.708 0 0)': '#a1a1a1',
  'oklch(0.556 0 0)': '#737373',
  'oklch(0.439 0 0)': '#525252',
  'oklch(0.371 0 0)': '#404040',
  'oklch(0.269 0 0)': '#262626',
  'oklch(0.205 0 0)': '#171717',
  'oklch(0.145 0 0)': '#0a0a0a',
  'oklch(0.577 0.245 27.325)': '#e7000b', // red-600 (slightly outside sRGB: clipped like browsers)
  'oklch(0.704 0.191 22.216)': '#ff6467', // red-400
  'oklch(0.488 0.243 264.376)': '#1447e6', // blue-700
  'oklch(0.646 0.222 41.116)': '#f54900', // orange-600
};

test('oklch -> sRGB matches the Tailwind v4 palette in 8-bit', () => {
  for (const [css, hex] of Object.entries(REF)) assert.equal(colorKey(css), hex, css);
});

test('alpha is kept: oklch(1 0 0 / 10%) -> white with a = 0.1', () => {
  const c = parseColor('oklch(1 0 0 / 10%)');
  assert.deepEqual([c.r, c.g, c.b].map((x) => Math.round(x * 1e6) / 1e6), [1, 1, 1]);
  assert.equal(c.a, 0.1);
  assert.equal(parseColor('oklch(1 0 0 / 0.15)').a, 0.15);
  assert.equal(rgbaToHex(c), '#ffffff1a');
  assert.equal(rgbaToOklch(c), 'oklch(1 0 0 / 10%)');
});

test('parse forms: percent lightness, none hue, hex shorthands; garbage is null', () => {
  assert.deepEqual(parseOklch('oklch(50% 0.1 120)'), { l: 0.5, c: 0.1, h: 120, alpha: 1 });
  assert.equal(parseOklch('oklch(0.5 0 none)').h, 0);
  assert.equal(colorKey('#FFF'), '#ffffff');
  assert.equal(colorKey('#0008'), '#00000088');
  for (const bad of ['red', 'oklch(1 0)', 'rgb(0,0,0)', '', null, '#12345']) assert.equal(parseColor(bad), null, String(bad));
});

test('round trip: sRGB -> oklch string -> the same 8-bit colour; greys are written with C = H = 0', () => {
  for (const hex of ['#7c3aed', '#16a34a', '#fddb2b', '#0e0f11', '#ffffff', '#000000', '#737373']) {
    const css = rgbaToOklch(parseColor(hex));
    assert.match(css, /^oklch\(/);
    assert.equal(colorKey(css), hex, `${hex} -> ${css}`);
  }
  assert.equal(rgbaToOklch(parseColor('#737373')), 'oklch(0.556 0 0)');
  for (const css of Object.keys(REF).filter((k) => / 0 0\)$/.test(k))) assert.equal(rgbaToOklch(parseColor(css)), css);
});

test('gamut and contrast', () => {
  assert.equal(inGamut('oklch(0.205 0 0)'), true);
  assert.equal(inGamut('oklch(0.577 0.245 27.325)'), false);
  const white = parseColor('#ffffff');
  const black = parseColor('#000000');
  assert.equal(Math.round(contrastRatio(white, black)), 21);
  assert.equal(contrastRatio(white, white), 1);
  const half = composite({ r: 0, g: 0, b: 0, a: 0.5 }, white);
  assert.ok(Math.abs(half.r - 0.5) < 1e-9 && half.a === 1);
});
