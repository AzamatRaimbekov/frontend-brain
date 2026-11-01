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

test('a poll dropped by a relaunched plugin does not swallow the next command', async () => {
  const srv = spawn(process.execPath, [new URL('./server.mjs', import.meta.url).pathname, '--http'], { env: { ...process.env, FIGMA_BRIDGE_PORT: String(PORT + 1) } });
  const b = `http://127.0.0.1:${PORT + 1}`;
  try {
    await wait(300);
    const gone = new AbortController();
    fetch(`${b}/poll?file=Old`, { signal: gone.signal }).catch(() => {});
    await wait(100);
    gone.abort(); // the old plugin window closed while its long poll was open
    await wait(100);
    const run = fetch(`${b}/run`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'inspect', args: { n: 1 } }) }).then((r) => r.json());
    await wait(100);
    const cmd = await (await fetch(`${b}/poll?file=New`)).json(); // the relaunched plugin
    assert.equal(cmd.type, 'inspect');
    await fetch(`${b}/result`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: cmd.id, ok: true, result: 'done' }) });
    assert.deepEqual(await run, { ok: true, result: 'done' });
  } finally {
    srv.kill();
  }
});
