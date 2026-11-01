// Figma REST client for figma-learn: token from env only, retries on 429/5xx with Retry-After, small concurrency.
// The token is never logged, printed or written anywhere; errors carry the path and status only.

export const API_BASE = 'https://api.figma.com';
export const TOKEN_ENV = 'FIGMA_ACCESS_TOKEN';
export const SCOPES = ['file_content:read', 'file_metadata:read', 'projects:read', 'library_content:read'];

const realSleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class FigmaError extends Error {
  constructor(status, path, hint) {
    super(`Figma API ${status} on ${path}${hint ? ` - ${hint}` : ''}`);
    this.status = status;
    this.path = path;
  }
}

const HINTS = {
  400: 'bad request (check the id or key)',
  403: `token rejected or missing a scope; needs ${SCOPES.join(', ')} and view access to the team/file`,
  404: 'not found or no access with this token',
};

/** Reads the token from env; throws a message that never contains the value. */
export function tokenFromEnv(env = process.env) {
  const token = env[TOKEN_ENV];
  if (!token || !token.trim()) {
    throw new Error(`${TOKEN_ENV} is not set. Create a Figma personal access token (read scopes: ${SCOPES.join(', ')}) and export it in your shell profile; never paste it into chat or the repo.`);
  }
  return token.trim();
}

/**
 * createClient({ token, fetch, sleep, base, retries, log })
 * get(path) -> parsed JSON. 429: waits Retry-After seconds (or backoff) and retries; 5xx: backoff retry.
 */
export function createClient({ token, fetch = globalThis.fetch, sleep = realSleep, base = API_BASE, retries = 5, log = () => {} } = {}) {
  if (!token) throw new Error('createClient: token is required');
  let calls = 0;
  async function get(path) {
    for (let attempt = 0; ; attempt++) {
      calls++;
      let res;
      try {
        res = await fetch(base + path, { headers: { 'X-Figma-Token': token } });
      } catch (error) {
        if (attempt >= retries) throw new FigmaError('network', path, error.message);
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      if (res.ok) return res.json();
      const retryable = res.status === 429 || res.status >= 500;
      if (!retryable || attempt >= retries) throw new FigmaError(res.status, path, HINTS[res.status]);
      const header = Number(res.headers?.get?.('retry-after'));
      const wait = Number.isFinite(header) && header > 0 ? header * 1000 : 1000 * 2 ** attempt;
      log(`figma ${res.status} on ${path}: retry in ${Math.round(wait / 1000)}s`);
      await sleep(Math.min(wait, 120000));
    }
  }
  return { get, calls: () => calls };
}

/** Runs fn over items with at most `limit` in flight; keeps result order. */
export async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** File key from a key or any figma.com URL (/file/, /design/, /proto/, /board/). */
export function parseFileKey(input) {
  const s = String(input || '').trim();
  const m = s.match(/figma\.com\/(?:file|design|proto|board|slides)\/([A-Za-z0-9]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9]{10,}$/.test(s)) return s;
  throw new Error(`not a Figma file key or URL: ${s.slice(0, 80)}`);
}

/** Team id from an id or a figma.com/files/team/<id> URL. */
export function parseTeamId(input) {
  const s = String(input || '').trim();
  const m = s.match(/team\/(\d+)/);
  if (m) return m[1];
  if (/^\d+$/.test(s)) return s;
  throw new Error(`not a Figma team id or URL: ${s.slice(0, 80)}`);
}
