import { type UnknownObject } from './types'

export const isPlainObject = (value: unknown): value is UnknownObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
