export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassDictionary
  | ClassArray
export type ClassDictionary = Record<string, boolean | undefined | null>
export type ClassArray = ClassValue[]

function toVal(mix: ClassValue): string {
  let str = ''

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix
  } else if (typeof mix === 'object' && mix) {
    if (Array.isArray(mix)) {
      for (const item of mix) {
        const val = toVal(item)
        if (val) {
          if (str) str += ' '
          str += val
        }
      }
    } else {
      for (const key in mix) {
        if (mix[key]) {
          if (str) str += ' '
          str += key
        }
      }
    }
  }

  return str
}

export function clsx(...args: ClassValue[]): string {
  let str = ''

  for (const arg of args) {
    const val = toVal(arg)
    if (val) {
      if (str) str += ' '
      str += val
    }
  }

  return str
}

export default clsx
