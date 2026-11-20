export const appLocales = {
  ru: {
    key: 'ru',
    label: 'Русский',
  },
  ky: {
    key: 'ky',
    label: 'Кыргызский',
  },
  en: {
    key: 'en',
    label: 'Английский',
  },
}

export const appLocalesKeys = Object.keys(appLocales)

const i18nConfig = {
  locales: appLocalesKeys,
  defaultLocale: 'ru',
}

export default i18nConfig
