import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { handle, TOOLS } from '../mcp/server.mjs';
import { parseTokens, sources } from '../mcp/tools.mjs';

const call = (name, args) => {
  const r = handle({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
  return { error: r.result.isError, data: r.result.isError ? r.result.content[0].text : JSON.parse(r.result.content[0].text) };
};

test('initialize, tools/list and unknown methods follow JSON-RPC; notifications get no reply', () => {
  assert.equal(handle({ id: 1, method: 'initialize', params: {} }).result.serverInfo.name, 'mbank-ds');
  assert.deepEqual(handle({ id: 2, method: 'tools/list' }).result.tools.map((t) => t.name), TOOLS.map((t) => t.name));
  assert.equal(handle({ id: 3, method: 'nope' }).error.code, -32601);
  assert.equal(handle({ method: 'notifications/initialized' }), null);
});

test('ds_tokens returns light/dark values and the Figma variable from the real kit', () => {
  const { data } = call('ds_tokens', { query: 'primary' });
  const primary = data.find((t) => t.name === 'primary');
  assert.equal(primary.light, '#fddb2b');
  assert.equal(primary.figma, 'accent/primary/default');
  assert.deepEqual(parseTokens(':root {\n  --a: #fff; /* x */\n}\n.dark {\n  --a: #000;\n}'), { a: { light: '#fff', dark: '#000' } });
});

test('ds_component gives install commands and inline files; an unknown name is a tool error', () => {
  const { data } = call('ds_component', { name: 'button' });
  assert.equal(data.install.shadcn, 'npx shadcn@latest add @mbank/button');
  assert.ok(data.files[0].content.includes('cva('));
  assert.equal(call('ds_component', { name: 'nope' }).error, true);
});

test('ds_check_project finds token bypasses and an outdated tokens copy; ds_sync_project fixes the copy', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-project-'));
  try {
    mkdirSync(join(dir, 'src', 'styles'), { recursive: true });
    writeFileSync(join(dir, 'src', 'styles', 'mbank-tokens.css'), '@theme inline {}\n:root { --brand-ghost: #fff; }');
    writeFileSync(join(dir, 'src', 'App.tsx'), 'export const A = () => <div className="bg-[#ff0000] text-gray-500 ring-[3px]" />');
    const { data } = call('ds_check_project', { path: dir });
    assert.equal(data.tokens.status, 'outdated: run ds_sync_project');
    assert.deepEqual(data.issues.map((i) => i.found), ['#ff0000', 'bg-[#ff0000]', 'text-gray-500']);
    assert.equal(call('ds_sync_project', { path: dir }).data.changed, false, 'dry run by default');
    assert.equal(call('ds_sync_project', { path: dir, write: true }).data.changed, true);
    assert.equal(readFileSync(join(dir, 'src', 'styles', 'mbank-tokens.css'), 'utf8'), readFileSync(sources().tokensCss, 'utf8'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the server answers over stdio', () => {
  const input = `${JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list' })}\n`;
  const r = spawnSync(process.execPath, [new URL('../mcp/server.mjs', import.meta.url).pathname], { input, encoding: 'utf8' });
  assert.equal(JSON.parse(r.stdout.trim()).id, 7);
});
