import { ColorPair } from './showcase/ColorPair'
import { Section } from './Section'

// Surface + its foreground with live contrast (shadcn design-system-page.md, «Color roles»).
const PAIRS = [
  ['Фон', 'background', 'foreground'],
  ['Карточка', 'card', 'card-foreground'],
  ['Поповер', 'popover', 'popover-foreground'],
  ['Главная кнопка', 'primary', 'primary-foreground'],
  ['Второстепенная', 'secondary', 'secondary-foreground'],
  ['Приглушённый', 'muted', 'muted-foreground'],
  ['Акцент', 'accent', 'accent-foreground'],
  ['Ошибка', 'background', 'destructive'],
  ['Успех', 'success', 'success-foreground'],
  ['Предупреждение', 'warning', 'warning-foreground'],
  ['Инфо', 'info', 'info-foreground'],
  ['Боковое меню', 'sidebar-primary', 'sidebar-primary-foreground'],
] as const

export function ColorRolesSection() {
  return (
    <Section id="roles" title="Роли цветов и контраст">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PAIRS.map(([name, bg, fg]) => (
          <ColorPair key={`${bg}-${fg}`} name={name} background={bg} foreground={fg} />
        ))}
      </div>
    </Section>
  )
}
