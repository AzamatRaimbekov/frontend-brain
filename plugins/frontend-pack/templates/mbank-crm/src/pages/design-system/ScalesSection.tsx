const TEXT = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const
const TEXT_CLASS: Record<(typeof TEXT)[number], string> = {
  xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl',
}
const RADIUS = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl', '3xl': 'rounded-3xl', '4xl': 'rounded-4xl' }
const SHADOW = { xs: 'shadow-xs', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' }

/** Text scale, radius scale and shadows of the design system (Figma font/*, radius/*, shadow/bottom/*). */
export function ScalesSection() {
  return (
    <section id="scales" aria-labelledby="ds-scales" className="grid scroll-mt-20 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h2 id="ds-scales" className="text-xl font-bold">
          Текст · Inter Mbank
        </h2>
        <ul className="flex flex-col gap-2">
          {TEXT.map((k) => (
            <li key={k} className="flex items-baseline gap-4">
              <code className="w-12 shrink-0 text-xs text-muted-foreground">{k}</code>
              <span className={`${TEXT_CLASS[k]} truncate font-medium`}>Кредитный конвейер</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Скругления</h2>
          <ul className="flex flex-wrap gap-3">
            {Object.entries(RADIUS).map(([k, cls]) => (
              <li key={k} className="flex flex-col items-center gap-1">
                <span className={`size-14 border border-border bg-muted ${cls}`} />
                <code className="text-xs text-muted-foreground">{k}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Тени</h2>
          <ul className="flex flex-wrap gap-4">
            {Object.entries(SHADOW).map(([k, cls]) => (
              <li key={k} className={`flex size-20 items-end rounded-lg bg-card p-2 ${cls}`}>
                <code className="text-xs text-muted-foreground">{k}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
