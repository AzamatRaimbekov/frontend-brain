const urlAlphabet: string =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

const scopedUrlAlphabet: string = urlAlphabet

const poolSize: number = 128
let pool: Uint8Array
let poolOffset: number

function fillPool(bytes: number): void {
  if (!pool || pool.length < bytes) {
    pool = new Uint8Array(bytes * poolSize)
    crypto.getRandomValues(pool) // Используем встроенный в браузер crypto
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    crypto.getRandomValues(pool)
    poolOffset = 0
  }
  poolOffset += bytes
}

export function random(bytes: number): Uint8Array {
  fillPool(bytes)
  return pool.subarray(poolOffset - bytes, poolOffset)
}

type CustomRandomFunction = (size?: number) => string

export function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array,
): CustomRandomFunction {
  const mask: number = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  const step: number = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

  return (size: number = defaultSize): string => {
    let id: string = ''
    while (true) {
      const bytes: Uint8Array = getRandom(step)
      let i: number = step
      while (i--) {
        id += alphabet[bytes[i] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}

export function customAlphabet(
  alphabet: string,
  size: number = 21,
): CustomRandomFunction {
  return customRandom(alphabet, size, random)
}

interface UuidProps {
  size?: number
  name?: string
}

export default function generateUuid({
  name = '',
  size = 12,
}: UuidProps = {}): string {
  fillPool(size)
  let id: string = ''
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += scopedUrlAlphabet[pool[i] & 63]
  }

  if (name) {
    return `${name}_${id}`
  }

  return id
}
