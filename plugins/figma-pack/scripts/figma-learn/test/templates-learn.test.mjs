import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateSpec } from '../../../builder/core/spec.js';
import { buildTemplates, writeTemplates, TEMPLATES_DIR, archetypeOfSpecScreen } from '../templates.mjs';
import { knowledgeDrafts, learnedPatterns, validateDraft, parseFrontmatter, writeLearn, KNOWLEDGE_RULES } from '../learn.mjs';
import { loadTokens } from '../library.mjs';
import { crawled, tempRoot } from './helpers.mjs';

test('templates: real structure from files, example fills the rest, every spec passes the validator', async () => {
  const { report } = await crawled();
  const { templates, skipped } = buildTemplates(report);
  assert.deepEqual(Object.keys(templates).sort(), ['board', 'dashboard', 'form', 'list', 'login', 'record', 'wizard']);
  assert.deepEqual(skipped, [], 'the credit CRM example has a wizard (Новая заявка: stepper + form)');
  for (const [a, spec] of Object.entries(templates)) {
    assert.deepEqual(validateSpec(spec), [], a);
    assert.equal(spec.template.archetype, a);
  }
  const list = templates.list;
  assert.equal(list.template.derivedFrom.signature, 'header>tabs>toolbar>table>pagination');
  assert.deepEqual(list.template.derivedFrom.files, ['CRM Кредиты']);
  const s = list.screens[0];
  assert.deepEqual(s.states, ['default', 'empty']);
  assert.equal(s.empty.title, 'Заявок пока нет');
  assert.deepEqual(s.blocks.find((b) => b.type === 'table').columns, ['Номер:id', 'Клиент:person', 'Продукт:product', 'Сумма:money', 'Статус:status', 'Дата:date']);
  assert.equal(list.nav.find((n) => n.id === s.nav).label, 'Заявки');
  assert.deepEqual(list.viewports, ['desktop', 'mobile']);
  assert.equal(templates.record.screens[0].blocks.find((b) => b.type === 'split').ratio, '2:1');
  assert.deepEqual(templates.form.screens[0].blocks[1].fields[0], { label: 'ФИО', type: 'text', required: true });
  assert.equal(templates.board.template.derivedFrom.screens, 0);
  assert.equal(templates.board.template.derivedFrom.example, 'credit-crm');
});

test('templates without any crawl come from the examples and still validate; writeTemplates writes files', () => {
  const { templates } = buildTemplates(null);
  assert.ok(Object.keys(templates).length >= 5);
  for (const spec of Object.values(templates)) assert.deepEqual(validateSpec(spec), []);
  const out = tempRoot();
  const files = writeTemplates(templates, out);
  assert.equal(readdirSync(out).length, files.length);
  assert.equal(archetypeOfSpecScreen({ blocks: [{ type: 'split', columns: [[{ type: 'table' }], []] }] }), 'list');
});

test('shipped builder/templates are valid spec@1 and named by archetype', () => {
  assert.ok(existsSync(TEMPLATES_DIR));
  const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.spec.json'));
  assert.ok(files.length >= 5, files.join(', '));
  for (const f of files) {
    const spec = JSON.parse(readFileSync(join(TEMPLATES_DIR, f), 'utf8'));
    assert.deepEqual(validateSpec(spec), [], f);
    assert.equal(`${spec.template.archetype}.spec.json`, f);
  }
});

test('learn: knowledge drafts carry valid frontmatter and evidence', async () => {
  const { report } = await crawled();
  const { templates } = buildTemplates(report);
  const drafts = knowledgeDrafts(report, templates, { author: 'tester', min: 1 });
  const slugs = drafts.map((d) => `${d.area}/${d.slug}`);
  for (const s of ['ui/mbank-list-screen-structure', 'ui/figma-raw-hex-to-mbank-token', 'ui/figma-components-not-in-code-kit']) assert.ok(slugs.includes(s), s);
  assert.ok(!slugs.includes('ui/mbank-board-screen-structure'), 'example-only templates are not knowledge');
  for (const d of drafts) {
    assert.deepEqual(d.errors, [], d.slug);
    const { meta, body } = parseFrontmatter(d.text);
    assert.ok(KNOWLEDGE_RULES.types.includes(meta.type));
    assert.equal(meta.author, 'tester');
    assert.match(body, /## Источник\n\nfigma-learn по 3 файлам/);
  }
  const list = drafts.find((d) => d.slug === 'mbank-list-screen-structure').text;
  assert.match(list, /файлы: CRM Кредиты; фреймов: 2/);
  assert.match(list, /Сумма:money/);
  assert.equal(knowledgeDrafts(report, templates).some((d) => d.slug.endsWith('-screen-structure')), false, 'default min 2 screens');
});

test('learn: the draft validator mirrors frontend-pack knowledge rules', () => {
  const bad = '---\ntitle: x\ntype: idea\nstack: [angular]\n---\n\ntext\n';
  const errors = validateDraft(bad, 'ui', 'Bad_Slug');
  for (const e of ['slug', 'type', 'stack', 'author', 'updated', '## Решение']) assert.ok(errors.some((x) => x.includes(e)), e);
  assert.deepEqual(validateDraft('no frontmatter', 'ui', 'x'), ['ui/x.md: no frontmatter']);
});

test('learn: learned-patterns.md states rules with evidence and writeLearn writes the folder', async () => {
  const { report } = await crawled();
  const { templates } = buildTemplates(report);
  const md = learnedPatterns(report, templates, { tokens: loadTokens() });
  for (const s of ['## 1. Screen structure by archetype', '`header>tabs>toolbar>table>pagination`', 'Side menu width: 280 in 5 of 5', 'card: padding 20/20/20/20 (spacing/m-1', '## 5. Naming and handoff']) assert.ok(md.includes(s), s);
  assert.ok(md.split('\n').filter((l) => l.startsWith('- ')).every((l) => /файлы:|frames|Bound|No pair/.test(l)), 'every claim has evidence');
  const out = tempRoot();
  const files = writeLearn(out, knowledgeDrafts(report, templates, { min: 1 }), md);
  assert.ok(files.includes(join(out, 'learned-patterns.md')));
  assert.ok(existsSync(join(out, 'knowledge', 'ui', 'mbank-list-screen-structure.md')));
});
