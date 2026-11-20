import { Icon } from '@shared/iconpack'
import { Button } from '@shared/ui/Button'
import { ResultView } from '@shared/ui/ResultView'

interface CreditResultProps {
  onDone: () => void
}

export function CreditResult({ onDone }: CreditResultProps) {
  return (
    <ResultView
      icon={
        <Icon
          name="applicationAccepted"
          size={56}
          color="var(--color-primary)"
        />
      }
      title="Заявка отправлена"
      subtitle="Решение придёт в уведомлении."
      onCloseClick={onDone}
      button={
        <Button
          block
          onClick={onDone}
        >
          Хорошо
        </Button>
      }
    />
  )
}
