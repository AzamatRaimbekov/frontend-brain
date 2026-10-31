// Spec -> Figma: one page per spec page, one section per screen,
// rows = states, columns = viewports. Rebuilding replaces the section.
import { normalizeSpec, VIEWPORTS, DATA_BLOCKS } from '../../core/spec.js';
import { createCtx, loadFonts, box, add, size } from './draw.js';
import { shell } from './shell.js';
import { setFrameModes } from './brand.js';
import * as data from './blocks-data.js';
import * as ui from './blocks-ui.js';

const BUILDERS = { ...data, ...ui };
const GAP = 120;
const LISTS = ['table', 'list', 'kanban', 'cards'];

// Rewrites a screen's blocks for a state, so builders only know "loading".
export function blocksForState(screen, state) {
  const blocks = screen.blocks;
  const emptyText = screen.empty || {};
  if (state === 'no-access') {
    const head = blocks.find((b) => b.type === 'header');
    return [head && { type: 'header', title: head.title, breadcrumbs: head.breadcrumbs },
      { type: 'empty', icon: '🔒', title: 'Нет доступа', text: 'У вашей роли нет прав на этот раздел. Обратитесь к администратору.', action: 'Запросить доступ' }].filter(Boolean);
  }
  if (state === 'empty') {
    let replaced = false;
    return blocks.flatMap((b) => {
      if (LISTS.includes(b.type)) {
        if (replaced) return [];
        replaced = true;
        return [{ type: 'empty', title: emptyText.title || b.emptyTitle || 'Пока ничего нет', text: emptyText.text || b.emptyText, action: emptyText.action || b.emptyAction }];
      }
      return b.type === 'pagination' ? [] : [b];
    });
  }
  if (state === 'error') {
    const out = [];
    let replaced = false;
    for (const b of blocks) {
      if (b.type === 'header') { out.push(b, { type: 'alert', variant: 'destructive', title: 'Не удалось загрузить данные', text: 'Проверьте соединение и попробуйте ещё раз.', action: 'Повторить' }); continue; }
      if (DATA_BLOCKS.includes(b.type) && b.type !== 'details') { if (!replaced && LISTS.includes(b.type)) { replaced = true; out.push({ type: 'empty', icon: '!', title: 'Ошибка загрузки', text: 'Данные временно недоступны.' }); } continue; }
      if (b.type !== 'pagination') out.push(b);
    }
    if (!blocks.some((b) => b.type === 'header')) out.unshift({ type: 'alert', variant: 'destructive', title: 'Ошибка', text: 'Не удалось загрузить данные.' });
    return out;
  }
  return blocks;
}

async function renderBlock(ctx, b) {
  if (b.type === 'split') {
    const row = box(ctx, 'Split', { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: ui.SPLIT_GAP, w: 'fill' });
    const ratio = (b.ratio || b.columns.map(() => 1).join(':')).split(':').map(Number);
    const total = ratio.reduce((a, c) => a + c, 0);
    const avail = ctx.width - ui.SPLIT_GAP * (b.columns.length - 1);
    for (const [i, col] of b.columns.entries()) {
      const w = ctx.vp === 'mobile' ? ctx.width : Math.floor((avail * (ratio[i] || 1)) / total);
      const c = box(ctx, `Column ${i + 1}`, { gap: 24, w: ctx.vp === 'mobile' ? 'fill' : w });
      const sub = { ...ctx, width: w };
      for (const x of blocksForState({ blocks: col }, ctx.state === 'loading' ? 'default' : ctx.state)) add(c, await renderBlock(sub, x));
      add(row, c);
    }
    return row;
  }
  const fn = BUILDERS[b.type];
  if (!fn) throw new Error(`No builder for block "${b.type}"`);
  const node = await fn(ctx, b);
  return node;
}

export async function buildFrame(base, spec, screen, state, vp, seed) {
  const width = VIEWPORTS[vp];
  const ctx = { ...base, vp, state, seed };
  const { frame, content, width: inner, push } = await shell(ctx, spec, screen, vp, width);
  ctx.width = inner;
  for (const b of blocksForState(screen, state)) {
    const node = await renderBlock(ctx, b);
    add(content, node);
    if (node.type === 'FRAME' && node.layoutSizingHorizontal !== 'FIXED' && b.type !== 'tabs' && b.type !== 'stepper') size(node, 'fill');
  }
  if (push && frame.height < 812) {
    frame.primaryAxisSizingMode = 'FIXED';
    frame.resize(width, 812);
    push.layoutSizingVertical = 'FILL';
  }
  frame.name = `[draft] ${screen.title} / ${state} / ${width}`;
  return frame;
}

async function pageFor(name) {
  await figma.loadAllPagesAsync();
  return figma.root.children.find((p) => p.name === name) || Object.assign(figma.createPage(), { name });
}

/**
 * Builds the whole spec. opts: { vars, radius, kit, font, brand, style, theme: 'light'|'dark', only: [screenId] }.
 * onProgress(done, total, label) is called after every frame.
 */
export async function buildSpec(rawSpec, opts, onProgress = () => {}) {
  const spec = normalizeSpec(rawSpec);
  const font = await loadFonts(opts.font || 'Inter');
  const base = createCtx({ vars: opts.vars, radius: opts.radius, font, kit: opts.kit || {} });
  base.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const screens = spec.screens.filter((s) => !opts.only?.length || opts.only.includes(s.id));
  const total = screens.reduce((n, s) => n + s.states.length * s.viewports.length, 0);
  const result = { frames: [], sections: [], stats: base.stats, font, fallbackFonts: false };
  let done = 0;
  const yByPage = {};

  for (const [si, screen] of screens.entries()) {
    const page = await pageFor(screen.page);
    await figma.setCurrentPageAsync(page);
    const title = `${spec.project} / ${screen.title}`;
    page.findAll((n) => n.type === 'SECTION' && n.name === title).forEach((n) => n.remove());
    if (yByPage[page.id] == null) yByPage[page.id] = Math.max(0, ...page.children.map((n) => n.y + n.height + GAP));

    const section = figma.createSection();
    section.name = title;
    page.appendChild(section);
    let y = GAP;
    for (const state of screen.states) {
      let x = GAP;
      let rowH = 0;
      for (const vp of screen.viewports) {
        const f = await buildFrame(base, spec, screen, state, vp, si * 13);
        section.appendChild(f);
        f.x = x;
        f.y = y;
        await setFrameModes(f, { brand: opts.brand, style: opts.style, theme: opts.theme || 'light' });
        x += f.width + GAP;
        rowH = Math.max(rowH, f.height);
        result.frames.push({ id: f.id, name: f.name, page: page.name });
        onProgress(++done, total, f.name);
      }
      y += rowH + GAP;
    }
    const w = Math.max(...section.children.map((n) => n.x + n.width)) + GAP;
    section.resizeWithoutConstraints(w, y);
    section.x = 0;
    section.y = yByPage[page.id];
    yByPage[page.id] += y + GAP;
    result.sections.push({ id: section.id, name: title, page: page.name });
  }
  result.fallbackFonts = base.stats.fallbackFonts;
  return result;
}
