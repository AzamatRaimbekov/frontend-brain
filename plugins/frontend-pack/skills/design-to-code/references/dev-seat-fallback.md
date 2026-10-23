# Запасная цепочка: Dev seat, нет шрифта, нет Code Connect

## Что даёт какое место

| Место | Чтение (`get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot`) | Запись (`use_figma` с изменениями, `create_new_file`, Code Connect) |
|---|---|---|
| Full | да, 200 в день (Starter, Pro) / 600 (Org, Enterprise) | да |
| Dev | да, те же лимиты | **нет** |
| View / Collab | 6 вызовов в месяц (20 на Starter) | нет |

Источник: `figma-pack:figma-core`, раздел 2. Дополнительно нужен доступ **can edit** на файл или папку: с can view MCP отказывает даже в чтении.

## Dev seat: код по существующему фрейму

Агент не рисует. Цепочка:

1. **Draw plan текстом.** Если макета ещё нет, `figma-designer` (или основная сессия по `figma-design` §3) готовит бриф и draw plan с ключами компонентов каталога — без записи в Figma. Дизайнер собирает экран сам из библиотеки по этому плану.
2. **Утверждение** как обычно: без `[draft]`, Section в Ready for dev (ворота A).
3. **Спека** — `figma-reader` (чтение на Dev seat работает).
4. Дальше этапы 5–10 без изменений: `UX.md`, план, код из кодового кита, `design-qa`, `frontend-reviewer`, PR.

Скажи пользователю в начале: «Место Dev: рисовать в Figma агент не может, нужен Full seat. Работаю по готовому фрейму дизайнера».

## Нет Inter Mbank (G03)

- В Figma: web/CRM экраны Mbank агент собирает только как `[draft]` на Inter и только с согласия пользователя (`mbank-figma-patterns`, `references/crm-screen.md` §0). Такой черновик дизайнер переводит на Inter Mbank после загрузки шрифта (`crm-screen.md` §6), иначе он не проходит ворота A.
- В коде: `--font-sans` с Inter Mbank первым и запасными шрифтами следом (`mbank-design-system/references/code-mapping.md` §4). Пока файлов шрифта нет, в отчёте и PR пишется «Inter Mbank не подключён, отрисовано запасным шрифтом».

## Нет Code Connect (G15)

Сейчас 0 привязок. Замена — детерминированный порядок поиска компонента в `figma-to-react/references/mbank-web.md` §3: Code Connect → `code.web` и `props` в каталоге → список `mbank-ui` → `code-mapping.md` §7. Вариант Figma без соответствующего prop — строка несовпадения в спеке, вопрос пользователю.

## Нет MCP или нет места вообще

`figma-core` §5: попросить PNG каждого фрейма и значения из Dev Mode, писать спеку в том же формате с пометкой «по скриншоту, не проверено». `design-qa` сравнивает с этими PNG.

## Что попросить у админа организации

- Full seat тому, кто запускает агента-дизайнера.
- Загрузить Inter Mbank как шрифт организации (Admin → Fonts).
- Доступ can edit на папку Mbank Tokens и на продуктовые файлы.
