# Как пополнять мозг фронтенда

Мозг общий: каждый фронтендер Mdigital может добавить правило, рецепт или ловушку, на которую наступил. Всё идёт через pull request, мейнтейнер проверяет и сливает.

## Быстрый путь: через агента

В любом проекте, где установлен `frontend-pack`, скажи агенту:

```text
Добавь в мозг: <что узнал, почему это важно, ссылка или проект>
```

Скилл `frontend-contribute` сам найдёт похожие статьи, склонирует репозиторий в `~/.frontend-brain`, напишет статью по шаблону, прогонит проверки, покажет тебе diff и после твоего «да» откроет PR.

Нужно один раз: доступ к `AzamatRaimbekov/frontend-brain` (попроси мейнтейнера) и `gh auth login`.

## Вручную

```bash
gh repo clone AzamatRaimbekov/frontend-brain && cd frontend-brain
git checkout -b kb/<area>-<slug>
cp plugins/frontend-pack/knowledge/_template.md plugins/frontend-pack/knowledge/<area>/<slug>.md
# заполни статью
node plugins/frontend-pack/scripts/knowledge.mjs index
npm test
git commit -am "kb(<area>): <что добавлено>" && git push -u origin HEAD
gh pr create
```

## Что куда класть

| Что | Куда |
|---|---|
| Ловушка, рецепт, решение, правило одной темы | `plugins/frontend-pack/knowledge/<area>/<slug>.md` |
| Изменение обязательного правила команды | сам скилл в `plugins/frontend-pack/skills/` |
| Новая библиотека или запрет | `plugins/frontend-pack/rules/libraries.json` |
| Факт одного проекта | не сюда, а в `CLAUDE.md` / `AGENTS.md` этого проекта |

Области: `project-setup`, `architecture`, `data`, `ui`, `ux`, `forms`, `state`, `errors`, `testing`, `performance`, `a11y`, `security`, `i18n`, `tooling`, `mobile`.
Стек статьи: `all`, `react`, `vite`, `next`, `expo`.

## Правила статьи

- Одна статья — одна мысль, до 150 строк. Секции: `Контекст`, `Решение`, `Почему`, `Источник`.
- Только проверенное: на проекте, в документации, в issue. Догадки не публикуем.
- Без секретов, токенов, внутренних адресов, имён клиентов и закрытого кода заказчика.
- Похожая статья уже есть — обнови её, а не пиши вторую. Устарела — `status: deprecated` и `replaced_by`.
- Статья не спорит со скиллом. Если скилл неправ, PR меняет скилл и объясняет почему.
- Версию плагина не трогай.

`npm test` (и CI на каждом PR) проверяет frontmatter, обязательные секции, ссылки и актуальность `knowledge/INDEX.md`.

## Для мейнтейнера: релиз

После слияния одного или нескольких PR:

```bash
git checkout main && git pull
node scripts/release.mjs minor     # или patch / major / x.y.z
npm test && git commit -am "frontend-pack <версия>" && git tag v<версия> && git push --follow-tags
```

Фронтендеры получают обновление командой `claude plugin marketplace update frontend-brain` (в Codex `codex plugin marketplace upgrade`).
