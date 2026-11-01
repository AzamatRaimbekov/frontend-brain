// learn: report -> drafts for people to review: knowledge entries in the frontend-pack format (written to an output
// folder, never into another plugin) and learned-patterns.md for mbank-figma-patterns/references/. Every claim has evidence.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ARCHETYPE_LABELS } from './archetypes.mjs';
import { spacingToken } from './library.mjs';

// Mirror of the frontend-pack knowledge rules (knowledge.mjs check); kept here because plugins do not import each other.
export const KNOWLEDGE_RULES = {
  areas: ['project-setup', 'architecture', 'data', 'ui', 'ux', 'forms', 'state', 'errors', 'testing', 'performance', 'a11y', 'security', 'i18n', 'tooling', 'mobile'],
  types: ['rule', 'recipe', 'decision', 'gotcha'],
  stacks: ['all', 'react', 'vite', 'next', 'expo'],
  headings: ['## Решение', '## Почему'],
  maxLines: 150,
};

export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].startsWith('[') ? kv[2].slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean) : kv[2].replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(m[0].length) };
}

export function validateDraft(text, area, slug) {
  const R = KNOWLEDGE_RULES;
  const errors = [];
  const at = `${area}/${slug}.md`;
  const parsed = parseFrontmatter(text);
  if (!parsed) return [`${at}: no frontmatter`];
  const m = parsed.meta;
  if (!R.areas.includes(area)) errors.push(`${at}: unknown area`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push(`${at}: slug must be kebab-case`);
  if (!m.title) errors.push(`${at}: title`);
  if (!R.types.includes(m.type)) errors.push(`${at}: type`);
  if (!Array.isArray(m.stack) || !m.stack.length || m.stack.some((s) => !R.stacks.includes(s))) errors.push(`${at}: stack`);
  if (!m.author) errors.push(`${at}: author`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(m.updated || '')) errors.push(`${at}: updated`);
  for (const h of R.headings) if (!parsed.body.split('\n').includes(h)) errors.push(`${at}: missing ${h}`);
  if (text.split('\n').length > R.maxLines) errors.push(`${at}: longer than ${R.maxLines} lines`);
  return errors;
}

const today = () => new Date().toISOString().slice(0, 10);
const list = (xs) => [...new Set(xs)].join(', ');
const ev = (files, frames) => `файлы: ${list(files)}; фреймов: ${frames}`;
const mode = (values) => {
  const c = {};
  for (const v of values) c[v] = (c[v] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

function entry({ area, slug, title, type, tags, author, context, decision, why, source }) {
  const text = [
    '---', `title: ${title}`, `type: ${type}`, 'stack: [react, vite, next]', `tags: [${tags.join(', ')}]`, `author: ${author}`, `updated: ${today()}`, '---', '',
    '## Контекст', '', context, '', '## Решение', '', decision, '', '## Почему', '', why, '', '## Источник', '', source, '',
  ].join('\n');
  return { area, slug, text };
}

const blockText = (b) => (b.type === 'split' ? `split ${b.ratio} (${b.columns.map((c) => c.map((x) => x.type).join(' + ')).join(' | ')})` : b.type);

/** Knowledge drafts from a report; templates = buildTemplates() result (only real-derived ones become entries). */
export function knowledgeDrafts(report, templates = {}, { author = 'figma-learn', min = 2 } = {}) {
  const out = [];
  const src = `figma-learn по ${report.totals.files} файлам Figma (${report.generatedAt.slice(0, 10)}): report.md. Черновик — проверить перед PR.`;
  for (const [a, spec] of Object.entries(templates)) {
    const d = spec.template.derivedFrom;
    if (!d || d.screens < min) continue;
    const s = spec.screens[0];
    const table = s.blocks.find((b) => b.type === 'table');
    out.push(entry({
      area: 'ui', slug: `mbank-${a}-screen-structure`, type: 'recipe', author, tags: ['figma', 'mbank', 'crm', a],
      title: `Экран «${ARCHETYPE_LABELS[a]}» в макетах Mbank: ${s.blocks.map(blockText).join(' → ')}`,
      context: `Задача: сверстать экран типа «${ARCHETYPE_LABELS[a]}» по макету Mbank или без макета. Так его рисуют дизайнеры: ${d.screens} экранов (${ev(d.files, d.frames)}), ${d.sameStructure} из них с той же структурой.`,
      decision: [
        `Блоки сверху вниз: ${s.blocks.map(blockText).join(' → ')}.`,
        table ? `Колонки таблицы: ${table.columns.join(', ')}.` : null,
        `Состояния, которые есть в макетах: ${s.states.join(', ')}.${['loading', 'empty', 'error'].some((x) => !s.states.includes(x)) ? ` Нет в макетах: ${['loading', 'empty', 'error'].filter((x) => !s.states.includes(x)).join(', ')} — делай по стандарту UX всё равно.` : ''}`,
        `Ширины: ${spec.viewports.join(', ')}.`,
        `Готовая спека-шаблон: figma-pack builder/templates/${a}.spec.json (spec@1) — из неё строятся и макет, и код.`,
      ].filter(Boolean).join('\n'),
      why: 'Экран, собранный в том же порядке блоков, что и макеты, проходит design-qa без правок раскладки и узнаётся пользователями CRM.',
      source: src,
    }));
  }
  const hex = report.hygiene.rawHex.filter((x) => x.token);
  if (hex.length) {
    out.push(entry({
      area: 'ui', slug: 'figma-raw-hex-to-mbank-token', type: 'gotcha', author, tags: ['figma', 'tokens', 'hex', 'mbank'],
      title: 'В макетах есть цвета без переменной — не копируй hex, бери токен 2.theme',
      context: `figma-learn нашёл ${report.hygiene.paints.total - report.hygiene.paints.bound} заливок и обводок без переменной (${hex.length} разных hex). Dev Mode и MCP отдают такой цвет как hex.`,
      decision: ['Ставь токен, а не hex. Самые частые:', '', '| hex | раз | токен | совпадение |', '|---|---|---|---|',
        ...hex.slice(0, 10).map((x) => `| ${x.hex} | ${x.count} | ${x.token.name} | ${x.token.exact ? 'точное' : `≈ ${x.token.distance}`} |`),
        '', 'Нет точного совпадения — спроси дизайнера и отметь в handoff.'].join('\n'),
      why: 'Hex в коде не меняется со сменой темы и бренда (1.brand), а токен меняется. Линтер arbitrary-цветов такой hex всё равно отклонит.',
      source: src,
    }));
  }
  const lists = report.files.flatMap((f) => f.groups.filter((g) => g.archetype === 'list').map((g) => ({ ...g, file: f.name })));
  const noEmpty = lists.filter((g) => !g.states.includes('empty'));
  if (lists.length && noEmpty.length) {
    out.push(entry({
      area: 'ux', slug: 'figma-lists-without-empty-state', type: 'gotcha', author, tags: ['figma', 'states', 'empty', 'list'],
      title: 'Макеты списков часто без пустого состояния и ошибки — делай их по стандарту сам',
      context: `${noEmpty.length} из ${lists.length} списков в макетах без состояния empty (${ev(noEmpty.map((g) => g.file), noEmpty.reduce((s, g) => s + g.frames, 0))}).`,
      decision: 'Нет состояния в макете — не пропускай его в коде: loading (скелетон), empty (текст + действие), error (повтор) по frontend-pack:react-ux. В handoff перечисли, что сделано без макета, чтобы дизайнер дорисовал.',
      why: 'Пустой список без подсказки выглядит как поломка; дизайнер узнаёт о пропуске только из handoff.',
      source: src,
    }));
  }
  const missing = report.gaps.filter((g) => g.kind === 'code-missing' || g.kind === 'detached');
  if (missing.length) {
    out.push(entry({
      area: 'ui', slug: 'figma-components-not-in-code-kit', type: 'gotcha', author, tags: ['figma', 'kit', 'mbank', 'detached'],
      title: 'Компоненты из макетов, которых нет в кодовом ките, и detached-копии — не изобретай свои',
      context: 'figma-learn сравнил экземпляры в макетах с картой компонентов Figma ↔ код.',
      decision: [...missing.slice(0, 10).map((g) => `- ${g.name} (${g.kind === 'detached' ? 'detached в макете' : 'нет в коде'}, ${g.count} раз; ${list(g.files)})`), '',
        'Detached-копию верстай компонентом кита. Нет компонента в ките — локальный компонент в фиче и строка в бэклог кита (design-engine components-map), не новый общий Button.'].join('\n'),
      why: 'Одноразовые копии расходятся с китом при первом обновлении токенов и ломают design-qa.',
      source: src,
    }));
  }
  return out.map((e) => ({ ...e, errors: validateDraft(e.text, e.area, e.slug) }));
}

/** learned-patterns.md: composition rules with evidence, for figma-pack mbank-figma-patterns/references/. */
export function learnedPatterns(report, templates = {}, { tokens = null } = {}) {
  const lines = [
    '# Learned patterns (figma-learn)',
    '',
    `Generated ${report.generatedAt.slice(0, 10)} from ${report.totals.files} files, ${report.totals.screens} frames. Draft: a person reviews it before it replaces \`references/learned-patterns.md\`. Each line ends with its evidence (files; frames).`,
    '',
    '## 1. Screen structure by archetype',
    '',
  ];
  const byArch = {};
  for (const s of report.screens.filter((x) => x.viewport === 'desktop' && x.state === 'default' && x.blocks.length)) {
    (byArch[s.archetype] ||= []).push(s);
  }
  for (const [a, screens] of Object.entries(byArch)) {
    for (const [sig, n] of mode(screens.map((s) => s.signature)).slice(0, 3)) {
      const hits = screens.filter((s) => s.signature === sig);
      lines.push(`- **${a}** (${ARCHETYPE_LABELS[a] || a}): \`${sig}\` — ${n} of ${screens.length} default desktop frames (${ev(hits.map((s) => s.file), hits.length)})`);
    }
  }
  lines.push('', '## 2. Blocks that go together', '');
  const pairs = {};
  const desktop = report.screens.filter((s) => s.viewport === 'desktop' && s.blocks.length);
  for (const s of desktop) {
    const types = [...new Set(s.signature.split(/[>|+()]/).map((x) => x.replace(/^split$/, '')).filter(Boolean))].sort();
    for (let i = 0; i < types.length; i++) for (let j = i + 1; j < types.length; j++) (pairs[`${types[i]} + ${types[j]}`] ||= []).push(s);
  }
  const frequent = Object.entries(pairs).filter(([, hits]) => hits.length >= 2).sort((a, b) => b[1].length - a[1].length).slice(0, 10);
  for (const [pair, hits] of frequent) lines.push(`- ${pair}: ${hits.length} frames (${ev(hits.map((s) => s.file), hits.length)})`);
  if (!frequent.length) lines.push('- No pair of blocks repeats in 2+ desktop frames yet.');
  lines.push('', '## 3. Grid and paddings', '');
  const widths = mode(report.screens.map((s) => s.width));
  lines.push(`- Frame widths: ${widths.slice(0, 5).map(([w, n]) => `${w} ×${n}`).join(', ')} (${report.totals.screens} frames)`);
  const nav = mode(report.layout.nav);
  if (nav.length) lines.push(`- Side menu width: ${nav[0][0]} in ${nav[0][1]} of ${report.layout.nav.length} frames with sideMenu`);
  for (const role of ['body', 'card', 'form']) {
    const samples = report.layout.samples.filter((s) => s.role === role);
    if (!samples.length) continue;
    const [pad, n] = mode(samples.map((s) => s.padding.join('/')))[0];
    const [gap, gn] = mode(samples.map((s) => s.gap))[0];
    const tok = (v) => spacingToken(v, tokens) || `${v} (no token)`;
    lines.push(`- ${role}: padding ${pad} (${pad.split('/').map(tok).join(' / ')}) in ${n} of ${samples.length}; gap ${tok(gap)} in ${gn} (${ev(samples.map((s) => s.file), samples.length)})`);
  }
  lines.push('', '## 4. States designers draw', '');
  for (const [a, v] of Object.entries(report.archetypes)) {
    lines.push(`- ${a}: ${Object.entries(v.states).map(([s, n]) => `${s} ${n}/${v.screens}`).join(', ')} (${ev(v.files, v.frames)})`);
  }
  lines.push('', '## 5. Naming and handoff', '');
  const conv = report.screens.filter((s) => s.conventional);
  lines.push(`- Frames named \`<Flow> / <Screen> / <State> / <width>\`: ${conv.length} of ${report.totals.screens} (${ev(conv.map((s) => s.file), conv.length)})`);
  const inSections = report.screens.filter((s) => s.section);
  lines.push(`- Frames inside a Section: ${inSections.length} of ${report.totals.screens}; Ready for dev: ${report.screens.filter((s) => s.ready).length}; [draft]: ${report.screens.filter((s) => s.draft).length} (${report.totals.screens} frames)`);
  const h = report.hygiene;
  lines.push(`- Bound colours ${h.paints.bound}/${h.paints.total}, styled texts ${h.texts.styled}/${h.texts.total}, bound spacing ${h.spacing.bound}/${h.spacing.total}, auto layout containers ${h.layout.auto}/${h.layout.containers}`);
  if (Object.keys(templates).length) lines.push('', `Templates written: ${Object.keys(templates).map((a) => `builder/templates/${a}.spec.json`).join(', ')}.`);
  return lines.join('\n') + '\n';
}

export function writeLearn(outDir, drafts, patterns) {
  const written = [];
  for (const d of drafts) {
    const file = join(outDir, 'knowledge', d.area, `${d.slug}.md`);
    mkdirSync(join(outDir, 'knowledge', d.area), { recursive: true });
    writeFileSync(file, d.text);
    written.push(file);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'learned-patterns.md'), patterns);
  written.push(join(outDir, 'learned-patterns.md'));
  return written;
}
