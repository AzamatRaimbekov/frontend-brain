// Figma REST node-tree helpers shared by crawl and analyze: screens, frame names, instance resolution, walking.

export const VIEWPORT_BREAKS = { mobile: 600, tablet: 1024 }; // < 600 mobile, < 1024 tablet, else desktop
export const MIN_SCREEN = { width: 320, height: 400 };

export const viewportOf = (width) => (width < VIEWPORT_BREAKS.mobile ? 'mobile' : width < VIEWPORT_BREAKS.tablet ? 'tablet' : 'desktop');

const box = (n) => n.absoluteBoundingBox || n.absoluteRenderBounds || { x: 0, y: 0, width: 0, height: 0 };
export const sizeOf = (n) => ({ width: Math.round(box(n).width || 0), height: Math.round(box(n).height || 0) });
export const posOf = (n) => ({ x: box(n).x || 0, y: box(n).y || 0 });

// Pages that hold no product screens (figma-structure page order).
export const SERVICE_PAGE = /^(\W+\s*)?(cover|обложка|-{3}.*|—{3}.*|archive|архив|_?components|компоненты|proposals|playground|черновик)$/i;

const isScreenSize = (n) => {
  const { width, height } = sizeOf(n);
  return width >= MIN_SCREEN.width && height >= MIN_SCREEN.height;
};

/**
 * Screen frames of a document (depth >= 3 is enough): top-level FRAMEs of a page and FRAMEs inside Sections
 * (nested Sections followed). Returns [{ id, name, page, section, ready, width, height, viewport }].
 */
export function screenFrames(document) {
  const out = [];
  const visit = (node, page, section, ready) => {
    for (const n of node.children || []) {
      if (n.visible === false) continue;
      if (n.type === 'SECTION') {
        visit(n, page, n.name, ready || n.devStatus?.type === 'READY_FOR_DEV');
      } else if (n.type === 'FRAME' && isScreenSize(n)) {
        const { width, height } = sizeOf(n);
        out.push({
          id: n.id, name: n.name, page: page.name, section, width, height, viewport: viewportOf(width),
          ready: Boolean(ready || n.devStatus?.type === 'READY_FOR_DEV'),
        });
      }
    }
  };
  for (const page of document?.children || []) if (page.type === 'CANVAS' && !SERVICE_PAGE.test(page.name.trim())) visit(page, page, null, false);
  return out;
}

const STATE_WORDS = [
  ['no-access', /no[- ]?access|нет доступа|доступ запрещ|403/i],
  ['loading', /loading|загрузк|skeleton|скелетон/i],
  ['empty', /\bempty\b|пуст|нет данных|ничего не найден/i],
  ['error', /\berror\b|ошибк|404|500|fail/i],
  ['default', /default|по умолчанию|основн|filled|заполн/i],
];

export function stateOf(text) {
  for (const [state, re] of STATE_WORDS) if (re.test(text)) return state;
  return null;
}

/**
 * "[draft] Кредиты / Список заявок / Empty / 1440" -> { draft, flow, screen, state, width, conventional }.
 * Names that do not follow the convention still get a screen name (the whole name) and a guessed state.
 */
export function parseFrameName(name) {
  const draft = /^\s*\[draft\]/i.test(name);
  const clean = name.replace(/^\s*\[draft\]\s*/i, '').trim();
  const parts = clean.split(/\s+\/\s+/).map((s) => s.trim()).filter(Boolean);
  const width = /^\d{3,4}$/.test(parts.at(-1) || '') ? Number(parts.pop()) : null;
  let state = parts.length >= 3 ? stateOf(parts.at(-1)) : null;
  if (state) parts.pop();
  else state = stateOf(clean) || 'default';
  const conventional = parts.length >= 2 && width != null;
  const screen = parts.length >= 2 ? parts.slice(1).join(' / ') : parts[0] || clean;
  return { draft, flow: parts.length >= 2 ? parts[0] : null, screen, state, width, conventional };
}

/** Merges the components / componentSets / styles maps of a file and of every /nodes entry. */
export function libraryMaps(file, nodes) {
  const components = { ...(file?.components || {}) };
  const componentSets = { ...(file?.componentSets || {}) };
  const styles = { ...(file?.styles || {}) };
  for (const entry of Object.values(nodes?.nodes || {})) {
    if (!entry) continue;
    Object.assign(components, entry.components || {});
    Object.assign(componentSets, entry.componentSets || {});
    Object.assign(styles, entry.styles || {});
  }
  return { components, componentSets, styles };
}

/** INSTANCE -> { key, name, remote, local } using the set (variant parent) when there is one. */
export function resolveInstance(node, maps) {
  const comp = maps.components[node.componentId];
  if (!comp) return { key: null, name: node.name, remote: false, local: false, unknown: true };
  const set = comp.componentSetId ? maps.componentSets[comp.componentSetId] : null;
  return {
    key: set?.key || comp.key || null,
    name: set?.name || comp.name || node.name,
    variant: set ? comp.name : null,
    remote: Boolean(comp.remote),
    local: !comp.remote,
  };
}

/** Depth-first walk; visit(node, ctx) may return false to skip children. ctx: { depth, inInstance, parent }. */
export function walk(node, visit, ctx = { depth: 0, inInstance: false, parent: null }) {
  if (visit(node, ctx) === false) return;
  for (const child of node.children || []) {
    walk(child, visit, { depth: ctx.depth + 1, inInstance: ctx.inInstance || node.type === 'INSTANCE', parent: node });
  }
}

/** All visible texts under a node, in reading order (top to bottom, left to right). */
export function textsOf(node, limit = 200) {
  const out = [];
  walk(node, (n) => {
    if (n.visible === false) return false;
    if (n.type === 'TEXT' && n.characters?.trim()) out.push({ text: n.characters.trim(), name: n.name, ...posOf(n), size: n.style?.fontSize || 0 });
    return out.length < limit;
  });
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

export const DEFAULT_NAME = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Text|Polygon|Star|Section|Component|Instance|Image|Union|Subtract)( \d+)?$/;

/** Figma 0..1 colour -> #rrggbb */
export function hexOf(color) {
  const h = (v) => Math.round((v ?? 0) * 255).toString(16).padStart(2, '0');
  return `#${h(color?.r)}${h(color?.g)}${h(color?.b)}`;
}
