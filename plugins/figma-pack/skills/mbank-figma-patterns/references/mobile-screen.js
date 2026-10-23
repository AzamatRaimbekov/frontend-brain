// Mbank mobile screen recipe for use_figma (Mobile KIT + Foundation + Icons).
// Verified 2026-10-09 on a Full seat (devmd8) in file vVuM5uw3TsWo1xm3vJelXG; Section placement verified 2026-10-12 (Android 360).
// Edit only SPEC; keep the helpers. Paste the whole file as the `code` of one use_figma call
// with skillNames "resource:figma-use,resource:figma-generate-design".

const SPEC = {
  page: 'Mobile / Платежи',             // created if missing; never a library page
  section: 'Mobile / Платежи',          // figma-structure: one Section per screen, created if missing
  name: '[draft] Mobile / Платежи / Default / 393',   // [draft] <Area> / <Screen> / <State> / <width>
  width: 393, height: 852,              // iOS 393x852; Android 360x800
  device: 'iPhone',                     // Status Bar variant: 'iPhone' | 'Android'
  title: 'Платежи',                     // Top-app-bar Small-center title
  search: 'Поиск по услугам',           // null to skip the Search field
  sections: [
    { header: 'Популярное', items: [
      { title: 'Мобильная связь', subtitle: 'Beeline, MegaCom, O!', icon: 'calling' },
      { title: 'Коммунальные услуги', subtitle: 'Свет, вода, газ', icon: 'home' },
      { title: 'Погашение кредита', subtitle: 'Кредиты Mbank', icon: 'credit-card' },
      { title: 'Электронные кошельки', subtitle: 'Элсом, О!Деньги', icon: 'wallet' },
    ] },
  ],
  primaryAction: 'Оплатить по QR',      // null = no footer button; keep it identical on iOS and Android
  tabs: { selected: 3, labels: ['Главная', 'Переводы', 'Платежи', 'История', 'Ещё'],
          icons: ['home', 'swap-arrow-horizontal', 'wallet', 'time', 'more-menu'] },
};

// ---- keys (from mbank-figma-patterns references; do not guess) ----
const C = { // component sets, Mobile KIT
  statusBar: '434ca11aa4fff9ad5cb3f3e7097dfc0acfacd047', topBar: 'cdd803b369825f27486825a0a25e0d25ea69d702',
  search: 'b71f7c31f9d41b1a2aa0da8005408c62f5aff9a4', sectionHeader: 'd207cac5d643ae788106a502ac26bf29d777ed82',
  cell: '561d137e2174b6b0b8f7dc6af482b607d78c4b0a', button: '8a0f638023ddb1a03daba6f5c644e0f74b8430fc',
  tabBar: '5546b31b33302a29ea0d8b4c50dc6dbe0b15e6e2',
};
const V = { // variables
  bg: '597e34eb4635ee8b4625923be7f8b6496f987f1c',          // background/onsurface/0
  p0: 'fb109a5072b402ff23bef536000e8e6b2c5ef8d5',          // paddings/default/none 0
  p8: '6e80bc94476fe9fb8e18a2ecd1184d9cc31865df',          // paddings/default/s 8
  p12: 'c44220317b3fa1713b480e666de7cd5fc2540446',         // paddings/default/s - 2 12
  p16: '81a966b963f940ab223bdc6d0742e7222a85a39f',         // paddings/default/m - 2 16
};
const ICON = {
  home: 'a78b8d74715500596284c5d5c85e37aeb7c3b498', wallet: '82c50e7fa879ad24f1836a01a79ec9d828f6dab8',
  'swap-arrow-horizontal': 'e461d58e04b90167d19a71bc8301e8ff3d655cd1', time: 'b3fba14b0ae7d05a7eadc0667465384df9342fe9',
  user: '97d03b2d55b447f904dbe536eaf39342aba16809', 'more-menu': '9c06e40ba8f86c06ae35a15fbc4f765e9ba0672a',
  calling: 'c53a91c42d8089d6823c74c9e36de5350d02749c', 'credit-card': '238fc09fae275bcdf0014f8385eac3351c326a00',
};

// ---- helpers ----
const report = { created: [], warnings: [] };
const variant = (set, want) => set.children.find(c => Object.entries(want).every(([k, v]) => c.name.includes(`${k}=${v}`))) || set.defaultVariant;
const iconSets = {};
async function iconSet(name) {
  if (!iconSets[name]) {
    try { iconSets[name] = await figma.importComponentSetByKeyAsync(ICON[name]); }
    catch { iconSets[name] = await figma.importComponentByKeyAsync(ICON[name]); }
  }
  return iconSets[name];
}
async function swapIcon(inst, name, style) { // keeps the slot's Line/Solid style
  const s = await iconSet(name);
  const cur = style || ((inst.mainComponent?.name.match(/Style=([^,]+)/) || [])[1]) || 'Line';
  inst.swapComponent(s.type === 'COMPONENT_SET' ? variant(s, { Style: cur }) : s);
  inst.name = name;
}
async function loadFontsOf(node) { // load every font of an instance; returns failed fonts
  const failed = [];
  const seen = new Set();
  for (const t of node.findAllWithCriteria({ types: ['TEXT'] })) {
    for (const seg of t.getStyledTextSegments(['fontName'])) {
      const id = seg.fontName.family + '|' + seg.fontName.style;
      if (seen.has(id)) continue; seen.add(id);
      try { await figma.loadFontAsync(seg.fontName); } catch { failed.push(seg.fontName); }
    }
  }
  return failed;
}
function setText(root, layerName, value, nth = 0) {
  const t = root.findAllWithCriteria({ types: ['TEXT'] }).filter(n => n.name === layerName && n.visible)[nth];
  if (t) t.characters = value; else report.warnings.push(`no text layer "${layerName}" in ${root.name}`);
}
const bind = (n, map) => { for (const [p, key] of Object.entries(map)) n.setBoundVariable(p, VARS[key]); };

// ---- imports in parallel ----
const [sets, varList] = await Promise.all([
  Promise.all(Object.values(C).map(k => figma.importComponentSetByKeyAsync(k))),
  Promise.all(Object.values(V).map(k => figma.variables.importVariableByKeyAsync(k))),
]);
const S = Object.fromEntries(Object.keys(C).map((k, i) => [k, sets[i]]));
const VARS = Object.fromEntries(Object.keys(V).map((k, i) => [k, varList[i]]));

// ---- page + screen frame ----
if (SPEC.page) {
  let pg = figma.root.children.find(p => p.name === SPEC.page);
  if (!pg) { pg = figma.createPage(); pg.name = SPEC.page; }
  await figma.setCurrentPageAsync(pg);
}
// Section per screen (figma-structure): states in rows, widths in columns; a new frame goes right of the frames already there
let section = figma.currentPage.children.find(n => n.type === 'SECTION' && n.name === SPEC.section);
if (!section) {
  const below = figma.currentPage.children.reduce((m, n) => Math.max(m, n.y + n.height + 160), 0);
  section = figma.createSection(); section.name = SPEC.section; section.x = 0; section.y = below;
}
let maxX = 0; for (const n of section.children) maxX = Math.max(maxX, n.x + n.width);
const screen = figma.createAutoLayout('VERTICAL', { name: SPEC.name });
section.appendChild(screen);
screen.resize(SPEC.width, SPEC.height);
screen.primaryAxisSizingMode = 'FIXED'; screen.counterAxisSizingMode = 'FIXED';
screen.x = maxX ? maxX + 80 : 80; screen.y = 80; screen.clipsContent = true;
section.resizeWithoutConstraints(Math.max(section.width, screen.x + screen.width + 80), Math.max(section.height, screen.y + screen.height + 80));
screen.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', VARS.bg)];
bind(screen, { paddingTop: 'p0', paddingBottom: 'p0', paddingLeft: 'p0', paddingRight: 'p0', itemSpacing: 'p0' });
report.created.push(screen.id);

async function place(parent, inst, fill = true) {
  const failed = await loadFontsOf(inst);
  if (failed.length) { inst.remove(); report.warnings.push(`skipped ${inst.name}: fonts ${failed.map(f => f.family + ' ' + f.style).join(', ')}`); return null; }
  parent.appendChild(inst); if (fill) inst.layoutSizingHorizontal = 'FILL';
  return inst;
}

// 1+2. Top app bar. It already contains "Status Bar - iPhone & Android" (Android variant by default):
// never add a second status bar or a 54px top padding; switch the built-in one to the device variant.
// SF UI Display (iOS status bar font) is not an org font -> that text falls back to SF Pro.
{
  const tb = variant(S.topBar, { Type: 'Small-center' }).createInstance();
  const sb = tb.findAllWithCriteria({ types: ['INSTANCE'] }).find(n => n.name === 'Status Bar - iPhone & Android');
  if (sb) {
    sb.swapComponent(variant(S.statusBar, { Device: SPEC.device, Background: 'False' }));
    // fonts per styled segment (fontName can be mixed); replace only segments whose font fails to load
    const fallback = SPEC.device === 'Android' ? { family: 'Roboto', style: 'Medium' } : { family: 'SF Pro', style: 'Semibold' };
    for (const t of sb.findAllWithCriteria({ types: ['TEXT'] })) {
      for (const seg of t.getStyledTextSegments(['fontName'])) {
        try { await figma.loadFontAsync(seg.fontName); }
        catch {
          await figma.loadFontAsync(fallback); t.setRangeFontName(seg.start, seg.end, fallback);
          report.warnings.push(`status bar: ${seg.fontName.family} ${seg.fontName.style} -> ${fallback.family} (fix the font in Mobile KIT)`);
        }
      }
    }
  }
  if (await place(screen, tb)) setText(tb, 'Label', SPEC.title);
}

// 3. Body: scrollable content, paddings 8/16, gap 12
const body = figma.createAutoLayout('VERTICAL', { name: 'Body' }); body.fills = []; // createAutoLayout adds an unbound white fill
screen.appendChild(body); body.layoutSizingHorizontal = 'FILL'; body.layoutSizingVertical = 'FILL';
bind(body, { paddingTop: 'p8', paddingLeft: 'p16', paddingRight: 'p16', paddingBottom: 'p0', itemSpacing: 'p12' });
if (SPEC.search) {
  const s = await place(body, variant(S.search, { State: 'default' }).createInstance());
  if (s) setText(s, 'Text', SPEC.search);
}
for (const sec of SPEC.sections) {
  const sh = await place(body, variant(S.sectionHeader, { 'Title size': '16', Description: 'off' }).createInstance());
  if (sh) setText(sh, 'Headline', sec.header);
  const list = figma.createAutoLayout('VERTICAL', { name: sec.header }); list.fills = [];
  body.appendChild(list); list.layoutSizingHorizontal = 'FILL';
  bind(list, { itemSpacing: 'p0', paddingTop: 'p0', paddingBottom: 'p0', paddingLeft: 'p0', paddingRight: 'p0' });
  for (const it of sec.items) {
    const leading = it.icon ? 'icon' : 'avatar';
    const cell = await place(list, variant(S.cell, { Leading: leading, Trailing: 'icon', Overline: 'false', Description: it.subtitle ? 'true' : 'false', Badge: 'False' }).createInstance());
    if (!cell) continue;
    setText(cell, 'Headline', it.title);
    if (it.subtitle) setText(cell, 'Supporting text', it.subtitle);
    if (it.icon) {
      const slot = cell.findAllWithCriteria({ types: ['INSTANCE'] }).find(n => /Style=/.test(n.mainComponent?.name || '') && n.width === 24);
      if (slot) await swapIcon(slot, it.icon); else report.warnings.push(`no icon slot in cell ${it.title}`);
    } else {
      const av = cell.findAllWithCriteria({ types: ['INSTANCE'] }).find(n => n.name === 'Avatars');
      if (av) av.setProperties({ 'Upload/icon': 'False', Placeholder: 'True' }); // no camera icon on contacts
    }
  }
}

// 4. Footer with the single primary action
if (SPEC.primaryAction) {
  const footer = figma.createAutoLayout('VERTICAL', { name: 'Footer' }); footer.fills = [];
  screen.appendChild(footer); footer.layoutSizingHorizontal = 'FILL';
  bind(footer, { paddingTop: 'p0', paddingLeft: 'p16', paddingRight: 'p16', paddingBottom: 'p12', itemSpacing: 'p0' });
  const btn = await place(footer, variant(S.button, { size: 'xl', variant: 'primary', state: 'default' }).createInstance());
  if (btn) {
    const key = Object.keys(btn.componentProperties).find(k => k.startsWith('Button Content'));
    const props = { [key]: SPEC.primaryAction };
    // the default variant shows placeholder circle icons and a counter: switch them off
    for (const k of Object.keys(btn.componentProperties)) if (/^(left-icon|right-icon|counter)#/.test(k)) props[k] = false;
    btn.setProperties(props);
  }
}

// 5. Tab bar: labels + Mbank icons (selected tab keeps Solid)
{
  const tab = await place(screen, variant(S.tabBar, { Type: SPEC.device === 'Android' ? 'Android' : 'iOS', 'liquid glass': 'False', label: 'on', Selected: String(SPEC.tabs.selected) }).createInstance());
  if (tab) {
    const labels = tab.findAllWithCriteria({ types: ['TEXT'] }).filter(t => t.visible && /Label/.test(t.name));
    labels.forEach((t, i) => { if (SPEC.tabs.labels[i]) t.characters = SPEC.tabs.labels[i]; });
    const slots = tab.findAllWithCriteria({ types: ['INSTANCE'] }).filter(n => /Style=/.test(n.mainComponent?.name || ''));
    for (let i = 0; i < slots.length && i < SPEC.tabs.icons.length; i++) await swapIcon(slots[i], SPEC.tabs.icons[i]);
  }
}

// ---- audit: raw paddings / gaps / fills on our own frames must be 0 ----
const raw = [];
const inInstance = n => { for (let p = n.parent; p && p !== screen; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
for (const f of [screen, ...screen.findAll(n => n.type === 'FRAME' && !inInstance(n))]) {
  for (const p of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'itemSpacing']) {
    if (f[p] !== 0 && !f.boundVariables?.[p]) raw.push(`${f.name}.${p}=${f[p]}`);
  }
  for (const paint of f.fills || []) if (paint.type === 'SOLID' && paint.visible !== false && !paint.boundVariables?.color) raw.push(`${f.name}.fill`);
}
report.audit = { instances: screen.findAllWithCriteria({ types: ['INSTANCE'] }).length, rawValues: raw,
  children: screen.children.map(c => `${c.name}:${Math.round(c.height)}`) };
report.screenId = screen.id;
return report;
