---
name: brain-learn
description: Self-learning of the Mdigital frontend brain - when work in any frontend project produced a new, verified and reusable piece of knowledge (a trap that was hit and fixed, a working recipe, a library or framework behaviour that changed, a better way than the current rule, a rule that turned out wrong), checks it against the brain, writes it as a knowledge entry or a skill fix and immediately opens a GitLab merge request to ai-native-depratment/frontend-brain without waiting for confirmation; the maintainer reviews and merges. Use proactively at the end of every frontend task and right after a bug turned out to have a non-obvious cause. Triggers - "изучили новое", "это надо запомнить", "научи мозг", "сделай MR в мозг", "мозг должен это знать", "обучи плагин", "learned something new", "teach the brain", "open a brain MR".
---

# Мозг учится сам

Нашли в работе что-то новое и проверенное — мозг не должен ждать, пока человек вспомнит. Этот скилл сам решает, достойно ли знание, пишет его и **сразу открывает merge request** в GitLab. Подтверждение человека не нужно: MR — это предложение, сливает его только мейнтейнер после ревью.

Репозиторий: `https://gitlab.mdigital.kg/ai-native-depratment/frontend-brain`. Установленный плагин в `~/.claude/plugins` только для чтения: **никогда не правь его файлы**, работай в отдельном клоне.

## 1. Ворота качества — все пять «да»

| Вопрос | «Нет» — значит |
|---|---|
| **Новое?** `node <plugin-root>/scripts/knowledge.mjs search <слова>` и скиллы не говорят этого же | уже есть — не публикуй; устарело — правь статью (шаг 4) |
| **Проверено?** Воспроизвели, исправили, тесты или браузер подтвердили; или есть первоисточник (release notes, документация, issue) | догадка — не публикуй |
| **Повторится?** Встретится в другом проекте или у другого фронтендера | факт одного проекта — в `CLAUDE.md` проекта |
| **Применимо без догадок?** Можно записать как правило, рецепт, решение или ловушку с кодом или командой | вкусовщина — не публикуй |
| **Чисто?** Нет токенов, паролей, `.env`, внутренних адресов и IP, имён клиентов, закрытого кода заказчика | обезличь; не получается — не публикуй |

Хоть одно «нет» — MR не создавай. Скажи одной строкой, что знание не прошло и по какому вопросу. Сомневаешься между «да» и «нет» — это «нет».

Лимиты: одно знание — один MR; не больше трёх MR за сессию; правку `rules/libraries.json` (новая или запрещённая библиотека) и смену версии плагина не делай — опиши в MR как «Решение мейнтейнера».

## 2. Клон и ветка

Отдельный клон, чтобы не задеть незакоммиченную работу в рабочей папке мозга:

```bash
BRAIN="${FRONTEND_BRAIN_DIR:-$HOME/.frontend-brain}"
REPO=https://gitlab.mdigital.kg/ai-native-depratment/frontend-brain.git
[ -d "$BRAIN/.git" ] || git clone "$REPO" "$BRAIN"
cd "$BRAIN"
git remote set-url origin "$REPO"
git status --short                      # не пусто — остановись и спроси человека
BASE=$(git ls-remote --symref origin HEAD | sed -n 's|^ref: refs/heads/\(.*\)\tHEAD|\1|p')
git fetch origin && git checkout -B "$BASE" "origin/$BASE"
git ls-remote origin "refs/heads/learn/*"   # есть ветка с тем же slug — MR уже открыт, не дублируй
git checkout -b learn/<area>-<kebab-slug>
```

`BASE` — ветка по умолчанию в GitLab: туда идут все MR. Нет доступа (401/403) — попроси человека выполнить `! git clone https://gitlab.mdigital.kg/ai-native-depratment/frontend-brain.git ~/.frontend-brain` (Git сохранит вход в связку ключей) и повтори.

## 3. Что писать

- Новая ловушка, рецепт, решение, правило → статья `plugins/frontend-pack/knowledge/<area>/<kebab-slug>.md` по `knowledge/_template.md`. Формат, области и правила статьи — шаги 1, 2 и 4 [frontend-contribute](../frontend-contribute/SKILL.md). `author` — `git config user.name` в клоне.
- Правило скилла неверно или устарело → правь сам `skills/<скилл>/SKILL.md` или его `references/`, маленьким абзацем, и объясни в MR, почему старое правило неверно. Статья не может спорить со скиллом.
- Статья устарела → `status: deprecated` и `replaced_by: <area>/<slug>`.

Одна мысль на MR. Код — минимальный обезличенный пример.

## 4. Проверки

```bash
node plugins/frontend-pack/scripts/knowledge.mjs index
npm test
git diff "origin/$BASE" | grep -nEi '(token|secret|passw|api[_-]?key|bearer|private key)\s*[:=]|([0-9]{1,3}\.){3}[0-9]{1,3}|\.mdigital\.kg' || echo clean
```

`npm test` упал — исправь своё изменение. Поиск секретов что-то нашёл — убери или обезличь; не получается — откати ветку и не публикуй.

## 5. Коммит и MR

```bash
git add -A
git commit -m "kb(<area>): <что узнали>"
git push -u origin HEAD \
  -o merge_request.create \
  -o merge_request.target="$BASE" \
  -o merge_request.remove_source_branch \
  -o merge_request.title="kb(<area>): <что узнали>" \
  -o merge_request.description="<одна строка: что за знание, где проверено, кому поможет, что затронуто кроме статьи>"
```

Описание MR — одна строка (опции push не принимают переносы). Ссылку на MR GitLab печатает в выводе push (`View merge request ...` или `To create a merge request ...`). Если там только ссылка на создание — MR не создан: дай человеку эту ссылку. Без `Co-Authored-By`, если в проекте не настроено иначе.

## 6. Итог

Одним блоком после основного ответа:

- 🧠 что узнали и почему это прошло ворота;
- ссылка на MR, путь к статье или правке, результат `npm test`;
- у всех заработает после ревью, слияния и `claude plugin marketplace update frontend-brain`.
