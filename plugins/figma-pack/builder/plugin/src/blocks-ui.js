// Structural blocks: page header, toolbars, forms, navigation and states.
import { box, text, add, rect, link } from './draw.js';
import { button, badge, input, checkbox, radio, skeleton } from './kit.js';
import { place, count } from './place.js';
import { card } from './blocks-data.js';
import { actionLabel as clean, isPrimaryAction as isPrimary } from '../../core/links.js';

// An action button tagged for the prototype: "+ Новая заявка → app-new" -> action:Новая заявка.
const actionButton = async (ctx, a, variant, sz) => link(await button(ctx, clean(a), variant, sz), `action:${clean(a)}`);

// «Заявки / CL-240118»: Breadcrumb item instances (the last one current), else one muted line.
async function breadcrumbs(ctx, items) {
  const row = box(ctx, 'Breadcrumbs', { dir: 'H', gap: 6, align: 'CENTER' });
  for (const [i, label] of items.entries()) {
    const inst = await place(ctx, 'breadcrumb-item', { props: { current: i === items.length - 1 ? 'true' : 'false' }, label });
    if (!inst) {
      row.remove();
      for (let k = i; k < items.length; k++) count(ctx, 'breadcrumb-item', false);
      return link(await text(ctx, items.join('  /  '), { size: 'sm', color: 'muted-foreground' }), 'back');
    }
    add(row, inst);
  }
  return link(row, 'back');
}

export async function header(ctx, b) {
  const mobile = ctx.vp === 'mobile';
  const h = box(ctx, 'Page header', { dir: mobile ? 'V' : 'H', gap: 16, align: mobile ? 'MIN' : 'CENTER', justify: 'SPACE_BETWEEN', w: 'fill' });
  const left = box(ctx, 'Title', { gap: 6, w: mobile ? 'fill' : 'hug' });
  if (b.breadcrumbs) add(left, await breadcrumbs(ctx, b.breadcrumbs));
  const titleRow = box(ctx, 'Title row', { dir: 'H', gap: 12, align: 'CENTER' });
  add(titleRow, await text(ctx, b.title, { size: mobile ? 'xl' : '2xl', weight: 'bold' }), b.badge && (await badge(ctx, b.badge, 'secondary')));
  add(left, titleRow, b.subtitle && (await text(ctx, b.subtitle, { size: 'sm', color: 'muted-foreground' })));
  add(h, left);
  if (mobile && b.period) add(h, await tabs(ctx, { items: b.period.slice(0, 3), active: b.periodActive ?? 0 }));
  if (b.actions?.length || (b.period && !mobile)) {
    const acts = box(ctx, 'Actions', { dir: 'H', gap: 8, align: 'CENTER', wrap: mobile, w: mobile ? ctx.width : 'hug' });
    if (b.period && !mobile) add(acts, await tabs(ctx, { items: b.period, active: b.periodActive ?? 0 }));
    for (const a of b.actions || []) add(acts, await actionButton(ctx, a, isPrimary(a) ? 'default' : 'outline'));
    add(h, acts);
  }
  return h;
}

export async function toolbar(ctx, b) {
  const mobile = ctx.vp === 'mobile';
  const t = box(ctx, 'Toolbar', { dir: mobile ? 'V' : 'H', gap: 8, align: mobile ? 'MIN' : 'CENTER', w: 'fill' });
  const search = await input(ctx, b.search || 'Поиск…', { w: mobile ? 'fill' : 320, kind: 'search-input' });
  add(t, search);
  if (mobile && 'layoutSizingHorizontal' in search) search.layoutSizingHorizontal = 'FILL';
  const filters = box(ctx, 'Filters', { dir: 'H', gap: 8, wrap: true, w: mobile ? 'fill' : 'hug' });
  for (const f of b.filters || []) {
    const chip = await place(ctx, 'filter-chip', { props: { state: 'default' }, label: f });
    if (!chip) count(ctx, 'filter-chip', 'stand-in'); // an outline button with a chevron
    add(filters, chip || (await button(ctx, `${f}  ▾`, 'outline', 'sm')));
  }
  if (b.filters?.length && !mobile) add(filters, await button(ctx, 'Сбросить', 'ghost', 'sm'));
  add(t, filters);
  if (b.actions?.length && !mobile) {
    add(t, box(ctx, 'Spacer', { w: 'fill', h: 1 }));
    for (const a of b.actions) add(t, await actionButton(ctx, a, isPrimary(a) ? 'default' : 'outline', 'sm'));
  }
  return t;
}

export async function pagination(ctx, b) {
  const p = box(ctx, 'Pagination', { dir: 'H', gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN', w: 'fill' });
  add(p, ctx.state === 'loading' ? await skeleton(ctx, 140, 12) : await text(ctx, b.summary || 'Показано 1–8 из 128', { size: 'sm', color: 'muted-foreground' }));
  const pages = box(ctx, 'Pages', { dir: 'H', gap: 4, align: 'CENTER' });
  add(pages, await button(ctx, '‹ Назад', 'ghost', 'sm'));
  if (ctx.vp !== 'mobile') {
    for (const n of ['1', '2', '3', '…', '16']) {
      const item = await place(ctx, 'pagination', { props: { state: n === '1' ? 'selected' : 'default', size: 'sm' }, label: n });
      if (!item) count(ctx, 'pagination', 'stand-in'); // a ghost / outline button
      add(pages, item || (await button(ctx, n, n === '1' ? 'outline' : 'ghost', 'sm')));
    }
  }
  add(pages, await button(ctx, 'Вперёд ›', 'ghost', 'sm'));
  return add(p, pages);
}

const tabState = (i, active) => ({ variant: 'segment', state: i === active ? 'selected' : 'default' });

export async function tabs(ctx, b) {
  const active = b.active ?? 0;
  const items = ctx.vp === 'mobile' ? b.items.slice(0, 3) : b.items; // the rest scrolls off on a phone
  // Three tabs: the Tabs list set as is (its nested triggers get the labels); otherwise triggers in a segment track.
  if (items.length === 3) {
    const nested = Object.fromEntries(items.map((label, i) => [`tab-${i + 1}`, { label, props: tabState(i, active) }]));
    const list = await place(ctx, 'tabs-list', { props: { variant: 'segment' }, nested });
    if (list) { list.name = 'Tabs'; return list; }
  }
  const t = box(ctx, 'Tabs', { dir: 'H', gap: 4, pad: 4, fill: 'muted', radius: 'lg' });
  for (const [i, label] of items.entries()) {
    const trigger = await place(ctx, 'tabs-trigger', { props: tabState(i, active), label });
    if (trigger) { trigger.name = `Tab / ${label}`; add(t, trigger); continue; }
    count(ctx, 'tabs-trigger', false);
    const tab = box(ctx, `Tab / ${label}`, { dir: 'H', pad: [6, 12], radius: 'md', fill: i === active ? 'background' : null, align: 'CENTER' });
    add(t, add(tab, await text(ctx, label, { size: 'sm', weight: 'medium', color: i === active ? 'foreground' : 'muted-foreground' })));
  }
  return t;
}

const FIELD_KIND = { select: 'select-trigger', textarea: 'textarea', date: 'date-picker-trigger' };

async function field(ctx, f, w, error) {
  const spec = typeof f === 'string' ? { label: f.split(':')[0], type: f.split(':')[1] || 'text' } : f;
  const wrap = box(ctx, `Field / ${spec.label}`, { gap: 6, w });
  if (spec.type === 'checkbox') {
    const row = box(ctx, 'Checkbox row', { dir: 'H', gap: 8, align: 'CENTER' });
    return add(wrap, add(row, await checkbox(ctx, true), await text(ctx, spec.label, { size: 'sm' })));
  }
  if (spec.type === 'radio') {
    const row = box(ctx, 'Radio row', { dir: 'H', gap: 8, align: 'CENTER' });
    return add(wrap, add(row, await radio(ctx, true), await text(ctx, spec.label, { size: 'sm' })));
  }
  add(wrap, await text(ctx, spec.label + (spec.required ? ' *' : ''), { size: 'sm', weight: 'medium' }));
  const kind = FIELD_KIND[spec.type];
  const own = !!(kind && ctx.sets && ctx.sets[kind]); // a select trigger draws its own chevron
  const ph = spec.placeholder || (spec.type === 'select' ? (own ? 'Выберите…' : 'Выберите…  ▾') : spec.type === 'date' ? 'дд.мм.гггг' : spec.type === 'money' ? '0 с' : spec.type === 'phone' ? '+996 ___ ___ ___' : '');
  const inp = await input(ctx, ph, { error, kind });
  if (spec.type === 'textarea' && !own) inp.resize(inp.width, 88);
  add(wrap, inp);
  if (error) add(wrap, await text(ctx, spec.error || 'Обязательное поле', { size: 'xs', color: 'destructive' }));
  else if (spec.hint) add(wrap, await text(ctx, spec.hint, { size: 'xs', color: 'muted-foreground' }));
  return wrap;
}

export async function form(ctx, b) {
  const c = card(ctx, b.title || 'Form', { gap: 20, w: b.width && ctx.vp === 'desktop' ? b.width : 'fill' });
  const inner = (b.width && ctx.vp === 'desktop' ? b.width : ctx.width) - 48;
  if (b.title) add(c, add(box(ctx, 'Head', { gap: 4, w: 'fill' }), await text(ctx, b.title, { size: 'lg', weight: 'semibold' }), b.subtitle && (await text(ctx, b.subtitle, { size: 'sm', color: 'muted-foreground' }))));
  const per = ctx.vp === 'mobile' ? 1 : b.columns || 2;
  const grid = box(ctx, 'Fields', { dir: 'H', gap: 16, w: inner, wrap: true });
  const w = Math.floor((inner - 16 * (per - 1)) / per);
  for (const [i, f] of b.fields.entries()) add(grid, await field(ctx, f, w, ctx.state === 'error' && i === 0));
  add(c, grid);
  const acts = box(ctx, 'Form actions', { dir: 'H', gap: 8, justify: 'MAX', w: 'fill' });
  add(acts, link(await button(ctx, b.cancel || 'Отмена', 'outline'), 'cancel'), link(await button(ctx, b.submit || 'Сохранить', 'default'), 'submit'));
  return add(c, acts);
}

export async function stepper(ctx, b) {
  const s = box(ctx, 'Stepper', { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: 8, align: 'CENTER', w: 'fill' });
  const cur = b.current ?? 1;
  for (const [i, label] of b.steps.entries()) {
    const done = i < cur;
    const status = done ? 'done' : i === cur ? 'current' : 'upcoming';
    const step = await place(ctx, 'stepper-step', { props: { status }, label, texts: { Number: String(i + 1), Description: null } });
    if (step) { step.name = `Step / ${label}`; add(s, step); } else {
      count(ctx, 'stepper-step', false);
      const st = box(ctx, `Step / ${label}`, { dir: 'H', gap: 8, align: 'CENTER' });
      const dot = box(ctx, 'Dot', { dir: 'H', w: 24, h: 24, radius: 'full', align: 'CENTER', justify: 'CENTER', fill: i <= cur ? 'primary' : 'muted' });
      add(dot, await text(ctx, done ? '✓' : String(i + 1), { size: 'xs', weight: 'semibold', color: i <= cur ? 'primary-foreground' : 'muted-foreground' }));
      add(st, dot, await text(ctx, label, { size: 'sm', weight: i === cur ? 'semibold' : 'regular', color: i <= cur ? 'foreground' : 'muted-foreground' }));
      add(s, st);
    }
    if (i < b.steps.length - 1 && ctx.vp !== 'mobile') add(s, rect(ctx, 'Line', 32, 1, done ? 'primary' : 'border'));
  }
  return s;
}

const ALERT = { destructive: ['destructive', 'destructive'], warning: ['warning', 'foreground'], info: ['info', 'foreground'], success: ['success', 'foreground'] };

const ALERT_TONE = { destructive: 'error', warning: 'warning', info: 'info', success: 'success' };

export async function alert(ctx, b) {
  const inst = await place(ctx, 'alert', { props: { tone: ALERT_TONE[b.variant] || 'info' }, texts: { Title: b.title || null, Description: b.text }, w: 'fill' });
  if (inst) {
    inst.name = `Alert / ${b.variant || 'info'}`;
    if (!b.action) return inst;
    // An instance takes no children: the action sits next to the alert.
    const row = box(ctx, `Alert / ${b.variant || 'info'}`, { dir: 'H', gap: 12, align: 'CENTER', w: 'fill' });
    return add(row, inst, await actionButton(ctx, b.action, 'outline', 'sm'));
  }
  count(ctx, 'alert', false);
  const [accent, tc] = ALERT[b.variant] || ALERT.info;
  const a = box(ctx, `Alert / ${b.variant || 'info'}`, { dir: 'H', gap: 12, pad: 16, stroke: accent, radius: 'lg', fill: 'background', w: 'fill' });
  add(a, rect(ctx, 'Mark', 4, 36, accent, 'full'));
  const t = box(ctx, 'Text', { gap: 2, w: 'fill' });
  add(t, b.title && (await text(ctx, b.title, { size: 'sm', weight: 'semibold', color: tc })), await text(ctx, b.text, { size: 'sm', color: 'muted-foreground', w: 'fill' }));
  return add(a, t, b.action && (await actionButton(ctx, b.action, 'outline', 'sm')));
}

export async function empty(ctx, b) {
  const title = b.title || 'Пока ничего нет';
  const body = b.text || 'Здесь появятся записи, когда они будут созданы.';
  const act = b.action && clean(b.action);
  const inst = await place(ctx, 'empty-state', { texts: { Title: title, Description: body, Action: act ? true : null }, nested: act ? { Action: { label: act } } : {}, w: 'fill' });
  if (inst) { inst.name = 'Empty state'; return act ? link(inst, `action:${act}`) : inst; }
  count(ctx, 'empty-state', false);
  const c = box(ctx, 'Empty state', { gap: 12, pad: [56, 24], align: 'CENTER', stroke: 'border', radius: 'xl', fill: 'card', w: 'fill' });
  c.dashPattern = [6, 4];
  const icon = box(ctx, 'Icon', { dir: 'H', w: 48, h: 48, radius: 'full', fill: 'muted', align: 'CENTER', justify: 'CENTER' });
  add(icon, await text(ctx, b.icon || '∅', { size: 'lg', color: 'muted-foreground' }));
  add(c, icon, await text(ctx, b.title || 'Пока ничего нет', { size: 'base', weight: 'semibold', align: 'CENTER' }),
    await text(ctx, b.text || 'Здесь появятся записи, когда они будут созданы.', { size: 'sm', color: 'muted-foreground', align: 'CENTER' }),
    b.action && (await actionButton(ctx, b.action, 'default')));
  return c;
}

export async function login(ctx, b) {
  const wrap = box(ctx, 'Login', { align: 'CENTER', pad: [ctx.vp === 'mobile' ? 32 : 96, 0], w: 'fill' });
  const w = Math.min(400, ctx.width);
  const c = card(ctx, 'Login card', { gap: 20, pad: 32, w });
  add(c, add(box(ctx, 'Head', { gap: 6, w: 'fill' }), await text(ctx, b.title || 'Вход в систему', { size: '2xl', weight: 'bold' }), await text(ctx, b.subtitle || 'Введите рабочую почту и пароль', { size: 'sm', color: 'muted-foreground' })));
  const err = ctx.state === 'error';
  if (err) add(c, await alert(ctx, { variant: 'destructive', text: b.error || 'Неверная почта или пароль' }));
  for (const f of b.fields || ['Почта:email', 'Пароль:password']) {
    const [label, type] = f.split(':');
    const fw = box(ctx, `Field / ${label}`, { gap: 6, w: 'fill' });
    add(c, add(fw, await text(ctx, label, { size: 'sm', weight: 'medium' }), await input(ctx, type === 'password' ? '••••••••' : 'name@company.kg', { error: err })));
  }
  const btn = link(await button(ctx, b.submit || 'Войти', 'default'), 'submit');
  add(c, btn);
  if ('layoutSizingHorizontal' in btn) btn.layoutSizingHorizontal = 'FILL';
  if (b.footer !== false) add(c, await text(ctx, b.footer || 'Забыли пароль?', { size: 'sm', color: 'muted-foreground', align: 'CENTER', w: 'fill' }));
  return add(wrap, c);
}

// split is resolved by the screen builder, which owns block dispatch.
export const SPLIT_GAP = 24;
