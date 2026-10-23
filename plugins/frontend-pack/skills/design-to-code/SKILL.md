---
name: design-to-code
description: End-to-end team process from a Figma design to merged React code at Mdigital - brief, draft in Figma from our design system (figma-pack), human approval, neutral spec, UX.md, file plan, code from the coded kit (mbank-ui for Mbank products), visual QA against Figma, review and QA. Names who does each stage (skills and agents), the gates between stages and the artifacts passed on (Figma links, spec file, UX.md, PR), plus the fallback for a Dev seat (read-only - code from an existing designer frame). Use when a task goes from design to code or from an idea through Figma to code. Triggers - "по макету", "из фигмы", "сделай в фигме и сверстай", "дизайн → код", "дизайн в код", "передай в разработку", "от макета до PR", "figma to code", "design to code", "design handoff", "from Figma to PR".
---

# Дизайн → код (процесс команды)

В Codex сначала прочитай [интеграцию с Codex](../../references/codex.md).

Этот скилл — порядок работы, а не правила кода. Правила кода остаются в скиллах `react-*` и в [libraries.json](../../rules/libraries.json), правила Figma — в плагине `figma-pack` (вход: `figma-pack:figma-core`). Ведёт процесс агент [design-lead](../../agents/design-lead.md): он проверяет ворота, называет следующий шаг и сам кода не пишет.

## 0. Перед стартом (один раз за сессию)

1. **Плагины.** Нужны `frontend-pack` и `figma-pack` (оба в репозитории `AzamatRaimbekov/frontend-brain`). Нет `figma-pack` — скажи пользователю и работай по [запасной цепочке](references/dev-seat-fallback.md) только с тем, что есть.
2. **Figma MCP и место.** `whoami` (бесплатно). Место определяет маршрут:

| Место | Что можно | Маршрут |
|---|---|---|
| Full | чтение и запись | полный: этапы 1–10 |
| Dev | только чтение | [запасная цепочка](references/dev-seat-fallback.md): рисует человек, агенты читают и пишут код |
| View / Collab | 6 чтений в месяц | стоп: назови оценку вызовов и попроси Dev или Full |

   На файл нужен доступ **can edit**: с can view MCP отказывает даже в чтении (`figma-core`, раздел 2).
3. **Продукт.** Mbank / MDigital (киты Mbank Tokens; Mbank, kassa, travel, artwin, koko) — в коде `figma-pack:mbank-design-system` и кодовый кит `frontend-pack:mbank-ui`, если он есть в установленном плагине (иначе code-mapping §7 и пометка в отчёте); иначе каталог проекта `.figma/design-system.json`.
4. **Шрифт (G03).** Web components, Hero Section и CRM UI KIT используют Inter Mbank. Пока админ не загрузил его как шрифт организации, агент рисует web/CRM только черновик `[draft]` на Inter и только с согласия пользователя (`mbank-figma-patterns`, `references/crm-screen.md`). Mobile KIT (Nunito) рисуется полностью.

## 1. Этапы

| # | Этап | Кто делает | Вход | Выход (артефакт) | Ворота дальше |
|---|---|---|---|---|---|
| 1 | Бриф | `figma-pack:figma-brief` (+ формат `react-page-ux` для web) | запрос, ТЗ | утверждённый бриф | пользователь ответил «да» |
| 2 | Черновик в Figma | `figma-pack:figma-core` → агент `figma-designer` (`figma-design`, `figma-structure`, для Mbank `mbank-figma-patterns`) | бриф, каталог | draw plan → после «да» фреймы `[draft] …`, ссылки | `structure-audit.js` 0 ошибок, `lint-design.js` 0 critical |
| 3 | Утверждение | **человек-дизайнер** | ссылки на черновики | фреймы без `[draft]`, Section в Ready for dev | ворота A |
| 4 | Спека | агент `figma-reader` | ссылка на утверждённый фрейм с `node-id` | спека по `spec-template` (12 разделов), скриншоты `.figma/<fileKey>/<nodeId>.png` | разделы 1–11 есть, вопросы раздела 11 закрыты или стали допущениями |
| 5 | UX.md | [react-page-ux](../react-page-ux/SKILL.md) | спека (разделы 8 и 11 → состояния и допущения) | `src/pages/<route>/UX.md` | ворота B |
| 6 | План файлов | агент [frontend-architect](../../agents/frontend-architect.md) | спека + UX.md | дерево файлов, данные, состояния | у каждого файла одна ответственность, оценка ≤ 150 строк |
| 7 | Код | основная сессия: `figma-pack:figma-to-react` + [react-architecture](../react-architecture/SKILL.md), [react-ui](../react-ui/SKILL.md), [react-ux](../react-ux/SKILL.md), [react-data-fetching](../react-data-fetching/SKILL.md), [react-error-handling](../react-error-handling/SKILL.md), [react-dry](../react-dry/SKILL.md); для Mbank `mbank-ui` (если установлен, иначе code-mapping §7) | план, спека, UX.md | ветка с кодом | ворота C |
| 8 | Визуальная сверка | агент [design-qa](../../agents/design-qa.md) | URL страницы, скриншоты Figma | таблица отличий 1280 / 768 / 375 | нет отличий с пометкой «исправить» |
| 9 | Ревью | агент [frontend-reviewer](../../agents/frontend-reviewer.md) | изменённые файлы | список нарушений | 0 блокирующих |
| 10 | QA и PR | основная сессия: `react-page-ux` §5 (состояния через MSW, клавиатура, консоль) | ветка | PR с отчётом | ворота D |

Мелкая правка одного компонента по макету: этапы 1–3 и 6 пропускаются, этапы 4, 7, 8, 9 обязательны.

## 2. Ворота (не пропускать)

- **A. Дизайн утверждён человеком.** Код пишется только по фрейму, который дизайнер утвердил: в имени нет `[draft]` (видно в `get_metadata`), и дизайнер подтвердил Ready for dev в ответе. Агент не утверждает свои черновики и не снимает `[draft]` сам. Черновик можно взять в код только по прямой просьбе пользователя — тогда PR помечается «по неутверждённому макету».
- **B. UX.md до кода.** Хук `check-ux-brief` блокирует новую страницу без `UX.md`. Бриф показан пользователю (в `claude -p` — повторён в начале отчёта).
- **C. Код по стандарту.** Каждый файл компонента ≤ 150 строк (`node <plugin-root>/scripts/check-file-size.mjs <файлы>`), нет hex и произвольных `[..]` значений, компоненты из `shared/ui` (для Mbank — из кита через `add-ui.mjs`; если скилла `mbank-ui` или скрипта `add-ui.mjs` нет в установленном frontend-pack — компоненты по `figma-pack` `mbank-design-system/references/code-mapping.md` §7, и отсутствие кита указано в плане и в отчёте PR), строки — ключи i18n, типы и линтер проходят.
- **D. Перед PR.** `design-qa` без незакрытых отличий, `frontend-reviewer` без блокирующих замечаний, состояния загрузки, пусто, ошибки проверены в браузере или тестами.

Если ворота не пройдены, процесс стоит: верни этап исполнителю с конкретным списком, что исправить.

## 3. Артефакты между этапами

Подробные форматы: [references/handoff.md](references/handoff.md).

- Ссылки на фреймы Figma с `node-id` (этап 2 → 3 → 4).
- Спека: `figma-reader` возвращает её текстом; основная сессия сохраняет в `.figma/<fileKey>/<nodeId>-spec.md` и даёт этот путь этапам 5–8.
- `UX.md` рядом со страницей.
- План файлов от `frontend-architect` — в описание PR.
- Скриншоты: Figma `.figma/<fileKey>/<nodeId>.png`, наши `.figma/<fileKey>/ours-<nodeId>-<ширина>.png`.
- PR: ссылка на фрейм, путь к спеке, `UX.md`, таблица `design-qa`, итог `frontend-reviewer`, допущения и пробелы дизайн-системы.

## 4. Команда агентов

```
design-lead ── ворота и следующий шаг, кода не пишет
  ├─ figma-designer (figma-pack, запись в Figma, нужен Full seat)
  ├─ человек-дизайнер (утверждение)
  ├─ figma-reader (figma-pack, только чтение) → спека
  ├─ frontend-architect → план
  ├─ основная сессия → код по скиллам frontend-pack
  ├─ design-qa → сверка с Figma
  └─ frontend-reviewer → ревью
```

Субагенты не запускают других субагентов. Если `design-lead` вызван как субагент, он возвращает следующий шаг, и агентов запускает основная сессия. Агенты `figma-designer` и `figma-reader` живут в `figma-pack`: не копируй их сюда.

## 5. Чего не делать

- Не вставлять код из `get_design_context`: это референс (`figma-to-react`, раздел 2).
- Не рисовать в Figma без подтверждённого draw plan и без Full seat.
- Не подставлять Inter вместо Inter Mbank молча, не брать `lucide-react` в Mbank-проект.
- Не начинать код до ворот A и B.

## Чек-лист

- [ ] Место и доступ проверены (`whoami`), маршрут выбран: полный или Dev-цепочка
- [ ] Бриф утверждён; черновик прошёл `structure-audit.js` и `lint-design.js`
- [ ] Ворота A: фрейм утверждён дизайнером
- [ ] Спека сохранена в `.figma/<fileKey>/<nodeId>-spec.md`; скриншоты на месте
- [ ] `UX.md` написан и показан
- [ ] План файлов; код по скиллам, ≤ 150 строк, Mbank — кит `mbank-ui` или, без него, code-mapping §7 с пометкой в отчёте
- [ ] `design-qa`: таблица отличий закрыта; `frontend-reviewer`: 0 блокирующих
- [ ] PR с артефактами раздела 3

## Справка

- [references/handoff.md](references/handoff.md) — форматы передачи между этапами и шаблон описания PR
- [references/dev-seat-fallback.md](references/dev-seat-fallback.md) — что делать с Dev seat, без шрифта и без Code Connect
