// Tests for components-map.mjs on a fixture kit (registry + catalog + map in a tmp dir) and on the real map.
// Run: node --test plugins/figma-pack/scripts/components-map.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEFAULTS, check, codeConnect, summarize, writeCatalog } from './components-map.mjs';
import { indexCode } from './code-index.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'components-map.mjs');
let dir;
let code;

const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
};
const clone = (v) => JSON.parse(JSON.stringify(v));

const BUTTON = `import { cva, type VariantProps } from "class-variance-authority"
// it's a comment with an apostrophe
const buttonVariants = cva("inline-flex", {
  variants: {
    variant: { primary: "bg-primary", destructive: "bg-destructive" },
    size: { sm: "h-9", md: "h-11" },
  },
  defaultVariants: { variant: "primary", size: "md" },
})
type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }
function Button({ className, variant, size, loading = false, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })} {...props} />
}
export { Button, buttonVariants }
`;
const DOT = `type DotProps = { tone?: "success" | "error"; label: string }
export function Dot({ tone = "success", label }: DotProps) {
  return <span aria-label={label} data-tone={tone} />
}
`;
const REGISTRY = { name: 'kit', items: [{ name: 'button', files: [{ path: 'components/button.tsx' }] }, { name: 'dot', files: [{ path: 'blocks/crm/Dot.tsx' }] }] };
const COMPONENTS = [
  { name: 'button/default', kit: 'web', library: 'Web components', type: 'COMPONENT_SET', key: 'k-button', nodeId: '1:2', variantProps: { variant: ['primary', 'negative'], size: ['m', 's'], state: ['default', 'loading'] }, properties: { 'Button Content': 'TEXT' }, code: { web: null, rn: null, flutter: null } },
  { name: 'dot', kit: 'crm', library: 'CRM UI KIT', type: 'COMPONENT_SET', key: 'k-dot', nodeId: '3:4', variantProps: { color: ['green', 'red', 'pink'] }, properties: {}, code: { web: null, rn: null, flutter: null } },
  { name: 'Frame 1', kit: 'web', library: 'Web components', type: 'COMPONENT', key: 'k-frame', nodeId: '5:6', variantProps: {}, properties: {}, code: { web: null, rn: null, flutter: null } },
];
const py = (v) => (v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(py).join(', ')}]` : `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(', ')}}`);
const CATALOG_TEXT = [
  '{',
  '  "version": 1,',
  `  "libraries": [${py({ name: 'Web components', fileKey: 'FILEWEB' })}, ${py({ name: 'CRM UI KIT', fileKey: 'FILECRM' })}],`,
  '  "components": [',
  COMPONENTS.map((c) => `    ${py(c)}`).join(',\n'),
  '  ],',
  '  "codeConnect": {"mapped": 0, "total": 3},',
  '  "gaps": []',
  '}',
  '',
].join('\n');
const MAP = {
  packages: { '@mdigital/mbank-ui': ['components'], '@mdigital/mbank-ui/crm': ['blocks/crm'] },
  components: [
    {
      figma: 'button/default', kit: 'web', key: 'k-button', nodeId: '1:2', status: 'mapped', import: '@mdigital/mbank-ui', registry: 'button', component: 'Button',
      props: {
        variant: { prop: 'variant', values: { primary: 'primary', negative: 'destructive' } },
        size: { prop: 'size', values: { m: 'md', s: 'sm' } },
        state: { prop: null, values: { default: null, loading: { loading: true } } },
      },
      text: { 'Button Content': 'children' },
    },
    { figma: 'dot', kit: 'crm', key: 'k-dot', nodeId: '3:4', status: 'partial', import: '@mdigital/mbank-ui/crm', registry: 'dot', component: 'Dot', props: { color: { prop: 'tone', values: { green: 'success', red: 'error', pink: null } } }, notes: 'pink has no tone' },
    { figma: 'Frame 1', kit: 'web', key: 'k-frame', nodeId: '5:6', status: 'ignore', notes: 'junk frame' },
  ],
};
const catalog = () => JSON.parse(CATALOG_TEXT);

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'components-map-'));
  code = join(dir, 'registry');
  write(join(code, 'components', 'button.tsx'), BUTTON);
  write(join(code, 'blocks', 'crm', 'Dot.tsx'), DOT);
  write(join(code, 'registry.json'), JSON.stringify(REGISTRY));
  write(join(dir, 'catalog.json'), CATALOG_TEXT);
  write(join(dir, 'map.json'), JSON.stringify(MAP));
});
after(() => rmSync(dir, { recursive: true, force: true }));

test('code index reads cva variants, literal unions and booleans', () => {
  const idx = indexCode(code, MAP.packages);
  assert.deepEqual(idx.components.Button.props.variant, ['primary', 'destructive']);
  assert.deepEqual(idx.components.Button.props.loading, [true, false]);
  assert.equal(idx.components.Button.native, true);
  assert.deepEqual(idx.components.Dot.props.tone, ['success', 'error']);
  assert.ok(idx.packages['@mdigital/mbank-ui/crm'].exports.has('Dot'));
});

test('check accepts a valid map', () => {
  assert.deepEqual(check(MAP, catalog(), indexCode(code, MAP.packages)), []);
});

test('check catches an invented prop value and an invented prop', () => {
  const map = clone(MAP);
  map.components[0].props.variant.values.negative = 'danger';
  map.components[1].props.color.prop = 'colour';
  const errors = check(map, catalog(), indexCode(code, MAP.packages));
  assert.ok(errors.some((e) => /variant = "danger" is not one of "primary", "destructive"/.test(e)), errors.join('\n'));
  assert.ok(errors.some((e) => /Dot has no prop "colour"/.test(e)), errors.join('\n'));
});

test('check catches a catalog component without an entry and a Figma value without a decision', () => {
  const map = clone(MAP);
  map.components.pop();
  delete map.components[1].props.color.values.pink;
  const errors = check(map, catalog(), indexCode(code, MAP.packages));
  assert.ok(errors.some((e) => /Frame 1 \(k-frame, web\): catalog component without an entry/.test(e)), errors.join('\n'));
  assert.ok(errors.some((e) => /color values without a decision: pink/.test(e)), errors.join('\n'));
});

test('check rejects a missing entry without a proposal and a wrong registry item', () => {
  const map = clone(MAP);
  map.components[2] = { figma: 'Frame 1', kit: 'web', key: 'k-frame', status: 'missing' };
  map.components[0].registry = 'dot';
  const errors = check(map, catalog(), indexCode(code, MAP.packages));
  assert.ok(errors.some((e) => /missing needs a one-line "proposal"/.test(e)));
  assert.ok(errors.some((e) => /registry item "dot" does not contain components\/button.tsx/.test(e)));
});

test('write-catalog fills code.web and codeConnect and is idempotent', () => {
  const once = writeCatalog(CATALOG_TEXT, MAP);
  const twice = writeCatalog(once, MAP);
  assert.equal(twice, once);
  const parsed = JSON.parse(once);
  assert.deepEqual(parsed.components[0].code.web, { status: 'mapped', import: '@mdigital/mbank-ui', component: 'Button', registry: 'button' });
  assert.equal(parsed.components[2].code.web, null);
  assert.equal(parsed.codeConnect.mapped, 2);
  assert.equal(parsed.codeConnect.byStatus.ignore, 1);
  assert.equal(once.split('\n').length, CATALOG_TEXT.split('\n').length, 'one line per component stays one line');
});

test('code-connect output for a mapped component (snapshot)', () => {
  const files = codeConnect(MAP, catalog());
  assert.deepEqual(Object.keys(files), ['button-default.figma.tsx']);
  assert.equal(
    files['button-default.figma.tsx'],
    `// Generated by plugins/figma-pack/scripts/components-map.mjs from components-map.json. Do not edit by hand.
// Figma: button/default (Web components, kit web), map status: mapped
import figma from "@figma/code-connect"
import { Button } from "@mdigital/mbank-ui"

figma.connect(Button, "https://www.figma.com/design/FILEWEB/?node-id=1-2", {
  props: {
    variant: figma.enum("variant", {
      "primary": "primary",
      "negative": "destructive",
    }),
    size: figma.enum("size", {
      "m": "md",
      "s": "sm",
    }),
    loading: figma.enum("state", {
      "loading": true,
    }),
    children: figma.string("Button Content"),
  },
  example: (props) => (
    <Button variant={props.variant} size={props.size} loading={props.loading}>{props.children}</Button>
  ),
})
`,
  );
  assert.equal(Object.keys(codeConnect(MAP, catalog(), { includePartial: true })).length, 2);
});

test('report groups missing components into the kit backlog', () => {
  const map = clone(MAP);
  map.components[2] = { figma: 'Frame 1', kit: 'web', key: 'k-frame', status: 'missing', proposal: 'Rating' };
  const s = summarize(map, indexCode(code, MAP.packages));
  assert.equal(s.counts.web.mapped, 1);
  assert.equal(s.counts.crm.partial, 1);
  assert.deepEqual(s.missing.map((m) => m.proposal), ['Rating']);
});

test('CLI check exits 1 on an invalid map and 0 on a valid one', () => {
  const args = ['--catalog', join(dir, 'catalog.json'), '--code', code];
  const ok = spawnSync(process.execPath, [SCRIPT, 'check', '--map', join(dir, 'map.json'), ...args], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  const bad = clone(MAP);
  bad.components[0].props.size.values.s = 'xl';
  write(join(dir, 'bad.json'), JSON.stringify(bad));
  const res = spawnSync(process.execPath, [SCRIPT, 'check', '--map', join(dir, 'bad.json'), ...args], { encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /size = "xl"/);
});

test('the real map is valid and catalog.json is in sync with it', () => {
  const map = JSON.parse(readFileSync(DEFAULTS.map, 'utf8'));
  const text = readFileSync(DEFAULTS.catalog, 'utf8');
  const errors = check(map, JSON.parse(text), indexCode(DEFAULTS.code, map.packages));
  assert.deepEqual(errors, []);
  assert.equal(writeCatalog(text, map), text, 'run: node plugins/figma-pack/scripts/components-map.mjs write-catalog');
});

test('planned: a contract-built component not in the library yet; once published it must become mapped', () => {
  const planned = { figma: 'CRM / Dot row', kit: 'crm', status: 'planned', contract: 'crm-dot-row', import: '@mdigital/mbank-ui/crm', registry: 'dot', component: 'Dot', proposal: 'build with DS Builder' };
  const idx = indexCode(code, MAP.packages);
  assert.deepEqual(check({ ...MAP, components: [...MAP.components, planned] }, catalog(), idx), []);
  const bad = check({ ...MAP, components: [...MAP.components, { ...planned, contract: undefined, component: 'Nope', key: 'k-x' }] }, catalog(), idx);
  for (const re of [/planned entry has no key/, /planned needs "contract"/, /does not export Nope/]) assert.ok(bad.some((e) => re.test(e)), bad.join('\n'));
  const published = catalog();
  published.components.push({ ...COMPONENTS[1], name: 'CRM / Dot row', key: 'k-dot-row', nodeId: '7:8', variantProps: {} });
  const now = check({ ...MAP, components: [...MAP.components, planned] }, published, idx);
  assert.ok(now.some((e) => /now in the library \(k-dot-row\): set key, nodeId and status mapped/.test(e)), now.join('\n'));
});
