import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

import { initReactI18next } from 'react-i18next'

import { i18nNamespaces } from './i18Namespaces'
import i18nConfig from './i18nConfig'

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: i18nNamespaces[0],
    ns: i18nNamespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
