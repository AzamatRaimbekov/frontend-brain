# Как запускать обновление мозга по расписанию

Скилл и агент сами расписание **не создают**: его включает мейнтейнер одним из способов ниже. Раз в неделю достаточно; день — до планёрки, чтобы PR успели посмотреть.

Промпт для любого способа:

```text
Используй скилл brain-update и открой PR. Проекты для метрик: <папки или «нет»>.
```

## 1. Облачная рутина Claude Code (`/schedule`)

В Claude Code: `/schedule` → еженедельно (например, понедельник 09:00 по Бишкеку) → промпт выше → репозиторий `AzamatRaimbekov/frontend-brain`.

Нужно:
- GitHub подключён к Claude Code на claude.ai с доступом к приватному `frontend-brain` (рутина клонирует его и пушит ветку);
- плагин `frontend-pack` в окружении рутины или работа прямо в клоне — скилл лежит в репозитории, путь `plugins/frontend-pack/skills/brain-update/SKILL.md`;
- `--projects` в облаке не видит локальные проекты: метрики использования только по проектам, которые есть в облачном окружении, иначе отчёт без них.

Плюс: компьютер может быть выключен. Минус: нет локальных `.frontend/tasks`.

## 2. Локальный cron с `claude -p`

```cron
0 9 * * 1  cd $HOME/.frontend-brain && GITHUB_TOKEN=$(gh auth token) claude -p "Используй скилл brain-update и открой PR. Проекты для метрик: $HOME/work/crm $HOME/work/portal" --allowedTools "Read,Edit,Write,WebFetch,Bash(git status *),Bash(git checkout *),Bash(git pull *),Bash(git diff *),Bash(git add *),Bash(git commit *),Bash(git push -u origin HEAD),Bash(git ls-remote *),Bash(node *),Bash(npm test),Bash(gh pr create *),Bash(gh repo clone *)" >> $HOME/.frontend-brain-update.log 2>&1
```

Нужно:
- установленный и залогиненный `claude` и `gh auth login` на машине;
- плагин `frontend-pack@frontend-brain` установлен (скилл `brain-update`);
- компьютер включён в это время (на macOS вместо cron надёжнее `launchd`);
- у cron короткий `PATH`: строкой выше задай `PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` или пиши полные пути к `claude`, `gh`, `node`;
- `--allowedTools` перечисляет только нужное: без merge, без `release.mjs`, без `git push --force`.

Плюс: видит локальные проекты, метрики использования полные.

## 3. GitHub Action

Файл `.github/workflows/brain-update.yml` с `schedule: cron` и [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action), промпт выше.

Нужно:
- секрет `ANTHROPIC_API_KEY` (или OAuth-токен Claude) в настройках репозитория;
- `permissions: contents: write, pull-requests: write` в workflow;
- чтобы запушить сам файл workflow, токену `gh` нужен scope `workflow`: сейчас его **нет**, добавить — `gh auth refresh -s workflow`;
- метрики использования только по проектам, доступным в раннере.

Плюс: история запусков в Actions, не зависит от чьего-то компьютера.

## Что выбрать

Нужны метрики по реальным проектам — локальный cron у мейнтейнера. Нужна только свежесть правил — облачная рутина. Action — когда команда хочет видеть запуски в GitHub и готова завести секрет.
