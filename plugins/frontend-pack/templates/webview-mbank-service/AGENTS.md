# AGENTS.md

Инструкции для Codex и других AI-агентов, работающих с этим проектом.

## Что это за проект

Этот репозиторий используется как React template/workbench для внутренней системы быстрой разработки WebView-приложений и экранов внутри основного мобильного приложения.

Главная цель текущего этапа - собрать и структурировать базу знаний по WebView, постепенно создавая project-local skills только после явного решения пользователя.

Важно: не создавай новые project-local skills, агентов, новые runtime-абстракции или глубокие изменения в коде без отдельной явной задачи пользователя. Уже созданные project-local skills перечислены ниже.

## Текущий этап

Сейчас делаем:

- отдельную папку документации для WebView App Builder;
- каркас для контекста WebView, best practices, форм, навигации, багов и типовых экранов;
- список уточняющих вопросов, по которым пользователь будет постепенно давать информацию;
- фиксацию подтвержденных знаний в документации.

Пока не делаем без отдельной явной задачи:

- создание дополнительных skills;
- создание отдельных Workspace Agents;
- обновление React;
- глубокую миграцию UI-компонентов.

## Где лежит документация

Основной каталог:

- `docs/webview-app-builder/`

Ключевые файлы:

- `AGENT_FEEDBACK.md` - user-owned активные замечания к подходу агента.
- `docs/webview-app-builder/README.md` - карта документации и статус.
- `docs/webview-app-builder/intake-questions.md` - уточняющие вопросы для сбора базы знаний.
- `docs/webview-app-builder/template-roadmap.md` - будущий план миграции React template.
- `docs/webview-app-builder/references/webview-context.md` - общий контекст WebView.
- `docs/webview-app-builder/references/mbank-webview-bridge.md` - новая целевая интеграция через `window.MBankBridge.invoke`.
- `docs/webview-app-builder/references/mbank-bridge-helper.md` - runtime helper `src/shared/mobile-bridge`.
- `docs/webview-app-builder/references/legacy-webview-integration.md` - старая схема через query params, axios и URL-перехваты.
- `docs/webview-app-builder/references/ui-best-practices.md` - UI best practices.
- `docs/webview-app-builder/references/forms-best-practices.md` - формы.
- `docs/webview-app-builder/references/navigation-best-practices.md` - навигация.
- `docs/webview-app-builder/references/debugging-playbook.md` - баги и отладка.
- `docs/webview-app-builder/references/project-questionnaire.md` - вопросы перед проектом или экраном.
- `docs/webview-app-builder/references/screen-patterns.md` - типовые экраны.

## Project-local skills

Уже созданы следующие project-local skills:

- `.codex/skills/webview-app-builder/SKILL.md` - главный вход для чтения WebView-базы знаний, вопросов и планирования.
- `.codex/skills/webview-debugger/SKILL.md` - расследование WebView-багов и формальные bug reports.
- `.codex/skills/webview-form-builder/SKILL.md` - проектирование, проверка и планирование WebView-форм.
- `.codex/skills/webview-navigation-builder/SKILL.md` - проектирование и проверка WebView-навигации, route config, header, back, close и deeplinks.
- `.codex/skills/webview-bridge-builder/SKILL.md` - проектирование, реализация и проверка MBANK Bridge-интеграций.
- `.codex/skills/webview-ui-builder/SKILL.md` - проектирование и реализация WebView-страниц, layout, shared UI composition, screen states и page/module structure.
- `.codex/skills/webview-app-builder/agents/openai.yaml` - agent-like metadata/entrypoint для основного WebView App Builder.
- `.codex/skills/webview-debugger/agents/openai.yaml` - agent-like metadata/entrypoint для debugging.
- `.codex/skills/webview-form-builder/agents/openai.yaml` - agent-like metadata/entrypoint для форм.
- `.codex/skills/webview-navigation-builder/agents/openai.yaml` - agent-like metadata/entrypoint для навигации.
- `.codex/skills/webview-bridge-builder/agents/openai.yaml` - agent-like metadata/entrypoint для bridge.
- `.codex/skills/webview-ui-builder/agents/openai.yaml` - agent-like metadata/entrypoint для UI-страниц.

Используй `webview-app-builder`, когда задача касается чтения базы знаний, проектирования WebView-экрана/flow, уточняющих вопросов, ориентации по docs или плана действий.

Используй `webview-debugger`, когда задача касается расследования, объяснения, triage или оформления багов в WebView. Детальные правила остаются в `docs/webview-app-builder/references/debugging-playbook.md`.

Используй `webview-form-builder`, когда задача касается проектирования, ревью, оптимизации или дебага форм. Детальные правила остаются в `docs/webview-app-builder/references/forms-best-practices.md`.

Используй `webview-ui-builder`, когда задача касается проектирования или реализации WebView-страниц, shared UI composition, page layout, 16px container, bottom safe area actions, screen states, page/module file structure или создания UI flow.

Используй `webview-navigation-builder`, когда задача касается route map, `src/pages/model.tsx`, поведения header/back/close, nested routes, stepper flow, deeplinks или bridge-навигации. Детальные правила остаются в `docs/webview-app-builder/references/navigation-best-practices.md`.

Используй `webview-bridge-builder`, когда задача касается MBANK Bridge, `src/shared/mobile-bridge`, typed helpers, native actions, capabilities, bridge errors, Sentry-логирования, payment, PDF preview, external links, deeplinks, analytics, adjust, biometry или device report. Детальные правила остаются в `docs/webview-app-builder/references/mbank-webview-bridge.md` и `docs/webview-app-builder/references/mbank-bridge-helper.md`.

Если пользователь дает новую подтвержденную информацию о WebView, native bridge, UI, формах, навигации, API, багах, Storybook или React template - добавляй ее в соответствующий файл в `docs/webview-app-builder/`, а не оставляй только в чате.

Для новых WebView основной источник по native-интеграции - `docs/webview-app-builder/references/mbank-webview-bridge.md`. Старую схему считать legacy/fallback, если пользователь явно не сказал иначе.

## Как собирать знания

- Не выдумывай правила, которых пользователь не давал.
- Если контекста не хватает, задавай уточняющие вопросы.
- Пользователь может давать информацию по одному блоку за раз: сначала общий контекст WebView, потом best practices, потом баги, формы и так далее.
- После получения информации структурируй ее в документации и, если нужно, добавляй открытые вопросы.
- Спорные или неполные пункты помечай как `Нужно уточнить`.

## Текущий стек шаблона

- React 18
- TypeScript
- Vite
- Base UI / shadcn-style shared UI components
- Redux Toolkit / RTK Query
- React Router
- i18next / react-i18next
- Tailwind CSS 4
- dayjs
- `md-glyphs` / локальный `src/shared/iconpack` для иконок
- sonner-based global notification

`antd` и `antd-mobile` удалены из runtime-кода и dependencies. Не возвращай их в новые экраны.

Storybook не является обязательной частью template; для ручной проверки shared UI используется `/ui-kit`.

## Важные команды

- Type check: `yarn lint:type`
- ESLint: `yarn lint:eslint`
- Prettier check: `yarn lint:prettier`
- Full lint: `yarn lint`
- Build: `yarn build`
- Dev server: `yarn dev`

Не запускай dev server и не разворачивай приложение без прямой просьбы пользователя. Пользователь обычно запускает приложение вручную.

## Правила работы

- Для текущего этапа предпочтительно менять документацию, а не runtime-код.
- Перед планированием или изменениями прочитать применимые active-записи в `AGENT_FEEDBACK.md`.
- Явная текущая инструкция пользователя выше старого feedback. Feedback не является approval на изменения; менять его можно только по прямой просьбе пользователя.
- Перед каждой новой задачей сначала составь короткий план работ и переходи к изменениям только после явного апрува пользователя.
- Сначала ищи существующий паттерн в `src/modules`, `src/pages`, `src/shared`, потом добавляй новый код.
- Не делай лишние рефакторы рядом с задачей.
- Не меняй API-контракты под себя.
- Все иконки использовать через `md-glyphs` / существующий iconpack проекта, пока не принято другое решение.
- После изменений в документации достаточно проверить структуру и git diff; TypeScript/build проверки нужны только при изменениях runtime-кода.

## Когда не уверен

Если не хватает контекста, спроси. Особенно по native bridge/deeplink, авторизации, API, ограничениям WebView, финальному дизайну, статусам, оплатам, permissions, Storybook и правилам шаблона.
