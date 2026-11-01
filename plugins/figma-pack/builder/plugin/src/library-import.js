// Import from a team library by key, safely: without access (403) Figma may never settle the promise, so a
// hung import would freeze a whole build. Each import waits at most TIMEOUT ms; after the first timeout the
// library counts as unreachable for this run and later imports return null at once.
const TIMEOUT = 4000;
let unreachable = false;

export function resetLibraryImports() { unreachable = false; }

export async function importByKey(load) {
  if (unreachable) return null;
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve('timeout'), TIMEOUT); });
  try {
    const res = await Promise.race([Promise.resolve().then(load).catch(() => null), timeout]);
    if (res === 'timeout') { unreachable = true; return null; }
    return res || null;
  } finally {
    clearTimeout(timer);
  }
}
