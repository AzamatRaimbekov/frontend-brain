---
name: brain-update
description: Weekly self-update of the Mdigital frontend brain - watches the upstream sources the rules depend on (Next.js, React, TanStack, Vercel React rules, Web Interface Guidelines, shadcn, Tailwind, Vite, MSW, Zod, React Hook Form, Figma Code Connect and MCP), decides per new item whether to add a knowledge entry, update a skill rule, re-verify sources or flag a library change, builds brain metrics (health of the repository and usage from project task files) with proposals, and opens ONE pull request for the maintainer. Never merges or releases. Triggers - "обнови мозг", "обновление мозга", "что нового для мозга", "метрики мозга", "здоровье мозга", "brain update", "brain metrics", "refresh the frontend brain".
---

# Обновление мозга

Мозг устаревает сам: выходят Next.js, React, TanStack, правила Vercel. Этот скилл раз в неделю (или по просьбе) смотрит, что вышло у источников, переносит безопасное в мозг, считает метрики и открывает **один PR**. Сливает и выпускает релиз только мейнтейнер.

Только метрики («метрики мозга», «здоровье мозга») — выполни шаг 5 и покажи отчёт, без ветки и PR.

## 1. Клон и ветка

Как в [frontend-contribute](../frontend-contribute/SKILL.md): работай в клоне, **никогда** не в установленном плагине (`~/.claude/plugins`).

```bash
BRAIN="${FRONTEND_BRAIN_DIR:-$HOME/.frontend-brain}"
[ -d "$BRAIN/.git" ] || gh repo clone AzamatRaimbekov/frontend-brain "$BRAIN"
cd "$BRAIN" && git status --short          # не пусто — остановись и спроси человека
git checkout main && git pull --ff-only
git checkout -b auto/brain-update-$(date +%F)
```

Текущая папка уже репозиторий `frontend-brain` (облачный запуск) — работай в ней. Ветка `auto/brain-update-<сегодня>` уже есть на origin — значит, прогон сегодня был: не дублируй, сообщи ссылку на открытый PR.

## 2. Что нового

```bash
node plugins/frontend-pack/scripts/brain-watch.mjs            # с прошлого обновления (rules/watch-state.json)
node plugins/frontend-pack/scripts/brain-watch.mjs --json     # то же для разбора
```

Источники и какие файлы они затрагивают — `plugins/frontend-pack/rules/watch-sources.json`. Пропущенный источник (таймаут, лимит GitHub) не ошибка: впиши его в PR как «не проверен». Лимит — выставь `GITHUB_TOKEN=$(gh auth token)` и повтори.

Новостей нет ни у одного источника — переходи к шагу 5.

## 3. Решение по каждой новости

Открой новость (WebFetch по ссылке: release notes, пост, diff коммита) и прими **одно** решение. Подробная таблица с примерами — [references/decisions.md](references/decisions.md).

| Решение | Когда | Что делаешь |
|---|---|---|
| `ничего` | патч без изменений API, маркетинг, канареечная сборка | только строка в таблице PR |
| `статья` | новая ловушка, рецепт или безопасная версия | статья в `knowledge/<area>/` по шаблону, как в frontend-contribute |
| `правило скилла` | меняется API или рекомендуемый способ, который скилл описывает | правка `skills/<скилл>/SKILL.md` из `affects` источника |
| `перепроверено` | ничего не сломалось, но версия выросла | обнови строку «Checked …» и версию в `references/sources.md` |
| `библиотека` | новая библиотека, запрет, смена мажорной версии в whitelist | **не правь сам**: опиши в PR как «Решение мейнтейнера» |
| `предложение` | новая возможность, которая может стать фичей мозга | строка в разделе «Предложения» PR, без кода |

Правила:

- Только проверенное: каждое изменение ссылается на первоисточник (release notes, документация, коммит). Догадки не вносим.
- Правки безопасные и маленькие: одна мысль — одна статья или один абзац скилла. Скилл и статья не спорят.
- Вендорные файлы `skills/react-brain/references/vercel-react-best-practices/` копируются **без изменений** целиком на новый коммит; при этом обнови закреплённый коммит в `skills/react-brain/SKILL.md` и `NOTICE.md`. Сомневаешься — решение `предложение`.
- Безопасность (security release Next.js, React) — всегда минимум `статья` с безопасной версией, даже если правила не меняются.
- Версию плагина не трогай, `rules/libraries.json` не правь.

## 4. Индекс и проверки

```bash
node plugins/frontend-pack/scripts/knowledge.mjs index
npm test
```

Упало — исправь своё изменение. Не получается — откати его и перенеси новость в «Предложения».

## 5. Метрики

```bash
node plugins/frontend-pack/scripts/brain-metrics.mjs --projects <папки проектов...>
```

Папки проектов, где лежат `.frontend/tasks/*.md`, назовёт человек или промпт расписания; нет — запусти без `--projects`. Отчёт: здоровье (скиллы, статьи по областям, устаревшие статьи и источники, libraries.json, последний релиз), использование (конвейеры, статусы, блокировки по этапам, круги на воротах, доля дошедших до handoff) и «Предложения» с файлом, который надо поменять. Простое и проверяемое из «Предложений» (обновить дату проверки источников, которую ты только что перепроверил) можно сделать в этом же PR; остальное — только в описание.

## 6. Состояние и PR

```bash
node plugins/frontend-pack/scripts/brain-watch.mjs --update-state   # rules/watch-state.json: последнее увиденное
npm test
git add -A && git commit -m "auto: обновление мозга $(date +%F)"
git push -u origin HEAD
gh pr create --title "auto: обновление мозга $(date +%F)" --body-file <временный файл>
```

Состояние коммитится в этом же PR: после слияния следующий прогон покажет только новое. PR закрыли без слияния — следующий прогон снова покажет те же новости, это нормально.

Описание PR — по [references/pr-body.md](references/pr-body.md): таблица «источник → новость → решение → файлы», «Решения мейнтейнера», «Не проверено», отчёт метрик. Без `Co-Authored-By`.

**Никогда** не сливай PR, не ставь тег и не запускай `scripts/release.mjs`. Если запуск ручной, перед push покажи человеку `git diff --stat` и описание и дождись «да». В запуске по расписанию подтверждение — сам PR: мейнтейнер ревьюит его.

## 7. Итог

Ссылка на PR, сколько новостей по решениям, что ждёт решения мейнтейнера, какие источники не проверены, топ-3 предложения метрик.

## Расписание

Скилл не создаёт расписание сам. Варианты (облачная рутина через `/schedule`, локальный cron с `claude -p`, GitHub Action) и что нужно для каждого — [references/schedule.md](references/schedule.md).
