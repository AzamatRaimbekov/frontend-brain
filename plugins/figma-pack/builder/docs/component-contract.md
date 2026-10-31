# Контракт компонента (`mbank/component@1`)

Один JSON на компонент — единственный источник того, **из каких частей он состоит и какой токен стоит на каждом свойстве** в каждом варианте, размере и состоянии. Из контракта генерируются обе стороны:

- **Figma** — плагин DS Builder (вкладка «Компоненты») строит component set: вариант = комбинация свойств, заливки, обводки, радиусы, отступы и высоты **привязаны к переменным** (`setBoundVariable`), текст — к текстовым стилям.
- **Код** — генератор frontend-pack пишет React-компонент на cva: классы Tailwind из тех же токенов (`bg-primary`, `hover:bg-primary-hover`, `rounded-md`, `h-11`).

Владелец контрактов — figma-pack (`builder/contracts/*.json`), их правит наш плагин; у frontend-pack копия (`registry/mbank/contracts/`), её обновляет design-engine `sync-contracts.mjs` (docs/architecture.md).

## Формат

```json
{
  "$schema": "mbank/component@1",
  "name": "button",
  "title": "Button",
  "figma": { "name": "button/default", "key": "…", "nodeId": "…" },
  "parts": ["root", "label", "icon"],
  "props": {
    "variant": { "values": ["primary", "secondary"], "default": "primary" },
    "size": { "values": ["sm", "md"], "default": "md" }
  },
  "base": {
    "root": { "layout": "row", "align": "center", "gap": 2, "radius": "md", "weight": "medium", "focus-ring": "ring" },
    "icon": { "size": 5 }
  },
  "variants": {
    "variant": {
      "primary": { "root": { "bg": "primary", "fg": "primary-foreground", "bg:hover": "primary-hover", "bg:active": "primary-active" } },
      "secondary": { "root": { "bg": "secondary", "fg": "secondary-foreground", "bg:hover": "secondary-hover" } }
    },
    "size": {
      "sm": { "root": { "height": 9, "px": 3, "text": "sm" }, "icon": { "size": 4 } },
      "md": { "root": { "height": 11, "px": 4, "text": "sm" } }
    }
  },
  "states": ["default", "hover", "active", "focus", "disabled"],
  "code": { "file": "button.tsx", "extra": "disabled:pointer-events-none disabled:opacity-50" }
}
```

## Свойства и куда они уходят

| Свойство | Значение | Код (Tailwind) | Figma |
|---|---|---|---|
| `bg` | цветовой токен | `bg-<t>` | fill → переменная цвета `<t>` |
| `fg` | цветовой токен | `text-<t>` | fill текста и иконок → `<t>` |
| `border` | цветовой токен | `border border-<t>` | stroke 1 px → `<t>` |
| `border-width` | число px | `border-<n>` | strokeWeight |
| `radius` | ключ шкалы (`xs` … `4xl`, `full`) | `rounded-<k>` | cornerRadius → переменная радиуса |
| `height`, `px`, `py`, `gap`, `size` | шаг сетки 4 px (`11` = 44 px) | `h-11`, `px-4`, `gap-2`, `size-5` | высота, padding, itemSpacing (число или переменная отступа) |
| `text` | ключ шкалы текста (`xs` … `7xl`, `caption`) | `text-<k>` | текстовый стиль |
| `weight` | `regular` / `medium` / `semibold` / `bold` | `font-<w>` | начертание шрифта |
| `shadow` | ключ шкалы теней | `shadow-<k>` | effect style |
| `layout`, `align` | `row` / `column`, `start` / `center` / `between` | `inline-flex items-center …` | auto layout |
| `focus-ring` | цветовой токен | `focus-visible:ring-[3px] focus-visible:ring-<t>/50` | вариант `state=focus` со stroke |

Состояние — суффикс свойства: `bg:hover`, `fg:disabled`, `border:focus`. В коде это модификатор (`hover:`), в Figma — отдельный вариант `state=<s>` с тем же набором привязок поверх `default`.

`code.extra` — классы, которые есть только в коде (поведение, svg-селекторы); Figma их не видит. Всё, что видно глазом, должно быть свойством контракта, иначе Figma и код разойдутся.

## Правила

1. Значение цвета — **только имя токена** из `tokens.css` (без `--`), никаких hex. Новый токен сначала добавляется в дизайн-систему (конфигуратор или `tokens.map.json`), потом привязывается.
2. Новый компонент = новый контракт. Плагин создаёт его из шаблона анатомии (button-like, input-like, badge-like, card-like), код генерируется тем же генератором.
3. Проверка: каждый токен контракта существует в `tokens.css`; каждое значение `props.values` описано в `variants`; генерированный код и Figma совпадают по списку вариантов.
