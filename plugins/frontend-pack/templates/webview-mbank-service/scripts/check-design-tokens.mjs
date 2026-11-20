#!/usr/bin/env node
// Design-system guard: components may colour only with shadcn tokens.
// Usage: node scripts/check-design-tokens.mjs [files...]   (no files = whole src/)
// A line can opt out with the comment `tokens-ok: <reason>`.
/* global console */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const SKIP = [
  'src/shared/config/styles/global.css', // the only place where token values live
  'src/shared/iconpack/', // exported SVG artwork
  'src/shared/libs/tailwind-merge/', // vendored library
]
const EXT = new Set(['.ts', '.tsx', '.css'])
const UTIL = String.raw`(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|placeholder|caret|divide|decoration|shadow)`
const PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'
const LEGACY = String.raw`brand(?:-secondary)?|text-[a-z-]+|background-[a-z-]+|body-[a-z-]+|divider(?:-[a-z]+)?|foreground-(?:primary|secondary)|accent-primary`

export const RULES = [
  {
    id: 'hex',
    re: /#[0-9a-fA-F]{3,8}\b/g,
    hint: 'hex colour: use a shadcn token (bg-primary, text-foreground, border-border …)',
  },
  {
    id: 'rgb',
    re: /\b(?:rgba?|hsla?|oklch)\(/g,
    hint: 'colour function: move the value into a token in global.css',
  },
  {
    id: 'palette',
    re: new RegExp(
      String.raw`(?<![\w-])${UTIL}-(?:${PALETTE})-\d{2,3}(?![\w-])|var\(--color-(?:${PALETTE})-\d{2,3}\)`,
      'g',
    ),
    hint: 'Tailwind palette colour: use a shadcn token',
  },
  {
    id: 'black-white',
    re: new RegExp(
      String.raw`(?<![\w-])${UTIL}-(?:black|white)(?:/\d+)?(?![\w-])`,
      'g',
    ),
    hint: 'black/white: use primary-foreground, overlay, card or foreground',
  },
  {
    id: 'legacy',
    re: new RegExp(
      String.raw`(?<![\w-])${UTIL}-(?:${LEGACY})(?![\w-])|var\(--(?:theme|adm)-[a-z-]+\)`,
      'g',
    ),
    hint: 'old template token: see the token map in docs/webview-app-builder/references/ui-component-inventory.md',
  },
  {
    id: 'legacy-type',
    re: /(?<![\w-])(?:rounded(?:-[trblse]{1,2})?-(?:primary|m)|font-primary|leading-base|text-(?:title-large|label-medium|body-xlarge)|text-[a-z0-9]+\/base)(?![\w-])|var\(--(?:header-size|dynamic-height|family-primary|size-[a-z-]+|weight-[a-z-]+|line-height-[a-z-]+)\)|\(--(?:header-size|dynamic-height)\)/g,
    hint: 'removed template token: radius 20px → rounded-[20px], title → text-[22px], label → text-xs, leading → leading-[1.42857]',
  },
  {
    id: 'dark-variant',
    re: /(?<![\w-])dark:[\w[\]-]+/g,
    hint: 'dark: class: dark values live in global.css under [data-theme=dark]',
  },
]


const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

export function checkText(text) {
  const problems = []
  text.split('\n').forEach((line, index) => {
    if (line.includes('tokens-ok:')) return
    for (const rule of RULES) {
      for (const match of line.matchAll(rule.re)) {
        problems.push({
          line: index + 1,
          rule: rule.id,
          found: match[0],
          hint: rule.hint,
        })
      }
    }
  })
  return problems
}

function main() {
  const args = process.argv.slice(2)
  const files = (args.length ? args : walk(join(ROOT, 'src')))
    .map((file) =>
      relative(
        ROOT,
        join(ROOT, file.startsWith('/') ? relative(ROOT, file) : file),
      ),
    )
    .filter(
      (file) =>
        EXT.has(extname(file)) && !SKIP.some((skip) => file.startsWith(skip)),
    )

  let count = 0
  for (const file of files) {
    for (const p of checkText(readFileSync(join(ROOT, file), 'utf8'))) {
      count += 1
      console.log(`${file}:${p.line}  [${p.rule}] ${p.found}  — ${p.hint}`)
    }
  }
  if (count) {
    console.log(
      `\n✖ design tokens: ${count} problem(s) in ${files.length} file(s)`,
    )
    process.exit(1)
  }
  console.log(`✔ design tokens: ${files.length} file(s) clean`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
