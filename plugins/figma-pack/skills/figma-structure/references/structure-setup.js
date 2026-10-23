// structure-setup.js - Mdigital figma-pack: put a design file into the standard structure.
// Run through use_figma (skillNames "resource:figma-use,resource:figma-generate-design").
// One call = one page (Plugin API rule: switch pages at most once per call). Safe to re-run:
// pages, sections and moves are idempotent by name. Never deletes anything.
//
//   Cover                      <- call with MODE 'cover'
//   ---
//   <Flow pages>               <- call with MODE 'flow' once per page: screens into Sections
//   ---
//   Components                 <- local components land here (MODE 'flow' moves them)
//   Proposals                  <- only when something is proposed
//   ---
//   Archive                    <- only when something is archived

// ---- Inputs ----
const MODE = 'flow';                       // 'cover' | 'flow'
const ORDER = ['Cover', '---', 'Mobile / Переводы', 'Mobile / Платежи', 'CRM / Переводы', '---', 'Components'];
const COVER = { title: 'Mbank · тестовый файл', subtitle: 'Черновики экранов на китах Mbank Tokens', status: 'В работе', updated: '12.10.2026' };
const PAGE = 'CRM / Переводы';             // MODE 'flow': the page to tidy
// Sections in reading order. frames: node ids; each frame is placed by its name
// "<Flow> / <Screen> / <State> / <width>": rows = states (order of first appearance), columns = widths (wide → narrow).
const SECTIONS = [
  { name: 'CRM / Дашборд', frames: ['21:9007'] },
  { name: 'CRM / Все переводы', frames: ['23:10080'] },
  { name: 'CRM / Карточка перевода', frames: ['24:6548'] },
];
const RENAME = { '21:9007': '[draft] CRM / Дашборд / Default / 1440', '23:10080': '[draft] CRM / Все переводы / Default / 1440', '24:6548': '[draft] CRM / Карточка перевода / AML / 1440' };
const COMPONENT_SECTION = 'CRM';           // section on the Components page for this page's local components
const GAP = 80, PAD = 80, SECTION_GAP = 160;

// ---- Pages: create missing, then order ----
const created = [], moved = [];
// separators are matched by position, so build the ordered list explicitly
const ordered = [];
const used = new Set();
for (const name of ORDER) {
  let p = figma.root.children.find(x => x.name === name && !used.has(x.id));
  if (!p) { p = figma.createPage(); p.name = name; created.push(name); }
  used.add(p.id); ordered.push(p);
}
// move only pages that are out of place: reinserting a page whose instances use a missing font fails
ordered.forEach((p, i) => { if (figma.root.children[i] !== p) figma.root.insertChild(i, p); });
const extra = figma.root.children.filter(p => !used.has(p.id)).map(p => p.name);  // pages not in ORDER stay at the end; report them

if (MODE === 'cover') {
  const cover = ordered[ORDER.indexOf('Cover')];
  await figma.setCurrentPageAsync(cover);
  let frame = cover.children.find(n => n.name === 'Cover');
  await Promise.all(['Regular', 'Bold'].map(s => figma.loadFontAsync({ family: 'Inter', style: s })));
  if (!frame) {
    frame = figma.createAutoLayout('VERTICAL', { name: 'Cover' });
    frame.resize(1920, 960); frame.primaryAxisSizingMode = 'FIXED'; frame.counterAxisSizingMode = 'FIXED';
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 120; frame.itemSpacing = 24;
    frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.965, b: 0.97 } }];
    const t = (s, size, style, name) => { const n = figma.createText(); n.fontName = { family: 'Inter', style }; n.fontSize = size; n.characters = s; n.name = name; frame.appendChild(n); return n; };
    t(COVER.title, 96, 'Bold', 'Title'); t(COVER.subtitle, 40, 'Regular', 'Subtitle'); t('Статус: ' + COVER.status + ' · обновлено ' + COVER.updated, 28, 'Regular', 'Status');
  } else {
    const set = (name, s) => { const n = frame.findOne(x => x.type === 'TEXT' && x.name === name); if (n) n.characters = s; };
    set('Title', COVER.title); set('Subtitle', COVER.subtitle); set('Status', 'Статус: ' + COVER.status + ' · обновлено ' + COVER.updated);
  }
  // file thumbnail: setFileThumbnailNodeAsync is not supported in use_figma - ask the designer to set it
  return { mode: MODE, pages: figma.root.children.map(p => p.name), created, extra, coverId: frame.id };
}

// ---- MODE 'flow': sections for screens, components to the Components page ----
const page = ordered[ORDER.indexOf(PAGE)] || figma.root.children.find(p => p.name === PAGE);
await figma.setCurrentPageAsync(page);
for (const [id, name] of Object.entries(RENAME)) { const n = await figma.getNodeByIdAsync(id); if (n) n.name = name; }

const parse = name => { const parts = name.replace(/^\[draft\] /, '').split(' / '); return { state: parts[parts.length - 2] || 'Default', width: parseInt(parts[parts.length - 1], 10) || 0 }; };
let y = 0;
const sectionIds = [];
for (const spec of SECTIONS) {
  let section = page.children.find(n => n.type === 'SECTION' && n.name === spec.name);
  if (!section) { section = figma.createSection(); section.name = spec.name; page.appendChild(section); }
  const frames = (await Promise.all(spec.frames.map(id => figma.getNodeByIdAsync(id)))).filter(Boolean);
  for (const f of frames) if (f.parent !== section) section.appendChild(f);
  const states = [], widths = [];
  for (const f of frames) { const p = parse(f.name); if (!states.includes(p.state)) states.push(p.state); if (!widths.includes(p.width)) widths.push(p.width); }
  widths.sort((a, b) => b - a);
  // column x = sum of widest frame per previous column; row y = sum of tallest frame per previous row
  const colW = widths.map(w => Math.max(...frames.filter(f => parse(f.name).width === w).map(f => f.width)));
  const rowH = states.map(s => Math.max(...frames.filter(f => parse(f.name).state === s).map(f => f.height)));
  for (const f of frames) {
    const p = parse(f.name), c = widths.indexOf(p.width), r = states.indexOf(p.state);
    f.x = PAD + colW.slice(0, c).reduce((a, b) => a + b + GAP, 0);
    f.y = PAD + rowH.slice(0, r).reduce((a, b) => a + b + GAP, 0);
  }
  const w = PAD * 2 + colW.reduce((a, b) => a + b, 0) + GAP * (colW.length - 1);
  const h = PAD * 2 + rowH.reduce((a, b) => a + b, 0) + GAP * (rowH.length - 1);
  section.resizeWithoutConstraints(w, h); section.x = 0; section.y = y; y += h + SECTION_GAP;
  sectionIds.push(section.id);
}

// local components → Components page, inside a section named COMPONENT_SECTION, stacked vertically
const compPage = ordered[ORDER.indexOf('Components')];
const comps = page.children.filter(n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
  .concat(page.children.filter(n => n.type === 'SECTION').flatMap(s => s.children.filter(n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')));
if (comps.length && compPage) {
  await compPage.loadAsync();
  let cs = compPage.children.find(n => n.type === 'SECTION' && n.name === COMPONENT_SECTION);
  if (!cs) { const below = compPage.children.reduce((m, s) => Math.max(m, s.y + s.height + SECTION_GAP), 0); cs = figma.createSection(); cs.name = COMPONENT_SECTION; compPage.appendChild(cs); cs.x = 0; cs.y = below; }
  let cy = PAD + cs.children.reduce((m, n) => Math.max(m, n.y + n.height + GAP - PAD), 0);
  let maxW = cs.children.reduce((m, n) => Math.max(m, n.width), 0);
  for (const c of comps) { cs.appendChild(c); c.x = PAD; c.y = cy; cy += c.height + GAP; maxW = Math.max(maxW, c.width); moved.push(c.name); }
  cs.resizeWithoutConstraints(PAD * 2 + maxW, cy - GAP + PAD);
}
const loose = page.children.filter(n => n.type !== 'SECTION').map(n => n.name);
return { mode: MODE, pages: figma.root.children.map(p => p.name), created, extra, sectionIds, movedComponents: moved, looseLeft: loose };
