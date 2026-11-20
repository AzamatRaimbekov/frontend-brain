import { ActionsSection } from './ActionsSection'
import { ColorRolesSection } from './ColorRolesSection'
import { DataSection } from './DataSection'
import { FeedbackSection } from './FeedbackSection'
import { InputsSection } from './InputsSection'
import { OverlaysSection } from './OverlaysSection'
import { PaletteSection } from './PaletteSection'
import { ScalesSection } from './ScalesSection'

const ANCHORS = [
  ['roles', 'Цвета'], ['palette', 'Палитра'], ['scales', 'Шкалы'], ['actions', 'Кнопки'], ['inputs', 'Поля'],
  ['data', 'Данные'], ['feedback', 'Обратная связь'], ['overlays', 'Оверлеи'],
] as const

/**
 * Dev-only design-system page by the shadcn skill guide (skills/shadcn/design-system-page.md): foundations, then
 * components with pinned states, on the live project tokens. The page title is in the top header (staticData).
 */
export function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-10 p-6">
      <nav aria-label="Разделы" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {ANCHORS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="text-info underline-offset-4 hover:underline">
            {label}
          </a>
        ))}
      </nav>
      <ColorRolesSection />
      <PaletteSection />
      <ScalesSection />
      <ActionsSection />
      <InputsSection />
      <DataSection />
      <FeedbackSection />
      <OverlaysSection />
    </div>
  )
}
