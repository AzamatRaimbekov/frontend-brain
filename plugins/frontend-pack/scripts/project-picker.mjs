#!/usr/bin/env node
// Opens one local HTML page where the person picks the kind of new project (Mbank WebView microservice or
// CRM) and its folder, waits for the click and prints the choice as one JSON line on stdout.
// Usage: node project-picker.mjs [--parent <dir>] [--name <folder>] [--timeout <seconds>] [--no-open]
//   stdout: {"type":"webview"|"crm","name":"…","dir":"/abs/…","create":["node","…/new-webview.mjs","/abs/…"]}
//   exit 0 = chosen, 2 = no answer before the timeout (default 600 s): ask the same question in chat.
// Listens on 127.0.0.1 only, the page URL carries a one-time key. Pure Node 18+, no dependencies.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const PAGE = join(SCRIPTS, '..', 'assets', 'project-picker.html');
const TOKENS = join(SCRIPTS, '..', 'registry', 'mbank', 'tokens.css');

/** Project kinds the page offers; `script` scaffolds the project in `dir`. */
export const KINDS = {
  webview: { script: 'new-webview.mjs', defaultName: 'mbank-webview' },
  crm: { script: 'new-crm.mjs', defaultName: 'mbank-crm' },
};
const NAME = /^[a-z0-9][a-z0-9-]{0,47}$/;

export function parseArgs(argv) {
  const opts = { parent: process.cwd(), name: '', timeout: 600, open: true, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`${arg.split('=')[0]} needs a value`);
      return v;
    };
    if (arg === '--no-open') opts.open = false;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--parent' || arg.startsWith('--parent=')) opts.parent = value();
    else if (arg === '--name' || arg.startsWith('--name=')) opts.name = value();
    else if (arg === '--timeout' || arg.startsWith('--timeout=')) {
      opts.timeout = Number(value());
      if (!Number.isFinite(opts.timeout) || opts.timeout <= 0) throw new Error('--timeout is a positive number of seconds');
    } else throw new Error(`Unknown argument ${arg}`);
  }
  opts.parent = resolve(opts.parent);
  return opts;
}

/** Validates what the page sent. Returns the result line or throws a message the page shows. */
export function validateChoice(body, parent) {
  const kind = KINDS[body?.type];
  if (!kind) throw new Error('Выберите тип проекта');
  const name = String(body?.name ?? '').trim();
  if (!NAME.test(name)) throw new Error('Папка: латиница в нижнем регистре, цифры и дефис');
  const dir = join(parent, name);
  if (existsSync(dir) && readdirSync(dir).length > 0) throw new Error(`Папка ${name} уже есть и не пустая`);
  return { type: body.type, name, dir, create: ['node', join(SCRIPTS, kind.script), dir] };
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The page with the key and the default folder filled in. Pure: used by tests. */
export function renderPage(template, { key, name }) {
  return template.replaceAll('{{KEY}}', key).replaceAll('{{NAME}}', escapeHtml(name));
}

/**
 * Starts the server. Resolves `result` with the validated choice or null after `timeout` seconds.
 * Pure of side effects outside the socket: tests drive it with fetch.
 */
export async function startPicker({ parent, name = '', timeout = 600, template = readFileSync(PAGE, 'utf8') }) {
  const key = randomBytes(16).toString('hex');
  let settle;
  const result = new Promise((r) => { settle = r; });
  const page = renderPage(template, { key, name: name || KINDS.webview.defaultName });
  const send = (res, status, type, body) => {
    res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    res.end(body);
  };
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.searchParams.get('k') !== key) return send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, 'text/html; charset=utf-8', page);
    if (req.method === 'GET' && url.pathname === '/tokens.css') return send(res, 200, 'text/css; charset=utf-8', readFileSync(TOKENS));
    if (req.method !== 'POST' || url.pathname !== '/choose') return send(res, 404, 'text/plain; charset=utf-8', 'Not found');
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; if (raw.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const choice = validateChoice(JSON.parse(raw), parent);
        send(res, 200, 'application/json', JSON.stringify({ ok: true }));
        settle(choice);
      } catch (error) {
        send(res, 400, 'application/json', JSON.stringify({ ok: false, error: error instanceof SyntaxError ? 'Неверный запрос' : error.message }));
      }
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const timer = setTimeout(() => settle(null), timeout * 1000);
  const url = `http://127.0.0.1:${server.address().port}/?k=${key}`;
  const done = result.finally(() => { clearTimeout(timer); setTimeout(() => server.close(), 200); });
  return { url, result: done, close: () => settle(null) };
}

export function openBrowser(url) {
  const [cmd, args] = process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]] : ['xdg-open', [url]];
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.on('error', () => console.error(`Open this page in a browser: ${url}`));
  child.unref();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) {
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 7).join('\n'));
    } else {
      const picker = await startPicker(opts);
      console.error(`project-picker: waiting for a choice at ${picker.url}`);
      if (opts.open) openBrowser(picker.url);
      const choice = await picker.result;
      if (!choice) {
        console.error('project-picker: no answer in time. Ask in chat: WebView microservice or CRM, and the folder name.');
        process.exitCode = 2;
      } else console.log(JSON.stringify(choice));
    }
  } catch (error) {
    console.error(`project-picker: ${error.message}`);
    process.exitCode = 1;
  }
}
