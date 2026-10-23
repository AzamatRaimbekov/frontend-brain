# Client state: code

Decision table: [SKILL.md](../SKILL.md) section 3. Placement order is owned by `react-architecture` section 6; URL state code by `react-ux` [url-state.md](../../react-ux/references/url-state.md).

## Local and lifted state

```tsx
// One status union instead of contradictory booleans (react-architecture state-and-effects.md)
type DialogState = { kind: 'closed' } | { kind: 'edit'; orderId: string } | { kind: 'delete'; orderId: string }
const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' })
```

Selection inside one table stays in the table (or its page) as `useState<Set<string>>`; store ids, never row objects (rows come from the query).

## Context (rarely changing, app-wide)

```tsx
// React 19: <Context value={...}> without .Provider
export const LocaleContext = createContext<Locale>('ru')
<LocaleContext value={locale}>{children}</LocaleContext>
```

Do not put frequently changing values in context: every consumer re-renders. That is the signal to move to a Zustand store with selectors.

## Zustand store (conditional library)

Allowed only for truly global, client-only UI state (`rules/libraries.json`). Write down the reason in the PR: why URL, lifting and context do not fit.

```ts
// src/shared/hooks/useSidebar.ts - domain-agnostic, cross-feature UI state
import { create } from 'zustand'

type SidebarState = {
  open: boolean
  actions: { toggle: () => void; close: () => void }
}

const useSidebarStore = create<SidebarState>()((set) => ({
  open: true,
  actions: {
    toggle: () => set((s) => ({ open: !s.open })),
    close: () => set({ open: false }),
  },
}))

// Only hooks leave this file; the store itself is not exported
export const useSidebarOpen = () => useSidebarStore((s) => s.open)
export const useSidebarActions = () => useSidebarStore((s) => s.actions) // stable identity, never re-renders
```

Several values at once:

```ts
import { useShallow } from 'zustand/react/shallow'
const { open, pinned } = useLayoutStore(useShallow((s) => ({ open: s.open, pinned: s.pinned })))
```

### Values that feed a query are not store state

A filter or scope chosen in a side panel for one feature (`branchId` for a report) goes to the URL (`react-ux` url-state.md) or is lifted to the page that renders both the panel and the query. Zustand is only for truly global UI state (`rules/libraries.json`), so `features/<f>/hooks/use<Name>Store.ts` is not a valid place for a store.

### Persisted UI preferences

```ts
import { persist } from 'zustand/middleware'

const useTablePrefsStore = create<TablePrefs>()(
  persist((set) => ({ density: 'comfortable', actions: { setDensity: (density) => set({ density }) } }), {
    name: 'mdigital.table-prefs',
    version: 1,
    partialize: ({ density }) => ({ density }), // never persist actions, tokens, PII or server data
  }),
)
```

Read the persisted value through a selector like any other; validate shape changes with `version` + `migrate` instead of trusting old `localStorage` content.

## Testing stores

Test through the components that use the hooks. If a store has real logic, reset it between tests with `useXStore.setState(initialState, true)` in `afterEach` (only possible from the store's own test file, since the store is not exported elsewhere - colocate `useSidebar.test.ts`).
