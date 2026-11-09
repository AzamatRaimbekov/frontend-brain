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
