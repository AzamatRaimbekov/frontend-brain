// code.kind "block": a contract for a hand-written block (registry/mbank/blocks/crm/*.tsx, e.g. CRM / KPI card).
// Blocks compose kit components and have no cva to generate, so contract-to-code does not write them; --check
// proves the parts instead: data-slot="<code.slot>" on the root element and data-slot="<code.slot>-<part>" on
// every other part, except parts listed in code.inline (text that is the content of its parent element in code).
// Token existence is checked by design-engine contracts-check against tokens.css.
export const isBlock = (c) => c?.code?.kind === 'block';

export const slotOf = (c, part) => (part === 'root' ? c.code.slot : `${c.code.slot}-${part}`);

// JSX attribute data-slot="x" or a props object entry "data-slot": "x" (render-prop roots such as renderLink).
const hasSlot = (source, slot) => source.includes(`data-slot="${slot}"`) || source.includes(`"data-slot": "${slot}"`);

// Drift list (empty = every part has its element).
export function checkBlockParts(c, source) {
  if (typeof c.code.slot !== 'string' || !c.code.slot) return [`${c.name}: code.slot is required for a block contract`];
  const inline = new Set(c.code.inline ?? []);
  return c.parts
    .filter((part) => !inline.has(part))
    .filter((part) => !hasSlot(source, slotOf(c, part)))
    .map((part) => `${c.code.file}: part "${part}" has no element with data-slot="${slotOf(c, part)}"`);
}
