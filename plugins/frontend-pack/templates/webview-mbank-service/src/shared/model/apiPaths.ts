export const apiPaths = (() => {
  const checkStatus = '/checkStatus'
  const faq = '/faq'
  const mekka = '/mekka'
  const hadiths = '/hadiths'
  const videos = '/videos'
  const zikr = '/zikr'
  const dua = '/dua'
  const weather = '/weather'
  const ctgr = '/ctgr'
  return {
    ctgr: {
      contact: `${ctgr}/contact/`,
    },
    checkStatus: {
      checkStatus: `${checkStatus}/`,
    },
    user: {
      refresh: `auth/refresh/`,
    },
    calendar: {
      prayerTimes: (id: number) => `prayer/calendar/${id}/`,
      locations: `prayer/calendar/alllocations/`,
    },
    weather: {
      byCity: (id: number) => `${weather}/cities/${id}/`,
      list: `${weather}/cities/`,
    },
    faq: {
      categories: `${faq}/categories/`,
      items: `${faq}/items/`,
    },
    mekka: {
      item: `${mekka}/`,
    },
    hadiths: {
      categories: `${hadiths}/categories/`,
      categoriesDetail: (id: number) => `${hadiths}/categories/${id}/`,
    },
    zikr: {
      items: `${zikr}/items/`,
      categories: `${zikr}/categories/`,
      categoriesDetail: (id: number) => `${zikr}/categories/${id}/`,
    },
    dua: {
      categories: `${dua}/categories/`,
      categoriesDetail: (id: number) => `${dua}/categories/${id}/`,
      detail: (id: number) => `${dua}/items/${id}/`,
    },
    videos: {
      list: `${videos}/`,
    },
    map: {
      locations: `/locations/mosque/`,
    },
  }
})()
