// Utility function to convert camelCase to kebab-case
export const hyphenate = (str: string) =>
  str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())
