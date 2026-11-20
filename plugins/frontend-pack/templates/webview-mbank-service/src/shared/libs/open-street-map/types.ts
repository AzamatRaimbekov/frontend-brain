export interface SearchItem {
  place_id: number
  licence: string
  osm_type: 'relation'
  osm_id: number
  lat: string
  lon: string
  class: 'boundary'
  type: 'administrative'
  place_rank: number
  importance: number
  addresstype: 'country'
  name: string
  display_name: string
  address: {
    country: string
    country_code: 'kg'
  }
  boundingbox: string[]
}

export interface AddressState {
  'ISO3166-2-lvl4': 'KG-C'
  country: string
  country_code: 'kg'
  county: string
  name: string
  postcode: string
  road: string
  state: string
  house_number?: string
  city?: string
  village?: string
  town?: string
  number?: string | number
}
