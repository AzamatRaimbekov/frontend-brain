// Heuristic: is this a dynamic import/chunk load failure?
export function isChunkLoadError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) {
    return false
  }

  const e = err as Record<string, unknown>
  const msg = (e?.message || '').toString()

  return (
    e?.name === 'ChunkLoadError' ||
    /Loading (CSS )?chunk \d+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /'text\/html' is not a valid JavaScript MIME type/i.test(msg)
  )
}
