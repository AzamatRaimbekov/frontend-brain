#!/usr/bin/env node
// Figma bridge: lets an agent drive the DS Builder plugin running in Figma Desktop — no clicks, no copying code
// through the model. The plugin (Plugins → DS Builder → «Мост для Claude») long-polls this server on
// 127.0.0.1:3055; commands queued here run in the file with the plugin's own engine and come back as JSON
// (PNG exports are written to disk and returned as paths).
//   node server.mjs          stdio MCP server "figma-bridge" + the HTTP bridge
//   node server.mjs --http   HTTP bridge only (curl: POST /run {"type":"…","args":{}})
// Pure Node 18+, no dependencies.
import { createServer } from 'node:http';
import { createInterface } from 'node:readline';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.FIGMA_BRIDGE_PORT || 3055);
const OUT = process.env.FIGMA_BRIDGE_OUT || join(tmpdir(), 'figma-bridge');
const queue = [];
const pending = new Map();
const waiters = [];
let lastPoll = 0;
let file = null;

const log = (...a) => process.stderr.write(`[figma-bridge] ${a.join(' ')}\n`);
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', ...cors }); res.end(JSON.stringify(body)); };
const body = (req) => new Promise((ok) => { let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { ok({}); } }); });

let proxy = false; // the port is taken by another bridge (e.g. a second Claude session): talk to it over HTTP

export const connected = () => Date.now() - lastPoll < 35000;

async function viaHttp(path, payload) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, payload ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) } : undefined);
  return res.json();
}

/** Queues a command for the plugin and waits for its result. */
export async function run(type, args = {}, timeoutMs = 600000) {
  if (proxy) { const r = await viaHttp('/run', { type, args, timeoutMs }); if (!r.ok) throw new Error(r.error); return r.result; }
  if (!connected()) return Promise.reject(new Error('Плагин не подключён: в Figma Desktop запусти Plugins → Development → DS Builder → «Мост для Claude»'));
  const id = randomUUID();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Нет ответа от Figma за ${timeoutMs / 1000} с`)); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    const cmd = { id, type, args };
    const w = waiters.shift();
    if (w) w(cmd); else queue.push(cmd);
  });
}

function saveImages(result) {
  if (!result || !Array.isArray(result.images)) return result;
  mkdirSync(OUT, { recursive: true });
  const images = result.images.map((img) => {
    const path = join(OUT, `${String(img.name || 'node').replace(/[^\w.-]+/g, '_').slice(0, 60)}-${Date.now()}.png`);
    writeFileSync(path, Buffer.from(img.base64, 'base64'));
    return { name: img.name, id: img.id, width: img.width, height: img.height, path };
  });
  return { ...result, images };
}

export function startHttp() {
  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (url.pathname === '/poll') { // the plugin asks for the next command (long poll, 25 s)
      lastPoll = Date.now();
      if (url.searchParams.get('file')) file = url.searchParams.get('file');
      const next = queue.shift();
      if (next) { json(res, 200, next); return; }
      let done = false;
      const w = (cmd) => { if (!done) { done = true; json(res, 200, cmd); } };
      waiters.push(w);
      setTimeout(() => { if (!done) { done = true; waiters.splice(waiters.indexOf(w), 1); json(res, 200, { type: 'idle' }); } }, 25000);
      return;
    }
    if (url.pathname === '/result' && req.method === 'POST') {
      const r = await body(req);
      const p = pending.get(r.id);
      if (p) { pending.delete(r.id); clearTimeout(p.timer); r.ok ? p.resolve(saveImages(r.result)) : p.reject(new Error(r.error || 'ошибка в плагине')); }
      json(res, 200, { ok: true });
      return;
    }
    if (url.pathname === '/status') { json(res, 200, { connected: connected(), file, lastPoll: lastPoll ? new Date(lastPoll).toISOString() : null }); return; }
    if (url.pathname === '/run' && req.method === 'POST') {
      const r = await body(req);
      try { json(res, 200, { ok: true, result: await run(r.type, r.args || {}, r.timeoutMs) }); } catch (e) { json(res, 200, { ok: false, error: e.message }); }
      return;
    }
    json(res, 404, { error: 'not found' });
  });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') { proxy = true; log(`порт ${PORT} занят другим мостом — работаю через него`); } else log(e.message);
  });
  server.listen(PORT, '127.0.0.1', () => log(`HTTP 127.0.0.1:${PORT}`));
  return server;
}

const str = (description) => ({ type: 'string', description });
export const TOOLS = [
  { name: 'figma_status', description: 'Is the DS Builder plugin connected (Figma Desktop → Plugins → Development → DS Builder → «Мост для Claude») and which file is open.', inputSchema: { type: 'object', properties: {} }, call: async () => (proxy ? viaHttp('/status') : { connected: connected(), file }) },
  { name: 'figma_command', description: 'Runs a DS Builder command in the open file: "render-all" (every component on one «Components» page as a kit sheet), "build" (args.spec: screen spec → section pages + «Прототип»), "contract-render" (args.name), "contract-bind" (args.name, path, key, value), "contracts-list", "tokens-apply" (Mbank tokens → variables), "inspect" (pages, collections, counts).', inputSchema: { type: 'object', properties: { type: str('command name'), args: { type: 'object' } }, required: ['type'] }, call: (a) => run(a.type, a.args || {}) },
  { name: 'figma_export', description: 'Exports nodes as PNG files the agent can look at: args.ids or args.names (top-level frames, sections, component sets, doc cards), args.scale (default 1).', inputSchema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } }, names: { type: 'array', items: { type: 'string' } }, page: str('page name'), scale: { type: 'number' } } }, call: (a) => run('export', a) },
  { name: 'figma_eval', description: 'Runs a short Plugin API snippet in the file (async function body with `figma` in scope, return a JSON-able value). For inspection and small fixes.', inputSchema: { type: 'object', properties: { code: str('function body') }, required: ['code'] }, call: (a) => run('eval', { code: a.code }) },
];

function startMcp() {
  const send = (m) => process.stdout.write(`${JSON.stringify(m)}\n`);
  createInterface({ input: process.stdin }).on('line', async (line) => {
    let m;
    try { m = JSON.parse(line); } catch (e) { return; }
    const { id, method, params = {} } = m;
    if (id === undefined) return;
    if (method === 'initialize') return send({ jsonrpc: '2.0', id, result: { protocolVersion: params.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'figma-bridge', version: '0.1.0' } } });
    if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
    if (method === 'tools/list') return send({ jsonrpc: '2.0', id, result: { tools: TOOLS.map(({ call, ...t }) => t) } });
    if (method === 'tools/call') {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return send({ jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool ${params.name}` } });
      try { send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(await tool.call(params.arguments || {}), null, 2) }] } }); } catch (e) { send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: e.message }], isError: true } }); }
      return;
    }
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method ${method}` } });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startHttp();
  if (!process.argv.includes('--http')) startMcp();
}
