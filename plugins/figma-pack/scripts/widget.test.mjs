// Runs the Mbank Tokens Figma widget tests (widget/test: pure logic + the built dist/code.js on a
// mocked Figma API with Widget API stubs) inside the repo test run. No dependencies.
// Run alone: node --test plugins/figma-pack/widget/test/*.test.mjs
import '../widget/test/core.test.mjs';
import '../widget/test/widget.test.mjs';
