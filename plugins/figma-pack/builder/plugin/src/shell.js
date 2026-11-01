// App frames around the content: sidebar app, plain page, mobile app.
import { box, text, add, fill, link } from './draw.js';
import { input, avatar, badge } from './kit.js';
import { icon, guessIcon } from './icons.js';

export const SIDEBAR = { desktop: 256, tablet: 72 };
export const PAD = { desktop: 32, tablet: 24, mobile: 16 };

async function navItem(ctx, item, active, compact) {
  const it = box(ctx, `Nav / ${item.label}`, { dir: 'H', gap: 10, pad: compact ? [10, 10] : [8, 12], radius: 'md', align: 'CENTER', fill: active ? 'sidebar-accent' : null, w: compact ? 'hug' : 'fill', justify: compact ? 'CENTER' : 'MIN' });
  add(it, icon(ctx, item.icon || guessIcon(item.label), active ? 'sidebar-accent-foreground' : 'sidebar-foreground', 16));
  if (!compact) add(it, await text(ctx, item.label, { size: 'sm', weight: active ? 'medium' : 'regular', color: active ? 'sidebar-accent-foreground' : 'sidebar-foreground', w: 'fill' }));
  if (!compact && item.badge) add(it, await badge(ctx, String(item.badge), active ? 'default' : 'secondary'));
  return link(it, `nav:${item.id}`);
}

async function logo(ctx, spec, compact) {
  const l = box(ctx, 'Logo', { dir: 'H', gap: 10, align: 'CENTER', pad: [4, compact ? 0 : 8], w: compact ? 'hug' : 'fill' });
  const mark = box(ctx, 'Mark', { dir: 'H', w: 32, h: 32, radius: 'md', fill: 'sidebar-primary', align: 'CENTER', justify: 'CENTER' });
  add(mark, await text(ctx, (spec.logo || spec.project).slice(0, 1).toUpperCase(), { size: 'sm', weight: 'bold', color: 'sidebar-primary-foreground' }));
  add(l, mark);
  if (!compact) add(l, add(box(ctx, 'Name', { gap: 0, w: 'fill' }), await text(ctx, spec.project, { size: 'sm', weight: 'semibold', color: 'sidebar-foreground', truncate: true, w: 'fill' }), spec.subtitle && (await text(ctx, spec.subtitle, { size: 'xs', color: 'muted-foreground' }))));
  return l;
}

async function sidebar(ctx, spec, screen, vp) {
  const compact = vp === 'tablet';
  const s = box(ctx, 'Sidebar', { gap: 4, pad: compact ? [16, 12] : [16, 12], fill: 'sidebar', stroke: 'sidebar-border', w: SIDEBAR[vp], h: 'fill', align: compact ? 'CENTER' : 'MIN' });
  add(s, await logo(ctx, spec, compact), box(ctx, 'Gap', { h: 16 }));
  let group = null;
  for (const item of spec.nav) {
    const changed = item.group && item.group !== group;
    group = item.group || group;
    if (changed && !compact) add(s, add(box(ctx, 'Group', { pad: [12, 12, 4, 12], w: 'fill' }), await text(ctx, item.group, { size: 'xs', weight: 'medium', color: 'muted-foreground' })));
    add(s, await navItem(ctx, item, item.id === screen.nav, compact));
  }
  add(s, box(ctx, 'Spacer', { h: 'fill' }));
  const user = box(ctx, 'User', { dir: 'H', gap: 10, pad: [8, compact ? 0 : 8], align: 'CENTER', w: compact ? 'hug' : 'fill' });
  add(user, await avatar(ctx, spec.user.name));
  if (!compact) add(user, add(box(ctx, 'Who', { gap: 0, w: 'fill' }), await text(ctx, spec.user.name, { size: 'sm', weight: 'medium', color: 'sidebar-foreground', truncate: true, w: 'fill' }), await text(ctx, spec.user.role, { size: 'xs', color: 'muted-foreground' })));
  return add(s, user);
}

async function topbar(ctx, spec, screen, vp) {
  const t = box(ctx, 'Topbar', { dir: 'H', gap: 12, pad: [12, PAD[vp]], align: 'CENTER', fill: 'background', stroke: 'border', w: 'fill', h: 60 });
  if (vp === 'mobile') add(t, icon(ctx, 'menu', 'foreground', 20), await text(ctx, screen.title, { size: 'base', weight: 'semibold', w: 'fill', truncate: true }));
  else add(t, await input(ctx, spec.searchPlaceholder || 'Поиск…', { w: 320 }), box(ctx, 'Spacer', { w: 'fill' }));
  return add(t, icon(ctx, 'bell', 'muted-foreground', 18), await avatar(ctx, spec.user.name));
}

async function mobileBar(ctx, screen) {
  const bar = box(ctx, 'App bar', { dir: 'H', gap: 12, pad: [12, 16], align: 'CENTER', fill: 'background', w: 'fill', h: 56 });
  if (screen.back) add(bar, link(icon(ctx, 'back', 'foreground', 22), 'back'));
  return add(bar, await text(ctx, screen.title, { size: 'lg', weight: 'semibold', w: 'fill', truncate: true }), icon(ctx, 'bell', 'foreground', 20));
}

async function tabbar(ctx, spec, screen) {
  const bar = box(ctx, 'Tab bar', { dir: 'H', pad: [8, 8, 24, 8], fill: 'background', stroke: 'border', w: 'fill', justify: 'SPACE_BETWEEN' });
  for (const item of spec.nav.slice(0, 5)) {
    const on = item.id === screen.nav;
    const it = link(box(ctx, `Tab / ${item.label}`, { gap: 4, align: 'CENTER', pad: [4, 6], w: 'fill' }), `nav:${item.id}`);
    add(bar, add(it, icon(ctx, item.icon || guessIcon(item.label), on ? 'primary' : 'muted-foreground', 22), await text(ctx, item.label, { size: 'xs', weight: on ? 'medium' : 'regular', color: on ? 'primary' : 'muted-foreground', align: 'CENTER' })));
  }
  return bar;
}

/**
 * Builds the outer frame and returns { frame, content, width, push }: content is the
 * column blocks go into, width its inner width, push the spacer above a mobile tab bar.
 */
export async function shell(ctx, spec, screen, vp, frameWidth) {
  const frame = box(ctx, 'Screen', { dir: screen.shell === 'sidebar' && vp !== 'mobile' ? 'H' : 'V', fill: 'background', w: frameWidth, clip: true });
  frame.primaryAxisSizingMode = screen.shell === 'sidebar' && vp !== 'mobile' ? 'FIXED' : 'AUTO';
  frame.counterAxisSizingMode = screen.shell === 'sidebar' && vp !== 'mobile' ? 'AUTO' : 'FIXED';
  const pad = PAD[vp];
  const content = box(ctx, 'Content', { gap: vp === 'mobile' ? 16 : 24, pad: screen.shell === 'mobile' ? [8, 16, 24, 16] : [pad, pad, pad * 1.5, pad], w: 'fill' });
  let width = frameWidth - pad * 2;
  let push = null;

  if (screen.shell === 'sidebar' && vp !== 'mobile') {
    const main = box(ctx, 'Main', { w: 'fill', h: 'hug' });
    add(frame, await sidebar(ctx, spec, screen, vp), main);
    add(main, await topbar(ctx, spec, screen, vp), content);
    width -= SIDEBAR[vp];
    frame.counterAxisAlignItems = 'MIN';
  } else if (screen.shell === 'sidebar') {
    add(frame, await topbar(ctx, spec, screen, vp), content);
  } else if (screen.shell === 'mobile') {
    add(frame, await mobileBar(ctx, screen), content);
    if (spec.nav.length && screen.tabbar !== false) {
      push = box(ctx, 'Push', { w: 'fill' });
      add(frame, push, await tabbar(ctx, spec, screen));
    }
  } else {
    add(frame, content);
    fill(frame, ctx, 'muted', 0.4);
  }
  return { frame, content, width, push };
}
