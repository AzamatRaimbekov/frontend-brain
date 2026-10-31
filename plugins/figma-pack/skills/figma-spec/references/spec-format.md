# Spec format (ds-builder/spec@1)

Source of truth: [`builder/core/spec.js`](../../../builder/core/spec.js) (validator) and [`builder/examples/credit-crm.spec.json`](../../../builder/examples/credit-crm.spec.json) (full example, every block).

```json
{
  "project": "Кредитный конвейер",
  "subtitle": "CRM аналитика",
  "platform": "web",
  "viewports": ["desktop", "mobile"],
  "user": { "name": "Айгуль Токтогулова", "role": "Кредитный аналитик" },
  "nav": [{ "id": "apps", "label": "Заявки", "icon": "inbox", "group": "Работа" }],
  "screens": [{
    "id": "apps", "title": "Заявки", "nav": "apps", "page": "Заявки",
    "shell": "sidebar", "states": ["default", "loading", "empty", "error"], "viewports": ["desktop"],
    "empty": { "title": "Заявок пока нет", "text": "…", "action": "+ Создать заявку" },
    "blocks": [ … ]
  }]
}
```

| Field | Values | Default |
|---|---|---|
| `platform` | `web`, `mobile` (app with tab bar) | `web` |
| `brand` | product name in the side menu next to the Mbank logo (code) | `MBANK CRM` |
| `viewports` | `desktop` 1440, `tablet` 768, `mobile` 375 (per spec or per screen) | desktop (web) / mobile |
| `shell` | `sidebar` (nav app), `plain` (login, public), `mobile` (app bar + tab bar) | from platform and nav |
| `states` | `default`, `loading`, `empty`, `error`, `no-access` | `default` |
| `page` | Figma page name; screens with the same page share it | screen title |
| nav `icon` | home, inbox, users, chart, settings, file, card, bell, wallet, transfer, history, shield, calendar, layers, folder, more | guessed from label |

## Blocks

| type | Required | Optional | Notes |
|---|---|---|---|
| `header` | `title` | `subtitle`, `breadcrumbs[]`, `badge`, `amount`, `actions[]`, `period[]` | `+` marks the primary action; other actions of a page go to the top header (dark «Экспорт ˅»); with `badge` or `amount` on a page with breadcrumbs it is the object summary card (amount 32 bold, `subtitle` = meta line, actions «Отклонить» red / others soft / `+` yellow); `period` = segment on the right (`["Сегодня","Неделя","Месяц","Квартал"]`) |
| `stats` | `items[{label,value}]` | `delta`, `better` (`up` default / `down`), `tone`, `hint` | 3–4 items. `delta` "+14% к вчера": the value is coloured by meaning — sign in the `better` direction → green, against → red, no sign → muted; the comparison ("к вчера", from `к`/`за`/`от`/`vs`) stays muted. Lower is better (time to decision, SLA overdue) → `better: "down"` |
| `toolbar` | — | `search`, `filters[]`, `actions[]` | |
| `table` | `columns[]` | `rows` (8), `statuses[]`, `selectable`, `title`, `data[][]` | column `"Label:type"`; mobile → list |
| `pagination` | — | `summary` | removed in empty/error |
| `tabs` | `items[]` | `active` | |
| `form` | `fields[]` | `title`, `subtitle`, `columns` (2), `width`, `submit`, `cancel` | field: `"ФИО"`, `"Телефон:phone"` or `{label,type,required,hint,placeholder}`; types text, phone, date, money, select, textarea, checkbox |
| `details` | `items[]` | `title`, `columns` (2) | item `"ФИО:person"` (fake by type), `["Срок","24 месяца"]` |
| `kanban` | `columns[]` | `badge:false` | column `"Скоринг"` or `{title,count}` |
| `chart` | — | `title`, `subtitle`, `points`, `height` | bar chart on chart-1/2 |
| `list` | — | `title`, `items[]`, `rows`, `statuses[]` | item `[title, subtitle, status]` |
| `timeline` | — | `title`, `items[[title, time]]` | |
| `stepper` | `steps[]` | `current` | |
| `cards` | `items[{title,text,badge}]` | `columns` (3) | |
| `alert` | `text` | `variant` destructive/warning/info/success, `title`, `action` | |
| `empty` | — | `title`, `text`, `icon`, `action` | |
| `login` | — | `title`, `subtitle`, `fields[]`, `submit`, `footer` | error state adds alert |
| `split` | `columns[[blocks]]` | `ratio` "2:1" | stacks on mobile |

Field types for columns and details: `id`, `person`, `company`, `phone`, `email`, `money`, `date`, `datetime`, `number`, `percent`, `product`, `city`, `text`, `status`, `actions`.

## What states do

- `loading` — data blocks become skeletons on `muted`.
- `empty` — the first table/list/kanban/cards becomes an `empty` block (screen `empty` texts), pagination removed, KPIs show 0.
- `error` — destructive alert under the header with «Повторить», first list replaced by an error empty block; forms show the first field invalid.
- `no-access` — header + «Нет доступа» empty block.
