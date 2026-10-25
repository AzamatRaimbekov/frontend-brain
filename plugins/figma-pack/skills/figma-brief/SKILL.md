---
name: figma-brief
description: The question gate before any design work in Figma at Mdigital. Asks the user the few questions that change the result (product and role, platform and widths, screens and flow, states, data density, brand mode, where in the file), with ready answer options and a recommended default taken from our design system, then plays back a short brief and waits for "да" before anything is drawn. Also covers how to ask at forks during the build (missing component, font not available, kit bug). Used by figma-design before the frame plan; runs in the main conversation because the figma-designer agent cannot ask questions. Triggers - "нарисуй", "создай макет", "сделай экран/страницу/CRM/дашборд в фигме", "что спросить перед дизайном", "бриф для макета", "design brief", "ask before designing".
---

# Brief by questions (Mdigital)

A wrong guess costs a whole redraw; a question costs one click. Ask the questions whose answer changes the frames, show options so the user only picks, recommend the option our design system supports best, and never ask what the request, the repo, the catalog or the file already answer.

Adapted from obra/superpowers `brainstorming` (one decision at a time, play back, hard approval gate) and the brief formats of `frontend-pack:react-page-ux` and `figma-design/references/briefs.md`.

## 1. Before asking: collect what is already known (no questions yet)

1. The request text: product, screens, platform words ("CRM", "мобилка", "лендинг").
2. The catalog (`.figma/design-system.json`, or `mbank-design-system` for Mbank): kits, brand modes, fonts and their availability, components that exist and gaps.
3. The target file: one read-only `use_figma` that lists pages, sections and top-level frames (the `figma-structure` audit script does this). The file's existing conventions win.
4. Related code in the repo (routes, entities, statuses) when the design is for an existing product.

Write every known answer down as a fact; it does not become a question.

## 2. Ask: one AskUserQuestion call, at most two rounds

- Use the `AskUserQuestion` tool: **up to 4 questions per call**, 2-4 options each, the recommended option **first** with "(Рекомендую)" in its label, one-line consequences in the description. The user can always type "Other".
- **Round 1** = the questions from section 3 that are still open, most important first (max 4). **Round 2** only if an answer opened a new fork (e.g. "обе платформы" -> which first). Never a third round: what is still unknown becomes a written assumption in the brief.
- Ask in the user's language (Russian by default). Short questions, no jargon the user did not use.
- Use `multiSelect: true` only where several answers make sense together (states, roles).
- Skip a question when the catalog leaves one sane answer (e.g. only one kit fits).
- The user said "сразу", "без вопросов", "делай" or already approved the same kind of work in this conversation: do not ask. Take the recommended option of every open question, and put the list of these choices in the first lines of the report ("Выбрал без вопросов: ...") so the user can correct them. A choice that affects other people's work (moving or deleting their frames, a font fallback never approved before) is still asked.

## 3. Question bank (pick the open ones)

| # | Question | Options (first = default) | Skip when |
|---|---|---|---|
| 1 | Кто пользователь и что он делает на этих экранах? | роль из запроса / оператор поддержки / клиент / администратор | role is in the request |
| 2 | Платформа и ширины? | Веб 1440 (Рекомендую для CRM) / Веб 1440 + 375 / iOS 393 / Android 360 / iOS + Android | platform is clear |
| 3 | Какие экраны входят в первый заход? | the 2-4 screens you infer (list, detail, dashboard, form) / только главный экран / весь флоу | the user listed screens |
| 4 | Какие состояния рисуем? (multiSelect) | Default + Empty + Error + Loading (Рекомендую) / только Default / + Нет доступа / + Валидация формы | the user named states |
| 5 | Плотность данных? | Плотная таблица 40-44 px строки (Рекомендую для CRM) / Карточки / Смешанно | not a data screen |
| 6 | Бренд и тема? | бренд из каталога (bank, kassa, ...) / светлая (Рекомендую) / светлая + тёмная | one brand, no dark mode |
| 7 | Главное действие экрана? | the verb you infer ("Одобрить перевод") / нет главного действия / другое | obvious from the request |
| 8 | Куда положить в файле? | новая страница "<Продукт> / <Флоу>" (Рекомендую) / существующая страница X / новый файл | file has no pages yet or the user said where |
| 9 | Чего нет в ките - как быть? | локальный компонент на странице Components + предложение дизайнерам (Рекомендую) / заглушка "Missing: ..." / ждать дизайнеров | catalog covers everything |
| 10 | Шрифт продукта недоступен в Figma MCP - как быть? | черновик на ближайшем доступном шрифте с пометкой [draft] (Рекомендую) / ждать загрузки шрифта / только план | the font loads |
| 11 | Роли и доступы? (multiSelect) | одна роль / оператор + супервайзер / + только чтение | single-role product |
| 12 | Реальные данные или примеры? | правдоподобные примеры (Рекомендую) / данные из репозитория/API / пустые шаблоны | data source is given |

Question 10 and 9 come from verified blockers (`mbank-figma-patterns`, `crm-screen.md`): ask them up front when the check in section 1 already shows the problem.

## 4. Play back the brief, then the hard gate

After the answers, post a short brief (8-15 lines) and the frame list, then stop:

```
Бриф
Продукт / роль: <...>; задача пользователя: <...>
Платформа: <web 1440 | iOS 393 | ...>; бренд: <bank>; тема: <light>
Экраны (раздел -> экран -> состояния):
  CRM / Переводы -> Список (Default, Empty, Error, Loading), Карточка (Default, Нет доступа)
Главное действие: <...> (одно на экран)
Данные: <плотность, колонки, статусы>
Кит: <components/blocks>; пробелы -> <local component on Components / Missing:>
Файл: <file>, страница "<...>" (новая / существующая), секции по экранам
Допущения: <what was not asked>
Нарисовать так? Ответьте "да" или поправьте.
```

Nothing is written to Figma until the user answers "да" (or equivalent) **to this brief**. The `figma-designer` agent gets the brief and the user's words verbatim; its own draw-plan confirmation still applies.

## 5. Questions during the build (forks)

When reality differs from the brief (an import fails, a component cannot be inserted, a font is missing, the kit has a bug), stop and ask **one** `AskUserQuestion` with 2-3 concrete options and a recommendation, e.g. "Компонент topHeader не вставляется без шрифта -> 1) отвязать только шапку, остальное оставить связанным (Рекомендую) 2) нарисовать шапку из примитивов 3) остановиться". Never silently substitute; record the decision in the report.

## 6. Do not

- Do not ask more than 8 questions in total, or questions without options.
- Do not ask about things the design system fixes (colours, radius, spacing, font family when it loads).
- Do not ask "are you sure?" after a clear answer; do not re-ask a decision the user already made in this conversation.
- Do not start drawing "to show something" before the "да".
