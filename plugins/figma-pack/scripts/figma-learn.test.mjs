// figma-learn tests inside the repo test run: crawl on a mocked Figma REST API (429 retry, incremental skip),
// analyze (archetypes, component usage, token hygiene, dev-readiness), templates (spec validator), learn (frontmatter).
// No network, no token. Run alone: node --test plugins/figma-pack/scripts/figma-learn/test/*.test.mjs
import './figma-learn/test/crawl.test.mjs';
import './figma-learn/test/analyze.test.mjs';
import './figma-learn/test/templates-learn.test.mjs';
