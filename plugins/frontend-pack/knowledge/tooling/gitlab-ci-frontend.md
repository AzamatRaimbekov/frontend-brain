---
title: GitLab CI для фронта — проверки на каждый MR в чистом контейнере, образ по SHA, ручной деплой
type: recipe
stack: [vite, react, next]
tags: [gitlab, ci, merge-request, lint, typecheck, docker, resource_group]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В монорепо CI разбит на `include: local` файлы по приложениям с общими шаблонами. Удачные решения: тесты
идут в одноразовом контейнере от имени текущего пользователя (shell-раннер не мусорит root-файлами), образ
тегается `$CI_COMMIT_SHA`, деплой ручной и сериализован `resource_group`. Пробелы: у одного приложения нет
lint, MR-пайплайнов нет (только push в main — ошибки находятся после мержа), smoke e2e не запускаются.

## Решение

```yaml
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

variables:
  NODE_IMAGE: node:22-slim          # одна версия node для CI и Dockerfile (ARG NODE_IMAGE)

web:check:
  stage: test
  script:
    - docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp -v "$CI_PROJECT_DIR/apps/web:/app" -w /app "$NODE_IMAGE"
        sh -lc 'corepack enable && pnpm install --frozen-lockfile && pnpm check && pnpm build'

web:image:
  extends: .docker-build            # тег $CI_COMMIT_SHA
  needs: [web:check]
  rules: [{ if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH }]

web:deploy:
  needs: [web:image]
  when: manual
  resource_group: web-prod          # два деплоя не идут одновременно
```

- `pnpm check` = `typecheck && lint && test` ([quality-gates-from-day-one](quality-gates-from-day-one.md)).
- Lint обязателен во всех фронт-джобах.
- Если в проекте есть smoke e2e, отдельная джоба после build, отчёт — в `artifacts` при падении.

## Почему

«Проверка в чистом контейнере → неизменяемый образ по SHA → ручной сериализованный деплой» даёт
воспроизводимые релизы и откат на любой коммит. Без MR-пайплайна правила мозга ничем не проверяются до мержа.

## Источник

Проверено на монорепо образовательной платформы (`.gitlab/ci/*.yml`) и SPA в pnpm-монорепо, октябрь 2026.
https://docs.gitlab.com/ci/yaml/workflow/
