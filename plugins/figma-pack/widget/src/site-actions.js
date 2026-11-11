// «Сайт»: connection to the design-system site (apps/ds-configurator), pull into the `shadcn` collection,
// push the designer's edits back with the version they were made from. The site never writes to Figma.
// Connection (url, project) lives in the document's plugin data, the write key in clientStorage (per user).
import { PROJECT_ID, STATUS, pushPayload, siteOrigin, syncStatus } from '../core/site.js';
import { pullPlan, readShadcn } from './site-io.js';

const CONN = 'site:conn';
const STATE = 'site:state';

const readData = (key) => { try { return JSON.parse(figma.root.getPluginData(key) || 'null'); } catch (e) { return null; } };
const writeData = (key, value) => figma.root.setPluginData(key, value == null ? '' : JSON.stringify(value));
const keyName = (conn) => `site-key:${conn.url}|${conn.project}`;

export const connection = () => readData(CONN);
const getKey = async (conn) => (figma.clientStorage ? (await figma.clientStorage.getAsync(keyName(conn))) || null : null);

async function call(conn, path, { method = 'GET', body, key, version } = {}) {
  if (typeof fetch !== 'function') throw new Error('В этой версии Figma у виджета нет сети (fetch)');
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (key) headers['X-Write-Key'] = key;
  if (version !== undefined) headers['If-Match'] = `"${version}"`;
  let res;
  try {
    res = await fetch(`${conn.url}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) {
    throw new Error(`Сайт ${conn.url} не отвечает: запущен ли сервер и разрешён ли домен в manifest (networkAccess)`);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Сайт ответил ${res.status}`);
    err.status = res.status;
    err.data = data;
    if (data && data.errors) err.message += `: ${data.errors.slice(0, 5).join('; ')}`;
    throw err;
  }
  return data;
}

const need = () => {
  const conn = connection();
  if (!conn) throw new Error('Сначала подключите сайт: адрес и проект');
  return conn;
};
const project = (conn) => `/api/projects/${encodeURIComponent(conn.project)}`;

/** Saves the connection. key: '' keeps the saved one. */
export async function siteConnect({ url, project: id, key }) {
  const origin = siteOrigin(url);
  if (!origin) throw new Error('Адрес сайта: http(s)://хост[:порт], например http://localhost:8797');
  const pid = String(id || '').trim();
  if (!PROJECT_ID.test(pid)) throw new Error('Проект: идентификатор с сайта (латиница, цифры, дефисы)');
  const conn = { url: origin, project: pid };
  const prev = connection();
  if (!prev || prev.url !== conn.url || prev.project !== conn.project) writeData(STATE, null); // another project: no history
  writeData(CONN, conn);
  if (key && figma.clientStorage) await figma.clientStorage.setAsync(keyName(conn), String(key).trim());
  return siteStatus();
}

/** Status for the window: connection, versions, status code + label, what changed in Figma. */
export async function siteStatus() {
  const conn = connection();
  if (!conn) return { connected: false };
  const state = readData(STATE);
  const base = { connected: true, url: conn.url, project: conn.project, hasKey: !!(await getKey(conn)), localVersion: state ? state.version : null, at: state ? state.at : null };
  const local = await readShadcn();
  let tokens;
  try { tokens = await call(conn, `${project(conn)}/tokens`); } catch (e) {
    return { ...base, error: e.message, status: null };
  }
  const s = syncStatus(tokens.version, state, local.current);
  return { ...base, siteVersion: tokens.version, collection: local.exists, status: s.status, label: STATUS[s.status].label, tone: STATUS[s.status].tone, figmaChanges: s.figmaChanges.slice(0, 30), figmaChangeCount: s.figmaChanges.length };
}

async function remember(conn, version, extra = {}) {
  const now = await readShadcn();
  const snapshot = {};
  for (const [name, v] of Object.entries(now.current)) snapshot[name] = { light: v.light.sig, dark: v.dark.sig };
  writeData(STATE, { version, snapshot, at: new Date().toISOString(), ...extra });
}

async function markSync(conn, from, version) {
  const key = await getKey(conn);
  if (!key) return false;
  try { await call(conn, `${project(conn)}/figma/sync`, { method: 'POST', key, body: { from, version, fileKey: figma.fileKey || undefined, fileName: figma.root.name || undefined } }); return true; } catch (e) { return false; }
}

/** «Получить с сайта». Unsent Figma edits stop it unless force. */
export async function sitePull({ force = false } = {}) {
  const conn = need();
  const plan = await call(conn, `${project(conn)}/figma.json`);
  const state = readData(STATE);
  const s = syncStatus(plan.version, state, (await readShadcn()).current);
  if (!force && state && s.figmaChanges.length) {
    const err = new Error(`В Figma есть неотправленные правки (${s.figmaChanges.slice(0, 5).join(', ')}${s.figmaChanges.length > 5 ? '…' : ''}). Отправьте их на сайт или получите с перезаписью.`);
    err.status = 'figma-changes';
    throw err;
  }
  const report = await pullPlan(plan);
  await remember(conn, plan.version);
  report.version = plan.version;
  report.recorded = await markSync(conn, 'site', plan.version);
  return report;
}

/** «Отправить на сайт»: value overrides of the shadcn names, If-Match = the version Figma has. */
export async function sitePush() {
  const conn = need();
  const key = await getKey(conn);
  if (!key) throw new Error('Нужен ключ записи проекта (сайт → проект → Figma → «Копировать»)');
  const state = readData(STATE);
  if (!state) throw new Error('Сначала «Получить с сайта»: отправлять можно только правки от известной версии');
  const local = await readShadcn();
  if (!local.exists) throw new Error('В файле нет коллекции shadcn');
  const plan = await call(conn, `${project(conn)}/figma.json`);
  const { tokens, skipped } = pushPayload(plan, local.current);
  try {
    const res = await call(conn, `${project(conn)}/tokens`, { method: 'PUT', key, version: state.version, body: tokens });
    await remember(conn, res.tokens.version);
    return { version: res.tokens.version, diff: res.diff, skipped, overrides: Object.keys(tokens.overrides).length };
  } catch (e) {
    if (e.status === 409) return { conflict: true, siteVersion: e.data && e.data.current ? e.data.current.version : null, localVersion: state.version, skipped };
    throw e;
  }
}
