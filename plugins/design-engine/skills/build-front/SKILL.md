---
name: build-front
description: Builds a working Mbank CRM / admin / cabinet frontend in about a minute from a ТЗ or a screen spec - writes the spec with figma-pack figma-spec, then one engine command checks the spec, scaffolds the project (frontend-pack new-crm), generates every screen (spec-to-code - routes, pages, API with MSW mocks, loading/empty/error states, UX.md, tests) and runs typecheck, lint, tests and build; the same spec draws the screens in Figma. Use when the user wants a frontend fast from requirements - "собери фронт", "собери фронт по ТЗ", "сгенерируй проект", "сделай CRM по ТЗ", "быстро собери админку", "фронт из спеки", "build the frontend from the spec", "generate the app from requirements".
---

# Фронт за минуту: ТЗ → спека → проект

Движок соединяет два плагина: спеку пишет `figma-pack:figma-spec`, код генерирует `frontend-pack` (`new-crm.mjs`, `spec-to-code.mjs`). Одна и та же спека рисует экраны в Figma (плагин DS Builder из figma-pack), поэтому макет и код совпадают по структуре.

## Шаги

1. **Спека.** Есть `specs/<project>.spec.json` — бери его. Нет — скилл `figma-pack:figma-spec`: из ТЗ получается одна JSON-спека экранов (меню, блоки, состояния). Спрашивай только то, что меняет экраны.
2. **Одна команда** (`ENGINE` — папка плагина design-engine, `${CLAUDE_PLUGIN_ROOT}`):

   ```bash
   node $ENGINE/scripts/build-front.mjs specs/<project>.spec.json --project <папка> --name "<Название>"
   ```

   Шаги команды: `spec-check` → `scaffold` (только если в папке нет проекта) → `generate` → `typecheck` → `lint` → `test` → `build`. Останавливается на первом упавшем шаге и печатает хвост вывода: исправь причину и запусти снова. Повторный запуск на готовом проекте только перегенерирует экраны; файлы, которые правили руками, сохраняются (`--force` перезаписывает).

   Флаги: `--kit copy` — исходники кита внутри проекта вместо пакета `@mdigital/mbank-ui` (пакет приватный, нужен доступ к git); `--dev --port 5180` — сразу запустить dev-сервер; `--dry-run` — показать план; `--json` — отчёт для агента; `--skip-checks` — без проверок проекта.
3. **Показать.** Запусти dev-сервер, открой главный экран в браузере, сделай скриншот 1440 после загрузки данных (первый кадр бывает состоянием загрузки). Состояния: `?mock=empty | error | no-access | action-error`.
4. **Что осталось руками** — из вывода `generate`: TODO-блоки (тип блока, которого нет в генераторе), кнопки без поведения (`TODO(spec-to-code)`), моки вместо реального API. Это следующий этап — агент `frontend-pack:frontend-engineer` по конвейеру `spec` скилла `frontend-pack:frontend`.
5. **Figma (если нужен макет).** Та же спека → плагин DS Builder («Экраны» → «Собрать») или `use_figma` с Full seat. Проверка совпадения — агент `design-engine:design-qa`.

## Отчёт

```
Фронт: <папка> — <n> экранов, кит <package|copy>
Шаги: spec-check ok · scaffold ok · generate ok · typecheck ok · lint ok · test <n> ok · build ok (<секунд> с)
Открыть: npm run dev → http://localhost:<port>/<первый экран>
Осталось: <TODO-блоки, действия без поведения, моки API> | нет
```

Не пушь и не открывай MR без просьбы. Новый тип блока — сначала в спеку и генератор (PR во frontend-brain через `frontend-pack:frontend-contribute`), а не руками в одном проекте.
