---
title: Токены объявлены, а в разметке bg-[#F97316] — запрещай arbitrary-цвета линтером и grep в CI
type: rule
stack: [react, vite, next]
tags: [tailwind, tokens, arbitrary-values, hex, ci, lint]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В `index.css` проекта через `@theme` объявлены `--color-primary`, `--color-surface`, `--color-success`.
В компонентах при этом 634 arbitrary-класса с hex: `bg-[#F97316]` 237 раз, `bg-[#0A0A0A]` 97 раз. В другом
проекте — `bg-[var(--accent)]` вместо утилиты. Смена бренд-цвета или тёмная тема превращается в поиск и
замену по сотням файлов, а переменные Figma не связать с кодом.

## Решение

- Цвет из макета сначала становится токеном, в разметке — утилита: `bg-primary`, `text-success`,
  `border-border`. Прозрачность — `bg-primary/10`, а не новый hex.
- Arbitrary-значения цвета (`[#...]`, `[rgb(...)]`, `[var(--x)]`) запрещены. Токена нет — добавь его по
  [tokens-and-theming.md](../../skills/react-ui/references/tokens-and-theming.md).
- Проверка в CI, пока нет линтера классов:

```bash
! grep -rEn "(bg|text|border|fill|stroke|ring|from|to|via)-\[(#|rgb|hsl|oklch|var\()" src --include=*.tsx
```

- Миграция старого проекта: собери частотный список hex (`grep -roE "\[#[0-9a-fA-F]{3,8}\]" src | sort | uniq -c | sort -rn`),
  заведи токены на топ-10, замени их скриптом, остальное — по мере правок.

## Почему

Дизайн-система, которая существует только в `index.css`, не работает: правила `react-ui` («без hex») без
автоматической проверки нарушаются сотни раз. Это главный блокер связки Figma → код.

## Источник

Найдено на сайте образовательной платформы (`src/index.css`, 634 вхождения) и в её админке
(`pages/LoginPage.tsx`), октябрь 2026.
