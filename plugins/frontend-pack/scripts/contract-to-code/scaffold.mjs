// New kit component from a contract (contract-to-code --new): the cva block between @contract markers plus a
// minimal accessible React 19 component by anatomy template. Pure Node 18+, no dependencies.
import { blockText, contractBlocks, cvaProps, exportName } from './blocks.mjs';

const pascal = (name) => name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());

// template -> element, extra JSX attributes, and whether it renders children.
export const TEMPLATES = {
  'button-like': { element: 'button', attrs: ['type="button"'], about: 'a native <button>: focusable, Enter/Space work, pass aria-label when there is no text' },
  'input-like': { element: 'input', attrs: [], about: 'a native <input>: pair it with <Label htmlFor> or aria-label; aria-invalid shows the error state' },
  'badge-like': { element: 'span', attrs: [], about: 'a non-interactive <span>: put the meaning in its text, not only in the colour' },
  'card-like': { element: 'div', attrs: [], about: 'a <div> surface: give it a heading inside, or role="region" with aria-labelledby' },
};

export function scaffold(contract) {
  const template = contract.code?.template ?? 'badge-like';
  const t = TEMPLATES[template];
  if (!t) throw new Error(`${contract.name}: unknown code.template "${template}" (${Object.keys(TEMPLATES).join(', ')})`);
  if ((contract.code?.shape ?? 'cva') !== 'cva' || contract.code?.maps || contract.code?.prefix || contract.code?.blocks)
    throw new Error(`${contract.name}: --new needs a plain cva contract (no shape/maps/prefix/blocks)`);
  const Name = pascal(contract.name);
  const variants = exportName(contract);
  const props = cvaProps(contract);
  const block = blockText(contractBlocks(contract)[contract.name]);
  const omit = props.length ? `Omit<React.ComponentProps<"${t.element}">, ${props.map((p) => JSON.stringify(p)).join(' | ')}>` : `React.ComponentProps<"${t.element}">`;
  const args = ['className', ...props, '...props'].join(', ');
  const call = `${variants}({ ${props.join(', ')} })`.replace('({  })', '()');
  const attrs = [...t.attrs, `data-slot="${contract.name}"`, `className={cn(${call}, className)}`, '{...props}'];
  return [
    'import type * as React from "react"',
    'import { cva, type VariantProps } from "class-variance-authority"',
    '',
    'import { cn } from "@/shared/lib/utils"',
    '',
    '/*',
    ` * ${contract.title ?? Name}${contract.figma?.name ? ` (Figma \`${contract.figma.name}\`)` : ''}. Generated from the contract`,
    ` * registry/mbank/contracts/${contract.name}.json by contract-to-code --new (template ${template}).`,
    ' * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.',
    ` * Accessibility: ${t.about}.`,
    ' */',
    `// @contract ${contract.name} start`,
    block,
    `// @contract ${contract.name} end`,
    '',
    `type ${Name}Props = ${omit} & VariantProps<typeof ${variants}>`,
    '',
    `function ${Name}({ ${args} }: ${Name}Props) {`,
    `  return <${t.element} ${attrs.join(' ')} />`,
    '}',
    '',
    `export { ${Name}, ${variants} }`,
    '',
  ].join('\n');
}

// registry.json item for the new file.
export const registryItem = (contract) => ({
  name: contract.name,
  type: 'registry:ui',
  description: `${contract.title ?? pascal(contract.name)} (from contract ${contract.name}.json)${contract.figma?.name ? `: Figma ${contract.figma.name}` : ''}`,
  files: [{ path: `components/${contract.code?.file ?? `${contract.name}.tsx`}`, target: 'ui' }],
  dependencies: ['class-variance-authority'],
  registryDependencies: ['utils', 'tokens'],
});
