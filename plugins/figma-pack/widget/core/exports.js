// "Sync with code": the board state as files the repo already understands.
//   tokens.json      owner contract shape (skills/mbank-figma-patterns/references/tokens.json)
//   raw dump         read-tokens.js format mbank-figma-raw/1 -> frontend-pack tokens-build.mjs --from
//   registry:base    shadcn registry item (https://ui.shadcn.com/schema/registry-item.json)
//   tokens.css       Tailwind v4 + shadcn/ui theme for one brand (preview; the canonical one is tokens-build)
import { TOKEN_MAP } from '../../builder/core/token-map.js';
import { buildModel, indexSource, normHex, resolveValue, rowsByCss, BRANDS, THEME, BRAND } from './model.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const str = (v) => (typeof v === 'number' ? String(Number(v.toFixed(4))) : v);

/** Board state (edits of every brand + extras) applied to tokens.json. */
export function exportTokensJson(tokens, { edits = {}, extras = [] } = {}) {
  const out = clone(tokens);
  const ix = indexSource(out);
  const themeVar = (name, light) => {
    let v = ix.theme.get(name);
    if (!v) {
      v = { name, key: null, light, dark: light, aliasLight: null };
      out.theme.vars.push(v);
      ix.theme.set(name, v);
    }
    return v;
  };
  for (const brand of ix.brandModes) {
    const model = buildModel(tokens, { brand, edits });
    const bi = ix.brandModes.indexOf(brand);
    for (const r of model.rows) {
      if (!r.edited) continue;
      if (r.kind === 'radius') { const v = ix.radius.get(r.figma); if (v) v.values = v.values.map(() => str(r.light)); continue; }
      if (r.collection === BRAND) {
        const v = ix.brand.get(r.figma);
        if (v) v.values[bi] = r.light;
        const d = themeVar(r.darkFigma, r.light);
        d.light = r.light;
        d.dark = r.dark;
        continue;
      }
      if (brand !== ix.brandModes[0]) continue; // 2.theme does not depend on the brand
      const v = themeVar(r.figma, r.light);
      if (!v || r.light == null) continue;
      if (v.light !== r.light) v.aliasLight = null;
      v.light = r.light;
      v.dark = r.dark;
    }
  }
  const model = buildModel(out, { brand: ix.brandModes[0], extras });
  const byCss = rowsByCss(model.rows);
  for (const r of model.rows.filter((x) => x.extra)) {
    const val = (mode) => (r.kind === 'color' ? normHex(resolveValue(r[mode], mode, byCss)) : str(r[mode]));
    const alias = /^var\(--([\w-]+)\)$/.exec(String(r.light));
    const target = alias && byCss.get(alias[1]);
    const v = themeVar(r.figma, val('light'));
    Object.assign(v, { light: val('light'), dark: val('dark'), aliasLight: target ? target.figma : null });
  }
  return out;
}

/** tokens.json -> read-tokens.js dump of the Foundation file (2.theme + 1.brand), for tokens-build --from. */
export function rawDump(tokens, { date = new Date().toISOString() } = {}) {
  const theme = tokens.theme.vars.map((v) => {
    const color = normHex(v.light) !== null;
    return {
      name: v.name, key: v.key || null, type: color ? 'COLOR' : 'FLOAT',
      values: { light: color ? v.light : Number(v.light), dark: color ? v.dark : Number(v.dark) },
      alias: { light: v.aliasLight || null, dark: null },
    };
  });
  const modes = tokens.brand.modes || tokens.brand.columns || BRANDS;
  const per = (fn) => Object.fromEntries(modes.map((m, i) => [m, fn(i)]));
  const brand = [
    ...tokens.brand.vars.map((v) => ({ name: v.name, key: v.key || null, type: 'COLOR', values: per((i) => v.values[i]), alias: per(() => null) })),
    ...((tokens.brandRadius && tokens.brandRadius.vars) || []).map((v) => ({ name: v.name, key: v.key || null, type: 'FLOAT', values: per(() => Number(v.values[0])), alias: per(() => null) })),
  ];
  return {
    format: 'mbank-figma-raw/1',
    kit: 'foundation',
    file: { name: 'Mbank Tokens widget', key: null },
    readAt: date,
    collections: [
      { name: THEME, key: (tokens.theme && tokens.theme.key) || null, modes: ['light', 'dark'], variables: theme },
      { name: BRAND, key: null, modes, variables: brand },
    ],
    textStyles: [],
    effectStyles: [],
    warnings: [],
  };
}

/** CSS variables of one brand: { light: { primary: '#..' }, dark: {...}, theme: {...} } (names without --). */
export function cssVarsOf(model) {
  const byCss = rowsByCss(model.rows);
  const light = {};
  const dark = {};
  for (const r of model.rows) {
    if (r.light == null) continue;
    if (r.kind === 'color') {
      light[r.css] = normHex(resolveValue(r.light, 'light', byCss)) || r.light;
      dark[r.css] = normHex(resolveValue(r.dark, 'dark', byCss)) || r.dark;
    } else {
      light[r.css] = `${Number(r.light)}px`;
      if (r.dark != null && Number(r.dark) !== Number(r.light)) dark[r.css] = `${Number(r.dark)}px`;
    }
  }
  for (const [css, m] of Object.entries(TOKEN_MAP.colors)) {
    if (m.alias && !(css in light)) { light[css] = `var(--${m.alias})`; dark[css] = `var(--${m.alias})`; }
  }
  if (light['radius-md']) light.radius = light['radius-md'];
  const theme = { 'font-sans': '"Inter Mbank", Inter, ui-sans-serif, system-ui, sans-serif' };
  return { light, dark, theme };
}

export const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';

/** shadcn registry item of type registry:base for one brand. */
export function registryBase(model) {
  const vars = cssVarsOf(model);
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: `mbank-${model.brand}`,
    type: 'registry:base',
    title: `Mbank ${model.brand}`,
    description: `Mbank design system, brand ${model.brand}: Figma tokens (2.theme + 1.brand) from the Mbank Tokens widget for shadcn/ui + Tailwind v4`,
    cssVars: vars,
    meta: {
      generator: 'figma-pack/widget (Mbank Tokens)',
      brand: model.brand,
      figma: { collections: [THEME, BRAND], brandMode: model.brand },
      extras: model.rows.filter((r) => r.extra).map((r) => r.css),
    },
  };
}

const block = (selector, vars) => `${selector} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}`;

/** tokens.css for one brand: :root, .dark, @theme inline, @layer base. */
export function tokensCss(model) {
  const vars = cssVarsOf(model);
  const inline = {};
  for (const r of model.rows) {
    if (r.kind === 'color') inline[`color-${r.css}`] = `var(--${r.css})`;
    else if (r.kind === 'radius' && r.css.startsWith('radius-')) inline[r.css] = `var(--${r.css})`;
  }
  for (const [css, m] of Object.entries(TOKEN_MAP.colors)) if (m.alias) inline[`color-${css}`] = `var(--${css})`;
  Object.assign(inline, vars.theme);
  return [
    '/*',
    ` * Mbank ${model.brand}: design tokens for Tailwind CSS v4 + shadcn/ui.`,
    ' * GENERATED by the Figma widget Mbank Tokens (figma-pack/widget). Preview of one brand; the canonical',
    ' * file is frontend-pack registry/mbank/tokens.css from tokens-build.mjs. Do not edit by hand.',
    ' */',
    '',
    '@custom-variant dark (&:where(.dark, .dark *));',
    '',
    block(':root', vars.light),
    '',
    block('.dark', vars.dark),
    '',
    block('@theme inline', inline),
    '',
    '@layer base {',
    '  * { @apply border-border outline-ring/50; }',
    '  body { @apply bg-background text-foreground; }',
    '}',
    '',
  ].join('\n');
}

export const OWNER_TOKENS = 'plugins/figma-pack/skills/mbank-figma-patterns/references/tokens.json';

/** What the developer runs after downloading the files (repo root). */
export function syncCommands({ contracts = [] } = {}) {
  const out = [
    { title: 'tokens.json → репозиторий (владелец контракта), затем копия во frontend-pack и tokens.css',
      cmd: `cp ~/Downloads/tokens.json ${OWNER_TOKENS}\nnode plugins/figma-pack/scripts/tokens-platforms.mjs split\nnode plugins/design-engine/scripts/sync-contracts.mjs` },
    { title: 'Или сырой дамп, как после read-tokens.js',
      cmd: `node plugins/frontend-pack/scripts/tokens-build.mjs --from ~/Downloads/mbank-tokens-raw.json --tokens ${OWNER_TOKENS}\nnode plugins/figma-pack/scripts/tokens-platforms.mjs split\nnode plugins/design-engine/scripts/sync-contracts.mjs` },
    { title: 'Проверка: копии и tokens.css совпадают с владельцем', cmd: 'npm test' },
  ];
  if (contracts.length) {
    const files = contracts.length > 1 ? `{${contracts.join(',')}}` : contracts[0];
    out.splice(2, 0, {
      title: `Контракты компонентов (${contracts.join(', ')}) → builder/contracts, затем код кита`,
      cmd: `cp ~/Downloads/${files}.json plugins/figma-pack/builder/contracts/\nnode plugins/design-engine/scripts/sync-contracts.mjs\nnode plugins/frontend-pack/scripts/contract-to-code.mjs`,
    });
  }
  return out;
}
