import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { check, create, write, KIT } from './contract-to-code.mjs';
import { parseLiteral, findBlocks, readBlock, keepOrder } from './contract-to-code/blocks.mjs';
import { readClasses, readTokens, renderScope, sameSet, splitClass } from './contract-to-code/classes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(HERE, 'contract-to-code', 'fixtures', 'kit');
const CLI = join(HERE, 'contract-to-code.mjs');
const tokens = readTokens(join(KIT, 'tokens.css'));

const withKit = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'contract-kit-'));
  try {
    cpSync(FIXTURE, dir, { recursive: true });
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
const editContract = (kit, name, change) => {
  const file = join(kit, 'contracts', `${name}.json`);
  const c = JSON.parse(readFileSync(file, 'utf8'));
  change(c);
  writeFileSync(file, JSON.stringify(c, null, 2));
};

test('literal parser reads cva configs and const maps without eval', () => {
  assert.deepEqual(parseLiteral(`{ a: "x y", 'b-c': ['z', 1, true], d: { e: \`f\` }, }`).value, { a: 'x y', 'b-c': ['z', 1, true], d: { e: 'f' } });
  const block = readBlock('const m = { sm: "h-6", md: "h-8 px-3" } as const');
  assert.deepEqual(block, { kind: 'map', name: 'm', scopes: { sm: ['h-6'], md: ['h-8', 'px-3'] } });
  assert.throws(() => parseLiteral('`a ${b}`'), /template literal/);
});

test('classes split at top-level colons; properties round-trip, the rest stays extra', () => {
  assert.deepEqual(splitClass("hover:[&_svg:not([class*='size-'])]:size-4"), { mods: ['hover', "[&_svg:not([class*='size-'])]"], util: 'size-4' });
  const contract = { name: 'x', code: { parts: { icon: '[&>svg]' }, modifiers: { selected: 'data-[state=on]' } } };
  const classes = ['h-11', 'px-4', 'bg-primary', 'hover:bg-primary-hover', 'data-[state=on]:text-foreground', 'border', 'border-input',
    'focus-visible:ring-[3px]', 'focus-visible:ring-ring/50', '[&>svg]:size-5', 'text-sm', 'font-medium', 'rounded-md',
    'transition-colors', 'inline-flex', 'bg-primary/50', 'aria-invalid:ring-border-destructive/20', 'hover:focus-visible:bg-muted', 'bg-transparent'];
  const { scope, extra } = readClasses(classes, contract, tokens);
  assert.deepEqual(scope.root, { height: 11, px: 4, bg: 'primary', 'bg:hover': 'primary-hover', 'fg:selected': 'foreground', 'border-width': 1, border: 'input', text: 'sm', weight: 'medium', radius: 'md', 'focus-ring': 'ring/50' });
  assert.deepEqual(scope.icon, { size: 5 });
  assert.deepEqual(extra.sort(), ['aria-invalid:ring-border-destructive/20', 'bg-primary/50', 'bg-transparent', 'hover:focus-visible:bg-muted', 'inline-flex', 'transition-colors']);
  assert.ok(sameSet([...renderScope(scope, contract), ...extra], classes));
});

test('the fixture kit matches its contract: cva block, const map and part block', () => {
  const [r] = check({ kit: FIXTURE });
  assert.equal(r.name, 'chip');
  assert.deepEqual(r.diffs, []);
});

test('--check reports drift per variant and exits 1', () =>
  withKit((kit) => {
    editContract(kit, 'chip', (c) => {
      c.variants.tone.brand.root.bg = 'primary';
      c.variants.size.sm.root.height = 7;
      c.base.label.weight = 'bold';
    });
    const diffs = check({ kit })[0].diffs.join('\n');
    assert.match(diffs, /chip \[tone=brand\]: contract has bg-primary; file has bg-brand/);
    assert.match(diffs, /chip\.size \[sm\]: contract has h-7; file has h-6/);
    assert.match(diffs, /chip\.label \[all\]: contract has font-bold/);
    const cli = spawnSync(process.execPath, [CLI, '--kit', kit, '--check'], { encoding: 'utf8' });
    assert.equal(cli.status, 1);
    assert.match(cli.stdout, /DRIFT chip/);
  }));

test('--write rewrites only the marked blocks, keeps class order and the rest of the file', () =>
  withKit((kit) => {
    const file = join(kit, 'components', 'chip.tsx');
    const before = readFileSync(file, 'utf8');
    assert.equal(write({ kit, name: 'chip' }).changed, false, 'in sync: nothing to write');
    editContract(kit, 'chip', (c) => {
      c.variants.tone.brand.root.bg = 'primary';
      c.variants.size.md.root.height = 9;
    });
    const res = write({ kit, name: 'chip' });
    assert.deepEqual(res.diffs, []);
    const after = readFileSync(file, 'utf8');
    assert.match(after, /brand: "bg-primary text-brand-foreground"/);
    assert.match(after, /md: "h-9 px-3 text-sm"/);
    const outside = (text) => text.split('\n').filter((l, i, all) => !Object.values(findBlocks(text)).some((b) => i > b.start && i < b.end)).join('\n');
    assert.equal(outside(after), outside(before));
    assert.deepEqual(check({ kit })[0].diffs, []);
  }));

test('keepOrder puts a changed class where the old one was', () => {
  assert.deepEqual(keepOrder(['h-11', 'bg-primary', 'hover:bg-primary-hover', 'px-4'], ['px-4', 'h-11', 'hover:bg-brand-hover', 'bg-brand', 'gap-2']),
    ['h-11', 'bg-brand', 'hover:bg-brand-hover', 'px-4', 'gap-2']);
});

test('--new scaffolds a component and a registry item from a cva contract', () =>
  withKit((kit) => {
    const tag = JSON.parse(readFileSync(join(kit, 'contracts', 'chip.json'), 'utf8'));
    tag.name = 'tag';
    tag.parts = ['root', 'icon'];
    delete tag.base.label;
    tag.code = { file: 'tag.tsx', template: 'button-like', parts: { icon: '[&>svg]' } };
    writeFileSync(join(kit, 'contracts', 'tag.json'), JSON.stringify(tag));
    const res = create({ kit, name: 'tag' });
    assert.deepEqual(res.diffs, []);
    const code = readFileSync(res.file, 'utf8');
    assert.match(code, /\/\/ @contract tag start\nconst tagVariants = cva\(/);
    assert.match(code, /type TagProps = Omit<React\.ComponentProps<"button">, "tone" \| "size"> & VariantProps<typeof tagVariants>/);
    assert.match(code, /<button type="button" data-slot="tag" className=\{cn\(tagVariants\(\{ tone, size \}\), className\)\} \{\.\.\.props\} \/>/);
    assert.ok(code.split('\n').length <= 150);
    const registry = JSON.parse(readFileSync(join(kit, 'registry.json'), 'utf8'));
    assert.deepEqual(registry.items.find((i) => i.name === 'tag').files, [{ path: 'components/tag.tsx', target: 'ui' }]);
    assert.throws(() => create({ kit, name: 'tag' }), /exists/);
    assert.throws(() => create({ kit, name: 'chip' }), /exists/);
  }));

test('the real Mbank kit matches its contracts (registry/mbank/contracts)', () => {
  const report = check();
  assert.ok(report.length >= 15, `contracts: ${report.length}`);
  assert.deepEqual(report.filter((r) => r.diffs.length), []);
});

test('block contracts: --check proves every part has its data-slot element; --write and --new refuse them', () =>
  withKit((kit) => {
    const block = {
      $schema: 'mbank/component@1', name: 'crm-note', title: 'CRM / Note', parts: ['root', 'title', 'text'], props: {}, variants: {}, states: ['default'],
      base: { title: { text: 'sm' } }, code: { kind: 'block', file: 'blocks/crm/Note.tsx', slot: 'note', inline: ['text'] },
    };
    writeFileSync(join(kit, 'contracts', 'crm-note.json'), JSON.stringify(block));
    const run = () => check({ kit, names: ['crm-note'] })[0].diffs;
    assert.match(run().join('\n'), /kit file missing/);
    mkdirSync(join(kit, 'blocks', 'crm'), { recursive: true });
    const file = join(kit, 'blocks', 'crm', 'Note.tsx');
    writeFileSync(file, 'export const Note = () => <div data-slot="note"><h3>t</h3>text</div>\n');
    assert.deepEqual(run(), ['blocks/crm/Note.tsx: part "title" has no element with data-slot="note-title"']);
    writeFileSync(file, 'export const Note = () => <div data-slot="note"><h3 data-slot="note-title">t</h3>text</div>\n');
    assert.deepEqual(run(), [], 'text is inline: no element of its own');
    assert.throws(() => write({ kit, name: 'crm-note' }), /block contract/);
    assert.throws(() => create({ kit, name: 'crm-note' }), /block contract/);
  }));
