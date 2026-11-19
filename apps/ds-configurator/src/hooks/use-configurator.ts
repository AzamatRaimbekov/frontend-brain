import { useCallback, useEffect, useMemo, useState } from "react"

import { buildDesignSystem } from "@/lib/design-system"
import { normalizeState, stateFromSearch, stateToSearch } from "@/lib/share"
import type { ConfiguratorState } from "@/lib/types"

/** Configurator state, synced to the URL (shareable preset code). */
export function useConfigurator() {
  const [state, setState] = useState<ConfiguratorState>(() => stateFromSearch(window.location.search))

  useEffect(() => {
    // keep the hash: the site routes by it (#/configurator)
    window.history.replaceState(null, "", stateToSearch(state) + window.location.hash)
  }, [state])

  const update = useCallback((patch: Partial<ConfiguratorState>) => {
    setState((prev) => normalizeState({ ...prev, ...patch }))
  }, [])

  const designSystem = useMemo(() => buildDesignSystem(state), [state])

  return { state, update, designSystem }
}
