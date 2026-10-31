// Bundles the plugin: dist/code.js (sandbox) and dist/ui.html (UI with inlined script).
import { build, context } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('../plugin/', import.meta.url);
const path = (p) => new URL(p, root).pathname;
const watch = process.argv.includes('--watch');

// Virtual module 'ds:contracts': builder/contracts/*.json; when that folder is empty, the
// hand-made fixtures from test/fixtures/contracts ship as examples (flag example: true).
async function bundledContracts() {
  for (const [dir, example] of [['../contracts/', false], ['../test/fixtures/contracts/', true]]) {
    const url = new URL(dir, import.meta.url);
    if (!existsSync(url)) continue;
    const files = (await readdir(url)).filter((f) => f.endsWith('.json')).sort();
    if (!files.length) continue;
    const list = await Promise.all(files.map(async (f) => JSON.parse(await readFile(new URL(f, url), 'utf8'))));
    return example ? list.map((c) => ({ ...c, example: true })) : list;
  }
  return [];
}
const contractsPlugin = {
  name: 'contracts',
  setup(b) {
    b.onResolve({ filter: /^ds:contracts$/ }, () => ({ path: 'contracts', namespace: 'ds' }));
    b.onLoad({ filter: /.*/, namespace: 'ds' }, async () => ({ contents: `export default ${JSON.stringify(await bundledContracts())};`, loader: 'js' }));
  },
};

// Figma's sandbox runs ES2017-level syntax; the UI iframe is a modern browser.
const code = { plugins: [contractsPlugin], entryPoints: [path('src/code.js')], bundle: true, outfile: path('dist/code.js'), target: 'es2017', format: 'iife', logLevel: 'info' };
const ui = { entryPoints: [path('src/ui/ui.js')], bundle: true, write: false, target: 'es2020', format: 'iife', minify: true };

async function buildUi() {
  const out = await build(ui);
  const html = await readFile(path('src/ui/ui.html'), 'utf8');
  const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  await writeFile(path('dist/ui.html'), html.replace('</body>', `<script>${js}</script>\n</body>`));
  console.log('ui  -> plugin/dist/ui.html');
}

await mkdir(path('dist'), { recursive: true });
if (watch) {
  const ctx = await context({ ...code, plugins: [contractsPlugin, { name: 'ui', setup(b) { b.onEnd(buildUi); } }] });
  await ctx.watch();
} else {
  await build(code);
  await buildUi();
}
