import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/base/empty'
import { Archive } from 'md-glyphs'

interface EmptyArchieveProps {
  title: string
  subtitle: string
}

export const EmptyArchieve = ({ subtitle, title }: EmptyArchieveProps) => {
  return (
    <Empty className="gap-y-4 p-0 py-4">
      <EmptyMedia className="mb-0">
        <Archive
          size={46}
          color="var(--color-input)"
        />
      </EmptyMedia>
      <EmptyHeader className="gap-y-2">
        <EmptyTitle className="text-[22px] leading-[1.5] font-bold tracking-normal text-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-base text-input">
          {subtitle}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
