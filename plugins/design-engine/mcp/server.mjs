#!/usr/bin/env node
// MCP server "mbank-ds" (stdio, JSON-RPC 2.0, one message per line): the design system for frontend agents.
// Claude Code starts it from the design-engine plugin (.mcp.json); any MCP client can run `node server.mjs`.
// Pure Node 18+, no dependencies.
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { checkProject, component, components, syncProject, tokens } from './tools.mjs';

const VERSION = '0.1.0';
const str = (description) => ({ type: 'string', description });

export const TOOLS = [
  {
    name: 'ds_tokens',
    description: 'Mbank design tokens: name (CSS var / Tailwind suffix), light and dark value, Figma variable. Use before writing any colour, radius or text class.',
    inputSchema: { type: 'object', properties: { query: str('filter by name or Figma variable, e.g. "brand", "text/muted"') } },
    run: (a) => tokens({ query: a.query }),
  },
  {
    name: 'ds_components',
    description: 'Kit components (@mdigital/mbank-ui and shadcn registry @mbank): name, type, description, whether a component contract exists, linked Figma components.',
    inputSchema: { type: 'object', properties: {} },
    run: () => components(),
  },
  {
    name: 'ds_component',
    description: 'One kit component: install commands (package, shadcn, copy), dependencies, the component contract (which token is bound to which part/variant/state) and the source files.',
    inputSchema: { type: 'object', properties: { name: str('registry name, e.g. "button", "data-table", "crm-kpi-card"') }, required: ['name'] },
    run: (a) => component({ name: a.name }),
  },
  {
    name: 'ds_check_project',
    description: 'Checks a React project against the design system: is its copy of the tokens current, and which lines bypass tokens (hex, arbitrary values, Tailwind palette, inline colours).',
    inputSchema: { type: 'object', properties: { path: str('absolute project root') }, required: ['path'] },
    run: (a) => checkProject({ path: a.path }),
  },
  {
    name: 'ds_sync_project',
    description: 'Replaces the project\'s copy of the Mbank tokens with the current design system (copy-mode projects). Dry run unless write=true.',
    inputSchema: { type: 'object', properties: { path: str('absolute project root'), write: { type: 'boolean' } }, required: ['path'] },
    run: (a) => syncProject({ path: a.path, write: a.write === true }),
  },
];

export function handle(message) {
  const { id, method, params = {} } = message;
  const reply = (result) => ({ jsonrpc: '2.0', id, result });
  if (method === 'initialize') {
    return reply({ protocolVersion: params.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'mbank-ds', version: VERSION } });
  }
  if (method === 'ping') return reply({});
  if (method === 'tools/list') return reply({ tools: TOOLS.map(({ run, ...tool }) => tool) });
  if (method === 'tools/call') {
    const tool = TOOLS.find((t) => t.name === params.name);
    if (!tool) return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool ${params.name}` } };
    try {
      return reply({ content: [{ type: 'text', text: JSON.stringify(tool.run(params.arguments ?? {}), null, 2) }] });
    } catch (e) {
      return reply({ content: [{ type: 'text', text: e.message }], isError: true });
    }
  }
  if (id === undefined) return null; // notifications (initialized, cancelled)
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  createInterface({ input: process.stdin }).on('line', (line) => {
    if (!line.trim()) return;
    let response;
    try {
      response = handle(JSON.parse(line));
    } catch {
      response = { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } };
    }
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  });
}
