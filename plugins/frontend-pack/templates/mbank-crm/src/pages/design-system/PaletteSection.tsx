import { GROUPS } from '@/dev/design-system/tokens'

function Swatch({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex shrink-0 overflow-hidden rounded-md border border-border">
        <span className="size-8" style={{ background: `var(--${name})` }} />
        <span className="dark size-8" style={{ background: `var(--${name})` }} />
      </span>
      <code className="truncate text-xs text-muted-foreground">--{name}</code>
    </li>
  )
}

/** All colour tokens of the project, light and dark side by side, read live from the loaded CSS. */
export function PaletteSection() {
  return (
    <section id="palette" aria-labelledby="ds-palette" className="flex scroll-mt-20 flex-col gap-4">
      <h2 id="ds-palette" className="text-xl font-bold">
        Палитра
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">{group.title}</h3>
            <ul className="flex flex-col gap-2">
              {group.names.map((name) => (
                <Swatch key={name} name={name} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
