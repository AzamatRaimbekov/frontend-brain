// The bridge without Figma: a fake plugin polls, runs the command, posts the result; PNGs land on disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const PORT = 3999;
const base = `http://127.0.0.1:${PORT}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('command round trip and PNG export through the HTTP bridge', async () => {
  const srv = spawn(process.execPath, [new URL('./server.mjs', import.meta.url).pathname, '--http'], { env: { ...process.env, FIGMA_BRIDGE_PORT: String(PORT) } });
  try {
    await wait(300);
    assert.equal((await (await fetch(`${base}/status`)).json()).connected, false);
    const plugin = (async () => {
      for (let i = 0; i < 2; i++) {
        const cmd = await (await fetch(`${base}/poll?file=Demo`)).json();
        const result = cmd.type === 'export' ? { images: [{ id: '1:2', name: 'Doc / Input', width: 1, height: 1, base64: 'iVBORw0KGgo=' }] } : { echo: cmd.args };
        await fetch(`${base}/result`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: cmd.id, ok: true, result }) });
      }
    })();
    await wait(100);
    const run = (type, args) => fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, args }) }).then((r) => r.json());
    assert.deepEqual((await run('inspect', { a: 1 })).result, { echo: { a: 1 } });
    const exp = await run('export', { names: ['Doc / Input'] });
    assert.ok(existsSync(exp.result.images[0].path), 'PNG written to disk');
    await plugin;
    assert.equal((await (await fetch(`${base}/status`)).json()).file, 'Demo');
  } finally {
    srv.kill();
  }
});
