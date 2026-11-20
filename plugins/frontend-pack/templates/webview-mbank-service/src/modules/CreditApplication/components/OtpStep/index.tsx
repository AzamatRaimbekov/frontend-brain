import { OtpInput } from '@shared/ui/OtpInput'
import { Preloader } from '@shared/ui/Preloader'

interface OtpStepProps {
  error: boolean
  isVerifying: boolean
  onComplete: (code: string) => void
}

export function OtpStep({ error, isVerifying, onComplete }: OtpStepProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-6 text-center">
      <p className="text-base text-muted-foreground">Введите код из SMS</p>
      <OtpInput
        disabled={isVerifying}
        onComplete={onComplete}
      />
      {error && <p className="text-sm text-destructive">Неверный код</p>}
      {isVerifying && <Preloader />}
    </div>
  )
}
