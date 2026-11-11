// Bundles the widget: dist/code.js (Widget API sandbox, JSX -> figma.widget.h) and dist/ui.html
// (iframe with inlined script and the shadcn colour roles as CSS variables). The token set
// skills/ds-tokens/references/shadcn-tokens.json is bundled at build time.
// Usage: node scripts/build.mjs [--watch]   (needs esbuild: npm install in this folder)
import { build, context } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root).pathname;
const watch = process.argv.includes('--watch');

// The widget sandbox runs ES2017-level syntax, like plugins.
const code = {
  entryPoints: [path('src/code.jsx')],
  bundle: true,
  outfile: path('dist/code.js'),
  target: 'es2017',
  format: 'iife',
  jsxFactory: 'figma.widget.h',
  jsxFragment: 'figma.widget.Fragment',
  loader: { '.js': 'jsx' },
  logLevel: 'info',
};
const ui = { entryPoints: [path('src/ui/ui.js')], bundle: true, write: false, target: 'es2020', format: 'iife', minify: true };

async function buildUi() {
  const { chromeCss } = await import(new URL('src/theme.js', root).href);
  const tokens = JSON.parse(await readFile(new URL('../skills/ds-tokens/references/shadcn-tokens.json', root), 'utf8'));
  const out = await build(ui);
  const html = await readFile(path('src/ui/ui.html'), 'utf8');
  const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  await writeFile(path('dist/ui.html'), html.replace('/*CHROME*/', chromeCss(tokens)).replace('</body>', () => `<script>${js}</script>\n</body>`));
  console.log('ui  -> widget/dist/ui.html');
}

await mkdir(path('dist'), { recursive: true });
if (watch) {
  const ctx = await context({ ...code, plugins: [{ name: 'ui', setup(b) { b.onEnd(buildUi); } }] });
  await ctx.watch();
} else {
  await build(code);
  await buildUi();
}
