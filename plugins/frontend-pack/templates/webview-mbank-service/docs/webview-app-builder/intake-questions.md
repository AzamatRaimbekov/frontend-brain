# Intake Questions

Этот файл нужен, чтобы постепенно собрать фактическую базу знаний. Не нужно задавать все вопросы сразу: выбирай блок, который пользователь готов описывать сейчас.

Статус после 3 июля 2026: общий контекст WebView частично заполнен. Следующий важный блок - новая реализация `MBANK WebView Bridge`.

## 0. Срочные вопросы по MBANK WebView Bridge

1. Какие user-friendly тексты показывать при `bridgeUnavailable`, `missingCapability`, `forbiddenOrigin`, `handlerFailed`?
2. Какой минимальный набор bridge events должен быть покрыт ручными тест-кейсами перед релизом, если отдельного test stand нет?

Уже подтверждено техподдержкой:

- Базовых capabilities нет; каждый сервис должен запрашивать нужные capabilities у MBANK.
- Capabilities и `allowedOrigins` заводит техподдержка.
- Для dev/test/prod origins нужно заводить отдельные значения.
- Фронт не хранит список capabilities, а обрабатывает `missingCapability`.
- Query params (`token`, `theme`, `lang`) продолжают приходить как раньше.
- Первичная авторизация и вызовы роутов остаются такими же.
- Bridge дополняет старый flow native-действиями, но не заменяет вход по query token.
- После rollout новые WebView используют bridge; legacy URL/AJAX-перехваты перестают работать.
- Если у пользователя старая версия приложения без `window.MBankBridge`, показывать просьбу обновить приложение.
- В template нужны typed helpers в `src/shared`.
- Нужны оба слоя API: универсальный `callMobile(type, payload)` и typed методы.
- В template есть local mock bridge: localhost по умолчанию получает mock, а `?mbankBridge=mock` и `?mbankBridge=disabled` возвращают успешные mock results. Это не заменяет проверку реального native handler.
- Bridge-ошибки логировать в Sentry.
- Пользователю показывать дружелюбные сообщения без технических слов.
- Для `bridgeUnavailable` можно делать retry.
- Rollout bridge: `3 августа 2026`.
- Новые WebView всегда работают через `window.MBankBridge`.
- Для `bridgeUnavailable` делать 3 retry-попытки с задержкой 1 секунда.
- Отдельного тестового стенда для bridge events нет.
- В базовом typed helper template нужны все bridge events: close, auth, payment, share, pdf, external links, deep links, analytics, adjust, biometry, device report.

## 1. Общий контекст WebView

Уже зафиксировано:

- WebView открывается внутри мобильного приложения MBANK.
- Входы разные: баннер, push, внутренние переходы; под капотом обычно deeplink.
- WebView открывается как отдельный экран.
- Есть native header, отключается только через MBANK/техподдержку.
- Видна верхняя системная область устройства.
- Платформы: iOS и Android.
- По домену можно открыть в браузере, но без token полноценный сценарий не работает.
- Лучше запрещать reload/zoom; pull-to-refresh делать только осознанно.
- При новом входе в WebView начинается новая сессия.
- Минимальные версии iOS/Android/WebView не фиксируются.
- Отличий bridge между iOS и Android сейчас нет.
- Pull-to-refresh отвечает frontend.
- Zoom нужно полностью блокировать через `meta viewport`.
- В template нужен стандартный fallback для браузера без token/bridge.

## 2. Данные, авторизация и стартовые параметры

Уже зафиксировано:

- MBANK прокидывает query params, но некоторые параметры могут забыть.
- Главные параметры: `token`, `lang`, `theme`.
- `token` уникальный, живет около 5 минут.
- Точный `token=GUEST` означает guest-режим; frontend не делает backend auth-запрос и не вызывает `auth.required` автоматически.
- При обычном token фронт вызывает свой backend auth endpoint.
- Backend получает данные пользователя у MBANK и ставит собственные cookies.
- После успешной авторизации frontend больше не использует MBANK token.
- `lang`: `ky`, `ru`, `en`.
- `theme`: `light`, `dark`.
- Query params сохраняются в `sessionStorage`.
- В `localStorage` лучше ничего не хранить.
- Наш backend refresh flow обрабатывается backend/cookie-логикой.

- Стандартного backend auth endpoint нет; для каждого проекта уточнять у backend.
- Если token отсутствует, `TokenProvider` показывает not found/error screen и просит перезайти в сервис.
- `device-id`, `user-authority`, `chanel` сохранять в `sessionStorage`, если они нужны проекту.
- Если `lang` не пришел, default: `ru`.
- Если `theme` не пришла, default: `light`.
- Данные авторизованного пользователя в Redux хранить по потребностям проекта.
- При logout/close достаточно новой WebView-сессии.
- Если guest-пользователь выполняет защищенное действие, экран явно вызывает `requestMobileAuth()` через `@shared/mobile-bridge`.
- Если авторизация нужна при входе, проект добавляет явный startup gate с `requestMobileAuth()`; `AuthProvider` подключается только проектами, которым нужен backend auth bootstrap по обычному token.

## 3. Native bridge и deeplinks

Уже зафиксировано:

- Новый API: `window.MBankBridge.invoke(type, payload)`.
- Версия контракта: `1`.
- Прямой вызов `window.flutter_inappwebview.callHandler(...)` запрещен.
- Native actions выполняются через event type и capabilities.
- Deeplink в новой схеме вызывается через `deepLink.open`.

Открытые вопросы:

1. Какие deeplink-схемы разрешены: только `mbank://` или другие?
2. Какие native-действия обязательно проверять вручную в реальном MBANK WebView, помимо local mock?

Уже уточнено:

- `app.close`, `auth.required`, `payment.start`, `pdf.previewUrl`, `pdf.previewBase64`, `external.open`, `deepLink.open` можно реализовать в typed helpers.
- Для PDF лучше `pdf.previewUrl`, но можно реализовать и `pdf.previewBase64`.
- Payment flow: сначала frontend дергает backend, после успешного ответа вызывает `payment.start`.
- External links решаются через capabilities/origin.
- `share.text`, analytics, adjust, biometry и device report нужны в базовом typed helper template.

## 4. Навигация

Уже зафиксировано:

- Back работает через navigation `-1` или native back, в зависимости от сценария.
- Close полностью закрывает WebView независимо от текущего route.
- Android system back, по текущему пониманию, обрабатывает frontend.
- На первом экране back может автоматически закрыть WebView.
- Nested routes допустимы, если нужны сценарию.
- В основном используются steppers.
- Confirm при dirty state зависит от проекта.
- Reload не должен быть частью сценария.
- Для `auth.required.redirectUrl` default: главная route; другое поведение уточнять отдельно.
- Если `deepLink.open` открывает новый flow, он открывается поверх текущей WebView; после закрытия нового flow пользователь возвращается в исходную WebView.
- `app.close` требует capability `close`, как в документации.
- Payload для `app.close` использовать по документации/сценарию.

## 5. UI best practices

Уже зафиксировано:

- UI должен ощущаться как часть мобильного приложения.
- Не делать WebView как обычный сайт.
- Рекомендуемый максимальный контейнер примерно `528-628px`.
- Loading states: skeleton/shimmer, spinner, full-page spinner.
- Основной token-шрифт: `Nunito mbank`.
- Bottom sheets допустимы, в том числе вместо select-паттернов.
- Primary action размещать выше secondary action.
- Fixed bottom actions допустимы, если нужны.
- Анимаций почти нет.
- Цветовые и typography tokens зафиксированы в `references/ui-best-practices.md`.

Открытые вопросы:

1. Какая максимальная ширина точная: `528`, `628` или зависит от проекта?
2. Как использовать Inter, если основной token-шрифт `Nunito mbank`?
3. Какие компоненты входят в MVP UI kit, а какие остаются backlog?
4. Какие loading/error/empty/success компоненты должны быть стандартными?
5. Какие spacing/radius/elevation tokens использовать?

Уже зафиксировано:

- Подробную UI system документацию пока пропускаем до этапа разработки UI.
- Предварительный список компонентов хранится в `references/ui-component-inventory.md`.

## 6. Формы

Уже зафиксировано:

- Есть два основных типа форм: простая submit-form и многоэтапная editable/autosave-form.
- В многоэтапной форме поля сначала сетятся в Redux, потом подтягиваются как `initialState`.
- `onValuesChange` меняет поля и при необходимости делает запрос на изменение.
- `initialState` нужно подтягивать оптимизированно, чтобы не было лишних рендеров.
- Обычная форма или wizard/stepper зависят от проекта.
- Validation показывать под input friendly-текстом.
- При submit/continue скроллить к первой ошибке.
- API errors показывать под конкретным input, если поле найдено.
- Общие API errors показывать выше submit button.
- Submit loading: disable button и показать loader icon.
- Disabled state должен поддерживаться.
- File upload будет кастомным input через shared `FileUploader`.
- `react-hook-form` установлен и является стандартом для новых форм.
- Для autosave `onValuesChange` использовать debounce `500ms` через `src/shared/libs/debounce`.
- Form state в Redux хранить по ключам.
- Dirty confirm зависит от требований: не дать выйти, сохранить или показать modal.
- File upload работает через `base64`; backend-сценарий уточнять: presigned url или direct base64 PATCH.
- Частые маски: телефон, госномер авто, валютные значения.

Открытые вопросы:

1. Какие конкретные regex/format правила использовать для телефона, госномера и валюты?
2. Какой стандартный UI для confirm при выходе из dirty form?
3. Какой backend file upload сценарий используется в конкретном проекте: presigned url или direct base64 PATCH?

## 7. Ошибки, баги и отладка

Уже зафиксировано:

- Bug reporter должен использовать формальный формат из `references/debugging-playbook.md`.
- Агент должен классифицировать баг как UI/API/Auth/Bridge/Form/Navigation.
- Агент должен ссылаться на релевантные docs и code files.
- Агент должен выдавать suspected cause, proposed fix и verification.
- API errors приходят через RTK Query.
- Базовая обработка находится в `src/shared/api/rtk-query/lib/queryErrorLogger.ts`.
- Эту логику можно оставить как основу.
- Для endpoint-specific поведения можно skip global notification и обрабатывать ошибку на уровне компонента.
- Critical errors можно парсить по code/status и показывать отдельный screen.
- 401 при auth показывает error screen на уровне `AuthProvider`.
- 401 в обычном API flow запускает refresh.
- 403 зависит от endpoint.
- 500 показывать как friendly notification про технические работы.
- Не использовать слово "Ошибка" в пользовательских текстах.
- Использовать info icon / info-тональность и friendly wording.

Открытые вопросы:

1. Какие баги уже часто встречались в WebView?
2. Какие баги связаны с клавиатурой, safe area, scroll или viewport?
3. Какие баги связаны с auth/session?
4. Какие баги связаны с API/loading/error states?
5. Как должен выглядеть хороший bug report?

Bridge-вопросы:

9. Какие реальные bridge-ошибки уже встречались на тестах?
10. Какие ошибки считаются пользовательскими, а какие интеграционными?

Уже уточнено:

- `error.details` логировать для разработчиков, пользователю показывать дружелюбный текст.
- Bridge-ошибки отправлять в Sentry.
- Для `bridgeUnavailable` можно делать retry.

## 8. React template

1. Какие части template точно нужно сохранить?
2. Какие части legacy и будут удалены?
3. Нужен ли shared `FormField` wrapper поверх `react-hook-form` или достаточно локальной composition через `Controller`?
4. Какие зависимости после dependency audit должны остаться как зарезервированные для будущих экранов?
5. Какие проверки обязательны перед сдачей изменений?
