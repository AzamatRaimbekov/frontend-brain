// Bundles mcp/entry.js for use_figma and cuts it into calls under the 50 000-char limit.
// Usage: node bundle.mjs <out-dir>  -> 01-load.js … NN-load.js (store chunks), run.js (helper to prepend).
// use_figma hosts have no setPluginData / loadAllPagesAsync: they are rewritten to shared plugin data
// (namespace "mbank.local") and to loading every page.
import { build } from 'esbuild';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const out = process.argv[2] || here('dist/').pathname;
const CHUNK = 20000;
// djb2 of a chunk: the load call returns it, so the caller checks the code arrived unchanged.
const hash = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0; return h.toString(16); };

const contractsPlugin = {
  name: 'contracts',
  setup(b) {
    b.onResolve({ filter: /^ds:contracts$/ }, () => ({ path: 'contracts', namespace: 'ds' }));
    b.onLoad({ filter: /.*/, namespace: 'ds' }, async () => {
      const dir = here('../contracts/');
      const files = existsSync(dir) ? (await readdir(dir)).filter((f) => f.endsWith('.json')).sort() : [];
      const list = await Promise.all(files.map(async (f) => JSON.parse(await readFile(new URL(f, dir), 'utf8'))));
      return { contents: `export default ${JSON.stringify(list)};`, loader: 'js' };
    });
  },
};

// Library keys of tokens.json are not needed in the file the engine writes to: fewer chars to send.
const lean = {
  name: 'lean-tokens',
  setup(b) {
    b.onLoad({ filter: /tokens\.json$/ }, async (a) => {
      const strip = (v) => (Array.isArray(v) ? v.map(strip) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'key').map(([k, x]) => [k, strip(x)])) : v);
      return { contents: JSON.stringify(strip(JSON.parse(await readFile(a.path, 'utf8')))), loader: 'json' };
    });
  },
};

const res = await build({ entryPoints: [here('entry.js').pathname], bundle: true, write: false, target: 'es2017', format: 'iife', minify: true, charset: 'ascii', plugins: [contractsPlugin, lean], loader: { '.json': 'json' } });
let js = res.outputFiles[0].text
  .replace(/\.setPluginData\(/g, '.setSharedPluginData("mbank.local",')
  .replace(/\.getPluginData\(/g, '.getSharedPluginData("mbank.local",')
  .replace(/\.getPluginDataKeys\(\)/g, '.getSharedPluginDataKeys("mbank.local")')
  // ASCII only: the agent copies the code into the call; Cyrillic and invisible spaces in regexes get mangled.
  .replace(/[^\x00-\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
  .replace(/figma\.loadAllPagesAsync\(\)/g, 'Promise.all(figma.root.children.map(p=>p.loadAsync?p.loadAsync():0))');

await mkdir(out, { recursive: true });
const parts = [];
for (let i = 0; i < js.length; i += CHUNK) parts.push(js.slice(i, i + CHUNK));
for (const [i, p] of parts.entries()) {
  const code = `const s=${JSON.stringify(p)};figma.root.setSharedPluginData('mbank.mcp','chunk:${i}',s);figma.root.setSharedPluginData('mbank.mcp','chunks','${parts.length}');let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return {chunk:${i},of:${parts.length},hash:h.toString(16)};`;
  if (code.length > 50000) throw new Error(`chunk ${i} is ${code.length} chars`);
  await writeFile(`${out}/${String(i + 1).padStart(2, '0')}-load.js`, code);
}
await writeFile(`${out}/hashes.json`, JSON.stringify(parts.map(hash)));
// Prepend to every call that uses the engine: evaluates the stored chunks once per call.
await writeFile(`${out}/run.js`, "const __n=+figma.root.getSharedPluginData('mbank.mcp','chunks');let __s='';for(let i=0;i<__n;i++)__s+=figma.root.getSharedPluginData('mbank.mcp','chunk:'+i);(0,eval)(__s);const DS=globalThis.DS;\n");
console.log(`${js.length} chars -> ${parts.length} load calls in ${out}`);
