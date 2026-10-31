// Structural blocks: page header, toolbars, forms, navigation and states.
import { box, text, add, rect, skel } from './draw.js';
import { button, badge, input, checkbox } from './kit.js';
import { card } from './blocks-data.js';

const isPrimary = (label) => String(label).trim().startsWith('+');
const clean = (label) => String(label).replace(/^\+\s*/, '');

export async function header(ctx, b) {
  const mobile = ctx.vp === 'mobile';
  const h = box(ctx, 'Page header', { dir: mobile ? 'V' : 'H', gap: 16, align: mobile ? 'MIN' : 'CENTER', justify: 'SPACE_BETWEEN', w: 'fill' });
  const left = box(ctx, 'Title', { gap: 6, w: mobile ? 'fill' : 'hug' });
  if (b.breadcrumbs) add(left, await text(ctx, b.breadcrumbs.join('  /  '), { size: 'sm', color: 'muted-foreground' }));
  const titleRow = box(ctx, 'Title row', { dir: 'H', gap: 12, align: 'CENTER' });
  add(titleRow, await text(ctx, b.title, { size: mobile ? 'xl' : '2xl', weight: 'bold' }), b.badge && (await badge(ctx, b.badge, 'secondary')));
  add(left, titleRow, b.subtitle && (await text(ctx, b.subtitle, { size: 'sm', color: 'muted-foreground' })));
  add(h, left);
  if (b.actions?.length) {
    const acts = box(ctx, 'Actions', { dir: 'H', gap: 8, align: 'CENTER', wrap: mobile });
    for (const a of b.actions) add(acts, await button(ctx, clean(a), isPrimary(a) ? 'default' : 'outline'));
    add(h, acts);
  }
  return h;
}

export async function toolbar(ctx, b) {
  const mobile = ctx.vp === 'mobile';
  const t = box(ctx, 'Toolbar', { dir: mobile ? 'V' : 'H', gap: 8, align: mobile ? 'MIN' : 'CENTER', w: 'fill' });
  add(t, await input(ctx, b.search || 'Поиск…', { w: mobile ? 'fill' : 320 }));
  const filters = box(ctx, 'Filters', { dir: 'H', gap: 8, wrap: true, w: mobile ? 'fill' : 'hug' });
  for (const f of b.filters || []) add(filters, await button(ctx, `${f}  ▾`, 'outline', 'sm'));
  if (b.filters?.length && !mobile) add(filters, await button(ctx, 'Сбросить', 'ghost', 'sm'));
  add(t, filters);
  if (b.actions?.length && !mobile) {
    add(t, box(ctx, 'Spacer', { w: 'fill' }));
    for (const a of b.actions) add(t, await button(ctx, clean(a), isPrimary(a) ? 'default' : 'outline', 'sm'));
  }
  return t;
}

export async function pagination(ctx, b) {
  const p = box(ctx, 'Pagination', { dir: 'H', gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN', w: 'fill' });
  add(p, ctx.state === 'loading' ? skel(ctx, 140, 12) : await text(ctx, b.summary || 'Показано 1–8 из 128', { size: 'sm', color: 'muted-foreground' }));
  const pages = box(ctx, 'Pages', { dir: 'H', gap: 4, align: 'CENTER' });
  add(pages, await button(ctx, '‹ Назад', 'ghost', 'sm'));
  if (ctx.vp !== 'mobile') for (const n of ['1', '2', '3', '…', '16']) add(pages, await button(ctx, n, n === '1' ? 'outline' : 'ghost', 'sm'));
  add(pages, await button(ctx, 'Вперёд ›', 'ghost', 'sm'));
  return add(p, pages);
}

export async function tabs(ctx, b) {
  const t = box(ctx, 'Tabs', { dir: 'H', gap: 4, pad: 4, fill: 'muted', radius: 'lg' });
  const active = b.active ?? 0;
  for (const [i, label] of b.items.entries()) {
    const tab = box(ctx, `Tab / ${label}`, { dir: 'H', pad: [6, 12], radius: 'md', fill: i === active ? 'background' : null, align: 'CENTER' });
    add(t, add(tab, await text(ctx, label, { size: 'sm', weight: 'medium', color: i === active ? 'foreground' : 'muted-foreground' })));
  }
  return t;
}

async function field(ctx, f, w, error) {
  const spec = typeof f === 'string' ? { label: f.split(':')[0], type: f.split(':')[1] || 'text' } : f;
  const wrap = box(ctx, `Field / ${spec.label}`, { gap: 6, w });
  if (spec.type === 'checkbox') {
    const row = box(ctx, 'Checkbox row', { dir: 'H', gap: 8, align: 'CENTER' });
    return add(wrap, add(row, await checkbox(ctx, true), await text(ctx, spec.label, { size: 'sm' })));
  }
  add(wrap, await text(ctx, spec.label + (spec.required ? ' *' : ''), { size: 'sm', weight: 'medium' }));
  const ph = spec.placeholder || (spec.type === 'select' ? 'Выберите…  ▾' : spec.type === 'date' ? 'дд.мм.гггг' : spec.type === 'money' ? '0 с' : spec.type === 'phone' ? '+996 ___ ___ ___' : '');
  const inp = await input(ctx, ph, { error });
  if (spec.type === 'textarea') inp.resize(inp.width, 88);
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
  const grid = box(ctx, 'Fields', { dir: 'H', gap: 16, w: 'fill', wrap: true });
  const w = Math.floor((inner - 16 * (per - 1)) / per);
  for (const [i, f] of b.fields.entries()) add(grid, await field(ctx, f, w, ctx.state === 'error' && i === 0));
  add(c, grid);
  const acts = box(ctx, 'Form actions', { dir: 'H', gap: 8, justify: 'MAX', w: 'fill' });
  add(acts, await button(ctx, b.cancel || 'Отмена', 'outline'), await button(ctx, b.submit || 'Сохранить', 'default'));
  return add(c, acts);
}

export async function stepper(ctx, b) {
  const s = box(ctx, 'Stepper', { dir: ctx.vp === 'mobile' ? 'V' : 'H', gap: 8, align: 'CENTER', w: 'fill' });
  const cur = b.current ?? 1;
  for (const [i, label] of b.steps.entries()) {
    const done = i < cur;
    const st = box(ctx, `Step / ${label}`, { dir: 'H', gap: 8, align: 'CENTER' });
    const dot = box(ctx, 'Dot', { dir: 'H', w: 24, h: 24, radius: 'full', align: 'CENTER', justify: 'CENTER', fill: i <= cur ? 'primary' : 'muted' });
    add(dot, await text(ctx, done ? '✓' : String(i + 1), { size: 'xs', weight: 'semibold', color: i <= cur ? 'primary-foreground' : 'muted-foreground' }));
    add(st, dot, await text(ctx, label, { size: 'sm', weight: i === cur ? 'semibold' : 'regular', color: i <= cur ? 'foreground' : 'muted-foreground' }));
    add(s, st);
    if (i < b.steps.length - 1 && ctx.vp !== 'mobile') add(s, rect(ctx, 'Line', 32, 1, done ? 'primary' : 'border'));
  }
  return s;
}

const ALERT = { destructive: ['destructive', 'destructive'], warning: ['warning', 'foreground'], info: ['info', 'foreground'], success: ['success', 'foreground'] };

export async function alert(ctx, b) {
  const [accent, tc] = ALERT[b.variant] || ALERT.info;
  const a = box(ctx, `Alert / ${b.variant || 'info'}`, { dir: 'H', gap: 12, pad: 16, stroke: accent, radius: 'lg', fill: 'background', w: 'fill' });
  add(a, rect(ctx, 'Mark', 4, 36, accent, 'full'));
  const t = box(ctx, 'Text', { gap: 2, w: 'fill' });
  add(t, b.title && (await text(ctx, b.title, { size: 'sm', weight: 'semibold', color: tc })), await text(ctx, b.text, { size: 'sm', color: 'muted-foreground', w: 'fill' }));
  return add(a, t, b.action && (await button(ctx, b.action, 'outline', 'sm')));
}

export async function empty(ctx, b) {
  const c = box(ctx, 'Empty state', { gap: 12, pad: [56, 24], align: 'CENTER', stroke: 'border', radius: 'xl', fill: 'card', w: 'fill' });
  c.dashPattern = [6, 4];
  const icon = box(ctx, 'Icon', { dir: 'H', w: 48, h: 48, radius: 'full', fill: 'muted', align: 'CENTER', justify: 'CENTER' });
  add(icon, await text(ctx, b.icon || '∅', { size: 'lg', color: 'muted-foreground' }));
  add(c, icon, await text(ctx, b.title || 'Пока ничего нет', { size: 'base', weight: 'semibold', align: 'CENTER' }),
    await text(ctx, b.text || 'Здесь появятся записи, когда они будут созданы.', { size: 'sm', color: 'muted-foreground', align: 'CENTER' }),
    b.action && (await button(ctx, clean(b.action), 'default')));
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
  const btn = await button(ctx, b.submit || 'Войти', 'default');
  add(c, btn);
  if ('layoutSizingHorizontal' in btn) btn.layoutSizingHorizontal = 'FILL';
  if (b.footer !== false) add(c, await text(ctx, b.footer || 'Забыли пароль?', { size: 'sm', color: 'muted-foreground', align: 'CENTER', w: 'fill' }));
  return add(wrap, c);
}

// split is resolved by the screen builder, which owns block dispatch.
export const SPLIT_GAP = 24;
