// Test helpers of the widget: boots dist/code.js on the builder's Figma mock (imported read-only),
// and drives the iframe by messages.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, installWidget } from '../../builder/test/figma-mock.mjs';

const CODE = readFileSync(new URL('../dist/code.js', import.meta.url), 'utf8');
export const UI = readFileSync(new URL('../dist/ui.html', import.meta.url), 'utf8');
export const MANIFEST = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

/** opts: createFigma options ({ library } = what the file's connected libraries publish). */
export function boot(seed, opts = {}) {
  const m = createFigma(opts);
  const w = installWidget(m.figma);
  if (seed) seed(m.figma);
  globalThis.figma = m.figma;
  globalThis.__html__ = UI;
  new Function(CODE)(); // the IIFE registers the widget
  return { ...m, w };
}

// Opens the iframe through the property menu and returns a sender for its messages.
export async function openWindow(w, action = 'edit') {
  w.render();
  const pending = w.menu.handler({ propertyName: action });
  assert.ok(figma.uiShown, 'figma.showUI called');
  const send = async (type, data = {}) => {
    w.sent.length = 0;
    await figma.ui.onmessage({ type, ...data });
    const done = w.sent.find((x) => x.type === `${type}:done` || x.type === 'error');
    if (done && done.type === 'error') throw new Error(done.message);
    return { done, state: w.sent.find((x) => x.type === 'state')?.state };
  };
  return { send, pending };
}

export const byName = (m, collection, name) => {
  const col = [...m.cols.values()].find((c) => c.name === collection);
  const v = [...m.vars.values()].find((x) => x.variableCollectionId === col.id && x.name === name);
  return { col, v, mode: (n) => col.modes.find((x) => x.name === n).modeId };
};
export const hex = (c) => `#${[c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}${c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : ''}`;
