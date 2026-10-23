---
title: Кодовый кит дизайн-системы — свой shadcn-registry, а не новый Button в каждом проекте
type: decision
stack: [react, vite, next]
tags: [design-system, shadcn, registry, kit, cva, figma, tokens]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Дизайн-система есть в Figma (библиотеки, переменные, таблица соответствия компонентов), но в коде её
нет: ни в одном репозитории отдела нет её токенов и компонентов. Шаблон студии собран на Geist + indigo,
генератор фронтенда каждый раз создаёт новый shadcn-проект и сопоставляет компоненты на лету. Итог: агент
берёт дефолтный shadcn (фирменный primary превращается в чёрный) или пишет компоненты с нуля в каждом проекте.

## Решение

Кит дизайн-системы — отдельный источник истины в виде **namespaced shadcn-registry**:

- `registry.json` + item-файлы: `registry:theme` (CSS-переменные light/dark/бренды и `@theme inline`),
  `registry:ui` (компоненты `shared/ui/*` на `cva`), иконки дизайн-системы как SVG-компоненты в
  `shared/ui/icons` ([react-ui](../../skills/react-ui/SKILL.md) разрешает это вместо Lucide).
- Подключение в `components.json`:

```json
{
  "registries": {
    "@ds": {
      "url": "https://<registry-host>/r/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

  `REGISTRY_TOKEN` — в `.env.local`, вне git. Только HTTPS. Установка: `npx shadcn@latest add @ds/button`,
  перед установкой — `view @ds/button`. Тот же registry видит shadcn MCP.
- Имена вариантов `cva` — по [react-ui](../../skills/react-ui/SKILL.md): семантические, совместимые с shadcn.
  Перевод «значение в Figma → значение cva» живёт в одной таблице — figma-pack
  `mbank-design-system/references/code-mapping.md`, раздел Component mapping (например, `flat` → `ghost`,
  `flat filled` → `soft`, `positive` → `success`, `negative` → `destructive`, `Size=m` → `size="md"`).
  Code Connect-шаблоны маппят props через эту таблицу; в проектах её не дублируют.
- После публикации кита — пути компонентов в каталог дизайн-системы и связи Code Connect
  ([code-connect-template-files](../tooling/code-connect-template-files.md)).
- Шаблоны новых проектов ставят тему кита первым шагом после `shadcn init`.

## Почему

`figma-to-react` требует «сначала компоненты». Один кит даёт одинаковый результат во всех проектах,
обновляется одной командой и становится целью для Code Connect. Registry — официальный механизм shadcn,
отдельный npm-пакет не нужен.

## Источник

https://ui.shadcn.com/docs/registry/namespace, https://ui.shadcn.com/docs/registry/registry-item-json;
аудит связки figma-pack → frontend-pack и шаблонов студии и генератора фронтенда, октябрь 2026.
