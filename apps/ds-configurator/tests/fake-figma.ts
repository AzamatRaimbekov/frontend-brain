// Tiny in-memory Figma variables API, modelled on plugins/figma-pack/builder/test/figma-mock.mjs
// (copied rules: aliases must point at existing variables, values only for modes of the collection).
type Mode = { modeId: string; name: string }
export type FakeVariable = {
  id: string
  name: string
  resolvedType: string
  variableCollectionId: string
  valuesByMode: Record<string, unknown>
  scopes: string[]
  codeSyntax: Record<string, string>
  setValueForMode(modeId: string, value: unknown): void
  setVariableCodeSyntax(platform: string, value: string): void
}
export type FakeCollection = {
  id: string
  name: string
  modes: Mode[]
  defaultModeId: string
  renameMode(id: string, name: string): void
  addMode(name: string): string
}

export function createFakeFigma() {
  let seq = 0
  const nid = (p: string) => `${p}:${++seq}`
  const vars = new Map<string, FakeVariable>()
  const cols = new Map<string, FakeCollection>()

  const collection = (name: string, modeNames = ["Mode 1"]): FakeCollection => {
    const modes = modeNames.map((n) => ({ modeId: nid("mode"), name: n }))
    const c: FakeCollection = {
      id: nid("VariableCollectionId"),
      name,
      modes,
      defaultModeId: modes[0].modeId,
      renameMode(id, n) {
        c.modes.find((m) => m.modeId === id)!.name = n
      },
      addMode(n) {
        const id = nid("mode")
        c.modes.push({ modeId: id, name: n })
        for (const v of vars.values()) if (v.variableCollectionId === c.id) v.valuesByMode[id] = v.valuesByMode[c.defaultModeId]
        return id
      },
    }
    cols.set(c.id, c)
    return c
  }

  const variable = (name: string, col: FakeCollection, type: string): FakeVariable => {
    const v: FakeVariable = {
      id: nid("VariableID"),
      name,
      resolvedType: type,
      variableCollectionId: col.id,
      valuesByMode: {},
      scopes: ["ALL_SCOPES"],
      codeSyntax: {},
      setValueForMode(modeId, value) {
        if (!cols.get(v.variableCollectionId)!.modes.some((m) => m.modeId === modeId)) throw new Error(`mode ${modeId} not in collection`)
        const a = value as { type?: string; id?: string }
        if (a?.type === "VARIABLE_ALIAS" && !vars.has(a.id!)) throw new Error("alias to missing variable")
        if (type === "COLOR" && typeof value === "object" && a?.type !== "VARIABLE_ALIAS" && !("r" in (value as object))) throw new Error("bad color")
        if (type === "FLOAT" && typeof value !== "number") throw new Error("bad float")
        v.valuesByMode[modeId] = value
      },
      setVariableCodeSyntax(p, value) {
        v.codeSyntax[p] = value
      },
    }
    vars.set(v.id, v)
    return v
  }

  const figma = {
    variables: {
      getLocalVariableCollectionsAsync: async () => [...cols.values()],
      getLocalVariablesAsync: async () => [...vars.values()],
      createVariableCollection: (name: string) => collection(name),
      createVariable: (name: string, col: FakeCollection, type: string) => variable(name, col, type),
      createVariableAlias: (v: FakeVariable) => ({ type: "VARIABLE_ALIAS", id: v.id }),
    },
  }

  const find = (colName: string, varName: string) => {
    const c = [...cols.values()].find((x) => x.name === colName)
    return c ? [...vars.values()].find((v) => v.variableCollectionId === c.id && v.name === varName) : undefined
  }
  return { figma, collection, variable, find, cols, vars }
}

/** Runs a use_figma script body the way the MCP does: as an async function with `figma` in scope. */
export async function runUseFigma(code: string, figma: unknown) {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  return new AsyncFunction("figma", code)(figma)
}
