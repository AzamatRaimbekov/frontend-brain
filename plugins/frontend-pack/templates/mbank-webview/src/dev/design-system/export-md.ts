import { ALL_NAMES, COLOR_NAMES, SINGLE, valueOf, type Overrides, type Values } from './tokens'

/**
 * design-system.md: what changed against the kit, and the full token set in shadcn/tokens@1 so the change
 * can be made official (frontend-brain shadcn-tokens.json or the project on the ds-configurator site).
 */
export function buildMarkdown(project: string, defaults: Values, overrides: Overrides): string {
  const changed = ALL_NAMES.filter((n) => overrides[n])
  const scale = (prefix: string) =>
    Object.fromEntries(
      SINGLE.filter((n) => n.startsWith(`${prefix}-`)).map((n) => [n.slice(prefix.length + 1), valueOf(defaults, overrides, n, 'light')]),
    )
  const single = (n: string) => SINGLE.includes(n)
  const cell = (n: string, mode: 'light' | 'dark') => (single(n) && mode === 'dark' ? '—' : `\`${valueOf(defaults, overrides, n, mode)}\``)
  const was = (n: string, mode: 'light' | 'dark') => (single(n) && mode === 'dark' ? '—' : `\`${defaults[n]?.[mode] ?? ''}\``)

  const rows = changed.length
    ? changed.map((n) => `| \`--${n}\` | ${cell(n, 'light')} | ${cell(n, 'dark')} | ${was(n, 'light')} | ${was(n, 'dark')} |`)
    : ['| — | изменений нет | | | |']

  const json = {
    $schema: 'shadcn/tokens@1',
    radius: valueOf(defaults, overrides, 'radius', 'light'),
    font: { sans: valueOf(defaults, overrides, 'font-sans', 'light'), heading: 'var(--font-sans)' },
    radiusScale: scale('radius'),
    text: scale('text'),
    shadow: scale('shadow'),
    colors: Object.fromEntries(
      COLOR_NAMES.map((n) => [n, { light: valueOf(defaults, overrides, n, 'light'), dark: valueOf(defaults, overrides, n, 'dark') }]),
    ),
  }

  return [
    `# Дизайн-система: ${project}`,
    '',
    `Собрано в виджете «Дизайн-система» ${new Date().toISOString().slice(0, 10)}. Имена — стандартные токены shadcn, меняются только значения.`,
    '',
    `## Изменения (${changed.length})`,
    '',
    '| Токен | Светлая | Тёмная | Было, светлая | Было, тёмная |',
    '|---|---|---|---|---|',
    ...rows,
    '',
    '## Как сделать официально',
    '',
    '1. Значения ниже — полный набор `shadcn/tokens@1` для этого проекта.',
    '2. Проект Mbank: перенести значения в `figma-pack/skills/ds-tokens/references/shadcn-tokens.json` (frontend-brain) или в проект на сайте ds-configurator, затем `node plugins/frontend-pack/scripts/tokens-build.mjs`.',
    '3. Только этот проект: заменить значения в `src/styles/mbank-tokens.css` (`:root` — светлая, `.dark` — тёмная) и очистить виджет кнопкой «Сбросить».',
    '4. Новых имён токенов не добавлять.',
    '',
    '## Токены',
    '',
    '```json',
    JSON.stringify(json, null, 2),
    '```',
    '',
  ].join('\n')
}

export function downloadMarkdown(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
