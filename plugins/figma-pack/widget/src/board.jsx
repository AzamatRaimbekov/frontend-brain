// Canvas board of the widget: counters, group tabs, token rows with swatches and status chips.
// Presentational only; every colour of the chrome is a shadcn token (src/theme.js).
import { paint, TONES } from './theme.js';
import { STATUS } from '../core/sync.js';
import { toPx } from '../core/model.js';

const { AutoLayout, Text, Rectangle } = figma.widget;
const W = 960;
const COL = { swatch: 220, css: 230, figma: 230, status: 190 };

function Chip({ c, tone, label, onClick, tooltip }) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return (
    <AutoLayout fill={c[bg]} cornerRadius={10} padding={{ vertical: 3, horizontal: 8 }} onClick={onClick} tooltip={tooltip}>
      <Text fontSize={11} fontWeight={600} fill={c[fg]}>{label}</Text>
    </AutoLayout>
  );
}

function Counter({ c, label, value, tone }) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return (
    <AutoLayout direction="vertical" spacing={2} padding={{ vertical: 8, horizontal: 12 }} fill={c[bg]} cornerRadius={10} width="fill-parent">
      <Text fontSize={20} fontWeight={700} fill={c[fg]}>{String(value)}</Text>
      <Text fontSize={11} fill={c[fg]}>{label}</Text>
    </AutoLayout>
  );
}

function Swatch({ c, row, mode }) {
  const value = row[mode];
  if (row.kind !== 'color') {
    const px = toPx(value);
    return (
      <AutoLayout spacing={6} verticalAlignItems="center" width={COL.swatch / 2}>
        <Rectangle width={24} height={24} cornerRadius={Math.max(0, Math.min(12, px || 0))} fill={c.soft} stroke={c.border} />
        <Text fontSize={11} fill={c.muted}>{value == null ? '—' : String(value)}</Text>
      </AutoLayout>
    );
  }
  const short = String(value == null ? '—' : value).replace(/^oklch\((.*)\)$/, '$1');
  return (
    <AutoLayout spacing={6} verticalAlignItems="center" width={COL.swatch / 2} tooltip={String(value)}>
      <Rectangle width={24} height={24} cornerRadius={6} fill={paint(value)} stroke={c.border} />
      <Text fontSize={9} fill={c.muted} width={COL.swatch / 2 - 30}>{short}</Text>
    </AutoLayout>
  );
}

function Row({ c, row, status, issue, onOpen }) {
  const st = STATUS[status] || STATUS.unknown;
  return (
    <AutoLayout width="fill-parent" spacing={12} padding={{ vertical: 6, horizontal: 12 }} verticalAlignItems="center"
      hoverStyle={{ fill: c.soft }} onClick={() => onOpen(row.key)} tooltip="Открыть редактор токена">
      <Swatch c={c} row={row} mode="light" />
      <Swatch c={c} row={row} mode="dark" />
      <Text fontSize={12} fontWeight={600} fill={c.text} width={COL.css}>{`--${row.name}`}</Text>
      <Text fontSize={11} fill={c.muted} width={COL.figma}>{`shadcn / ${row.name}`}</Text>
      <AutoLayout spacing={4} width={COL.status}>
        <Chip c={c} tone={st.tone} label={st.label} />
        {row.edited ? <Chip c={c} tone="brand" label="изменён" tooltip="Отличается от значения shadcn по умолчанию" /> : null}
        {issue ? <Chip c={c} tone="error" label="AA" tooltip={issue} /> : null}
      </AutoLayout>
    </AutoLayout>
  );
}

function Header({ c, source }) {
  return (
    <AutoLayout direction="vertical" spacing={2} width="fill-parent">
      <Text fontSize={22} fontWeight={700} fill={c.text}>shadcn Tokens</Text>
      <Text fontSize={11} fill={c.muted}>{source}</Text>
    </AutoLayout>
  );
}

function Tabs({ c, groups, group, counts, onGroup }) {
  return (
    <AutoLayout width="fill-parent" spacing={6} wrap>
      {groups.map((g) => (
        <AutoLayout key={g.id} padding={{ vertical: 5, horizontal: 10 }} cornerRadius={8} stroke={c.border}
          fill={g.id === group ? c.accentSoft : c.card} onClick={() => onGroup(g.id)}>
          <Text fontSize={12} fill={g.id === group ? c.accentText : c.text}>{`${g.label} · ${counts[g.id] || 0}`}</Text>
        </AutoLayout>
      ))}
    </AutoLayout>
  );
}

/** props: { c, groups, group, rows, status, issues, counters, totals, scan, report, source, handlers } */
export function Board(p) {
  const { c } = p;
  const counts = {};
  for (const r of p.rows) counts[r.group] = (counts[r.group] || 0) + 1;
  const visible = p.rows.filter((r) => r.group === p.group);
  const issueOf = {};
  for (const i of p.issues) if (!i.ok) issueOf[i.fg] = `${issueOf[i.fg] ? `${issueOf[i.fg]}; ` : ''}${i.mode}: ${i.ratio} на --${i.bg} (нужно ${i.min})`;
  const t = p.totals;
  const fileLine = p.scan
    ? `Файл проверен ${p.scan.scannedAt.slice(0, 16).replace('T', ' ')}${p.scan.exists ? '' : ' (коллекции shadcn нет)'}: ✓ ${t.bound} · ≠ ${t.differs} · нет ${t.missing}${t.library ? ` · в библиотеке ${t.library}` : ''}`
    : 'Файл ещё не проверяли: свойства виджета → «Проверить файл»';
  return (
    <AutoLayout direction="vertical" width={W} padding={24} spacing={16} fill={p.c.page} cornerRadius={20} stroke={c.border}>
      <Header c={c} source={p.source} />
      <AutoLayout width="fill-parent" spacing={8}>
        <Counter c={c} label="токенов" value={p.counters.tokens} tone="neutral" />
        <Counter c={c} label="изменено" value={p.counters.edited} tone="brand" />
        <Counter c={c} label="проблем контраста AA" value={p.counters.contrast} tone={p.counters.contrast ? 'error' : 'success'} />
      </AutoLayout>
      <Text fontSize={12} fill={c.muted} width="fill-parent">{fileLine}</Text>
      {p.report ? <Text fontSize={12} fill={c.text} width="fill-parent">{p.report}</Text> : null}
      <Tabs c={c} groups={p.groups} group={p.group} counts={counts} onGroup={p.handlers.group} />
      <AutoLayout direction="vertical" width="fill-parent" fill={c.card} cornerRadius={12} stroke={c.border} padding={{ vertical: 6 }}>
        <AutoLayout width="fill-parent" spacing={12} padding={{ vertical: 6, horizontal: 12 }}>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.swatch / 2}>light</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.swatch / 2}>dark</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.css}>CSS-переменная</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.figma}>Переменная Figma</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.status}>Статус</Text>
        </AutoLayout>
        {visible.length ? visible.map((r) => (
          <Row key={r.key} c={c} row={r} status={p.status[r.key]} issue={issueOf[r.name]} onOpen={p.handlers.open} />
        )) : <Text fontSize={12} fill={c.muted} width="fill-parent" horizontalAlignText="center">Пусто.</Text>}
      </AutoLayout>
      <Text fontSize={11} fill={c.muted} width="fill-parent">Свойства виджета: Редактировать · Проверить файл · Применить в Figma · Выгрузить для кода · Сайт. Клик по строке открывает токен. Набор имён shadcn фиксирован: меняются только значения.</Text>
    </AutoLayout>
  );
}
