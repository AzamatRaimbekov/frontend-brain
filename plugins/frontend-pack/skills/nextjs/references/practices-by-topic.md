# Практики Next.js по темам

Все актуальные практики с nextjs.org (блог 2018 – октябрь 2026 и App Router guides), сгруппированы по темам,
дубли слиты, при расхождении взят более новый источник. Проверено 2026-10-25 для Next.js 16.4.3. Пункты, где
правило Mdigital важнее совета nextjs.org, помечены **Mdigital:**.

| Файл | Темы |
|---|---|
| [practices-security-actions.md](practices-security-actions.md) | безопасность (auth, сессии, DAL, CSP, route handlers), Server Actions |
| [practices-data-caching-rendering.md](practices-data-caching-rendering.md) | кэширование (Cache Components и прежняя модель), данные (TanStack Query), рендеринг |
| [practices-routing-deploy.md](practices-routing-deploy.md) | роутинг, proxy, навигация и префетч, деплой и self-host (Docker, nginx, кэш), i18n |
| [practices-performance-seo-styling.md](practices-performance-seo-styling.md) | производительность (бандл, изображения, шрифты, Turbopack), SEO, стили |
| [practices-tooling-agents-testing.md](practices-tooling-agents-testing.md) | AI-агенты и MCP, DX и инструменты, тестирование, миграция |

Как пользоваться: сначала короткие правила в [SKILL.md](../SKILL.md) и тематические рецепты (`caching.md`,
`server-actions.md`, `routing-and-proxy.md`, `seo-metadata.md`, `self-hosting.md`); эти файлы — полный справочник,
когда нужен конкретный нюанс. Для фактов, зависящих от версии, сверяйся с `node_modules/next/dist/docs/` проекта.
