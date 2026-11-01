// Component contracts shared by the DS Builder plugin and the Mbank Tokens widget in one Figma file.
// Each plugin's own plugin data is private to its plugin id, so the shared copy lives in document
// sharedPluginData under one namespace: an edit made in either tool is seen by the other.
export const NAMESPACE = 'mbank';
const PREFIX = 'contract:';

/** Contracts stored in the file: { [name]: contract }. */
export function sharedContracts() {
  const out = {};
  for (const key of figma.root.getSharedPluginDataKeys(NAMESPACE).filter((k) => k.startsWith(PREFIX))) {
    const raw = figma.root.getSharedPluginData(NAMESPACE, key);
    if (!raw) continue;
    try { out[key.slice(PREFIX.length)] = JSON.parse(raw); } catch (e) { /* broken entry: ignored */ }
  }
  return out;
}

export function sharedContract(name) {
  const raw = figma.root.getSharedPluginData(NAMESPACE, PREFIX + name);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export function putSharedContract(contract) {
  figma.root.setSharedPluginData(NAMESPACE, PREFIX + contract.name, JSON.stringify(contract));
}

/** Back to the bundled contract: removes the file's copy. */
export function dropSharedContract(name) {
  figma.root.setSharedPluginData(NAMESPACE, PREFIX + name, '');
}
