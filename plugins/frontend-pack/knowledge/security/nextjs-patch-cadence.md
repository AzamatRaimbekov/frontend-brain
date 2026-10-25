---
title: Патчи безопасности Next.js выходят почти каждый месяц — держи последний патч своей мажорной ветки
type: rule
stack: [next]
tags: [nextjs, security, upgrade, lts, cve, patch, sharp]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

В 2026 году Next.js выпускал security-релизы в июле, августе, сентябре и октябре, среди них критичные RCE
(`'use cache'` с typed arrays, Image Optimization через `sharp` на glibc), SSRF при `images.remotePatterns`,
DoS через Server Actions, отравление ISR-кэша при self-hosting. Проект, который «работает, не трогаем»,
быстро оказывается уязвимым.

## Решение

- Раз в спринт и перед любым советом об обновлении: `node <plugin-root>/scripts/nextjs-news.mjs --project .`
  Скрипт покажет установленную версию, последний патч её мажорной ветки и все security-посты после неё.
- Патч в пределах своей ветки ставим в ту же неделю (`npx @next/codemod@latest upgrade patch`).
- Поддерживаемые ветки: 16.x — Active LTS; 15.x — Maintenance LTS, по политике два года с релиза 2024-10-21,
  то есть до 2026-10-21 (на 2026-10-25 страница ещё показывает её как Maintenance). Проекты на 15 планируют
  переход на 16, проекты на 14 и ниже — задача безопасности.
- Не выключай `experimental.agentUpgrade` (по умолчанию политика `security` напоминает об уязвимых версиях в
  `next dev`/`next build`).
- Self-hosted на glibc-образах (`node:*-slim`) следи за версией `sharp` из последнего advisory.

## Почему

Исправления выходят только для поддерживаемых веток и обычно как патч-версии. Для 15.x фиксы шли параллельно
(15.5.27, 15.5.28); в сентябрьском и октябрьском постах патчей для 14.x нет.

## Источник

- https://nextjs.org/support-policy (проверено 2026-10-25)
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://nextjs.org/blog/september-2026-security-release
- https://nextjs.org/docs/app/guides/upgrading/agent-upgrade
