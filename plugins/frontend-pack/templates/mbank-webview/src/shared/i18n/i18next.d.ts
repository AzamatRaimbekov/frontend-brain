import 'i18next'
import type ru from './locales/ru.json'

// Typed keys: t('home.title') is checked by tsc, a typo fails the build.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ru }
  }
}
