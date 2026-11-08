# CRM UI KIT: блоки, которые команда рисует локально

Для дизайнера с правом редактирования CRM UI KIT. Сделано 2026-11-01 по файлу «[draft] Mbank CRM — тест ИИ» (`vVuM5uw3TsWo1xm3vJelXG`, страница Components, секция CRM).

## Что и почему

В тестовом файле пять локальных компонентов, которых нет в CRM UI KIT, и их копии расходятся по макетам:

| Компонент | Экземпляров | Где в макетах | Код (`@mdigital/mbank-ui/crm`) | Контракт |
|---|---:|---|---|---|
| CRM / Key-value row | 26 | карточка заявки, карточка перевода | `KeyValueRow` | `crm-key-value-row` |
| CRM / Application card | 15 | доска «Конвейер заявок», 5 колонок | `ApplicationCard` | `crm-application-card` |
| CRM / Transfer row | 10 | таблица «Все переводы» | `TransferRow` | `crm-transfer-row` |
| CRM / KPI card | 8 | дашборд | `KpiCard` | `crm-kpi-card` |
| CRM / Timeline item | 8 | блок «История» | `TimelineItem` | `crm-timeline-item` |
| CRM / List item | — | списки клиентов и задач (нарисован из токенов, в тестовом файле его нет) | `ListItem` | `crm-list-item` |

Контракт — JSON в `figma-pack/builder/contracts/crm-*.json`: части, вложенность, размеры и **какая переменная стоит на каждом свойстве** — ровно как в ваших локальных компонентах (переменные 2.theme, `spacing/*`, `radius/*` из Foundation, Badge-status из Web components). По этому же контракту проверяется код, так что Figma и фронт не разойдутся.

## Как собрать (одна кнопка на компонент)

1. Откройте **CRM UI KIT** (нужно право редактирования). Библиотеки Foundation и Web components должны быть подключены (Assets → Libraries) — они уже подключены, если в файле есть их переменные.
2. Plugins → Development → **DS Builder** (если плагина нет: Import plugin from manifest… → `plugins/figma-pack/builder/plugin/manifest.json`).
3. Вкладка **«Компоненты»** → в списке выберите `crm-key-value-row` → состояния оставьте как есть (`default`) → **«Собрать в Figma»**.
4. Повторите для `crm-application-card`, `crm-transfer-row`, `crm-kpi-card`, `crm-timeline-item`, `crm-list-item` (в нём экземпляр Avatars 40 px из Web components).
5. Плагин кладёт компоненты на страницу **«☰ CRM blocks»** (создаст её). Под кнопкой — отчёт: «привязок N», «Без переменной» должно отсутствовать. Если написано «Не найден компонент библиотеки: Badge-status» — подключите Web components и соберите ещё раз.
6. Проверьте глазами рядом с локальными копиями из тестового файла, при желании переложите страницу в нужное место кита.
7. **Publish library** (Assets → Publish), в описании: «CRM blocks: Key-value row, Application card, Transfer row, KPI card, Timeline item, List item».

Повторная сборка обновляет компонент на месте (тот же узел, экземпляры в макетах не отваливаются, ваш текст сохраняется).

## Что получится

| Компонент | Структура | Привязки |
|---|---|---|
| Key-value row | строка 480, Label 180 + Value (Fill) | gap `spacing/m-2-base`, py `spacing/s-3`, px `spacing/none`; Label `text/muted` 14/20, Value `text/default` 14/20 Medium |
| Application card | колонка 200: Top (ID ↔ Time), Name, Amount, Meta, Footer с Badge-status S Info | p `spacing/s-1`, gap `spacing/xs`, радиус `radius/m`, фон `background/onsurface/0`; Name 14 Medium, Amount 16 Bold, ID/Time/Meta 12 `text/muted`; Footer pt `spacing/xs` |
| Transfer row | 8 ячеек 124/156/160/170/116/124/128/138, разделитель справа у ячейки и снизу у строки, в последней Badge-status S Success | фон `background/surface/light`, обводки `border/divider/primary`, ячейка px/py `spacing/s-1`, текст 14/20 `text/default` |
| KPI card | колонка 260: Label, Value, Delta (значение + подпись) | p `spacing/m-1`, gap `spacing/s-3`, радиус `radius/l`, фон `background/onsurface/0`; Value 24/32 Bold, Delta `text/positive` 14 Medium + 12 `text/muted` |
| Timeline item | строка 320: Marker (точка 12) + Content (Title, Meta) | gap `spacing/s-1`, marker pt `spacing/xs`, точка `border/accent/positive`; Title 14 Medium, Meta 12 `text/muted` |

Имена слоёв и вложенность — как в ваших локальных копиях (`Label`, `Value`, `Top` › `ID`/`Time`, `TableCell 1` › `TextContent` › `Label`, `Marker` › `Dot` …), поэтому Swap instance сохранит тексты. Отличия (осознанные): текст привязан к стилям `font/Body/s`, `font/Label/m` и т. п. (в локальных копиях стили не стояли); точка события — рамка с радиусом, а не эллипс; ячейка статуса в Transfer row добирает высоту 44 отступами 12 сверху/снизу вместо Fill по высоте. Цвет точки и бейджа меняется в экземпляре (точка: `border/accent/warning` для «в работе», `border/global/soft/default` для «впереди»; бейдж — свойство Appearance).

## Как заменить локальные копии в тестовом файле

1. Откройте «[draft] Mbank CRM — тест ИИ», в Assets включите опубликованный CRM UI KIT.
2. Страница Components, секция CRM → выберите локальный `CRM / Key-value row` → правой кнопкой **Select all with same component** (выделятся все 26 экземпляров).
3. В правой панели — меню экземпляра → **Swap instance** → CRM UI KIT → `CRM / Key-value row`. Переопределённые тексты и бейджи сохраняются: имена и вложенность слоёв в ките те же, что в локальной копии. Проверьте 2–3 экземпляра глазами.
4. Повторите для остальных четырёх; затем удалите локальные компоненты из секции CRM.
5. Прогоните figma-learn ещё раз: в отчёте эти пять должны пропасть из «локальных компонентов».

После публикации: разработчик переводит записи `status: "planned"` в `plugins/design-engine/references/components-map.json` на `mapped` с ключом и nodeId (проверка `components-map.mjs check` сама напомнит, когда компонент появится в каталоге).

## Header, «отвязанный» 8 раз

Это **не** отвязанный компонент кита: figma-learn совпал по имени слоя `Header` с компонентом `header` (шапка бокового меню). На деле это три разных заголовка секций:

| Слой | Сколько | Что внутри | Что делать |
|---|---:|---|---|
| Header в колонке доски | 5 | название этапа 16 Bold + счётчик, «SLA этапа …» 12 muted | это шапка колонки, в коде `BoardColumn`; если нужна в ките — отдельный компонент «CRM / Board column header», пока не делаем |
| Header карточки (AML, Скоринг) | 2 | заголовок 16 Bold + Badge-status | в коде заголовки `ScoreCard` / `KeyValueSection`; оставить локально |
| Header «Требуют внимания» | 1 | заголовок 20 Bold + кнопка | заголовок секции дашборда; оставить локально |

Просьба: переименуйте эти слои (`Column header`, `Card header`, `Section header`), чтобы проверка не путала их с шапкой меню.

Настоящие отвязки — **topHeader (detached)**, 5 раз (3 × Default, 2 × subheader): внутри кнопка «назад», заголовок, поиск, основная кнопка и пользователь. Используйте экземпляр `topHeader` из CRM UI KIT; если отвязали, потому что в ките не хватает кнопки «назад» или основной кнопки, — напишите, добавим свойство в `topHeader`, а не будем рисовать отдельный блок.
