import { AddressState, SearchItem } from './types'

const searchStreet = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}
&countrycodes=KG&addressdetails=1`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return data as SearchItem[]
  } catch (error) {
    console.error('Возникла проблема при поиске улицы:', error)
  }
}

const getAddressByCoords = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.address) {
      throw new Error('Адрес не найден')
    }

    const { road, house_number, city, town, village } =
      data.address as AddressState
    const street = road || ''
    const number = house_number ? `${house_number}` : ''
    const locality = city || town || village || ''

    return {
      name: `${street} ${number}, ${locality}`.trim(),
      number: number,
      ...data.address,
    } as AddressState
  } catch (error) {
    console.error('Возникла проблема при получений адреса:', error)
    return null
  }
}

export const OpenStreetMapApi = {
  searchStreet,
  getAddressByCoords,
}
