// The design-system panel edits only the standard shadcn tokens: 31 colours + 6 status colours (light + dark), radius, font.
// Defaults are read from the CSS the app already loads, so the panel works with the copied kit and the package.

export type Mode = 'light' | 'dark'
export type Values = Record<string, { light: string; dark: string }>
export type Overrides = Record<string, Partial<Record<Mode, string>>>

export const GROUPS: { title: string; names: string[] }[] = [
  { title: 'Основа', names: ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground'] },
  { title: 'Кнопки и акценты', names: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'destructive'] },
  { title: 'Статусы', names: ['success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground'] },
  { title: 'Приглушённые', names: ['muted', 'muted-foreground'] },
  { title: 'Рамки', names: ['border', 'input', 'ring'] },
  { title: 'Графики', names: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
  {
    title: 'Боковое меню',
    names: ['sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'],
  },
]
export const COLOR_NAMES = GROUPS.flatMap((g) => g.names)
const steps = (prefix: string, keys: string[]) => keys.map((k) => `${prefix}-${k}`)
/** Single-value tokens (same in both themes): Figma radius, text and shadow scales on standard Tailwind names. */
export const SCALE_GROUPS: { title: string; names: string[] }[] = [
  { title: 'Форма и шрифт', names: ['radius', 'font-sans'] },
  { title: 'Скругления', names: steps('radius', ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) },
  { title: 'Текст', names: steps('text', ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']) },
  { title: 'Тени', names: steps('shadow', ['xs', 'sm', 'md', 'lg', 'xl']) },
]
export const SINGLE: readonly string[] = SCALE_GROUPS.flatMap((g) => g.names)
export const isColorToken = (name: string) => !SINGLE.includes(name)
export const ALL_NAMES = [...COLOR_NAMES, ...SINGLE]

function read(el: Element): Record<string, string> {
  const style = getComputedStyle(el)
  return Object.fromEntries(ALL_NAMES.map((n) => [n, style.getPropertyValue(`--${n}`).trim()]))
}

/** Values of the loaded CSS for both themes, ignoring the panel's own overrides (pass its style element). */
export function readDefaults(overridesStyle: HTMLStyleElement | null): Values {
  const root = document.documentElement
  const wasDark = root.classList.contains('dark')
  if (overridesStyle) overridesStyle.disabled = true
  root.classList.remove('dark')
  const light = read(root)
  root.classList.add('dark')
  const dark = read(root)
  if (!wasDark) root.classList.remove('dark')
  if (overridesStyle) overridesStyle.disabled = false
  return Object.fromEntries(ALL_NAMES.map((n) => [n, { light: light[n], dark: dark[n] }]))
}

const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i

/** oklch(...) or #hex → #rrggbb for the colour picker; null when the value is not a colour it understands. */
export function toHex(value: string): string | null {
  const v = value.trim()
  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v)) return v.slice(0, 7).toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join('')}`.toLowerCase()
  const m = OKLCH.exec(v)
  if (!m) return null
  const L = Number(m[1]) / (m[2] ? 100 : 1)
  const C = Number(m[3])
  const h = (Number(m[4]) * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((c) => {
    const x = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, x)) * 255)
  })
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** A CSS value the browser accepts for this token. */
export function isValid(name: string, value: string): boolean {
  if (!value.trim()) return false
  if (name === 'radius' || /^(radius|text)-/.test(name)) return /^\d+(\.\d+)?(px|rem)$/.test(value.trim())
  if (name.startsWith('shadow-')) return CSS.supports('box-shadow', value)
  if (name === 'font-sans') return true
  return CSS.supports('color', value)
}

/** Current value: override first, then the loaded CSS. Single-value tokens ignore the mode. */
export function valueOf(defaults: Values, overrides: Overrides, name: string, mode: Mode): string {
  const m = SINGLE.includes(name) ? 'light' : mode
  return overrides[name]?.[m] ?? defaults[name]?.[m] ?? ''
}
