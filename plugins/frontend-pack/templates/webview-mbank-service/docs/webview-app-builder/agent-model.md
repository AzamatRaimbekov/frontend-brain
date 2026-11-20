# Agent Model

Статус: активно используются шесть project-local skills. Отдельный Workspace Agent для них не создается.

## Цель

Основной entrypoint должен помогать PM довести WebView-проект от ТЗ, дизайна и API-контрактов до понятного плана и реализации в template. PM не обязан заранее знать React, RTK Query или MBANK Bridge, но должен подтвердить план перед изменениями согласно `AGENTS.md`.

## Роли

| Skill                        | Роль                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `webview-app-builder`        | Главный entrypoint: собирает контекст, выбирает docs, формирует план и подключает специализированные skills. |
| `webview-ui-builder`         | Страница, layout, reuse-first shared UI composition, модульные blocks и состояния экрана.                    |
| `webview-form-builder`       | RHF-формы: semantic form, feature hooks, validation, autosave, upload и dirty state.                         |
| `webview-navigation-builder` | Route map, header, back/close, stepper, deeplink и auth return route.                                        |
| `webview-bridge-builder`     | Typed bridge helpers, capabilities, native actions, errors и diagnostics.                                    |
| `webview-debugger`           | Triage, расследование и формальный bug report.                                                               |

Каждый skill хранит `SKILL.md` и `agents/openai.yaml` с UI metadata. Они являются специализированными режимами одного рабочего процесса, а не отдельными автономными агентами.

## Рабочий цикл

1. Агент читает применимые active-записи из `AGENT_FEEDBACK.md`. Текущая явная инструкция PM имеет приоритет, а feedback не дает право начинать изменения.
2. PM передает ТЗ, дизайн-референс или ссылку и доступный API-контракт.
3. `webview-app-builder` выделяет экраны, состояния, API, навигацию, формы и native-действия; читает только релевантные reference docs.
4. Агент задает только вопросы, без которых нельзя безопасно выбрать контракт, auth/bridge behavior, navigation или итоговый пользовательский сценарий. Допущения отмечаются явно.
5. Агент сообщает короткий план работ, scope и проверки и ждет отдельного явного approval перед изменениями — это правило `AGENTS.md` действует для каждой новой задачи.
6. После approval специализированные skills применяются по необходимости, а подтвержденные правила фиксируются в `docs/webview-app-builder/`.

Для новой формы план также указывает semantic `<form>`, feature hook,
смысловые UI-блоки и существующие компоненты, которые будут переиспользованы.

## Auth и Bridge по умолчанию

- `token=GUEST` означает стартовый guest-режим: не выполнять backend auth bootstrap и не вызывать `auth.required` автоматически.
- `AuthProvider` — opt-in слой для проекта, которому нужен backend auth bootstrap по обычному startup token.
- Проект, которому нужна native-авторизация при входе или перед защищенным действием, явно вызывает `requestMobileAuth()` через `@shared/mobile-bridge` и согласует capability `authResume`.
- Feature-код использует typed bridge helpers; прямой вызов `window.MBankBridge.invoke` допустим только внутри shared helper.

## Границы

- Не создавать новые skills или Workspace Agents без отдельной задачи пользователя.
- Не подменять подтвержденные API, capabilities, deeplink schemes или native behavior предположениями.
- Для bugs результатом остается проверяемый report через `webview-debugger`, а не непроверенная правка.
