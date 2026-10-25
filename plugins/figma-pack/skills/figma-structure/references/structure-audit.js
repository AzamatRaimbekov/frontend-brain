// structure-audit.js - Mdigital figma-pack: read-only audit of file structure and layer hygiene.
// Run through use_figma (skillNames "resource:figma-use"). Edit the inputs, nothing else.
// Complements vendor/lint-design.js (WCAG + tokens, MIT, southleft): this one checks
// pages, sections, frame names, junk layers, components placement, raw values, placeholder copy.

// ---- Inputs ----
const PAGE_NAME = 'CRM / Переводы';   // page to audit (exact name); null = the first page
const DRAFT_MODE_FONT = null;           // e.g. 'Inter' when the user approved a draft without the product font; null = every own text needs a text style
const LOCAL_COMPONENT_PAGES = ['Components', '_Components']; // where local components must live
const MAX_PER_RULE = 15;

// ---- Rules ----
const DEFAULT_NAME = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Text|Polygon|Star|Section|Component|Instance|Image|Union|Subtract|Boolean)( \d+)?$/;
const PLACEHOLDER_TEXT = /^(Title|Title Page|Label|Button|Text|Headline|Data|Badge|Placeholder|Lorem ipsum.*|Description|Subtitle|Name|Value|Ключ|Значение|Заголовок|Кнопка|Текст)$/i;
const FRAME_NAME = /^(\[draft\] )?[^/]+( \/ [^/]+){2,3}$/;   // [draft] Flow / Screen / State / width
const SEPARATOR = /^(-{3}|—{3}.*)$/;

const page = PAGE_NAME ? figma.root.children.find(p => p.name === PAGE_NAME) : figma.root.children[0];
if (!page) throw new Error('Page not found: ' + PAGE_NAME);
await figma.setCurrentPageAsync(page);

const found = {};
function add(rule, sev, node, extra) {
  const r = found[rule] || (found[rule] = { rule, sev, count: 0, nodes: [] });
  r.count++;
  if (r.nodes.length < MAX_PER_RULE) r.nodes.push(Object.assign({ id: node.id, name: node.name.slice(0, 60) }, extra || {}));
}

// File level: page order
const pages = figma.root.children.map(p => p.name);
const fileNotes = [];
if (!/^(📔 |🔖 )?Cover$/.test(pages[0])) fileNotes.push('first page is not "Cover"');
if (!pages.some(n => SEPARATOR.test(n)) && pages.length > 3) fileNotes.push('no "---" separator pages');

// Page level: everything top-level must be a Section (components only on the Components page)
const isComponentPage = LOCAL_COMPONENT_PAGES.includes(page.name);
for (const n of page.children) {
  if (n.type === 'SECTION') {
    if (DEFAULT_NAME.test(n.name)) add('section-default-name', 'error', n);
    continue;
  }
  if (isComponentPage && (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')) continue;
  add('loose-top-level', 'error', n, { type: n.type, hint: 'put screens into a Section, components on the Components page' });
}
const frames = page.children.filter(n => n.type === 'FRAME');   // loose screens are still checked inside

// Inside: our own nodes only (kit instance internals are the library's business)
const kitInstance = n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.remote;
function insideKit(n) { let p = n.parent; while (p && p.type !== 'PAGE') { if (kitInstance(p)) return true; p = p.parent; } return false; }
function insideDetachedKit(n) { let p = n; while (p && p.type !== 'PAGE') { if (/\(detached\)/.test(p.name)) return true; p = p.parent; } return false; }

for (const s of page.children.filter(n => n.type === 'SECTION')) {
  const kids = s.children;
  for (const f of kids) {
    if (f.type === 'FRAME') { frames.push(f); if (!FRAME_NAME.test(f.name)) add('frame-name', 'warn', f, { want: '[draft] Flow / Screen / State / width' }); }
    else if (f.type === 'TEXT' || f.type === 'SECTION') continue;   // section titles / notes, nested sections
    else if (f.type === 'COMPONENT' || f.type === 'COMPONENT_SET') continue;   // reported below
    else add('section-junk', 'warn', f, { type: f.type });
  }
  // overlapping screens inside a section
  for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
    const a = kids[i], b = kids[j];
    if (a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) add('overlap', 'error', a, { with: b.name.slice(0, 40) });
  }
}

let scanned = 0;
const bound = n => n.boundVariables || {};
for (const root of frames) {
  for (const n of [root, ...root.findAll(() => true)]) {
    if (insideKit(n)) continue;
    scanned++;
    const own = !kitInstance(n) && !insideDetachedKit(n);
    if (DEFAULT_NAME.test(n.name) && own) add('default-name', 'warn', n);
    if (n.type === 'GROUP') add('group', 'warn', n, { hint: 'auto layout frame instead' });
    if (n.visible === false && own) add('hidden-layer', 'warn', n);
    if (n.type === 'FRAME' && n.children.length === 0 && own) add('empty-frame', 'warn', n);
    if (n.type === 'FRAME' && own && n.layoutMode === 'NONE' && n.children.length > 1) add('no-autolayout', 'warn', n);
    if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') add('component-inside-screen', 'error', n);
    if (n.type === 'TEXT' && n.visible) {
      const t = n.characters.trim();
      if (PLACEHOLDER_TEXT.test(t)) add('placeholder-text', 'error', n, { text: t });
      if (own && !n.textStyleId) {
        const fam = n.fontName === figma.mixed ? 'mixed' : n.fontName.family;
        if (DRAFT_MODE_FONT && fam === DRAFT_MODE_FONT) add('draft-font', 'info', n, { hint: 'approved draft fallback; swap to the product text style later' });
        else add('no-text-style', 'warn', n, { font: fam });
      }
      if (n.textAutoResize === 'NONE' && n.height + 1 < (n.lineHeight && n.lineHeight.value ? n.lineHeight.value : n.fontSize * 1.2)) add('text-clipped', 'error', n);
    }
    if (!own) continue;
    if (n.layoutMode && n.layoutMode !== 'NONE') {
      for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) {
        if (n[p] !== 0 && !bound(n)[p]) add('raw-spacing', 'error', n, { prop: p, value: n[p] });
        if (n[p] % 4 !== 0) add('off-grid', 'warn', n, { prop: p, value: n[p] });
      }
    }
    for (const prop of ['fills', 'strokes']) {
      const ps = n[prop];
      if (Array.isArray(ps)) for (const p of ps) if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color) && !(prop === 'fills' ? n.fillStyleId : n.strokeStyleId)) add('raw-color', 'error', n, { prop });
    }
    if (typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !bound(n).topLeftRadius) add('raw-radius', 'error', n, { value: n.cornerRadius });
  }
}

// Local components: on the Components page, with a description
const localComponents = page.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] }).filter(c => !(c.parent && c.parent.type === 'COMPONENT_SET'));
for (const c of localComponents) {
  if (!isComponentPage) add('component-outside-components-page', 'warn', c);
  if (!c.description) add('component-no-description', 'warn', c);
  if (!/^_?[A-ZА-Я]/.test(c.name.replace(/^CRM \/ |^[^/]+ \/ /, ''))) add('component-name', 'info', c);
}

const rules = Object.values(found).sort((a, b) => ({ error: 0, warn: 1, info: 2 })[a.sev] - ({ error: 0, warn: 1, info: 2 })[b.sev]);
const summary = { error: 0, warn: 0, info: 0 };
for (const r of rules) summary[r.sev] += r.count;
return { page: page.name, pages, fileNotes, sections: page.children.filter(n => n.type === 'SECTION').length, screens: frames.length, scanned, summary, rules };
