import { type UnknownObject } from './types'

export const hasKey = (obj: UnknownObject, key: string) => key in obj
