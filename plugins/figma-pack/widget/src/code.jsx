// shadcn Tokens: Figma widget (Widget API). The board of the shadcn/ui tokens lives on the canvas and its
// state is synced to every collaborator of the file; editing happens in the iframe (property menu → Редактировать).
import { Board } from './board.jsx';
import { chrome } from './theme.js';
import { openUI } from './ui-bridge.js';
import { reportLine } from './figma-io.js';
import { TOKENS, readState, scan } from './actions.js';
import { buildModel, counters, GROUPS } from '../core/model.js';
import { contrastIssues } from '../core/checks.js';
import { fileStatus } from '../core/sync.js';

const { widget } = figma;
const { useSyncedState, useSyncedMap, usePropertyMenu } = widget;

function ShadcnTokens() {
  const [group, setGroup] = useSyncedState('group', 'base');
  const [scanned, setScan] = useSyncedState('scan', null);
  const [report, setReport] = useSyncedState('report', null);
  const edits = useSyncedMap('edits');
  const store = { scan: scanned, setScan, setReport, edits };

  const model = buildModel(TOKENS, readState(store));
  const issues = contrastIssues(model.rows);
  const status = fileStatus(model.rows, scanned);

  usePropertyMenu(
    [
      { itemType: 'action', propertyName: 'edit', tooltip: 'Редактировать' },
      { itemType: 'action', propertyName: 'scan', tooltip: 'Проверить файл' },
      { itemType: 'action', propertyName: 'apply', tooltip: 'Применить в Figma' },
      { itemType: 'action', propertyName: 'sync', tooltip: 'Выгрузить для кода' },
      { itemType: 'action', propertyName: 'site', tooltip: 'Сайт дизайн-системы' },
    ],
    async ({ propertyName }) => {
      if (propertyName === 'edit') await openUI(store, 'tokens');
      else if (propertyName === 'sync') await openUI(store, 'code');
      else if (propertyName === 'site') await openUI(store, 'site');
      else if (propertyName === 'scan') {
        const snap = await scan(store);
        figma.notify(snap.exists ? `Проверено: ${snap.count} переменных коллекции shadcn` : 'В файле нет коллекции shadcn: «Применить в Figma» создаст её');
      } else if (propertyName === 'apply') {
        // Preview first: the designer confirms in the window what will be created and changed.
        await openUI(store, 'figma');
      }
    },
  );

  const handlers = {
    group: (g) => setGroup(g),
    open: (key) => openUI(store, 'tokens', key),
  };
  return (
    <Board c={chrome(TOKENS)} groups={GROUPS} group={group} rows={model.rows}
      status={status.byKey} totals={status.totals} issues={issues} counters={counters(model, issues)}
      scan={scanned} report={reportLine(report)} source="Источник: shadcn/ui (Tailwind v4, oklch) — skills/ds-tokens/references/shadcn-tokens.json" handlers={handlers} />
  );
}

widget.register(ShadcnTokens);
