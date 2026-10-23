# Дизайн-система Mbank: замечания для дизайнеров

Папка Figma «Mbank Tokens» (MDigital LLC): Foundation, Web components, Hero Section, CRM UI KIT, Mobile KIT, Icons.
Дата проверки: 2026-10-07 (Dev-место), обновлено 2026-10-09 полным чтением с Full-места (`use_figma`): все значения переменных, стилей и режимов прочитаны, см. `mbank-figma-patterns/references/tokens.md`. Номера (G01...) совпадают с `catalog.json` → `gaps[]`.

Как читать: **блокер** мешает собирать продукты по системе прямо сейчас; **важно** даёт расхождения между макетом и кодом; **мелочь** касается гигиены и названий. Для каждого пункта указано, что сделать.

## Блокеры

### G01. Нет значений большинства цветов — ЗАКРЫТО 2026-10-09
- Все 256 переменных `2.theme` (light и dark), 23 переменные `1.brand` по 5 режимам, радиусы, `5.rem`, отступы и текстовые стили прочитаны с Full-места. Значения и ключи: `mbank-figma-patterns/references/tokens.md`.

### G02. Режимы (modes) — ЗАКРЫТО, осталось двойное брендирование
- Подтверждено: `2.theme` = `light` / `dark`; `1.brand` = `bank`, `kassa`, `travel`, `artwin`, `koko` (пятый бренд `koko`, розовый `#DA78F2`). В названии режима artwin первая буква не латинская: переименуйте в обычное `artwin`.
- Осталось: в `2.theme` параллельно живут `brand/bank/*`, `brand/kassa/*`, `brand/artwin/*`, `brand/travel/*` (для koko таких нет). Брендировать только режимом `1.brand`; переменные `brand/<продукт>/*` оставить для логотипов и переключателя продуктов или удалить.

### G03. Шрифты — мобайл подтверждён, веб заблокирован
- Подтверждено: мобильные текстовые стили на **Nunito** (коллекция `mobile` в Mobile KIT с режимами `Nunito` / `Inter`, где Inter = Inter Mbank). Веб и CRM на **Inter Mbank**.
- Блокер остаётся: Inter Mbank не загружен как общий шрифт организации, поэтому ИИ не может собирать веб- и CRM-экраны (см. последний раздел). Передайте разработчикам файлы Inter Mbank (woff2) и лицензию.

## Важно

### G04. Тёмная тема: значения есть, но часть выглядит ошибочной
- Что видим (2026-10-09): Dark заполнен у всех 256 переменных `2.theme`. Но:
  - `brand/artwin/ghost-*` и `brand/travel/ghost-*` в dark = `#2563EB33` (синий), хотя artwin жёлтый;
  - `neutral/positive/*` в dark совпадает со светлой темой (`#ECFDF5`, светло-зелёный фон на тёмном экране);
  - `neutral/static/on-accent` dark = `#0E0F11F2` (почти чёрный текст на `neutral/static/default` `#0E0F11`) — нечитаемо;
  - `accent/secondary/flat/on-accent-muted` и `neutral/primary/on-accent-muted` в dark = `#0E0F11F2` — тоже тёмное на тёмном.
- Что сделать: проверить эти пары на контраст в режиме dark и поправить значения. Тёмная тема — только переключением режима, без отдельных Dark-вариантов компонентов.

### G05. Шкала типографики разбросана по китам
- Что видим: текстовые стили лежат в Web components (`font/Heading/h1..h6`, `font/Body/xs..xl` и `-md`), в Mobile KIT (`body/large|medium|small`, `label/*-prominent`), в Starter KIT (`font/Body/small..xlarge`) и в DS:Mbank (camelCase, `bodyLarge_Bold` дважды). В Foundation стилей нет. Метрики прочитаны 2026-10-09: h1 и h2 одинаковые (44/52 Bold) — сделать h2 меньше; Mobile использует отдельную шкалу Material-типа (display/headline/title/body/label). CRM использует `font/Body/s-strong` и `xl-strong`, которых нет в списке Web.
- Что сделать: перенести все текстовые стили в Foundation одной шкалой (display / heading / body / label / caption × regular / medium / bold), семейство шрифта брать из переменной (G03). Из китов стили убрать, оставить только ссылки на Foundation.

### G06. Тени разбросаны и задублированы
- Что видим: в Web components `shadow/none`, `shadow/top/s..xl`, `shadow/bottom/*`, `shadow/modal`, и каждая опубликована дважды (два ключа). В Mobile KIT есть свои `shadow/modal`, `shadow/Default`, `shadow/tooltip`.
- Что сделать: одна шкала теней в Foundation (`shadow/xs..xl`, `shadow/modal`, `shadow/tooltip`), дубли снять с публикации, в китах пересвязать.

### G07. Отступы (spacing) не в Foundation и в трёх схемах
- Что видим: `spacing/*` (Web), `rem/default/*` (Web, CRM), `paddings/default/*` (Mobile, CRM), плюс `3.Spacing` в Starter KIT. Названия не по порядку: `spacing/s-1` = 12, а `spacing/s-3` = 8; `spacing/s-2` = 10 вне сетки 4px. В мобайле `paddings/default/xs` = 2, `xs 2` = 4, `m` = 14 (вне сетки), `m - 2` = 16. В CRM встречается `spacing/m-2-base` и `paddings/default/xs 2` (с пробелом).
- Что сделать: коллекция `spacing` в Foundation на шаге 4px (`space/0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`, то есть 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96). Старые переменные сделать алиасами на новые, затем пометить как устаревшие.

### G08. Скругления задублированы и противоречат друг другу
- Что видим: `1.brand` → `radius/none..full` и `4.border-radius` → `border-radius/xs..xl-4` описывают одно и то же. В шапке CRM `radius/xs` = 8, а в Web `radius/xs` = 4. Mobile KIT держит свою коллекцию `foundation` с другой шкалой: мобильный `radius/m` = 16, а `1.brand` `radius/m` = 12; `radius/s` у мобильного помечен ALL_SCOPES.
- Что сделать: оставить одну коллекцию радиусов (лучше отдельную `radius` в Foundation), вторую сделать алиасами. Исправить привязку в `topHeader` CRM.

### G10. Не хватает состояний
- Фокус с клавиатуры (focus) отсутствует везде: Button, FloatButton, Chips, Tabs, Segment, Switchers, все Input. Это проблема доступности, на вебе без него нельзя.
- Mobile `bttn / default`: нет pressed и focus (есть только default / active / disabled / loading).
- Нет disabled: Chips, Tabs, Segments (Mobile), табы и сегменты в Web.
- `Cell/list item` (Mobile): нет pressed и disabled.
- `inputDropdown` (Mobile): нет active и typing.
- Checkbox / Radio / Toggle: нет error и indeterminate.
- Что сделать: добавить `State=focus` (кольцо 2px цветом `border/accent/brand` поверх обычного состояния), `pressed` и `disabled` там, где их нет.

### G11. В Mobile KIT нет ключевых банковских компонентов
- Нет: skeleton / shimmer (его нет и в Web, есть только в Starter KIT), toast / snackbar (в Mobile только `Top alerts`), date picker (в Web есть календарь), ввод OTP / PIN (в Web есть `otp`), ввод суммы с валютой, ячейка транзакции (иконка, контрагент, сумма, статус), банковская карта (лицевая сторона, маска номера, состояния), pull-to-refresh.
- Что сделать: добавить в Mobile KIT. OTP и календарь можно взять за основу из Web components.

### G12. В CRM UI KIT нет типовых блоков админки
- Нет: панель над таблицей (поиск + фильтры + действия), панель фильтров, пагинация таблицы, раскладка формы, модальное окно / боковая панель (drawer), пустое состояние, skeleton, тост, шапка страницы с табами и хлебными крошками, страница входа.
- Что сделать: собрать как блоки из экземпляров Web components.

### G13. Блоки Hero Section только под десктоп
- Что видим: блоки нарисованы в ширину 1920. Мобильный вариант есть у 5 из 39 (hero-banner, hero-segment, hero-downloadFile, hero-table, hero-banner-default). Планшета нет нигде.
- Что сделать: добавить свойство `Breakpoint=Desktop/Tablet/Mobile` (1440 / 768 / 375) каждому блоку.

### G14. Библиотеки подписаны сами на себя и на чужие киты
- Что видим: CRM UI KIT подключает сам себя. Mobile KIT подключает библиотеку с тем же названием «Mobile KIT» (копия?). Киты используют библиотеки вне папки: Starter KIT (подключён к Mobile KIT), DS:Mbank.
- Что сделать: отключить самоподписки; выбрать каноничный файл Mobile KIT; заменить экземпляры из Starter KIT / DS:Mbank на компоненты из папки; старые библиотеки пометить как устаревшие.

### G15. Нет Code Connect
- Что видим: 0 связей из всех опубликованных компонентов.
- Что сделать (фронтенд): когда появится код, связать в первую очередь Button, семейство Input, Switchers, Badge, Tabs, Dialog.

### G21. Нет сеток и брейкпоинтов
- Что видим: нет переменных брейкпоинтов, нет стилей сеток (layout grid), нет токенов безопасных зон (safe area) для мобайла.
- Что сделать: переменные `breakpoint/sm, md, lg, xl` (640 / 768 / 1024 / 1280), стили сеток на 4 / 8 / 12 колонок, отступы safe area для iOS и Android.

## Мелочи

### G09. Дубль `text&Icon/muted`
- По данным инвентаризации, `text&Icon/muted` повторяет `text/muted`. В выгрузке этой переменной нет, нужно проверить в файле.
- Что сделать: слить в `text/muted` (или переименовать группу, чтобы текст и иконки пользовались одним токеном).

### G16. Опечатки в свойствах и значениях
- `negotive` (bttn / default), `squired` (Badge-status, badge), `Buttom` (Tooltip), `Ttile` (Top-app-bar), `desceiption` (item-stepper-basic), `tetriary` (`border/divider/tetriary`), `Attantion` (alert-text), `Outlned` (40 наборов иконок), а также `Exeption`, `seletedYear`, `pagintaion`, `Coulm`, `mount` (месяц), `seperated`, `hightly` / `Priory`, `Tru`, `3 llines`.
- Что сделать: переименовать. Экземпляры при переименовании значения варианта сохраняют настройки.

### G17. Свойства с названием «Property 1»
- Где: alert-text, accordion, `Item / dropdown / simple`, upload, диалоги, степперы, badge-dot, пункты меню CRM, 50 наборов иконок (вместо `Style`).
- Что сделать: назвать по смыслу: `Status`, `Type`, `State`, `Style`.

### G18. Мусорные варианты и названия
- `tab-outline` и `tab-stepper`: значения quantity `Variant8..Variant21`. `Created by`: `Orientation3..6`. `cursor`: `Variant2`. Кириллическая «С» в `TableСellContent 2.0` и в названии страницы `InputСounter`. Опубликованы `Frame 2087326547` и `Frame 851213252`.
- Что сделать: удалить лишние варианты, переименовать, снять фреймы с публикации.

### G19. Иконки
- 28 повторяющихся имён (2809 записей, 2781 уникальное, например `mbonus-icon` ×2). 50 наборов используют `Property 1` вместо `Style`. 40 наборов со значением `Outlned`. Имена не в kebab-case: `arrow-top left`, `coffee shop`, `Bell`, `Like`, `POS-terminal`, `youtube-symbol-svgrepo-com 1`. Нарисован только размер 24px.
- Что сделать: убрать дубли; везде одно свойство `Style=Line/Outlined/Solid/Duo Tone`; имена в kebab-case; решить, нужен ли отдельный оптический размер 16/20px.

### G20. Z-index только текстом
- Что видим: на странице Z-Index таблица текстом (hide -1, default 0, dropdown 1000, sticky 1100, fab 1200, overlay 1300, loader 1400, modal 1500, toast 1600, popover 1700, tooltip 1800).
- Что сделать: числовая коллекция `z-index` в Foundation с теми же значениями и WEB code syntax (`var(--z-modal)`).

### G22. Опубликованы черновики
- Страницы «Draft» и «in process» в Hero Section, копия `sideMenu/type4` за пределами холста в CRM, компоненты на странице «🔥 To Do» в Mobile KIT (`ElementFile`, `Help / StatusElementFile`).
- Что сделать: доделать или снять с публикации.

### G23. Одинаковые имена компонентов
- `dialogForm` ×2, `tab-outline` ×2, `ImageSlot` ×2, `molecules / Calendar-items` ×2, `hero-possibility` ×2, `logoCont` ×2, `Modal: List` и `Modal: list`, в Mobile два компонента `input` (обычный и пароль).
- Что сделать: дать каждому уникальное имя.

### G24. Взрыв вариантов
- `button/default` до 450 вариантов (5 размеров × 9 видов × 5 состояний × neutralState), `Avatars` 15 размеров × флаги, `item/cell/basic` с шириной как вариантом (66 вариантов).
- Что сделать: ширину задавать auto-layout (fill / fixed), а не вариантами; `neutralState` вынести в отдельное свойство тона.

### G25. Области применения (scopes) и code syntax
- `brand/*` и `text/default` с ALL_SCOPES; примитивы (`black/*`, `white/*`) доступны для выбора везде; WEB code syntax у переменных не замечен.
- Что сделать: задать scopes по роли (заливки, обводки, текст), скрыть примитивы от публикации, прописать WEB code syntax по таблице `code-mapping.md`.

### G26. Web и Mobile называют одно и то же по-разному
- `button/default` и `bttn / default`, `Switchers - Check` и `switches`, `Badge-status` и `badge`; русские названия свойств в Hero Section («Тип блока», «Фикс размер»).
- Что сделать: одинаковые имена и одинаковый набор свойств в обоих китах, свойства на английском.

### G27. Мобильные платформы покрыты неравномерно
- `Top-app-bar` только шириной 360; нет диалога и snackbar для Android; Keyboard и `alert-ios` только для iOS.
- Что сделать: добавить app bar под iOS 393, диалог и snackbar под Android.

### G28. Компоненты Mobile KIT с заглушками по умолчанию
- Что видим: `Top-app-bar` по умолчанию содержит статус-бар **Android** (на iOS его надо переключать вручную); `bttn / default` по умолчанию показывает две иконки-заглушки (кружки) и счётчик; `Avatars` по умолчанию с иконкой камеры; `Tab Bar` с иконками-треугольниками.
- Чем мешает: каждый новый экран сначала выглядит «сломанным», легко пропустить заглушку.
- Что сделать: в вариантах по умолчанию выключить иконки и счётчик у кнопки, у аватара включить `Placeholder`, в таб-баре поставить реальные иконки (home, swap-arrow-horizontal, wallet, time, more-menu); у Top-app-bar добавить свойство Device или вариант iOS.

### G29. Скрытые слои со шрифтом в CRM-компонентах
- Что видим: в `topHeader` есть скрытый текст «Поставщик», в `Widget-Chart` скрытый текст `Date`; в `TableSection 2.0` и `TableCell` тоже есть скрытые текстовые слои. До них нельзя достучаться из экземпляра, поэтому, пока шрифта нет, эти компоненты нельзя вставить даже после замены шрифта. ИИ отвязывает (detach) их в черновиках.
- Что сделать: удалить неиспользуемые скрытые слои или вынести их в свойства (boolean и текст), например показать роль пользователя в `topHeader`. В CRM UI KIT добавить карточку метрики (KPI), строку «поле — значение», пункт истории статусов, карточку канбан-доски и горизонтальный степпер этапов (сейчас в черновиках это локальные компоненты, см. G12; степпер в Web components есть, но на Inter Mbank).

## Что нужно от дизайнеров в первую очередь
1. Загрузить Inter Mbank как общий шрифт организации (G03, последний раздел) — без этого ИИ не собирает веб и CRM.
2. Проверить тёмную тему по списку G04.
3. Состояние focus и недостающие disabled/pressed (G10).
4. Недостающие мобильные компоненты (G11) и заглушки по умолчанию (G28).
5. Одна шкала отступов и радиусов в Foundation (G07, G08).

## Проверено 2026-10-07: шрифты в Figma MCP

- **Блокер:** шрифта **Inter Mbank** нет среди шрифтов организации, доступных Figma MCP. Компоненты Web components, Hero Section и CRM UI KIT нельзя вставить через ИИ. **Исправление:** админ Figma в MDigital LLC загружает Inter Mbank как общий шрифт организации (Admin → Fonts → Upload).
- **SF UI Display** (статус-бар iOS в Mobile KIT) тоже недоступен. ИИ сейчас подменяет только время в статус-баре на SF Pro. **Исправление:** заменить шрифт статус-бара в Mobile KIT на SF Pro или загрузить SF UI Display.
- Проверено ещё раз 2026-10-09 с Full-места: доступны Inter, Nunito, Nunito Sans, SF Pro, SF Pro Rounded, SF Compact, Roboto; Inter Mbank и SF UI Display по-прежнему нет.
- Nunito и Roboto доступны: мобильные экраны ИИ собирает.
- 2026-10-12: Inter Mbank по-прежнему нет. CRM переводов собран как черновик на Inter с согласия пользователя (страница «CRM / Переводы» в тестовом файле). После загрузки шрифта его переводят на Inter Mbank одним скриптом (`mbank-figma-patterns/references/crm-screen.md`, раздел 6).
- 2026-10-12: тем же способом собран черновик «CRM / Кредитный конвейер» (доска этапов и карточка заявки); новый локальный компонент `CRM / Application card`.
