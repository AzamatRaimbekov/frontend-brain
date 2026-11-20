import { useCallback, useEffect, useState } from 'react'
import { ALL_NAMES, readDefaults, SINGLE, type Mode, type Overrides, type Values } from './tokens'

const STORAGE_KEY = 'design-system-overrides'
const STYLE_ID = 'design-system-overrides'

function load(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Overrides) : {}
  } catch {
    return {}
  }
}

function save(overrides: Overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Private mode or blocked storage: edits still apply until reload.
  }
}

function styleElement(): HTMLStyleElement {
  const found = document.getElementById(STYLE_ID)
  if (found instanceof HTMLStyleElement) return found
  const el = document.createElement('style')
  el.id = STYLE_ID
  document.head.appendChild(el)
  return el
}

/** Overrides as CSS: light on :root, dark on .dark; single-value tokens only on :root. */
export function overridesCss(overrides: Overrides): string {
  const decl = (mode: Mode) =>
    ALL_NAMES.filter((n) => overrides[n]?.[mode] && (mode === 'light' || !SINGLE.includes(n)))
      .map((n) => `  --${n}: ${overrides[n][mode]};`)
      .join('\n')
  // Tailwind v4 inlines the font into --default-font-family and .font-sans, so the font is set there too.
  const font = overrides['font-sans']?.light
  const fontCss = font ? `:root { --default-font-family: ${font}; }\n.font-sans { font-family: ${font}; }\n` : ''
  return `:root {\n${decl('light')}\n}\n.dark {\n${decl('dark')}\n}\n${fontCss}`
}

/** Local design-system edits: applied live to the page, kept in localStorage, never sent anywhere. */
export function useDesignTokens() {
  const [overrides, setOverrides] = useState<Overrides>(load)
  const [defaults] = useState<Values>(() => readDefaults(document.getElementById(STYLE_ID) as HTMLStyleElement | null))

  useEffect(() => {
    styleElement().textContent = overridesCss(overrides)
    save(overrides)
  }, [overrides])

  const setValue = useCallback((name: string, mode: Mode, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [name]: { ...prev[name], [mode]: value } }
      if (value === defaults[name]?.[mode]) delete next[name][mode]
      if (!Object.keys(next[name]).length) delete next[name]
      return next
    })
  }, [defaults])

  const resetValue = useCallback((name: string) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const resetAll = useCallback(() => setOverrides({}), [])

  return { defaults, overrides, setValue, resetValue, resetAll }
}
