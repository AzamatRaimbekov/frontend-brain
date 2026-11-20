# Project Questionnaire

Статус: частично заполнено. Основные bridge-вопросы вынесены в `intake-questions.md`.

Сюда нужно разложить вопросы перед созданием нового проекта или экрана:

- тип экрана или приложения;
- пользователь;
- главная задача;
- данные;
- действия пользователя;
- формы и поля;
- возможные ошибки;
- loading/empty/error/success states;
- навигация;
- back/close;
- API;
- API error handling: global notification, inline error, separate screen, skip notification;
- роли/permissions;
- ограничения WebView;
- Storybook;
- acceptance criteria.

## Bridge checklist для нового проекта

- Проект будет работать через `MBANK WebView Bridge`; нужен ли экран "обновите приложение" для старых версий без bridge?
- Какие `allowedOrigins` нужны?
- Какие capabilities нужны?
- Какие event type будет вызывать фронт?
- Поддерживается ли `token=GUEST` без auth bootstrap?
- Нужен ли явный `requestMobileAuth()` при входе или только перед защищенным действием; кто владеет startup gate?
- Нужен ли opt-in `AuthProvider` для backend auth bootstrap по обычному token?
- Нужен ли `payment.start` и какие поля известны фронту?
- Нужен ли `pdf.previewUrl` или `pdf.previewBase64`?
- Нужны ли `external.open`, `deepLink.open`, analytics, adjust, biometry, device report?
- Как фронт логирует bridge-ошибки?
- Что пользователь видит, если bridge недоступен?
