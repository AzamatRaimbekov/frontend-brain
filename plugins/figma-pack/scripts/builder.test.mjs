// Runs the Figma screen builder tests (builder/test: tokens, spec, plugin on a mocked Figma API)
// inside the repo test run. No dependencies: esbuild is only needed to rebuild plugin/dist.
// Run alone: node --test plugins/figma-pack/builder/test/*.test.mjs
import '../builder/test/core.test.mjs';
import '../builder/test/plugin.test.mjs';
