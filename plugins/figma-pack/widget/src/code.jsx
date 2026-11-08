// Mbank Tokens: Figma widget (Widget API). The board lives on the canvas and its state is synced
// to every collaborator of the file; editing happens in the iframe (property menu → Редактировать).
import { Board } from './board.jsx';
import { chrome } from './theme.js';
import { openUI } from './ui-bridge.js';
import { reportLine } from './figma-io.js';
import { TOKENS, readState, scan } from './actions.js';
import { buildModel, counters, BRANDS, GROUPS } from '../core/model.js';
import { contrastIssues } from '../core/checks.js';
import { fileStatus } from '../core/sync.js';

const { widget } = figma;
const { useSyncedState, useSyncedMap, usePropertyMenu, useWidgetNodeId } = widget;

const BRAND_LABEL = { bank: 'Bank', kassa: 'Kassa', travel: 'Travel', artwin: 'Artwin', koko: 'Koko' };

function MbankTokens() {
  const [brand, setBrand] = useSyncedState('brand', 'bank');
  const [group, setGroup] = useSyncedState('group', 'brand');
  const [scanned, setScan] = useSyncedState('scan', null);
  const [report, setReport] = useSyncedState('report', null);
  const [prefix, setPrefix] = useSyncedState('prefix', 'mb');
  const [propagated, setPropagation] = useSyncedState('propagation', null);
  const widgetId = useWidgetNodeId();
  const edits = useSyncedMap('edits');
  const extras = useSyncedMap('extras');
  const bindings = useSyncedMap('bindings');
  const store = { brand, setBrand, scan: scanned, setScan, setReport, propagation: propagated, setPropagation, prefix, setPrefix, widgetId, edits, extras, bindings };

  const model = buildModel(TOKENS, readState(store));
  const issues = contrastIssues(model.rows);
  const status = fileStatus(model.rows, scanned);

  usePropertyMenu(
    [
      { itemType: 'dropdown', propertyName: 'brand', tooltip: 'Бренд', selectedOption: brand, options: BRANDS.map((b) => ({ option: b, label: BRAND_LABEL[b] })) },
      { itemType: 'separator' },
      { itemType: 'action', propertyName: 'edit', tooltip: 'Редактировать' },
      { itemType: 'action', propertyName: 'scan', tooltip: 'Проверить файл' },
      { itemType: 'action', propertyName: 'apply', tooltip: 'Применить в Figma' },
      { itemType: 'action', propertyName: 'components', tooltip: 'Компоненты' },
      { itemType: 'action', propertyName: 'sync', tooltip: 'Синхронизация с кодом' },
      { itemType: 'action', propertyName: 'site', tooltip: 'Сайт дизайн-системы' },
    ],
    async ({ propertyName, propertyValue }) => {
      if (propertyName === 'brand') setBrand(propertyValue);
      else if (propertyName === 'edit') await openUI(store, 'tokens');
      else if (propertyName === 'sync') await openUI(store, 'code');
      else if (propertyName === 'site') await openUI(store, 'site');
      else if (propertyName === 'components') await openUI(store, 'bind');
      else if (propertyName === 'scan') {
        const snap = await scan(store);
        figma.notify(`Проверено: ${snap.count} переменных 2.theme / 1.brand в файле`);
      } else if (propertyName === 'apply') {
        // Preview first: the designer confirms in the window what will be created and changed.
        await openUI(store, 'figma');
      }
    },
  );

  const handlers = {
    brand: (b) => setBrand(b),
    group: (g) => setGroup(g),
    open: (key) => openUI(store, 'tokens', key),
  };
  const source = `Источник: tokens.json (${String(TOKENS.source || '').slice(0, 90)})`;
  return (
    <Board c={chrome(TOKENS, brand)} brand={brand} brands={BRANDS} groups={GROUPS} group={group} rows={model.rows}
      status={status.byKey} totals={status.totals} issues={issues} counters={counters(model, issues)}
      scan={scanned} report={reportLine(report)} propagation={propagated} source={source} handlers={handlers} />
  );
}

widget.register(MbankTokens);
