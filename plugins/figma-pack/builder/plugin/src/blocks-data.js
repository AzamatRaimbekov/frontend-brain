// Data blocks: they change in loading / empty states.
import { box, text, add, skel, rect, sizing, link, fill } from './draw.js';
import { icon } from './icons.js';
import { badge, avatar, checkbox, statusVariant } from './kit.js';
import { fakeRows, parseColumn, rng } from '../../core/fake.js';
import { statDelta } from '../../core/spec.js';

export const card = (ctx, name, o = {}) =>
  box(ctx, name, { gap: o.gap ?? 16, pad: o.pad ?? 24, fill: 'card', stroke: 'border', radius: 'xl', w: 'fill', ...o });

async function cardTitle(ctx, title, sub) {
  const h = box(ctx, 'Card header', { gap: 4, w: 'fill' });
  return add(h, await text(ctx, title, { size: 'base', weight: 'semibold', w: 'fill' }), sub && (await text(ctx, sub, { size: 'sm', color: 'muted-foreground', w: 'fill' })));
}

const cols = (ctx, desktop) => (ctx.vp === 'mobile' ? Math.min(desktop, 1) : ctx.vp === 'tablet' ? Math.min(desktop, 2) : desktop);

export async function stats(ctx, b) {
  const row = box(ctx, 'Stats', { dir: 'H', gap: 16, w: ctx.width, wrap: true });
  const per = ctx.vp === 'mobile' ? 2 : cols(ctx, b.items.length > 4 ? 4 : b.items.length);
  const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
  for (const it of b.items) {
    const c = card(ctx, `Stat / ${it.label}`, { gap: 8, pad: 20, w });
    if (ctx.state === 'loading') add(c, skel(ctx, 96, 12), skel(ctx, 140, 28, 'md'), skel(ctx, 72, 10));
    else {
      const value = ctx.state === 'empty' ? '0' : it.value;
      // "+14% к вчера": the value coloured by meaning (it.better up | down), the comparison muted.
      const d = ctx.state !== 'empty' ? statDelta(it) : null;
      const tone = { positive: 'success', negative: 'destructive', neutral: 'muted-foreground' };
      const delta = d
        ? add(box(ctx, 'Delta', { dir: 'H', gap: 4, align: 'CENTER' }),
          await text(ctx, d.value, { size: 'xs', weight: 'medium', color: tone[d.tone] }),
          d.label && ctx.vp !== 'mobile' && (await text(ctx, d.label, { size: 'xs', color: 'muted-foreground' })))
        : null;
      const top = box(ctx, 'Top', { dir: 'H', gap: 8, align: 'CENTER', w: 'fill' });
      add(top, await text(ctx, it.label, { size: 'sm', weight: 'medium', color: 'muted-foreground', w: 'fill' }));
      if (it.icon && ctx.vp !== 'mobile') {
        const tile = box(ctx, 'Icon', { dir: 'H', w: 32, h: 32, radius: 'md', align: 'CENTER', justify: 'CENTER' });
        fill(tile, ctx, 'muted');
        add(top, add(tile, icon(ctx, it.icon, 'foreground', 16)));
      }
      add(c, top,
        await text(ctx, value, { size: ctx.vp === 'mobile' ? 'xl' : '2xl', weight: 'bold' }),
        delta || (it.hint && (await text(ctx, it.hint, { size: 'xs', color: 'muted-foreground' }))));
    }
    add(row, c);
  }
  return row;
}

async function cell(ctx, type, value, w) {
  const c = box(ctx, 'Cell', { dir: 'H', gap: 8, pad: [12, 12], align: 'CENTER', w, h: 52 });
  if (ctx.state === 'loading') return add(c, skel(ctx, Math.max(40, Math.min(w - 24, 60 + (w % 70))), 12));
  if (type === 'status') return add(c, await badge(ctx, value, statusVariant(value)));
  if (type === 'person') return add(c, await avatar(ctx, value, 28), await text(ctx, value, { size: 'sm', weight: 'medium', truncate: true }));
  if (type === 'actions') return add(c, await text(ctx, '•••', { size: 'sm', color: 'muted-foreground' }));
  const color = ['id', 'date', 'datetime', 'phone', 'email'].includes(type) ? 'muted-foreground' : 'foreground';
  const t = await text(ctx, value, { size: 'sm', color, weight: type === 'money' ? 'medium' : 'regular', truncate: true });
  if (type === 'money') c.primaryAxisAlignItems = 'MAX';
  return add(c, t);
}

const WEIGHT = { id: 1, person: 1.6, company: 1.6, money: 1.1, status: 1, date: 1, datetime: 1.2, actions: 0.4, email: 1.6, text: 1.6 };

async function mobileRows(ctx, b, columns, rows) {
  const list = card(ctx, 'List', { gap: 0, pad: 0 });
  for (const r of rows) {
    const item = link(box(ctx, 'Row', { dir: 'H', gap: 12, pad: 16, w: 'fill', align: 'CENTER', stroke: 'border' }), b.link && `row:${b.link}`);
    const main = box(ctx, 'Main', { gap: 4, w: 'fill' });
    const pi = columns.findIndex((c) => c.type === 'person' || c.type === 'company');
    const si = columns.findIndex((c) => c.type === 'status');
    const mi = columns.findIndex((c) => c.type === 'money');
    if (ctx.state === 'loading') add(main, skel(ctx, 140, 12), skel(ctx, 90, 10));
    else add(main, await text(ctx, r[pi >= 0 ? pi : 0], { size: 'sm', weight: 'medium', w: 'fill', truncate: true }),
      await text(ctx, r[0], { size: 'xs', color: 'muted-foreground' }));
    const side = box(ctx, 'Side', { gap: 4, align: 'MAX' });
    if (ctx.state !== 'loading') add(side, mi >= 0 && (await text(ctx, r[mi], { size: 'sm', weight: 'medium' })), si >= 0 && (await badge(ctx, r[si], statusVariant(r[si]))));
    add(list, add(item, main, side));
  }
  return list;
}

export async function table(ctx, b) {
  const columns = b.columns.map(parseColumn);
  const count = ctx.state === 'loading' ? Math.min(b.rows || 8, 6) : b.rows || 8;
  const rows = b.data || fakeRows(b.columns, count, (b.seed || 7) + ctx.seed, b.statuses);
  const head = b.title ? await cardTitle(ctx, b.title, b.subtitle) : null;
  if (ctx.vp === 'mobile') {
    const wrap = box(ctx, 'Table (mobile)', { gap: 12, w: 'fill' });
    return add(wrap, head, await mobileRows(ctx, b, columns, rows));
  }
  const t = card(ctx, b.title || 'Table', { gap: 0, pad: 0, clip: true });
  if (head) add(t, add(box(ctx, 'Head', { pad: [20, 24], w: 'fill' }), head));
  const sel = b.selectable ? 44 : 0;
  const total = columns.reduce((s, c) => s + (WEIGHT[c.type] || 1), 0);
  const avail = ctx.width - 2 - sel;
  const widths = columns.map((c) => Math.floor((avail * (WEIGHT[c.type] || 1)) / total));
  const hr = box(ctx, 'Header row', { dir: 'H', fill: 'muted', fillOpacity: 0.5, w: 'fill' });
  if (sel) add(hr, add(box(ctx, 'Select', { pad: [0, 14], align: 'CENTER', justify: 'CENTER', h: 40 }), await checkbox(ctx)));
  for (let i = 0; i < columns.length; i++) {
    const h = box(ctx, `Head / ${columns[i].label}`, { dir: 'H', pad: [10, 12], align: 'CENTER', w: widths[i], h: 40 });
    if (columns[i].type === 'money') h.primaryAxisAlignItems = 'MAX';
    add(hr, add(h, await text(ctx, columns[i].label, { size: 'xs', weight: 'medium', color: 'muted-foreground' })));
  }
  add(t, hr);
  for (const [ri, r] of rows.entries()) {
    const row = link(box(ctx, `Row ${ri + 1}`, { dir: 'H', w: 'fill', align: 'CENTER' }), b.link && `row:${b.link}`);
    add(t, sizing(rect(ctx, 'Divider', avail + sel, 1, 'border'), 'fill'));
    if (sel) add(row, add(box(ctx, 'Select', { pad: [0, 14], align: 'CENTER', justify: 'CENTER', h: 52 }), await checkbox(ctx, ri === 1)));
    for (let i = 0; i < columns.length; i++) add(row, await cell(ctx, columns[i].type, r[i], widths[i]));
    add(t, row);
  }
  return t;
}

export async function kanban(ctx, b) {
  const board = box(ctx, 'Kanban', { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: 16, w: 'fill' });
  const list = ctx.vp === 'mobile' ? b.columns.slice(0, 2) : b.columns;
  const colW = ctx.vp === 'mobile' ? ctx.width : Math.floor((ctx.width - 16 * (list.length - 1)) / list.length);
  const r = rng(11 + ctx.seed);
  for (const [ci, col] of list.entries()) {
    const name = typeof col === 'string' ? col : col.title;
    const n = ctx.state === 'empty' ? 0 : typeof col === 'object' && col.count != null ? col.count : 2 + Math.floor(r() * 3);
    const c = box(ctx, `Column / ${name}`, { gap: 12, pad: 12, fill: 'muted', fillOpacity: 0.6, radius: 'xl', w: colW });
    const head = box(ctx, 'Head', { dir: 'H', gap: 8, align: 'CENTER', w: 'fill' });
    add(head, await text(ctx, name, { size: 'sm', weight: 'semibold' }), await badge(ctx, String(n), 'outline'));
    add(c, head);
    const shown = Math.min(n, ctx.state === 'loading' ? 2 : 3);
    for (let i = 0; i < shown; i++) {
      const k = link(card(ctx, 'Card', { gap: 8, pad: 12 }), b.link && `row:${b.link}`);
      if (ctx.state === 'loading') add(k, skel(ctx, 80, 10), skel(ctx, 'fill', 12), skel(ctx, 60, 10));
      else {
        const [id, who, sum, product] = fakeRows([':id', ':person', ':money', ':product'], ci * 3 + i + 1, 31 + ci * 5 + i + ctx.seed).at(-1); // the row index makes the number unique
        const inner = colW - 48; // column and card padding: rows get real widths, so nothing overlaps
        const top = box(ctx, 'Top', { dir: 'H', align: 'CENTER', justify: 'SPACE_BETWEEN', w: inner });
        const late = i === 0 && ci === 1;
        add(top, await text(ctx, id, { size: 'xs', color: 'muted-foreground' }), b.badge !== false && (await badge(ctx, late ? 'SLA' : `${10 + i * 7} мин`, late ? 'destructive' : 'secondary')));
        const who_ = box(ctx, 'Client', { dir: 'H', gap: 8, align: 'CENTER', w: inner });
        add(who_, await avatar(ctx, who, 24), await text(ctx, who, { size: 'sm', weight: 'medium', w: 'fill', truncate: true }));
        // A pipeline column is narrow: product and amount on their own lines, never squeezed into one.
        const foot = box(ctx, 'Sum', { gap: 2, w: inner });
        add(foot, await text(ctx, sum, { size: 'sm', weight: 'semibold' }), await text(ctx, product, { size: 'xs', color: 'muted-foreground' }));
        add(k, top, who_, foot);
      }
      add(c, k);
    }
    if (n > shown && ctx.state === 'default') add(c, await text(ctx, `Ещё ${n - shown}`, { size: 'xs', weight: 'medium', color: 'muted-foreground' }));
    add(board, c);
  }
  return board;
}

// Bars with x labels; b.series: ["Одобрено", "Отказ"] draws grouped bars with a legend.
export async function chart(ctx, b) {
  const c = card(ctx, b.title || 'Chart');
  const head = box(ctx, 'Chart head', { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: 12, align: ctx.vp === 'mobile' ? 'MIN' : 'CENTER', w: 'fill' });
  add(head, await cardTitle(ctx, b.title || 'Динамика', b.subtitle));
  const series = b.series || [];
  if (series.length) {
    const legend = box(ctx, 'Legend', { dir: 'H', gap: 16, align: 'CENTER' });
    for (const [i, name] of series.entries()) add(legend, add(box(ctx, `Legend / ${name}`, { dir: 'H', gap: 6, align: 'CENTER' }), rect(ctx, 'Dot', 8, 8, `chart-${i + 1}`, 'full'), await text(ctx, name, { size: 'xs', color: 'muted-foreground' })));
    add(head, legend);
  }
  add(c, head);
  const labels = b.labels || (ctx.vp === 'mobile' ? ['09', '11', '13', '15', '17', '19', '21'] : ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']);
  const n = ctx.vp === 'mobile' ? Math.min(7, labels.length) : labels.length;
  const k = Math.max(1, series.length);
  const gap = ctx.vp === 'mobile' ? 6 : 12;
  const slot = Math.floor((ctx.width - 48 - (n - 1) * gap) / n);
  const barW = Math.max(4, Math.floor((slot - (k - 1) * 3) / k));
  const H = b.height || 200;
  const plot = box(ctx, 'Plot', { dir: 'H', gap, align: 'MAX', w: 'fill' });
  const r = rng(5 + ctx.seed);
  for (let i = 0; i < n; i++) {
    const col = box(ctx, `Slot / ${labels[i]}`, { gap: 8, align: 'CENTER', w: slot });
    const bars = box(ctx, 'Bars', { dir: 'H', gap: 3, align: 'MAX', h: H });
    for (let j = 0; j < k; j++) {
      const h = ctx.state === 'loading' ? 40 + ((i * 37 + j * 19) % 120) : Math.round((j ? 0.25 : 0.45) * H + r() * (j ? 0.25 : 0.5) * H);
      const tone = ctx.state === 'loading' ? 'muted' : k > 1 ? `chart-${j + 1}` : i === n - 2 ? 'chart-1' : 'chart-2';
      add(bars, rect(ctx, 'Bar', barW, h, tone, 'sm'));
    }
    add(col, bars, await text(ctx, labels[i], { size: 'xs', color: 'muted-foreground' }));
    add(plot, col);
  }
  return add(c, plot);
}

export async function list(ctx, b) {
  const c = card(ctx, b.title || 'List', { gap: 0, pad: 0 });
  if (b.title) add(c, add(box(ctx, 'Head', { pad: [20, 24, 8, 24], w: 'fill' }), await cardTitle(ctx, b.title, b.subtitle)));
  const items = b.items || fakeRows([':person', ':text', ':status'], b.rows || 5, 21 + ctx.seed, b.statuses);
  for (const it of items) {
    const [who, what, st] = Array.isArray(it) ? it : [it.title, it.subtitle, it.status];
    const row = link(box(ctx, 'Item', { dir: 'H', gap: 12, pad: [12, 24], align: 'CENTER', w: 'fill' }), b.link && `row:${b.link}`);
    if (ctx.state === 'loading') { add(row, skel(ctx, 32, 32, 'full'), add(box(ctx, 'Lines', { gap: 6, w: 'fill' }), skel(ctx, 140, 12), skel(ctx, 90, 10))); add(c, row); continue; }
    const main = box(ctx, 'Text', { gap: 2, w: 'fill' });
    add(main, await text(ctx, who, { size: 'sm', weight: 'medium', w: 'fill', truncate: true }), what && (await text(ctx, what, { size: 'xs', color: 'muted-foreground', w: 'fill' })));
    add(c, add(row, await avatar(ctx, who), main, st && (await badge(ctx, st, statusVariant(st)))));
  }
  return c;
}

export async function timeline(ctx, b) {
  const c = card(ctx, b.title || 'Timeline', { gap: 0 });
  add(c, await cardTitle(ctx, b.title || 'История'));
  const items = b.items || [['Заявка создана', '21.10.2026, 09:12'], ['Скоринг пройден', '21.10.2026, 09:40'], ['Передана в СБ', '21.10.2026, 10:05']];
  for (const [i, it] of items.entries()) {
    const [title, when] = Array.isArray(it) ? it : [it.title, it.time];
    const row = box(ctx, 'Event', { dir: 'H', gap: 12, pad: [12, 0, 0, 0], w: 'fill' });
    add(row, rect(ctx, 'Dot', 8, 8, i === items.length - 1 ? 'primary' : 'border', 'full'));
    const t = box(ctx, 'Text', { gap: 2, w: 'fill' });
    if (ctx.state === 'loading') add(t, skel(ctx, 160, 12), skel(ctx, 100, 10));
    else add(t, await text(ctx, title, { size: 'sm', weight: 'medium' }), await text(ctx, when, { size: 'xs', color: 'muted-foreground' }));
    add(c, add(row, t));
  }
  return c;
}

export async function cards(ctx, b) {
  const grid = box(ctx, 'Cards', { dir: 'H', gap: 16, w: ctx.width, wrap: true });
  const per = cols(ctx, b.columns || 3);
  const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
  for (const it of b.items) {
    const c = link(card(ctx, `Card / ${it.title}`, { gap: 8, pad: 20, w }), (it.link || b.link) && `row:${it.link || b.link}`);
    if (ctx.state === 'loading') add(c, skel(ctx, 120, 14), skel(ctx, 'fill', 10), skel(ctx, 160, 10));
    else add(c, await text(ctx, it.title, { size: 'base', weight: 'semibold' }), it.text && (await text(ctx, it.text, { size: 'sm', color: 'muted-foreground', w: 'fill' })), it.badge && (await badge(ctx, it.badge, statusVariant(it.badge))));
    add(grid, c);
  }
  return grid;
}

export async function details(ctx, b) {
  const c = card(ctx, b.title || 'Details');
  if (b.title) add(c, await cardTitle(ctx, b.title, b.subtitle));
  const per = cols(ctx, b.columns || 2);
  const grid = box(ctx, 'Fields', { dir: 'H', gap: 16, w: ctx.width - 48, wrap: true });
  const w = Math.floor((ctx.width - 48 - 16 * (per - 1)) / per);
  for (const it of b.items) {
    const [label, value] = Array.isArray(it) ? it : typeof it === 'string' ? it.split(':') : [it.label, it.value];
    const f = box(ctx, `Field / ${label}`, { gap: 4, w });
    const v = value && !['money', 'person', 'phone', 'date', 'id', 'product', 'city', 'company'].includes(value) ? value : fakeRows([`x:${value || 'text'}`], 1, label.length + ctx.seed)[0][0];
    add(f, await text(ctx, label, { size: 'xs', color: 'muted-foreground' }), ctx.state === 'loading' ? skel(ctx, 120, 12) : await text(ctx, v, { size: 'sm', weight: 'medium', w: 'fill' }));
    add(grid, f);
  }
  return add(c, grid);
}
