import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRegistry, rewriteImports, tokensToBase } from './registry-build.mjs';

test('imports of the project layout become @/registry/mbank paths the shadcn CLI rewrites', () => {
  const code = 'import { cn } from "@/shared/lib/utils"\nimport { Card } from "@/shared/ui/card"\nimport { X } from "@/shared/components/crm/X"';
  assert.equal(rewriteImports(code), 'import { cn } from "@/registry/mbank/lib/utils"\nimport { Card } from "@/registry/mbank/ui/card"\nimport { X } from "@/registry/mbank/blocks/crm/X"');
});

test('tokens.css becomes cssVars plus css; at-rules inside rules use the shadcn empty-body form', () => {
  const base = tokensToBase(`@custom-variant dark (&:where(.dark, .dark *));
:root { color-scheme: light; --primary: #fddb2b; }
.dark { --primary: #f7c21c; }
[data-brand="kassa"] { --brand: #2563eb; }
@theme inline { --color-primary: var(--primary); }
@layer base { body { @apply bg-background; } }`);
  assert.deepEqual(base.cssVars, { theme: { 'color-primary': 'var(--primary)' }, light: { primary: '#fddb2b' }, dark: { primary: '#f7c21c' } });
  assert.deepEqual(base.css['[data-brand="kassa"]'], { '--brand': '#2563eb' });
  assert.deepEqual(base.css['@layer base'], { body: { '@apply bg-background': {} } });
  assert.deepEqual(base.css[':root'], { 'color-scheme': 'light' });
  assert.ok('@custom-variant dark (&:where(.dark, .dark *))' in base.css);
});

test('the real kit builds: a registry:base item, inline file contents, namespaced dependencies without tokens', () => {
  const { registry, items } = buildRegistry();
  const base = items.find((i) => i.name === 'mbank');
  assert.equal(base.type, 'registry:base');
  assert.ok(Object.keys(base.cssVars.light).length > 100);
  const button = items.find((i) => i.name === 'button');
  assert.ok(button.files[0].content.includes('@/registry/mbank/lib/utils'));
  assert.ok(button.registryDependencies.every((d) => d.startsWith('@mbank/') && d !== '@mbank/tokens'));
  assert.ok(registry.items.every((i) => !i.files || i.files.every((f) => !('content' in f))));
});
