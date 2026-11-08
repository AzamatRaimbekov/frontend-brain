// «Components» as a kit sheet a designer can read: one Figma section per group (Основа, Формы, …), in it a card
// per component — title, variant count, its properties — with the component set itself on a token-bound surface.
// Rebuilding reuses the cards (plugin data "mbank-doc"), so sets and their instances stay where they are.
import { loadFonts } from './draw.js';
import { tokenIndex, colorVar } from './tokens-resolve.js';

export const GROUPS = [
  { title: 'Основа', names: ['button', 'badge', 'avatar', 'card', 'separator'] },
  { title: 'Формы', names: ['input', 'textarea', 'search-input', 'select-trigger', 'date-picker-trigger', 'checkbox', 'radio', 'switch', 'filter-chip'] },
  { title: 'Навигация', names: ['nav-item', 'tabbar-item', 'breadcrumb-item', 'tabs-list', 'tabs-trigger', 'pagination', 'stepper-step'] },
  { title: 'Данные', names: ['table-head', 'table-cell'] },
  { title: 'Обратная связь', names: ['alert', 'toast', 'progress', 'spinner', 'skeleton', 'empty-state'] },
  { title: 'Оверлеи', names: ['dialog', 'tooltip', 'dropdown-menu-item'] },
  { title: 'CRM', names: ['crm-kpi-card', 'crm-application-card', 'crm-key-value-row', 'crm-timeline-item', 'crm-transfer-row', 'crm-list-item'] },
];
const DOC = 'mbank-doc';
const GAP = 48;
const SECTION_GAP = 160;
const PAD = 64;
const ROW_WIDTH = 2400;

const groupOf = (name) => (GROUPS.find((g) => g.names.includes(name)) || { title: 'Другое' }).title;

/** «variant: primary, brand … · size: sm, md» — what the set's variants are made of. */
export function propsLine(c) {
  const parts = Object.entries(c.props || {}).map(([p, d]) => `${p}: ${(d.values || []).join(', ')}`);
  const states = (c.states || []).filter((s) => s !== 'default');
  if (states.length) parts.push(`состояния: ${states.join(', ')}`);
  return parts.join('   ·   ');
}

async function paint(t, token, fallback) {
  const v = await colorVar(t, token, { create: false });
  const base = { type: 'SOLID', color: fallback };
  return v ? figma.variables.setBoundVariableForPaint(base, 'color', v) : base;
}

function label(font, chars, size, style, fills) {
  const n = figma.createText();
  n.fontName = { family: font, style };
  n.fontSize = size;
  n.characters = chars;
  n.fills = fills;
  return n;
}

async function card(page, c, set, look) {
  let doc = page.findOne((n) => n.type === 'FRAME' && n.getPluginData(DOC) === c.name);
  if (!doc) {
    doc = figma.createFrame();
    doc.setPluginData(DOC, c.name);
    page.appendChild(doc);
  }
  doc.name = `Doc / ${c.title || c.name}`;
  doc.layoutMode = 'VERTICAL';
  doc.primaryAxisSizingMode = 'AUTO';
  doc.counterAxisSizingMode = 'AUTO';
  doc.itemSpacing = 16;
  doc.paddingTop = doc.paddingBottom = doc.paddingLeft = doc.paddingRight = 32;
  doc.cornerRadius = 24;
  doc.fills = [look.card];
  doc.strokes = [look.border];
  doc.strokeWeight = 1;
  for (const n of [...doc.children]) if (n !== set) n.remove();
  const variants = set.type === 'COMPONENT_SET' ? set.children.length : 1;
  doc.insertChild(0, label(look.font, c.title || c.name, 28, 'Bold', [look.text]));
  doc.insertChild(1, label(look.font, [`${variants} ${variants === 1 ? 'вариант' : 'вариантов'}`, propsLine(c)].filter(Boolean).join('   ·   '), 14, 'Regular', [look.muted]));
  set.fills = [look.surface];
  set.cornerRadius = 16;
  if (set.parent !== doc) doc.appendChild(set); // moving a set keeps its instances linked
  return doc;
}

/**
 * Lays the built sets out as the kit sheet. items: [{ contract, setId }]. Returns the section nodes.
 */
export async function kitSheet(page, items) {
  const t = await tokenIndex();
  const font = await loadFonts('Inter');
  const look = {
    font,
    card: await paint(t, 'card', { r: 1, g: 1, b: 1 }),
    surface: await paint(t, 'muted', { r: 0.96, g: 0.96, b: 0.97 }),
    border: await paint(t, 'border', { r: 0.9, g: 0.9, b: 0.92 }),
    text: await paint(t, 'foreground', { r: 0.06, g: 0.06, b: 0.07 }),
    muted: await paint(t, 'muted-foreground', { r: 0.45, g: 0.47, b: 0.5 }),
    page: await paint(t, 'background', { r: 0.97, g: 0.97, b: 0.98 }),
  };
  const byGroup = new Map();
  for (const it of items) {
    const g = groupOf(it.contract.name);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(it);
  }
  const order = [...GROUPS.map((g) => g.title), 'Другое'].filter((g) => byGroup.has(g));
  const sections = [];
  let y = 0;
  for (const g of order) {
    let section = page.findOne((n) => n.type === 'SECTION' && n.getPluginData(DOC) === `group:${g}`);
    if (!section) {
      section = figma.createSection();
      section.setPluginData(DOC, `group:${g}`);
      page.appendChild(section);
    }
    section.name = g;
    section.fills = [look.page];
    // Cards in rows inside the section, the group's order from GROUPS.
    const list = byGroup.get(g).sort((a, b) => (GROUPS.find((x) => x.title === g)?.names || []).indexOf(a.contract.name) - (GROUPS.find((x) => x.title === g)?.names || []).indexOf(b.contract.name));
    let x = PAD;
    let rowY = PAD + 40;
    let rowH = 0;
    let maxX = 0;
    for (const it of list) {
      const set = await figma.getNodeByIdAsync(it.setId);
      if (!set) continue;
      const doc = await card(page, it.contract, set, look);
      section.appendChild(doc);
      if (x > PAD && x + doc.width > ROW_WIDTH) { x = PAD; rowY += rowH + GAP; rowH = 0; }
      doc.x = x;
      doc.y = rowY;
      x += doc.width + GAP;
      rowH = Math.max(rowH, doc.height);
      maxX = Math.max(maxX, doc.x + doc.width);
    }
    section.resizeWithoutConstraints(Math.max(maxX + PAD, 800), rowY + rowH + PAD);
    section.x = 0;
    section.y = y;
    y += section.height + SECTION_GAP;
    sections.push(section);
  }
  return sections;
}
