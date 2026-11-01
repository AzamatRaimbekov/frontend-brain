// Canvas board of the widget: brand switcher, counters, group tabs, token rows with swatches and
// status chips. Presentational only; every colour is an Mbank token (src/theme.js).
import { paint, TONES } from './theme.js';
import { STATUS } from '../core/sync.js';
import { normHex } from '../core/model.js';

const { AutoLayout, Text, Rectangle } = figma.widget;
const W = 960;
const COL = { swatch: 132, css: 250, figma: 300, status: 190 };

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
    const px = Math.max(0, Math.min(14, Number(value) || 0));
    return (
      <AutoLayout spacing={6} verticalAlignItems="center" width={COL.swatch / 2}>
        <Rectangle width={24} height={24} cornerRadius={px} fill={c.soft} stroke={c.border} />
        <Text fontSize={11} fill={c.muted}>{value == null ? '—' : `${value}px`}</Text>
      </AutoLayout>
    );
  }
  const hex = normHex(value);
  return (
    <AutoLayout spacing={6} verticalAlignItems="center" width={COL.swatch / 2} tooltip={String(value)}>
      <Rectangle width={24} height={24} cornerRadius={6} fill={hex ? paint(hex) : c.soft} stroke={c.border} />
      <Text fontSize={10} fill={c.muted}>{hex ? hex.slice(1, 7) : 'var'}</Text>
    </AutoLayout>
  );
}

function Row({ c, row, status, issue, onOpen }) {
  const st = STATUS[status] || STATUS.unknown;
  return (
    <AutoLayout width="fill-parent" spacing={12} padding={{ vertical: 6, horizontal: 12 }} verticalAlignItems="center"
      hoverStyle={{ fill: c.soft }} onClick={() => onOpen(row.key)} tooltip={row.note || 'Открыть редактор токена'}>
      <Swatch c={c} row={row} mode="light" />
      <Swatch c={c} row={row} mode="dark" />
      <Text fontSize={12} fontWeight={600} fill={c.text} width={COL.css}>{`--${row.css}`}</Text>
      <Text fontSize={11} fill={c.muted} width={COL.figma}>{`${row.collection} / ${row.figma}`}</Text>
      <AutoLayout spacing={4} width={COL.status}>
        <Chip c={c} tone={st.tone} label={st.label} />
        {row.edited ? <Chip c={c} tone="brand" label={row.extra ? 'новый' : 'изменён'} tooltip="Отличается от tokens.json" /> : null}
        {issue ? <Chip c={c} tone="error" label="AA" tooltip={issue} /> : null}
      </AutoLayout>
    </AutoLayout>
  );
}

function Header({ c, brand, brands, onBrand, source }) {
  return (
    <AutoLayout width="fill-parent" verticalAlignItems="center" spacing={16}>
      <AutoLayout direction="vertical" spacing={2} width="fill-parent">
        <Text fontSize={22} fontWeight={700} fill={c.text}>Mbank Tokens</Text>
        <Text fontSize={11} fill={c.muted}>{source}</Text>
      </AutoLayout>
      <AutoLayout spacing={4} padding={4} fill={c.soft} cornerRadius={12}>
        {brands.map((b) => (
          <AutoLayout key={b} padding={{ vertical: 6, horizontal: 12 }} cornerRadius={9} fill={b === brand ? c.brand : c.soft} onClick={() => onBrand(b)}>
            <Text fontSize={12} fontWeight={600} fill={b === brand ? c.onBrand : c.text}>{b}</Text>
          </AutoLayout>
        ))}
      </AutoLayout>
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

/** props: { c, brand, brands, groups, group, rows, status, issues, counters, totals, scan, report, handlers } */
export function Board(p) {
  const { c } = p;
  const counts = {};
  for (const r of p.rows) counts[r.group] = (counts[r.group] || 0) + 1;
  const visible = p.rows.filter((r) => r.group === p.group);
  const issueOf = {};
  for (const i of p.issues) if (!i.ok) issueOf[i.fg] = `${issueOf[i.fg] ? `${issueOf[i.fg]}; ` : ''}${i.mode}: ${i.ratio} на --${i.bg} (нужно ${i.min})`;
  const t = p.totals;
  const fileLine = p.scan
    ? `Файл проверен ${p.scan.scannedAt.slice(0, 16).replace('T', ' ')}: ✓ ${t.bound} · ≠ ${t.differs} · нет ${t.missing}${t.library ? ` · в библиотеке ${t.library}` : ''}`
    : 'Файл ещё не проверяли: свойства виджета → «Проверить файл»';
  return (
    <AutoLayout direction="vertical" width={W} padding={24} spacing={16} fill={p.c.page} cornerRadius={20} stroke={c.border}>
      <Header c={c} brand={p.brand} brands={p.brands} onBrand={p.handlers.brand} source={p.source} />
      <AutoLayout width="fill-parent" spacing={8}>
        <Counter c={c} label="токенов" value={p.counters.tokens} tone="neutral" />
        <Counter c={c} label="токенов проекта" value={p.counters.extras} tone="info" />
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
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.css}>CSS-токен</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.figma}>Переменная Figma</Text>
          <Text fontSize={11} fontWeight={600} fill={c.muted} width={COL.status}>Статус</Text>
        </AutoLayout>
        {visible.length ? visible.map((r) => (
          <Row key={r.key} c={c} row={r} status={p.status[r.key]} issue={issueOf[r.css]} onOpen={p.handlers.open} />
        )) : <Text fontSize={12} fill={c.muted} width="fill-parent" horizontalAlignText="center">Пусто. Токен проекта добавляется в «Редактировать» → «Новый токен».</Text>}
      </AutoLayout>
      <Text fontSize={11} fill={c.muted} width="fill-parent">Свойства виджета: Редактировать · Проверить файл · Применить в Figma · Синхронизация с кодом. Клик по строке открывает токен.</Text>
    </AutoLayout>
  );
}
