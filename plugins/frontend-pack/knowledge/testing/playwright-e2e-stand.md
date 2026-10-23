---
title: Playwright E2E — изолированный стенд, локаторы по ролям, авторизация через storageState
type: recipe
stack: [all]
tags: [playwright, e2e, ci, flaky, storageState, agents]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Для проектов, где Playwright уже подключён (в `rules/libraries.json` его пока нет — новый проект
согласуй с лидом). E2E флакуют из-за общих портов и базы с dev, лимитов запросов и CSS-селекторов;
smoke-тесты есть, но в CI не запускаются.

## Решение

- Локаторы — `getByRole`, `getByLabel`, `getByText`; проверки — web-first (`await expect(l).toBeVisible()`).
- Вход один раз в setup-проекте, дальше `storageState`.
- Внешние сервисы закрывай `page.route`; Service Worker — `serviceWorkers: 'block'`, иначе тест видит
  закэшированную сборку.
- Стенд изолирован: `webServer` поднимает API на своей e2e-базе и Vite с прокси на него, порты не
  пересекаются с dev, `reuseExistingServer: false`. Сценарии с rate-limit — отдельным `project` со своим стендом.
- CI: `forbidOnly: !!process.env.CI`, `trace: 'on-first-retry'` или `retain-on-failure`, отчёт — в
  артефакты при падении, браузер зашит в CI-образ. В линтере — `@typescript-eslint/no-floating-promises`.
- Агенты Playwright (planner, generator, healer, Playwright ≥ 1.56): `npx playwright init-agents --loop=claude`.
  Перегенерируй их после обновления Playwright, дифф после healer ревьюй как обычный код.

## Почему

Изоляция стенда убирает флаки «тест зависит от того, что я делал в dev». Локаторы по ролям переживают
рефакторинг вёрстки и заодно проверяют доступность.

## Источник

https://playwright.dev/docs/best-practices, https://playwright.dev/docs/test-agents; проверено на SPA в
pnpm-монорепо (`playwright.config.ts`, 34 сценария) и сайте образовательной платформы, октябрь 2026.
