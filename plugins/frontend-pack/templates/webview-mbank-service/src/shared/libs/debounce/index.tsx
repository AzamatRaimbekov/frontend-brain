import { useLatest } from '@shared/hooks/useLatest'

import { useCallback, useEffect, useRef, useState } from 'react'

export const useDebounceCallback = <T,>(
  callback: (...args: T[]) => void,
  delay = 300,
) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackLatest = useLatest(callback)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [delay])

  return useCallback(
    (...args: T[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        callbackLatest.current(...args)
      }, delay)
    },
    [delay, callbackLatest],
  )
}

interface DebounceOptions {
  immediate?: boolean
}

interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>
  clear: () => void
  flush: () => void
  trigger: () => void
  readonly isPending: boolean
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  function_: T,
  wait = 100,
  options: DebounceOptions | boolean = {},
): DebouncedFunction<T> {
  if (typeof function_ !== 'function') {
    throw new TypeError(
      `Expected the first parameter to be a function, got \`${typeof function_}\`.`,
    )
  }

  if (wait < 0) {
    throw new RangeError('`wait` must not be negative.')
  }

  const { immediate } =
    typeof options === 'boolean' ? { immediate: options } : options

  let storedContext: unknown
  let storedArguments: unknown[] = []
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let timestamp: number
  let result: ReturnType<T>

  function run() {
    const callContext = storedContext
    const callArguments = storedArguments as Parameters<T>
    storedContext = undefined
    storedArguments = []
    result = function_.apply(callContext, callArguments) as ReturnType<T>
    return result
  }

  function later() {
    const last = Date.now() - timestamp

    if (last < wait && last >= 0) {
      timeoutId = setTimeout(later, wait - last)
    } else {
      timeoutId = undefined

      if (!immediate) {
        result = run()
      }
    }
  }

  const debounced = function (
    this: unknown,
    ...args: Parameters<T>
  ): ReturnType<T> {
    if (
      storedContext &&
      this !== storedContext &&
      Object.getPrototypeOf(this) === Object.getPrototypeOf(storedContext)
    ) {
      throw new Error(
        'Debounced method called with different contexts of the same prototype.',
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    storedContext = this
    storedArguments = args
    timestamp = Date.now()

    const callNow = immediate && !timeoutId

    if (!timeoutId) {
      timeoutId = setTimeout(later, wait)
    }

    if (callNow) {
      result = run()
    }

    return result
  } as DebouncedFunction<T>

  Object.defineProperty(debounced, 'isPending', {
    get() {
      return timeoutId !== undefined
    },
  })

  debounced.clear = () => {
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  debounced.flush = () => {
    if (!timeoutId) {
      return
    }

    debounced.trigger()
  }

  debounced.trigger = () => {
    result = run()
    debounced.clear()
  }

  return debounced
}

export const useDebouncedValue = <T,>(value: T, delay = 1000): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
