// Bundles the plugin: dist/code.js (sandbox) and dist/ui.html (UI with inlined script).
import { build, context } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../plugin/', import.meta.url);
const path = (p) => new URL(p, root).pathname;
const watch = process.argv.includes('--watch');
// Figma's sandbox runs ES2017-level syntax; the UI iframe is a modern browser.
const code = { entryPoints: [path('src/code.js')], bundle: true, outfile: path('dist/code.js'), target: 'es2017', format: 'iife', logLevel: 'info' };
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
  const ctx = await context({ ...code, plugins: [{ name: 'ui', setup(b) { b.onEnd(buildUi); } }] });
  await ctx.watch();
} else {
  await build(code);
  await buildUi();
}
