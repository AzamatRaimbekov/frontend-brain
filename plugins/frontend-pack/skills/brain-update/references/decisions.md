# Решения по новостям источников

Одна новость — одно решение. Сомневаешься между двумя — бери более осторожное (ниже по таблице риска: `ничего` < `перепроверено` < `статья` < `правило скилла`), а сомнение опиши в PR.

## По типу источника

| Источник (id) | Обычно | Когда больше |
|---|---|---|
| `nextjs-releases`, `vite-releases`, `tanstack-*`, `zod-releases`, `react-hook-form-releases`, `msw-releases` — патч | `ничего` | в заметках «breaking», «deprecated», «security», смена дефолта → `статья` или `правило скилла` |
| те же — минорная версия | `перепроверено` (версия в `references/sources.md`) | новый рекомендуемый API, который скилл описывает иначе → `правило скилла` |
| те же — мажорная версия | `предложение` плана миграции; `библиотека`, если `rules/libraries.json` или скилл называют версию («v5 only») | — |
| `nextjs-blog`, `react-blog` — релиз-пост | `правило скилла` или `статья` по каждому изменению, влияющему на наш стек | — |
| `nextjs-blog` — security update | `статья` в `knowledge/security/` с уязвимыми и безопасными версиями | затрагивает наш код → `правило скилла` в `react-security-i18n` |
| блоги — истории, кейсы, найм | `ничего` | — |
| `vercel-react-best-practices` — новый коммит | перевендорить папку целиком без правок, обновить закреплённый коммит в `skills/react-brain/SKILL.md` и `NOTICE.md` | новое правило спорит с Mdigital override в `react-brain` → `предложение` |
| `web-interface-guidelines` | перенести новый пункт в `skills/react-brain/references/web-interface-guidelines.md` (адаптация, не копия) | — |
| `shadcn-changelog`, `shadcn-cli` | новые компоненты и флаги CLI → `правило скилла` в `skills/shadcn` или `react-ui`; смена базовой библиотеки или пакетов → `библиотека` | — |
| `tailwindcss-*` | как у релизов выше; новости компании → `ничего` | — |
| `figma-code-connect`, `figma-mcp-guide` | смена команд, ограничений мест, порядка вызовов MCP → обновить статьи `knowledge/tooling/figma-mcp-*`, `code-connect-*` | новые инструменты MCP → `предложение` для `design-to-code` и figma-pack |

## Что значит «безопасная правка»

- Есть первоисточник, и в PR стоит ссылка на него.
- Меняется описание, пример или версия, а не политика команды (библиотеки, лимиты, обязательные этапы).
- `npm test` зелёный.

Всё, что меняет политику команды, — только как «Решение мейнтейнера» или «Предложение».

## Примеры

| Новость | Решение | Файлы |
|---|---|---|
| Next.js Security Update for Upstream Vulnerabilities | `статья` | `knowledge/security/nextjs-<cve-или-дата>.md` |
| `@tanstack/react-query@5.104.5` (патч, исправления) | `ничего` | — |
| `react-hook-form v8.0.0` (стабильный) | `предложение` миграции + `библиотека` после решения мейнтейнера | `rules/libraries.json`, `skills/react-forms-state/SKILL.md` |
| shadcn «September 2026 - cn» | `правило скилла` | `skills/react-ui/SKILL.md`, `skills/react-ui/references/sources.md` |
| WIG «Add desktop overscroll guideline» | `правило скилла` | `skills/react-brain/references/web-interface-guidelines.md` |
| Figma MCP guide: «Add figma-spec and figma-code-workflows» | `предложение` | — (описание в PR) |
