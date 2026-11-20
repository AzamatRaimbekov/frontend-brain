export const getCssColor = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}
