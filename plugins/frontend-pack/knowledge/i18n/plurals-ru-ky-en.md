---
title: Плюралы в i18next — для русского нужны _one, _few, _many и _other, переменная только count
type: gotcha
stack: [all]
tags: [i18next, react-i18next, plurals, cldr, russian, kyrgyz]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Переводчики и агенты делают для русского только `_one` и `_other`, как в английском. Получается
«5 файл» или «21 файлов». Скилл требует плюралы через `t('key', { count })`
([react-ux](../../skills/react-ux/SKILL.md)), но не перечисляет категории.

## Решение

i18next (v21+) берёт категории из `Intl.PluralRules` (CLDR). Наборы ключей:

| Язык | Ключи | Примеры |
|---|---|---|
| ru | `_one`, `_few`, `_many`, `_other` | one: 1, 21; few: 2–4, 22–24; many: 0, 5–20, 11–14; other: дроби (1,5) |
| ky | `_one`, `_other` | |
| en | `_one`, `_other` | |

```json
{
  "files_one": "{{count}} файл",
  "files_few": "{{count}} файла",
  "files_many": "{{count}} файлов",
  "files_other": "{{count}} файла"
}
```

- Переменная обязательно называется `count`, иначе суффикс не подставится.
- `_zero` необязателен и перекрывает категорию для 0 («Файлов нет»).
- Порядковые: `t('place', { count, ordinal: true })` и ключи `_ordinal_*`.
- Проверка в CI: у каждого ключа с плюралом в `ru` есть все четыре формы.
- Даты, числа и валюты (KGS, RUB, USD) — `Intl.DateTimeFormat`/`Intl.NumberFormat` с текущим языком,
  не вручную.
- Expo/Hermes: проверь, что `Intl.PluralRules` доступен; если нет — полифилл, иначе работают только `_one`/`_other`.

## Почему

Без `_few` и `_many` русский текст грамматически неверен в большинстве чисел, без `_other` ломаются
дробные значения.

## Источник

https://www.i18next.com/translation-function/plurals,
https://www.unicode.org/cldr/charts/48/supplemental/language_plural_rules.html, октябрь 2026.
