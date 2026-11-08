import { useCallback, useEffect, useMemo, useState } from "react"

import { buildDesignSystem } from "@/lib/design-system"
import { loadExtras, normalizeState, saveExtras, stateFromSearch, stateToSearch } from "@/lib/share"
import type { ConfiguratorState } from "@/lib/types"

/** Configurator state, synced to the URL (shareable) and extras to localStorage. */
export function useConfigurator() {
  const [state, setState] = useState<ConfiguratorState>(() => stateFromSearch(window.location.search, loadExtras()))

  useEffect(() => {
    // keep the hash: the site routes by it (#/configurator)
    window.history.replaceState(null, "", stateToSearch(state) + window.location.hash)
  }, [state])

  useEffect(() => {
    saveExtras(state.extras)
  }, [state.extras])

  const update = useCallback((patch: Partial<ConfiguratorState>) => {
    setState((prev) => normalizeState({ ...prev, ...patch }))
  }, [])

  const designSystem = useMemo(() => buildDesignSystem(state), [state])

  return { state, update, designSystem }
}
