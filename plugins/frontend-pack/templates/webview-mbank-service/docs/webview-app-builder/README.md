# WebView App Builder Knowledge Base

Эта папка - каркас будущей базы знаний для внутренней системы быстрой разработки WebView-приложений.

Статус: база знаний начала заполняться. Основная новая точка опоры - `MBANK WebView Bridge`; legacy URL/AJAX-перехваты нужно хранить отдельно и не считать целевой реализацией для новых проектов.

## Что это за репозиторий

`/Users/anixii/react-md/template-app` сейчас используется как React template/workbench для будущих WebView-приложений и экранов.

Важно: этот репозиторий пока не является финальным продуктовым приложением. Legacy-документы и старые экраны могут быть удалены или заменены позже, когда шаблон будет приведен к нужному состоянию.

## Текущая структура

- `plugin-plan.md` - согласованная модель отдельного плагина, GitHub-template и подготовки проекта из пустой папки.
- `../../AGENT_FEEDBACK.md` - user-owned активные замечания к подходу агента.
- `intake-questions.md` - подтвержденные знания и открытые вопросы для сбора базы.
- `agent-model.md` - текущая модель главного WebView entrypoint и специализированных skills.
- `template-roadmap.md` - будущий план миграции React template.
- `references/webview-context.md` - контекст WebView.
- `references/mbank-webview-bridge.md` - новый контракт `window.MBankBridge.invoke`.
- `references/mbank-bridge-helper.md` - runtime helper `src/shared/mobile-bridge`.
- `references/legacy-webview-integration.md` - старая схема через query params, axios и URL-перехваты.
- `references/ui-best-practices.md` - UI-правила.
- `references/ui-page-building.md` - правила создания WebView-страниц, layout, контейнеры, bottom actions и code scope.
- `references/ui-component-inventory.md` - карта доступных shared UI компонентов и их границ.
- `references/forms-best-practices.md` - формы.
- `references/navigation-best-practices.md` - навигация.
- `references/api-error-handling.md` - RTK Query, API errors, notification, skip и status handling.
- `references/debugging-playbook.md` - разбор багов.
- `references/project-questionnaire.md` - вопросы перед проектом или экраном.
- `references/screen-patterns.md` - типовые экраны.

## Project-local skills

Есть один основной entrypoint `webview-app-builder` и пять специализированных skills: UI, forms, navigation, bridge и debugging. Их роли, порядок подключения и границы описаны в `agent-model.md`.

## Правило заполнения

Не выдумывать правила. Заполнять эти файлы только на основе информации, которую пользователь явно дал, подтвердил или попросил зафиксировать.

Перед планированием и реализацией читать применимые active-записи из
`../../AGENT_FEEDBACK.md`. Этот файл не заменяет текущую явную задачу
пользователя и не является approval на изменения.

Если bridge-правило конфликтует со старой схемой native-действий, для новых проектов приоритет у bridge-правила. Старую схему помечать как historical/legacy reference, а не как основной fallback.
