import { Button } from '@shared/ui/Button'

interface CreditSubmitActionsProps {
  loading: boolean
}

export function CreditSubmitActions({ loading }: CreditSubmitActionsProps) {
  return (
    <Button
      block
      className="mt-2"
      loading={loading}
      type="submit"
    >
      Продолжить
    </Button>
  )
}
