import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { FilterChip } from '@/shared/ui/filter-chip'
import { Demo, Section } from './Section'
import { previewState } from './showcase/preview-state'
import { StateMatrix } from './showcase/StateMatrix'

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const SIZES = ['xs', 'sm', 'md', 'lg'] as const
const TONES = ['neutral', 'accent', 'success', 'warning', 'info', 'error', 'clear'] as const

export function ActionsSection() {
  return (
    <Section id="actions" title="Кнопки и бейджи">
      <Demo title="Button · вариант × состояние">
        <StateMatrix
          rows={VARIANTS}
          render={(variant, state) => (
            <Button variant={variant} {...previewState(state)}>
              Сохранить
            </Button>
          )}
        />
      </Demo>
      <div className="grid gap-4 lg:grid-cols-2">
        <Demo title="Button · размеры и загрузка">
          <div className="flex flex-wrap items-center gap-3">
            {SIZES.map((size) => (
              <Button key={size} size={size}>
                {size}
              </Button>
            ))}
            <Button loading>Отправляем</Button>
          </div>
        </Demo>
        <Demo title="Badge · тоны, FilterChip">
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip>Статус</FilterChip>
            <FilterChip selected>Продукт: Ипотека</FilterChip>
          </div>
        </Demo>
      </div>
    </Section>
  )
}
