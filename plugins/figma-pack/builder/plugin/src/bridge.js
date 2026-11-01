// «Мост для Claude»: a hidden-ish window long-polls the local figma-bridge server (bridge/server.mjs) and runs each
// command here with the plugin's own engine, so an agent drives the file without clicks or pasted code.
import TOKENS from '../../../skills/mbank-figma-patterns/references/tokens.json';
import { buildModel, BRANDS } from '../../../widget/core/model.js';
import { planAllBrands } from '../../../widget/core/sync.js';
import { applyWrites } from '../../../widget/src/figma-io.js';

const URL_BASE = 'http://localhost:3055';

export const BRIDGE_HTML = `<!doctype html><meta charset="utf-8"><body style="font:12px Inter,system-ui;margin:12px;color:#111">
<b>Мост для Claude</b><div id="s">подключаюсь к ${URL_BASE}…</div><div id="l" style="color:#666;margin-top:6px"></div>
<script>
const s = document.getElementById('s'), l = document.getElementById('l');
let file = '';
const waits = {};
onmessage = (e) => { const m = e.data.pluginMessage; if (!m) return; if (m.type === 'file') file = m.name; if (m.type === 'done' && waits[m.id]) { waits[m.id](m); delete waits[m.id]; } };
async function loop() {
  for (;;) {
    try {
      const r = await fetch('${URL_BASE}/poll?file=' + encodeURIComponent(file));
      const cmd = await r.json();
      s.textContent = 'подключено · ' + new Date().toLocaleTimeString();
      if (cmd.type === 'idle') continue;
      l.textContent = '▶ ' + cmd.type;
      const res = await new Promise((ok) => { waits[cmd.id] = ok; parent.postMessage({ pluginMessage: { type: 'bridge-cmd', cmd } }, '*'); });
      await fetch('${URL_BASE}/result', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: cmd.id, ok: res.ok, result: res.result, error: res.error }) });
      l.textContent = (res.ok ? '✓ ' : '✗ ') + cmd.type;
    } catch (e) { s.textContent = 'нет сервера моста (node bridge/server.mjs) — повтор через 3 с'; await new Promise((r) => setTimeout(r, 3000)); }
  }
}
loop();
</script>`;

async function findNodes({ ids = [], names = [], page }) {
  const out = [];
  for (const id of ids) { const n = await figma.getNodeByIdAsync(id); if (n) out.push(n); }
  if (names.length) {
    const pages = page ? figma.root.children.filter((p) => p.name === page) : figma.root.children;
    for (const p of pages) {
      await p.loadAsync();
      for (const name of names) { const n = p.findOne((x) => x.name === name); if (n) out.push(n); }
    }
  }
  return out;
}

export const BRIDGE_COMMANDS = {
  async export(a) {
    const images = [];
    for (const n of await findNodes(a)) {
      const bytes = await n.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: a.scale || 1 } });
      images.push({ id: n.id, name: n.name, width: Math.round(n.width), height: Math.round(n.height), base64: figma.base64Encode(bytes) });
    }
    return { images };
  },
  async eval(a) {
    const fn = new (Object.getPrototypeOf(async () => {}).constructor)('figma', a.code);
    return fn(figma);
  },
  async inspect() {
    const pages = [];
    for (const p of figma.root.children) { await p.loadAsync(); pages.push({ name: p.name, id: p.id, children: p.children.map((n) => `${n.type}:${n.name}`).slice(0, 40) }); }
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    return { file: figma.root.name, pages, collections: cols.map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), variables: c.variableIds.length })) };
  },
  async 'tokens-apply'(a) {
    const plan = planAllBrands((b) => buildModel(TOKENS, { brand: b, edits: a.edits || {}, extras: a.extras || [] }), BRANDS, { all: true });
    const r = await applyWrites(plan.writes, { dryRun: !!a.dryRun });
    return { created: r.created.length, updated: r.updated.length, raw: r.raw.length, errors: r.errors };
  },
};

/** Wires the bridge window to the plugin's handlers (+ BRIDGE_COMMANDS). */
export function startBridge(handlers) {
  figma.showUI(BRIDGE_HTML, { width: 260, height: 90, title: 'Мост для Claude' });
  figma.ui.postMessage({ type: 'file', name: figma.root.name });
  figma.ui.onmessage = async (m) => {
    if (!m || m.type !== 'bridge-cmd') return;
    const { id, type, args } = m.cmd;
    const fn = BRIDGE_COMMANDS[type] || handlers[type];
    try {
      if (!fn) throw new Error(`нет команды ${type}`);
      figma.ui.postMessage({ type: 'done', id, ok: true, result: await fn(args || {}) });
    } catch (e) {
      figma.ui.postMessage({ type: 'done', id, ok: false, error: String(e && e.message ? e.message : e) });
    }
  };
}
