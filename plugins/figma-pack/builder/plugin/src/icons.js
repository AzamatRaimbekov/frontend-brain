// Small stroke icons (24px grid, lucide-like) whose color binds to a token.
import { paint } from './draw.js';

const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M18 15a5 5 0 0 1 4 5v1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 16v-4"/><path d="M13 16V8"/><path d="M18 16v-7"/>',
  settings: '<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h2"/><path d="M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="18" r="2"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  wallet: '<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M17 14h.01"/>',
  transfer: '<path d="M4 8h16l-4-4"/><path d="M20 16H4l4 4"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  minus: '<path d="M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
};

export const ICONS = Object.keys(P);

// Guesses an icon from a nav label when the spec gives none.
export function guessIcon(label = '') {
  const s = label.toLowerCase();
  const rules = [
    [/главн|обзор|дашборд|home|dashboard/, 'home'], [/заявк|входящ|inbox|очеред/, 'inbox'],
    [/клиент|пользоват|сотрудн|users|роли/, 'users'], [/отчёт|отчет|аналит|report|stat/, 'chart'],
    [/настро|settings/, 'settings'], [/документ|договор|file/, 'file'], [/карт|card/, 'card'],
    [/уведом|bell/, 'bell'], [/перевод|transfer/, 'transfer'], [/платеж|платёж|кошел|wallet/, 'wallet'],
    [/истор|history/, 'history'], [/безопас|провер|aml|risk|риск/, 'shield'], [/календ|calendar/, 'calendar'],
    [/продукт|каталог/, 'layers'], [/ещё|еще|more/, 'more'],
  ];
  const hit = rules.find(([re]) => re.test(s));
  return hit ? hit[1] : 'folder';
}

export function icon(ctx, name, color = 'muted-foreground', px = 16) {
  const body = P[name] || P.folder;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const node = figma.createNodeFromSvg(svg);
  node.name = `Icon / ${name}`;
  node.fills = [];
  const tint = (n) => {
    if ('strokes' in n && n.strokes.length) n.strokes = [paint(ctx, color)];
    if ('fills' in n && n.type !== 'FRAME') n.fills = [];
    if ('children' in n) n.children.forEach(tint);
  };
  tint(node);
  node.rescale(px / 24);
  return node;
}
