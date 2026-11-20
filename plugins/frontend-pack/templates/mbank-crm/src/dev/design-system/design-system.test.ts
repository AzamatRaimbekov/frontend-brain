import { describe, expect, it } from 'vitest'
import { buildMarkdown } from './export-md'
import { COLOR_NAMES, toHex, valueOf, type Values } from './tokens'
import { overridesCss } from './use-design-tokens'

const defaults: Values = Object.fromEntries(
  [...COLOR_NAMES, 'radius', 'font-sans'].map((n) => [n, { light: '#ffffff', dark: '#0e0f11' }]),
)
defaults.radius = { light: '0.75rem', dark: '0.75rem' }
defaults['font-sans'] = { light: 'Inter', dark: 'Inter' }

describe('design-system widget', () => {
  it('has the 31 shadcn colours + 6 status colours', () => {
    expect(COLOR_NAMES).toHaveLength(37)
    expect(new Set(COLOR_NAMES).size).toBe(37)
  })

  it('converts oklch and short hex for the colour picker', () => {
    expect(toHex('oklch(0.8938 0.1756 97.008)')).toBe('#fddb2b') // Mbank primary
    expect(toHex('oklch(1 0 0)')).toBe('#ffffff')
    expect(toHex('#FFF')).toBe('#ffffff')
    expect(toHex('red')).toBeNull()
  })

  it('an override wins over the loaded CSS; radius ignores the theme', () => {
    const o = { primary: { dark: '#7c3aed' }, radius: { light: '1rem' } }
    expect(valueOf(defaults, o, 'primary', 'dark')).toBe('#7c3aed')
    expect(valueOf(defaults, o, 'primary', 'light')).toBe('#ffffff')
    expect(valueOf(defaults, o, 'radius', 'dark')).toBe('1rem')
  })

  it('writes light to :root, dark to .dark, single tokens only to :root', () => {
    const css = overridesCss({ primary: { light: '#111111', dark: '#222222' }, radius: { light: '1rem', dark: '2rem' } })
    expect(css).toMatch(/:root \{\n {2}--primary: #111111;\n {2}--radius: 1rem;\n\}/)
    expect(css).toMatch(/\.dark \{\n {2}--primary: #222222;\n\}/)
  })

  it('markdown lists the changes and the full shadcn/tokens@1 set', () => {
    const md = buildMarkdown('Админ-панель', defaults, { primary: { light: '#7c3aed' } })
    expect(md).toContain('# Дизайн-система: Админ-панель')
    expect(md).toContain('## Изменения (1)')
    expect(JSON.parse(md.split('```json\n')[1].split('\n```')[0]).radiusScale).toBeTypeOf('object')
    expect(md).toContain('| `--primary` | `#7c3aed` | `#0e0f11` | `#ffffff` | `#0e0f11` |')
    const json = JSON.parse(md.split('```json\n')[1].split('\n```')[0])
    expect(json.$schema).toBe('shadcn/tokens@1')
    expect(Object.keys(json.colors)).toHaveLength(37)
    expect(json.colors.primary).toEqual({ light: '#7c3aed', dark: '#0e0f11' })
    expect(json.radius).toBe('0.75rem')
  })
})
