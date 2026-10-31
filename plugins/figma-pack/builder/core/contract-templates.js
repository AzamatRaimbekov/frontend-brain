// Anatomy templates for «Новый компонент»: name + template + props -> a valid mbank/component@1
// contract the designer then rebinds in «Привязки». Tokens are Mbank tokens.css names.
import { SCHEMA, validateContract } from './contract.js';

const SIZES = { xs: [8, 3, 'xs'], sm: [9, 3, 'sm'], md: [11, 4, 'sm'], lg: [14, 6, 'base'], xl: [16, 8, 'lg'] };

export const TEMPLATES = {
  'button-like': {
    title: 'Кнопка: фон, подпись, иконка; hover/active/focus/disabled',
    parts: ['root', 'label', 'icon'],
    base: {
      root: { layout: 'row', align: 'center', gap: 2, px: 4, height: 11, radius: 'md', text: 'sm', weight: 'medium', bg: 'primary', fg: 'primary-foreground', 'bg:hover': 'primary-hover', 'bg:active': 'primary-active', 'focus-ring': 'ring/50', 'opacity:disabled': 50 },
      icon: { size: 5 },
    },
    states: ['default', 'hover', 'active', 'focus', 'disabled'],
  },
  'input-like': {
    title: 'Поле: рамка, плейсхолдер; hover/focus/disabled',
    parts: ['root', 'placeholder'],
    base: {
      root: { layout: 'row', align: 'center', px: 3, height: 11, radius: 'md', text: 'sm', bg: 'background', fg: 'foreground', border: 'input', 'border:hover': 'input-hover', 'border:focus': 'ring', 'focus-ring': 'ring/30', 'bg:disabled': 'muted', 'border:disabled': 'input-disabled' },
      placeholder: { fg: 'muted-foreground', 'fg:disabled': 'disabled-foreground' },
    },
    states: ['default', 'hover', 'focus', 'disabled'],
  },
  'badge-like': {
    title: 'Бейдж: заливка и подпись, без состояний',
    parts: ['root', 'label'],
    base: { root: { layout: 'row', align: 'center', gap: 1, px: 2, height: 6, radius: 'full', text: 'xs', weight: 'medium', bg: 'status-neutral-muted', fg: 'status-neutral-foreground' } },
    states: ['default'],
  },
  'card-like': {
    title: 'Карточка: заголовок, описание, содержимое',
    parts: ['root', 'title', 'description', 'content'],
    base: {
      root: { layout: 'column', gap: 2, px: 6, py: 6, radius: 'xl', bg: 'card', fg: 'foreground', border: 'border' },
      title: { text: 'base', weight: 'semibold' },
      description: { text: 'sm', fg: 'muted-foreground' },
      content: { layout: 'column', gap: 2, 'min-height': 16 },
    },
    states: ['default'],
  },
};

const kebab = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * props: { variant: ['primary', 'secondary'], size: ['sm', 'md'] } or the text form
 * "variant=primary,secondary; size=sm,md". Size values get heights/paddings from the scale.
 */
export function parseProps(input) {
  if (typeof input !== 'string') return input || {};
  const out = {};
  for (const chunk of input.split(/[;\n]/)) {
    const [k, v] = chunk.split('=');
    if (!k || !v) continue;
    const values = v.split(',').map((x) => kebab(x)).filter(Boolean);
    if (values.length) out[kebab(k)] = values;
  }
  return out;
}

export function newContract({ name, title, template = 'button-like', props = {} }) {
  const t = TEMPLATES[template];
  if (!t) throw new Error(`Нет шаблона «${template}»: ${Object.keys(TEMPLATES).join(', ')}`);
  const id = kebab(name);
  const c = {
    $schema: SCHEMA, name: id, title: title || name, parts: [...t.parts], props: {},
    base: JSON.parse(JSON.stringify(t.base)), variants: {}, states: [...t.states],
    code: { file: `${id}.tsx`, export: `${id.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase())}Variants` },
  };
  for (const [p, values] of Object.entries(parseProps(props))) {
    c.props[p] = { values, default: values[0] };
    c.variants[p] = {};
    for (const v of values) {
      const sz = p === 'size' && SIZES[v];
      c.variants[p][v] = sz ? { root: { height: sz[0], px: sz[1], text: sz[2] } } : {};
    }
  }
  const errors = validateContract(c);
  if (errors.length) throw new Error(errors.join('; '));
  return c;
}
