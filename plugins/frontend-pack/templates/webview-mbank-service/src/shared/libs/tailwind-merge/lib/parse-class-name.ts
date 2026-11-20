import { AnyConfig, ParsedClassName } from './types'

export const importantModifier = '!'
const modifierSeparator = ':'
const modifierSeparatorLength = modifierSeparator.length

export const createParseClassName = (config: AnyConfig) => {
  const { prefix, experimentalParseClassName } = config

  /**
   * Parse class name into parts.
   *
   * Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
   */
  let parseClassName = (className: string): ParsedClassName => {
    const modifiers = []

    let bracketDepth = 0
    let parenDepth = 0
    let modifierStart = 0
    let postfixModifierPosition: number | undefined

    for (let index = 0; index < className.length; index++) {
      const currentCharacter = className[index]

      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === modifierSeparator) {
          modifiers.push(className.slice(modifierStart, index))
          modifierStart = index + modifierSeparatorLength
          continue
        }

        if (currentCharacter === '/') {
          postfixModifierPosition = index
          continue
        }
      }

      if (currentCharacter === '[') {
        bracketDepth++
      } else if (currentCharacter === ']') {
        bracketDepth--
      } else if (currentCharacter === '(') {
        parenDepth++
      } else if (currentCharacter === ')') {
        parenDepth--
      }
    }

    const baseClassNameWithImportantModifier =
      modifiers.length === 0 ? className : className.substring(modifierStart)
    const baseClassName = stripImportantModifier(
      baseClassNameWithImportantModifier,
    )
    const hasImportantModifier =
      baseClassName !== baseClassNameWithImportantModifier
    const maybePostfixModifierPosition =
      postfixModifierPosition && postfixModifierPosition > modifierStart
        ? postfixModifierPosition - modifierStart
        : undefined

    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition,
    }
  }

  if (prefix) {
    const fullPrefix = prefix + modifierSeparator
    const parseClassNameOriginal = parseClassName
    parseClassName = (className) =>
      className.startsWith(fullPrefix)
        ? parseClassNameOriginal(className.substring(fullPrefix.length))
        : {
            isExternal: true,
            modifiers: [],
            hasImportantModifier: false,
            baseClassName: className,
            maybePostfixModifierPosition: undefined,
          }
  }

  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName
    parseClassName = (className) =>
      experimentalParseClassName({
        className,
        parseClassName: parseClassNameOriginal,
      })
  }

  return parseClassName
}

const stripImportantModifier = (baseClassName: string) => {
  if (baseClassName.endsWith(importantModifier)) {
    return baseClassName.substring(0, baseClassName.length - 1)
  }

  /**
   * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
   * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
   */
  if (baseClassName.startsWith(importantModifier)) {
    return baseClassName.substring(1)
  }

  return baseClassName
}
