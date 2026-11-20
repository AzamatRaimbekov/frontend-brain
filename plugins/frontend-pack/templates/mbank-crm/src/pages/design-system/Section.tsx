import type { ReactNode } from 'react'

/** One band of the design-system page: anchor id, title, content. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-4">
      <h2 id={`${id}-title`} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A labelled demo card inside a section. */
export function Demo({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl bg-card p-5 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}
