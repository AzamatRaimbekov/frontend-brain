export const cloneDeepJSON = (obl: object) => {
  return JSON.parse(JSON.stringify(obl))
}
