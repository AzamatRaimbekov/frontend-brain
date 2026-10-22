---
name: frontend-contribute
description: Adds knowledge to the Mdigital frontend brain through a GitHub pull request - a new rule, recipe, decision or gotcha in the knowledge base, a fix to an outdated entry, or a change to a skill or rules/libraries.json. Works from any frontend project - clones AzamatRaimbekov/frontend-brain, writes the entry from the template, runs the checks, shows the diff, then opens a PR for the maintainer to review. Triggers - "добавь в мозг", "сохрани в мозг", "запиши правило", "предложи правило", "улучши мозг", "это надо в базу знаний", "обнови статью", "сделай PR в мозг", "contribute to the brain", "add this to the knowledge base", "propose a rule".
---

# Пополнить мозг фронтенда

Мозг — это репозиторий `AzamatRaimbekov/frontend-brain`. Каждый фронтендер пополняет его через PR, мейнтейнер (CODEOWNERS) проверяет и сливает. Установленный плагин в `~/.claude/plugins` только для чтения: **никогда не правь его файлы**, работай в клоне.

## 1. Сформулируй знание

Возьми из разговора или из задачи одну мысль, которую стоит знать всем:

- `rule` — так делать обязательно (и что будет, если нет);
- `recipe` — пошаговый рецепт: команды, код, конфиг;
- `decision` — почему выбрали X, а не Y;
- `gotcha` — ловушка, на которую уже наступили: симптом → причина → обход.

Подходит: проверенное на реальном проекте, повторяющееся, полезное другим. Не подходит: факт одного проекта (это в `CLAUDE.md` проекта), непроверенная догадка, вкусовщина без причины. Если знание сомнительное, скажи об этом пользователю и предложи не публиковать.

**Без секретов**: никаких токенов, паролей, `.env`, внутренних адресов, имён клиентов и кусков закрытого кода заказчика. Код — минимальный обезличенный пример.

## 2. Найди, куда оно ложится

```bash
node <plugin-root>/scripts/knowledge.mjs search <слова> [--stack vite|next|react|expo] [--area <область>]
```

- Похожая статья есть → **обнови её** (поле `updated`, автор остаётся, себя упомяни в PR), а не создавай дубль.
- Знание меняет уже действующее правило скилла или `rules/libraries.json` → правь сам скилл или список и объясни в PR, почему старое правило неверно. Статья не может противоречить скиллу: при конфликте побеждает скилл, пока PR не изменит его.
- Статья устарела → `status: deprecated` и `replaced_by: <area>/<slug>` на новую.

Области (папка): `project-setup`, `architecture`, `data`, `ui`, `ux`, `forms`, `state`, `errors`, `testing`, `performance`, `a11y`, `security`, `i18n`, `tooling`, `mobile`.

## 3. Подготовь клон

```bash
BRAIN="${FRONTEND_BRAIN_DIR:-$HOME/.frontend-brain}"
[ -d "$BRAIN/.git" ] || gh repo clone AzamatRaimbekov/frontend-brain "$BRAIN"
git -C "$BRAIN" status --short          # должно быть пусто, иначе спроси пользователя
git -C "$BRAIN" checkout main && git -C "$BRAIN" pull --ff-only
git -C "$BRAIN" checkout -b kb/<area>-<slug>
```

Если текущая папка — сам репозиторий `frontend-brain`, работай в ней. Нет `gh` или входа: попроси пользователя выполнить `! gh auth login`. Нет доступа к репозиторию: попроси мейнтейнера добавить его в collaborators.

## 4. Напиши статью

Скопируй `plugins/frontend-pack/knowledge/_template.md` в `plugins/frontend-pack/knowledge/<area>/<kebab-slug>.md`, заполни frontmatter (`author` — логин из `gh api user --jq .login`, `updated` — сегодня) и секции `Контекст`, `Решение`, `Почему`, `Источник`. Одна статья — одна мысль, до 150 строк; длиннее — раздели. Пиши по-русски, коротко, так, чтобы агент мог применить без догадок. Новые библиотеки — только через правку `rules/libraries.json` в том же PR.

## 5. Проверь

```bash
cd "$BRAIN"
node plugins/frontend-pack/scripts/knowledge.mjs index
npm test
```

Исправь всё, что упало. Версию плагина **не меняй**: её поднимает мейнтейнер при релизе.

## 6. Покажи и отправь

Покажи пользователю `git diff` и текст PR и **дождись подтверждения**: PR видят все. Затем:

```bash
git add -A && git commit -m "kb(<area>): <что добавлено>"
git push -u origin HEAD
gh pr create --title "kb(<area>): <что добавлено>" --body-file <временный-файл-с-описанием>
```

Описание собери по `.github/pull_request_template.md`: что за знание, откуда (проект, задача, ссылка), кому поможет, что затронуто кроме статьи. Без `Co-Authored-By`, если в проекте не настроено иначе.

## 7. Итог пользователю

Ссылка на PR, путь к статье, результат `npm test`. Скажи, что правило заработает у всех после ревью, слияния и релиза (`claude plugin marketplace update frontend-brain`).
