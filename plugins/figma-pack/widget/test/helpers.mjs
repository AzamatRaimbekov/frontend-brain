// Test helpers of the widget: boots dist/code.js on the builder's Figma mock (imported read-only),
// drives the iframe by messages, and places what a designer's file has (the widget node, instances).
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
export const hex = (c) => `#${[c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;

/** The widget itself on the canvas: the mock's useWidgetNodeId() returns 'widget:1'. */
export function placeWidget(m, { x = 100, y = 200, width = 960, height = 900 } = {}) {
  const node = m.figma.createFrame();
  m.nodes.delete(node.id);
  Object.assign(node, { id: 'widget:1', name: 'Mbank Tokens', x, y, width, height });
  m.nodes.set(node.id, node);
  m.figma.currentPage.appendChild(node);
  return node;
}

/** n instances of a variant of the set, placed on a page (created when missing): a product screen. */
export function placeInstances(m, main, n, pageName = 'Screens') {
  let page = m.figma.root.children.find((p) => p.name === pageName);
  if (!page) { page = m.figma.createPage(); page.name = pageName; }
  const frame = m.figma.createFrame();
  frame.name = 'Screen';
  page.appendChild(frame);
  return Array.from({ length: n }, () => { const i = main.createInstance(); frame.appendChild(i); return i; });
}

/** Component set (or single component) built from a contract name, on any page. */
export const setOf = (m, title) => m.figma.root.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === title && n.parent.type === 'PAGE');

/** Variable bound to the first fill / stroke of a node. */
export const fillVar = (m, node, field = 'fills') => {
  const paint = node[field][0];
  return paint && paint.boundVariables && paint.boundVariables.color ? m.vars.get(paint.boundVariables.color.id) : null;
};
