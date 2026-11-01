// CRM blocks of a credit pipeline: funnel, SLA meters, scoring, decision, documents, checks,
// comments, client profile, breakdown. Same rules as blocks-data.js: tokens only, loading = skeletons.
import { box, text, add, skel, rect, link, fill } from './draw.js';
import { badge, avatar, button, input, statusVariant } from './kit.js';
import { icon } from './icons.js';
import { card } from './blocks-data.js';
import { actionLabel as clean, isPrimaryAction as isPrimary } from '../../core/links.js';

const CHART = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const TONE = { success: 'success', warning: 'warning', danger: 'destructive', destructive: 'destructive', info: 'info', default: 'primary' };
const loading = (ctx) => ctx.state === 'loading';
const pairOf = (it) => (Array.isArray(it) ? it : typeof it === 'string' ? it.split(':') : [it.label, it.value]);

// Card head: title + subtitle on the left, a quiet link («Все заявки →») on the right.
export async function cardHead(ctx, b) {
  const h = box(ctx, 'Card header', { dir: 'H', gap: 12, align: 'CENTER', w: 'fill' });
  const t = box(ctx, 'Titles', { gap: 2, w: 'fill' });
  add(t, await text(ctx, b.title, { size: 'base', weight: 'semibold', w: 'fill' }), b.subtitle && (await text(ctx, b.subtitle, { size: 'sm', color: 'muted-foreground', w: 'fill' })));
  add(h, t);
  if (b.more) add(h, link(await text(ctx, `${clean(b.more)} →`, { size: 'sm', weight: 'medium', color: 'foreground' }), `action:${clean(b.more)}`));
  return h;
}

// Track + fill bar; share 0..1.
function bar(ctx, width, share, token, h = 8) {
  const track = box(ctx, 'Track', { dir: 'H', fill: 'muted', radius: 'full', w: width, h, clip: true });
  add(track, rect(ctx, 'Fill', Math.max(h, Math.round(width * Math.min(1, share))), h, token, 'full'));
  return track;
}

/** Pipeline funnel: items [{ label, value, rate }] — bar length by value, conversion on the right. */
export async function funnel(ctx, b) {
  const c = card(ctx, b.title || 'Funnel');
  add(c, await cardHead(ctx, b));
  const max = Math.max(...b.items.map((it) => Number(String(it.value).replace(/\D/g, '')) || 0), 1);
  const barW = ctx.width - 48 - (ctx.vp === 'mobile' ? 0 : 220);
  for (const [i, it] of b.items.entries()) {
    const row = box(ctx, `Stage / ${it.label}`, { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: ctx.vp === 'mobile' ? 6 : 16, align: ctx.vp === 'mobile' ? 'MIN' : 'CENTER', w: 'fill' });
    if (loading(ctx)) { add(c, add(row, skel(ctx, 120, 12), skel(ctx, Math.round(barW * (1 - i * 0.15)), 28, 'md'))); continue; }
    const label = box(ctx, 'Label', { gap: 2, w: ctx.vp === 'mobile' ? 'fill' : 140 });
    add(label, await text(ctx, it.label, { size: 'sm', weight: 'medium', w: 'fill' }), it.hint && (await text(ctx, it.hint, { size: 'xs', color: 'muted-foreground', w: 'fill' })));
    const share = (Number(String(it.value).replace(/\D/g, '')) || 0) / max;
    const w = Math.max(8, Math.round((barW - 64) * share));
    const lane = box(ctx, 'Lane', { dir: 'H', gap: 10, align: 'CENTER', w: ctx.vp === 'mobile' ? 'fill' : barW });
    add(lane, rect(ctx, 'Bar', w, 28, 'chart-1', 'md'), await text(ctx, String(it.value), { size: 'sm', weight: 'semibold' }));
    add(row, label, lane);
    if (ctx.vp !== 'mobile') add(row, add(box(ctx, 'Rate', { dir: 'H', justify: 'MAX', w: 56 }), it.rate ? await text(ctx, it.rate, { size: 'sm', weight: 'medium', color: 'muted-foreground' }) : null));
    add(c, row);
  }
  return c;
}

/** Meters (SLA by stage, team load, limits): items [{ label, value, percent, hint, tone }]. */
export async function meters(ctx, b) {
  const c = card(ctx, b.title || 'Meters');
  add(c, await cardHead(ctx, b));
  const inner = ctx.width - 48;
  for (const it of b.items) {
    const m = box(ctx, `Meter / ${it.label}`, { gap: 8, w: 'fill' });
    if (loading(ctx)) { add(c, add(m, skel(ctx, 160, 12), skel(ctx, inner, 8, 'full'))); continue; }
    const top = box(ctx, 'Top', { dir: 'H', gap: 8, align: 'CENTER', w: 'fill' });
    const pct = Number(String(it.percent ?? 0).replace(/[^\d.]/g, '')) || 0;
    const tone = TONE[it.tone] || (pct >= 90 ? 'destructive' : pct >= 75 ? 'warning' : 'primary');
    add(top, await text(ctx, it.label, { size: 'sm', weight: 'medium', w: 'fill', truncate: true }), await text(ctx, it.value ?? `${pct}%`, { size: 'sm', weight: 'semibold', color: tone === 'primary' ? 'foreground' : tone }));
    add(m, top, bar(ctx, inner, pct / 100, tone), it.hint && (await text(ctx, it.hint, { size: 'xs', color: 'muted-foreground' })));
    add(c, m);
  }
  return c;
}

/** Credit score: value of max, grade, a 5-zone scale with a marker, factors [[label, '+42' | '−18']]. */
export async function score(ctx, b) {
  const c = card(ctx, b.title || 'Скоринг', { gap: 20 });
  add(c, await cardHead(ctx, { title: b.title || 'Скоринг', subtitle: b.subtitle, more: b.more }));
  const inner = ctx.width - 48;
  if (loading(ctx)) return add(c, skel(ctx, 120, 40, 'md'), skel(ctx, inner, 10, 'full'), skel(ctx, 200, 12), skel(ctx, 160, 12));
  const max = b.max || 850;
  const top = box(ctx, 'Value', { dir: 'H', gap: 12, align: 'MAX', w: 'fill' });
  add(top, await text(ctx, String(b.value), { size: '4xl', weight: 'bold' }), await text(ctx, `из ${max}`, { size: 'sm', color: 'muted-foreground' }), box(ctx, 'Spacer', { w: 'fill', h: 1 }), b.grade && (await badge(ctx, b.grade, statusVariant(b.grade))));
  // Zones from high risk to low risk; the marker sits over the value.
  const zones = ['destructive', 'warning', 'chart-3', 'chart-1', 'success'];
  const gap = 4;
  const zw = Math.floor((inner - gap * 4) / 5);
  const scale = box(ctx, 'Scale', { dir: 'H', gap, w: 'fill' });
  for (const z of zones) add(scale, rect(ctx, 'Zone', zw, 8, z, 'full'));
  const markerRow = box(ctx, 'Marker row', { dir: 'H', w: 'fill', h: 12 });
  const pos = Math.round(Math.min(1, b.value / max) * inner);
  add(markerRow, box(ctx, 'Offset', { w: Math.max(0, pos - 6), h: 1 }), rect(ctx, 'Marker', 12, 12, 'foreground', 'full'));
  const legend = box(ctx, 'Legend', { dir: 'H', justify: 'SPACE_BETWEEN', w: 'fill' });
  add(legend, await text(ctx, 'Высокий риск', { size: 'xs', color: 'muted-foreground' }), await text(ctx, 'Низкий риск', { size: 'xs', color: 'muted-foreground' }));
  add(c, top, add(box(ctx, 'Gauge', { gap: 6, w: 'fill' }), markerRow, scale, legend));
  if (b.items?.length) {
    const list = box(ctx, 'Factors', { gap: 10, w: 'fill' });
    add(list, await text(ctx, b.factorsTitle || 'Что повлияло', { size: 'xs', weight: 'medium', color: 'muted-foreground' }));
    for (const it of b.items) {
      const [label, impact] = pairOf(it);
      const good = /^[+▲]/.test(String(impact).trim());
      const row = box(ctx, `Factor / ${label}`, { dir: 'H', gap: 10, align: 'CENTER', w: 'fill' });
      add(row, rect(ctx, 'Dot', 8, 8, good ? 'success' : 'destructive', 'full'), await text(ctx, label, { size: 'sm', w: 'fill' }), await text(ctx, impact, { size: 'sm', weight: 'semibold', color: good ? 'success' : 'destructive' }));
      add(list, row);
    }
    add(c, list);
  }
  return c;
}

/** Decision panel: offer parameters [[label, value]] in a grid + decision buttons. */
export async function decision(ctx, b) {
  const c = card(ctx, b.title || 'Решение', { gap: 20 });
  add(c, await cardHead(ctx, { title: b.title || 'Решение', subtitle: b.subtitle }));
  const per = ctx.vp === 'mobile' ? 2 : b.columns || 2;
  const inner = ctx.width - 48;
  const w = Math.floor((inner - 12 * (per - 1)) / per);
  const grid = box(ctx, 'Terms', { dir: 'H', gap: 12, wrap: true, w: inner });
  for (const it of b.items) {
    const [label, value] = pairOf(it);
    const cell = box(ctx, `Term / ${label}`, { gap: 4, pad: [12, 14], fill: 'muted', fillOpacity: 0.5, radius: 'lg', w });
    add(cell, await text(ctx, label, { size: 'xs', color: 'muted-foreground' }), loading(ctx) ? skel(ctx, 80, 14) : await text(ctx, value, { size: 'base', weight: 'semibold' }));
    add(grid, cell);
  }
  add(c, grid);
  if (b.note) add(c, await text(ctx, b.note, { size: 'sm', color: 'muted-foreground', w: 'fill' }));
  const acts = box(ctx, 'Decision actions', { dir: 'H', gap: 8, wrap: true, w: ctx.width - 48 });
  const list = b.actions || ['Одобрить', 'На доработку', 'Отказать'];
  for (const a of list) {
    const variant = /отказ|отклон|reject/i.test(a) ? 'destructive' : isPrimary(a) || a === list[0] ? 'default' : 'outline';
    add(acts, link(await button(ctx, clean(a), variant), `action:${clean(a)}`));
  }
  return list.length ? add(c, acts) : c;
}

/** Documents: items [{ name, meta, status }]. */
export async function files(ctx, b) {
  const c = card(ctx, b.title || 'Документы', { gap: 4 });
  add(c, add(box(ctx, 'Head', { pad: [0, 0, 8, 0], w: 'fill' }), await cardHead(ctx, { title: b.title || 'Документы', subtitle: b.subtitle, more: b.more })));
  for (const it of b.items) {
    const f = typeof it === 'string' ? { name: it } : it;
    const row = box(ctx, `File / ${f.name}`, { dir: 'H', gap: 12, pad: [10, 0], align: 'CENTER', w: 'fill' });
    const tile = box(ctx, 'File icon', { dir: 'H', w: 36, h: 36, radius: 'md', fill: 'muted', align: 'CENTER', justify: 'CENTER' });
    add(tile, icon(ctx, 'file', 'muted-foreground', 18));
    const t = box(ctx, 'Name', { gap: 2, w: 'fill' });
    if (loading(ctx)) add(t, skel(ctx, 160, 12), skel(ctx, 90, 10));
    else add(t, await text(ctx, f.name, { size: 'sm', weight: 'medium', w: 'fill', truncate: true }), f.meta && (await text(ctx, f.meta, { size: 'xs', color: 'muted-foreground' })));
    add(c, add(row, tile, t, !loading(ctx) && f.status && (await badge(ctx, f.status, statusVariant(f.status))), icon(ctx, 'more', 'muted-foreground', 16)));
  }
  return c;
}

const CHECK = { ok: ['check', 'success'], warn: ['info', 'warning'], fail: ['shield', 'destructive'], wait: ['history', 'muted-foreground'] };

/** Checks (stop lists, credit bureau, verification): items [{ label, result, status: ok|warn|fail|wait }]. */
export async function checks(ctx, b) {
  const c = card(ctx, b.title || 'Проверки', { gap: 0 });
  add(c, add(box(ctx, 'Head', { pad: [0, 0, 12, 0], w: 'fill' }), await cardHead(ctx, { title: b.title || 'Проверки', subtitle: b.subtitle, more: b.more })));
  for (const [i, it] of b.items.entries()) {
    const ch = typeof it === 'string' ? { label: it, status: 'ok' } : it;
    const [ic, tone] = CHECK[ch.status] || CHECK.ok;
    const row = box(ctx, `Check / ${ch.label}`, { dir: 'H', gap: 12, pad: [12, 0], align: 'CENTER', w: 'fill' });
    if (i) add(c, rect(ctx, 'Divider', ctx.width - 48, 1, 'border'));
    const dot = box(ctx, 'Status', { dir: 'H', w: 28, h: 28, radius: 'full', align: 'CENTER', justify: 'CENTER' });
    fill(dot, ctx, 'muted'); // a tint of a bound colour renders solid in Figma: grey plate, coloured glyph
    add(dot, icon(ctx, ic, tone, 16));
    const t = box(ctx, 'Text', { gap: 2, w: 'fill' });
    if (loading(ctx)) add(t, skel(ctx, 180, 12), skel(ctx, 100, 10));
    else add(t, await text(ctx, ch.label, { size: 'sm', weight: 'medium', w: 'fill' }), ch.hint && (await text(ctx, ch.hint, { size: 'xs', color: 'muted-foreground', w: 'fill' })));
    add(c, add(row, dot, t, !loading(ctx) && ch.result && (await text(ctx, ch.result, { size: 'sm', weight: 'medium', color: tone === 'muted-foreground' ? 'muted-foreground' : tone }))));
  }
  return c;
}

/** Comments: items [{ who, time, text }] + a reply field. */
export async function comments(ctx, b) {
  const c = card(ctx, b.title || 'Комментарии', { gap: 16 });
  add(c, await cardHead(ctx, { title: b.title || 'Комментарии', subtitle: b.subtitle }));
  for (const it of b.items) {
    const m = Array.isArray(it) ? { who: it[0], time: it[1], text: it[2] } : it;
    const row = box(ctx, `Comment / ${m.who}`, { dir: 'H', gap: 12, w: 'fill' });
    const body = box(ctx, 'Body', { gap: 4, w: 'fill' });
    if (loading(ctx)) { add(c, add(row, skel(ctx, 32, 32, 'full'), add(body, skel(ctx, 140, 12), skel(ctx, 'fill', 10)))); continue; }
    const head = box(ctx, 'Who', { dir: 'H', gap: 8, align: 'CENTER', w: 'fill' });
    add(head, await text(ctx, m.who, { size: 'sm', weight: 'semibold' }), m.time && (await text(ctx, m.time, { size: 'xs', color: 'muted-foreground' })));
    const bubble = box(ctx, 'Bubble', { pad: [10, 12], fill: 'muted', fillOpacity: 0.6, radius: 'lg', w: 'fill' });
    add(bubble, await text(ctx, m.text, { size: 'sm', w: 'fill' }));
    add(c, add(row, await avatar(ctx, m.who), add(body, head, bubble)));
  }
  const reply = box(ctx, 'Reply', { dir: 'H', gap: 8, align: 'CENTER', w: 'fill' });
  const field = await input(ctx, b.placeholder || 'Написать комментарий…');
  add(reply, field, await button(ctx, 'Отправить', 'default'));
  if ('layoutSizingHorizontal' in field) field.layoutSizingHorizontal = 'FILL';
  return add(c, reply);
}

/** Client (or company) profile header: avatar, name, meta, badges, key facts, actions. */
export async function profile(ctx, b) {
  const mobile = ctx.vp === 'mobile';
  const c = card(ctx, `Profile / ${b.name}`, { gap: 20 });
  const top = box(ctx, 'Top', { dir: mobile ? 'V' : 'H', gap: 16, align: mobile ? 'MIN' : 'CENTER', w: 'fill' });
  const who = box(ctx, 'Who', { dir: 'H', gap: 16, align: 'CENTER', w: mobile ? 'fill' : 'hug' });
  const t = box(ctx, 'Name', { gap: 4 });
  const badges = box(ctx, 'Badges', { dir: 'H', gap: 6, wrap: true });
  for (const x of b.badges || []) add(badges, await badge(ctx, x, statusVariant(x)));
  add(t, await text(ctx, b.name, { size: 'xl', weight: 'bold' }), b.meta && (await text(ctx, b.meta, { size: 'sm', color: 'muted-foreground' })), b.badges?.length && badges);
  add(who, await avatar(ctx, b.name, 56), t);
  add(top, who);
  if (b.actions?.length) {
    if (!mobile) add(top, box(ctx, 'Spacer', { w: 'fill', h: 1 }));
    const acts = box(ctx, 'Actions', { dir: 'H', gap: 8, wrap: true });
    for (const a of b.actions) add(acts, link(await button(ctx, clean(a), isPrimary(a) ? 'default' : 'outline'), `action:${clean(a)}`));
    add(top, acts);
  }
  add(c, top);
  if (b.items?.length) {
    const per = mobile ? 2 : Math.min(b.items.length, 5);
    const inner = ctx.width - 48;
    const w = Math.floor((inner - 16 * (per - 1)) / per);
    const facts = box(ctx, 'Facts', { dir: 'H', gap: 16, wrap: true, pad: [16, 0, 0, 0], w: inner });
    for (const it of b.items) {
      const [label, value] = pairOf(it);
      const f = box(ctx, `Fact / ${label}`, { gap: 4, w });
      add(f, await text(ctx, label, { size: 'xs', color: 'muted-foreground' }), loading(ctx) ? skel(ctx, 90, 14) : await text(ctx, value, { size: 'sm', weight: 'semibold', w: 'fill' }));
      add(facts, f);
    }
    add(c, rect(ctx, 'Divider', inner, 1, 'border'), facts);
  }
  return c;
}

/** Share breakdown (portfolio by product): one stacked bar + legend rows [{ label, value, share }]. */
export async function breakdown(ctx, b) {
  const c = card(ctx, b.title || 'Структура');
  add(c, await cardHead(ctx, b));
  const inner = ctx.width - 48;
  if (loading(ctx)) return add(c, skel(ctx, inner, 12, 'full'), skel(ctx, 180, 12), skel(ctx, 160, 12), skel(ctx, 140, 12));
  const shares = b.items.map((it) => Number(String(it.share).replace(/[^\d.]/g, '')) || 0);
  const total = shares.reduce((a, x) => a + x, 0) || 1;
  const stack = box(ctx, 'Stack', { dir: 'H', gap: 2, w: 'fill', radius: 'full', clip: true });
  b.items.forEach((it, i) => add(stack, rect(ctx, `Part / ${it.label}`, Math.max(4, Math.floor(((inner - 2 * (b.items.length - 1)) * shares[i]) / total)), 12, CHART[i % CHART.length])));
  add(c, stack);
  for (const [i, it] of b.items.entries()) {
    const row = box(ctx, `Legend / ${it.label}`, { dir: 'H', gap: 10, align: 'CENTER', w: 'fill' });
    add(row, rect(ctx, 'Dot', 10, 10, CHART[i % CHART.length], 'full'), await text(ctx, it.label, { size: 'sm', w: 'fill' }),
      it.value && (await text(ctx, it.value, { size: 'sm', weight: 'medium' })),
      add(box(ctx, 'Share', { dir: 'H', justify: 'MAX', w: 48 }), await text(ctx, String(it.share), { size: 'sm', color: 'muted-foreground' })));
    add(c, row);
  }
  return c;
}
