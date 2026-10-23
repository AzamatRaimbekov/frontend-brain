---
title: Токены дизайна — один JSON, сборка в CSS и @theme, маппинг из Figma генерируется скриптом
type: recipe
stack: [react, vite, next]
tags: [tokens, dtcg, tailwind, theme, figma-variables, contrast, codegen]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Токены живут в трёх местах: переменные Figma, руками написанный `index.css` и таблица соответствия в
документации. Они расходятся: в одной таблице маппинга 28 значений помечены «?» спустя недели после того,
как все переменные выгрузили из Figma; агент по правилу «неизвестное — оставь пустым» генерирует пустые
CSS-переменные. Роль, выбранная по имени (`on-accent`), в одной теме дала тёмный текст на тёмной кнопке.

## Решение

1. **Один источник** — `tokens.json` в формате W3C DTCG (стабильная версия 2025.10: темы, бренды,
   алиасы). Выгрузка из Figma — через `get_variable_defs` или плагин экспорта в DTCG.
2. **Сборка скриптом** (без ручных правок результата, файл помечен «сгенерировано»):
   - `tokens.css`: `:root`, `.dark`, `[data-brand=...]` с сырыми значениями;
   - `theme.css` для Tailwind v4 — связи с утилитами через `@theme inline` и имена слотов shadcn
     (`--primary`, `--ring`, ...), как в [tokens-and-theming.md](../../skills/react-ui/references/tokens-and-theming.md);
   - таблица маппинга «переменная Figma → токен → light/dark → CSS var» для агентов.
3. **Палитра по умолчанию** выключается только если дизайн-система это явно требует:

```css
@theme {
  --color-*: initial;   /* bg-red-500 больше не соберётся */
  --color-white: #fff;  /* сброс убирает и white/black: text-white, bg-black/50 в shared/ui */
  --color-black: #000;
}
@theme inline {         /* значения-ссылки на переменные — только в inline */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ...остальные роли */
}
```

   Сброс `--color-*` удаляет всю палитру, включая `white` и `black`. Заново объяви каждый цвет палитры,
   который ещё используют `shared/ui` (`grep -rEo "(bg|text|border)-(white|black)" src/shared/ui`), затем
   `vite build` и визуальная проверка Dialog/AlertDialog (оверлей `bg-black/50`) и `bg-destructive text-white`:
   пропавший класс не даёт ошибки, стиль просто исчезает.

4. **Проверки в тестах сборки:** невалидное имя токена — ошибка; в таблице маппинга нет «?», если выгрузка
   полная; каждая пара фон/текст проходит контраст 4.5:1 в light и dark, непрошедшие уходят дизайнерам.
5. **Роль берётся по фактической привязке** в макете (переменная на тексте экземпляра, видна через
   `get_design_context`/`get_variable_defs`), а не по похожему имени.

## Почему

Таблица, которую правят руками, отстаёт от источника, а агент доверяет ей больше, чем макету. Генерация
плюс проверка контраста превращают расхождение в упавшую сборку, а не в нечитаемую кнопку в проде.

## Источник

https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/, https://tailwindcss.com/docs/theme;
проверено на SPA в pnpm-монорепо (`packages/design/tokens.json`) и внутреннем портале; аудит таблицы
маппинга figma-pack, октябрь 2026.
