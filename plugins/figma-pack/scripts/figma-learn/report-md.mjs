// report.json -> report.md: overall picture first, then one block per file for designers.
import { ARCHETYPE_LABELS } from './archetypes.mjs';

const p = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const share = (a, b) => (b ? `${a}/${b} (${Math.round((a / b) * 100)}%)` : '—');
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)];
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');

export function renderReport(r) {
  const t = r.totals;
  const h = r.hygiene;
  const out = [
    '# Figma: что у нас в макетах (figma-learn)',
    '',
    `Сгенерировано ${r.generatedAt.slice(0, 10)}. Файлов ${t.files}, страниц ${t.pages}, экранов-фреймов ${t.screens} (уникальных экранов ${t.screenGroups}). Готовность к разработке в среднем: **${t.score ?? '—'}/100**.`,
    `Источники: catalog.json ${r.sources.catalog ? 'да' : 'нет'}, карта компонентов design-engine ${r.sources.componentsMap ? 'да' : 'нет (статусы кода из catalog.json)'}, tokens.json ${r.sources.tokens ? 'да' : 'нет'}.`,
    '',
    '## Типы экранов',
    '',
    ...table(['Тип', 'Экранов', 'Фреймов', 'Состояния (экранов с ним)', 'Файлы'],
      Object.entries(r.archetypes).sort((a, b) => b[1].screens - a[1].screens).map(([k, v]) => [
        `${k} — ${ARCHETYPE_LABELS[k] || k}`, v.screens, v.frames,
        Object.entries(v.states).map(([s, n]) => `${s} ${n}`).join(', '), esc(v.files.join(', ')),
      ])),
    '',
    `Ширины: ${Object.entries(t.viewports).map(([v, n]) => `${v} ${n}`).join(', ') || '—'}.`,
    '',
    '## Компоненты кита в макетах',
    '',
    `По статусу кода (экземпляры): ${Object.entries(r.usage.byStatus).map(([s, n]) => `${s} ${n}`).join(', ') || '—'}.`,
    '',
    ...table(['Компонент', 'Статус кода', 'Экземпляров', 'Файлы'],
      r.usage.components.slice(0, 25).map((u) => [esc(u.name), u.status, u.count, esc(u.files.join(', '))])),
    '',
    '## Гигиена токенов',
    '',
    `- Цвета (заливки и обводки) на переменных или стилях: ${share(h.paints.bound, h.paints.total)}.`,
    `- Текст со стилем: ${share(h.texts.styled, h.texts.total)}.`,
    `- Отступы auto layout на переменных: ${share(h.spacing.bound, h.spacing.total)}; радиусы: ${share(h.radius.bound, h.radius.total)}.`,
    `- Auto layout у контейнеров: ${share(h.layout.auto, h.layout.containers)}; слоёв с именем по умолчанию: ${share(h.naming.defaults, h.naming.total)}.`,
    '',
  ];
  if (h.rawHex.length) {
    out.push('Сырые hex (чаще всего) и ближайший токен 2.theme:', '');
    out.push(...table(['hex', 'Раз', 'Токен', 'Совпадение'], h.rawHex.slice(0, 12).map((x) => [x.hex, x.count, x.token?.name || '—', x.token ? (x.token.exact ? 'точное' : x.token.far ? `далеко, ≈ ${x.token.distance}: цвет вне палитры` : `≈ ${x.token.distance}`) : '—'])), '');
  }
  out.push('## Бэклог кита (топ)', '');
  if (r.gaps.length) out.push(...table(['Что', 'Вид', 'Раз', 'Файлы', 'Действие'], r.gaps.slice(0, 15).map((g) => [esc(g.name), g.kind, g.count, esc(g.files.join(', ')), g.action])), '');
  else out.push('Пробелов не найдено.', '');
  out.push('## По файлам', '');
  for (const f of r.files) {
    const x = f.hygiene;
    out.push(`### ${f.name} — ${f.score.total}/100 (${f.score.grade})`, '');
    out.push(`[${f.url}](${f.url}) · проект ${f.project || '—'} · изменён ${String(f.lastModified || '').slice(0, 10)}${f.truncated ? ' · **часть экранов не скачана (--max-frames)**' : ''}`, '');
    out.push(`Оценка: auto layout ${p(f.score.parts.autoLayout)}, имена ${p(f.score.parts.naming)}, переменные ${p(f.score.parts.variables)}, экземпляры против detached ${p(f.score.parts.instances)}, Ready for dev ${p(f.score.parts.readyForDev)}, без [draft] ${p(f.score.parts.noDrafts)}.`, '');
    out.push(`Страницы: ${f.pages.map((pg) => `${pg.name} (секций ${pg.sections}, экранов ${pg.screens})`).join('; ')}.`, '');
    out.push(...table(['Экран', 'Тип', 'Состояния', 'Ширины', 'Фреймов'], f.groups.map((g) => [esc(g.id), g.archetype, g.states.join(', '), g.viewports.join(', '), g.frames])), '');
    const fix = [];
    if (x.rawPaints) fix.push(`${x.rawPaints} из ${x.paints} цветов без переменной (${x.rawHex} разных hex)`);
    if (x.unstyledTexts) fix.push(`${x.unstyledTexts} из ${x.texts} текстов без стиля${x.textExamples.length ? ` (например «${x.textExamples.slice(0, 2).join('», «')}»)` : ''}`);
    if (x.rawSpacing) fix.push(`${x.rawSpacing} отступов без переменной`);
    if (x.defaultNames) fix.push(`${x.defaultNames} слоёв с именем по умолчанию (${x.nameExamples.slice(0, 3).join(', ')})`);
    if (x.manualContainers) fix.push(`${x.manualContainers} контейнеров без auto layout (или Group)`);
    const det = Object.entries(x.detached);
    if (det.length) fix.push(`detached: ${det.map(([n, c]) => `${n} ×${c}`).join(', ')}`);
    const drafts = f.screens.filter((s) => s.draft).length;
    if (drafts) fix.push(`${drafts} фреймов с [draft]`);
    if (!f.screens.some((s) => s.ready)) fix.push('нет секций Ready for dev');
    const noStates = f.groups.filter((g) => g.archetype === 'list' && !g.states.includes('empty'));
    if (noStates.length) fix.push(`списки без пустого состояния: ${noStates.map((g) => g.id).join(', ')}`);
    out.push(fix.length ? 'Дизайнеру поправить:' : 'Замечаний нет.', '', ...fix.map((s) => `- ${s}`), '');
  }
  return out.join('\n');
}
