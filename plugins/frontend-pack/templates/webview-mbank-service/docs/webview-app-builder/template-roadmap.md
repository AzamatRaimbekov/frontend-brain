# React Template Roadmap

Статус: подтверждено целевое направление миграции template. Runtime-миграцию делать по отдельным задачам, не одним большим рефактором.

## Текущий template

Путь:

```txt
/Users/anixii/react-md/template-app
```

## Целевой стек

Подтверждено:

- React + Vite;
- Redux Toolkit / RTK Query;
- Tailwind CSS 4;
- Base UI / shadcn-style shared components;
- `md-glyphs` / локальный `src/shared/iconpack` для иконок;
- `react-hook-form` для форм;
- без `antd` и `antd-mobile` для новых экранов;
- Storybook не входит в обязательный план template.

## Подтвержденные решения

- Shared UI component set считается в основном собранным; дальнейшая работа - точечная полировка API, states и замена legacy usage.
- Навигационный слой и правила API/error/loading states уже есть; миграция должна использовать существующие паттерны.
- MBANK Bridge helper уже работает корректно, но его нужно добить как стандарт template: fallback "обновите приложение", capabilities, typed native actions и единое поведение ошибок.
- Глобальные notifications оставляем: текущий слой переписан под shadcn/sonner и используется `queryErrorLogger`.
- Формы переводятся полностью на `react-hook-form`; `antd Form` не является целевым API.
- Runtime `RcFile`, `UploadFile` и другие `antd` upload-типы не используются; для новых форм использовать native `File` / `Blob` / shared `FileUploader`.
- `antd` и `antd-mobile` уже удалены из runtime/package dependencies; новые экраны не должны возвращать эти зависимости.
- Dependency audit начат: удалены неиспользуемые dnd/yandex/media/webcam/swiper/redux-persist/storybook зависимости.

## Provider strategy

`AntProvider` не заменяется другим UI-provider один-в-один. Его обязанности нужно разнести:

- глобальные стили и шрифты: `StyleProvider` + `global.css`;
- единый font-family: задать через CSS variables на `html`, `body`, `button`, `input`, `textarea`, `select`;
- theme: существующий `ThemeProvider` + `data-theme` на `document.documentElement`;
- locale для `antd`/`antd-mobile`: удалить вместе с библиотеками;
- `antd App` wrapper: удалить;
- notification API: оставить на текущем shadcn/sonner-based слое.

## Порядок миграции

1. Зафиксировать глобальный font-family без `AntProvider`.
2. Перевести формы на `react-hook-form` pattern.
3. Добить bridge fallback/capabilities/actions как стандарт template.
4. Завершить dependency audit: проверить, какие build/dev plugins реально нужны.
5. Проверить `yarn lint:type`, `yarn lint:eslint`, `yarn lint:prettier`, `yarn build`.

## Уже начато

- создан typed bridge helper в `src/shared/mobile-bridge`;
- поддержаны оба уровня API: универсальный `callMobile` и typed методы;
- добавлено Sentry-логирование bridge-ошибок на уровне helper;
- добавлен doc `references/mbank-bridge-helper.md`.
- `antd` и `antd-mobile` удалены из runtime-кода и dependencies.
- common header переписан без `antd`.
- Storybook scripts/deps/config удалены; ручная проверка shared UI идет через `/ui-kit`.
- Runtime upload audit выполнен: `RcFile`/`UploadFile` остались только в документации как запрет/legacy reference.
