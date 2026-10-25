// Tests for knowledge.mjs search ranking. Run: node --test plugins/frontend-pack/scripts/knowledge.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MAX_RESULTS, rank, stem } from './knowledge.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'knowledge.mjs');

const entry = (slug, { title, tags = [], body = '', stack = ['all'], area = 'testing', status } = {}) => ({
  area, slug, file: `${area}/${slug}.md`, body,
  meta: { title, tags, stack, type: 'gotcha', status },
});

test('stem strips Russian and English endings but keeps at least four letters', () => {
  assert.equal(stem('загрузка'), 'загрузк');
  assert.equal(stem('Тесты'), 'тест');
  assert.equal(stem('testing'), 'test');
  assert.equal(stem('msw'), 'msw');
});

test('title beats tags, tags beat body', () => {
  const ranked = rank([
    entry('in-body', { title: 'Другое', body: 'про роутер tanstack' }),
    entry('in-title', { title: 'Роутер и скролл' }),
    entry('in-tags', { title: 'Третье', tags: ['роутер'] }),
  ], ['роутер']);
  assert.deepEqual(ranked.map((r) => r.e.slug), ['in-title', 'in-tags', 'in-body']);
  assert.deepEqual(ranked.map((r) => r.score), [3, 2, 1]);
});

test('word forms match by stem', () => {
  const ranked = rank([entry('a', { title: 'Состояние загрузки страницы' })], ['загрузка', 'страница']);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].matched, 2);
});

test('short terms match whole words only', () => {
  const ranked = rank([entry('a', { title: 'h1 в каждом состоянии' }), entry('b', { title: 'h12 grid' })], ['h1']);
  assert.deepEqual(ranked.map((r) => r.e.slug), ['a']);
});

test('with three or more terms an entry must match at least half of them', () => {
  const entries = [
    entry('one-term', { title: 'vitest only' }),
    entry('two-terms', { title: 'vitest msw' }),
  ];
  assert.deepEqual(rank(entries, ['vitest', 'msw', 'jsdom', 'router']).map((r) => r.e.slug), ['two-terms']);
  assert.deepEqual(rank(entries, ['vitest', 'msw']).map((r) => r.e.slug), ['two-terms', 'one-term']);
});

test('filters by stack and area, skips deprecated, caps the result list', () => {
  const many = Array.from({ length: 12 }, (_, i) => entry(`e${i}`, { title: `msw ${i}` }));
  assert.equal(rank(many, ['msw']).length, MAX_RESULTS);
  const mixed = [
    entry('next-only', { title: 'msw', stack: ['next'] }),
    entry('old', { title: 'msw', status: 'deprecated' }),
    entry('data', { title: 'msw', area: 'data' }),
  ];
  assert.deepEqual(rank(mixed, ['msw'], { stack: 'vite' }).map((r) => r.e.slug), ['data']);
  assert.deepEqual(rank(mixed, ['msw'], { area: 'testing', stack: 'next' }).map((r) => r.e.slug), ['next-only']);
});

test('CLI prints the score and at most eight results', () => {
  const out = spawnSync(process.execPath, [SCRIPT, 'search', 'msw', 'vitest'], { encoding: 'utf8' }).stdout;
  assert.match(out, /score \d+\]/);
  assert.ok(out.split('\n').filter((l) => l.endsWith('.md')).length <= MAX_RESULTS);
});
