import { TFunction } from 'i18next'

export const regions = {
  BISHKEK: 'BISHKEK',
  OSH_CITY: 'OSH_CITY',
  CHUY: 'CHUY',
  OSH: 'OSH',
  DJALAL_ABAD: 'DJALAL_ABAD',
  BATKEN: 'BATKEN',
  IK: 'IK',
  NARYN: 'NARYN',
  TALAS: 'TALAS',
} as const
export const regionOptions = (t: TFunction) => [
  {
    label: t('regionOptions.bishkek'),
    value: regions.BISHKEK,
  },
  {
    label: t('regionOptions.osh_city'),
    value: regions.OSH_CITY,
  },
  {
    label: t('regionOptions.chuy'),
    value: regions.CHUY,
  },
  {
    label: t('regionOptions.osh'),
    value: regions.OSH,
  },
  {
    label: t('regionOptions.djalal_abad'),
    value: regions.DJALAL_ABAD,
  },
  {
    label: t('regionOptions.batken'),
    value: regions.BATKEN,
  },
  {
    label: t('regionOptions.ik'),
    value: regions.IK,
  },
  {
    label: t('regionOptions.naryn'),
    value: regions.NARYN,
  },
  {
    label: t('regionOptions.talas'),
    value: regions.TALAS,
  },
]

export type RegionOptionsType = (typeof regions)[keyof typeof regions]
export const getRegionCoords = (
  region: keyof typeof regions,
): [number, number] => {
  switch (region) {
    case regions.BISHKEK:
    case regions.CHUY:
      return [42.8746, 74.5698] // Бишкек
    case regions.OSH_CITY:
    case regions.OSH:
      return [40.5135, 72.816] // Ош
    case regions.DJALAL_ABAD:
      return [40.933, 73.0] // Джалал-Абад
    case regions.BATKEN:
      return [40.0661, 70.8194] // Баткен
    case regions.IK:
      return [42.4958, 78.3959] // Иссык-Куль
    case regions.NARYN:
      return [41.4287, 75.991] // Нарын
    case regions.TALAS:
      return [42.5228, 72.2428] // Талас
    default:
      return [42.8746, 74.5698] // По умолчанию Бишкек
  }
}
