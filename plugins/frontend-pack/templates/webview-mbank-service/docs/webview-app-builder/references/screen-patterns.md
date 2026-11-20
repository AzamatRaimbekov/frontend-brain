# Screen Patterns

Статус: ожидает фактическую базу знаний от пользователя.

Сюда нужно разложить типовые экраны:

- list/detail/create/edit;
- CRUD;
- dashboard;
- settings;
- onboarding;
- wizard;
- approval flow;
- profile;
- search/filter screen;
- empty state screen;
- error recovery screen.

## Result/status screens

Для экранов результата использовать `src/shared/ui/ResultView`.

Подтвержденные правила:

- контент результата находится по центру экрана;
- основное действие находится снизу и учитывает safe area;
- нижнее действие может быть кнопкой, ссылкой или другим ReactNode, который играет роль кнопки;
- close action выводится через внешний header;
- close action по умолчанию ведет на `/`, если не передан отдельный handler;
- close action можно отключить;
- высота экрана по умолчанию `min-h-dvh`, но может быть переопределена через `className`.

Стандарт иконок:

- успешный кейс: `applicationAccepted` из `@shared/iconpack`, обычно `size={56}`, цвет `var(--color-brand)`;
- ошибка, отказ или неуспешный кейс: `face` из `@shared/iconpack`, обычно `size={56}`, цвет `var(--color-secondary)`.

При проектировании нового WebView result/status screen нужно уточнять:

- какой статус показываем: success, error, rejected, pending или другой;
- какой текст title/subtitle нужен пользователю;
- нужно ли показывать close action;
- куда ведет close action, если не `/`;
- какое нижнее действие нужно и должно ли оно быть fixed-bottom behavior.
