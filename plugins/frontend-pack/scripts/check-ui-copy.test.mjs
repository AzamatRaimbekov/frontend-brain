// Tests for check-ui-copy.mjs. Run: node --test plugins/frontend-pack/scripts/check-ui-copy.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSource } from './check-ui-copy.mjs';

const rules = (src, file = 'src/pages/Clients.tsx') => checkSource(src, file).map((f) => f.rule);

test('a lean screen passes', () => {
  const src = `
export function Clients() {
  return (
    <section>
      <h1>{t('clients.title')}</h1>
      <h2>Документы</h2>
      <Input label="Телефон" placeholder="+996 555 123 456" />
      <Button variant="outline">Отмена</Button>
      <Button>Сохранить</Button>
      <p>ИНН, CRM и API — сокращения, не капслок</p>
    </section>
  );
}`;
  assert.deepEqual(checkSource(src, 'src/pages/Clients.tsx'), []);
});

test('filler phrases, «!» and shouting are found', () => {
  const src = `<div>
    <p>Здесь вы можете управлять клиентами</p>
    <h2>Добро пожаловать!</h2>
    <p>ВНИМАНИЕ проверьте данные</p>
    <EmptyState description="Пожалуйста, создайте заявку" />
  </div>`;
  const r = rules(src);
  assert.ok(r.filter((x) => x === 'filler').length >= 3, r.join());
  assert.ok(r.includes('exclamation'));
  assert.ok(r.includes('caps'));
});

test('long text and long buttons are found', () => {
  const long = 'Этот раздел показывает всех клиентов банка, которых вы когда-либо добавляли, вместе с их статусами и историей';
  const r = rules(`<p>${long}</p><Button variant="outline">Перейти к списку всех клиентов</Button>`);
  assert.ok(r.includes('long'));
  assert.ok(r.includes('button'));
});

test('two primary buttons side by side are found, primary + outline is fine', () => {
  assert.ok(rules('<Button>Сохранить</Button>\n<Button>Отправить</Button>').includes('two-primary'));
  assert.ok(!rules('<Button variant="outline">Отмена</Button>\n<Button>Сохранить</Button>').includes('two-primary'));
  assert.ok(rules('<Button variant="default">А</Button>\n<Button>Б</Button>').includes('two-primary'));
});

test('a placeholder that repeats the label is found', () => {
  assert.ok(rules('<Input label="Телефон" placeholder="Введите телефон" />').includes('placeholder'));
  assert.ok(rules('<Input label="Email" placeholder="Email" />').includes('placeholder'));
});

test('i18n dictionaries are checked by phrase only', () => {
  const dict = JSON.stringify({ clients: { title: 'Клиенты', hint: 'Пожалуйста, заполните форму', long: 'x'.repeat(200) } });
  const r = rules(dict, 'src/locales/ru.json');
  assert.deepEqual(r, ['filler']);
  assert.deepEqual(rules(dict, 'src/data/clients.json'), [], 'other JSON is not a dictionary');
});

test('TypeScript generics, conditions and comments are not interface text', () => {
  const src = `/** Optional <b>user</b> block: pass a custom node to replace the default avatar and the name. Long comment text here. */
type P = { user?: React.ReactNode; items: Array<Item> };
export function A({ ok }: P) {
  if (!ok) return null; // Пожалуйста, не трогай — это комментарий!
  return <div>{ok ? <span>Да</span> : null}</div>;
}`;
  assert.deepEqual(checkSource(src, 'src/A.tsx'), []);
});

test('subtitles without data are found; a subtitle with data stays', () => {
  const r = rules(`<h1>Клиенты</h1>
      <p className="text-sm text-muted-foreground">Управляйте клиентами банка</p>
      <PageHeader title="Заявки" subtitle="Все заявки в одном месте" />`);
  assert.equal(r.filter((x) => x === 'subtitle').length, 2, r.join());
  assert.deepEqual(rules(`<h1>Обзор</h1><p className="text-muted-foreground">Обновлено в 09:40</p><Header subtitle="128 заявок" />`), []);
  assert.deepEqual(rules(`<h1>Страница не найдена</h1><p className="text-muted-foreground">Проверьте адрес или вернитесь назад.</p>`), [], 'an instruction on an error screen stays');
});

test('--hook feeds findings back to the agent with exit 2 and stays quiet on clean files', async () => {
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join, dirname } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const script = join(dirname(fileURLToPath(import.meta.url)), 'check-ui-copy.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'ui-copy-'));
  const bad = join(dir, 'Page.tsx');
  const good = join(dir, 'Ok.tsx');
  writeFileSync(bad, '<h1>Клиенты</h1>\n<p className="text-muted-foreground">Здесь вы можете управлять клиентами</p>\n');
  writeFileSync(good, '<h1>Клиенты</h1>\n<Button>Сохранить</Button>\n');
  const run = (file, env = {}) => spawnSync(process.execPath, [script, '--hook'], {
    input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: file } }), encoding: 'utf8', env: { ...process.env, ...env },
  });
  const r = run(bad);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /subtitle/);
  assert.match(r.stderr, /filler/);
  assert.equal(run(good).status, 0);
  assert.equal(run(bad, { MDIGITAL_COPY_HOOK: 'off' }).status, 0);
  assert.equal(run(join(dir, 'notes.md')).status, 0, 'not a component');
});
