import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { host } from '@/shared/bridge'
import en from './locales/en.json'
import ky from './locales/ky.json'
import ru from './locales/ru.json'

// Russian is the source: every key exists there; ky and en fall back to it if a key is missing.
export const resources = { ru: { translation: ru }, ky: { translation: ky }, en: { translation: en } } as const

let following = false

const apply = (lang: string) => {
  document.documentElement.lang = lang
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
}

/** Starts i18next in the app language and follows the app when the person switches it. Safe to call twice. */
export function initI18n() {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: host.getState().lang,
      fallbackLng: 'ru',
      interpolation: { escapeValue: false },
    })
  }
  apply(host.getState().lang)
  if (!following) {
    following = true
    host.subscribe(() => apply(host.getState().lang))
  }
}

export { i18n }
