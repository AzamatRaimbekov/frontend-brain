import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/ui/button'

/** Placeholder for menu items without a page yet; replace with a real page (mbank-crm skill). */
export function SectionPage({ title }: { title: string }) {
  return (
    <>
      <title>{`${title} — Mbank CRM`}</title>
      <EmptyState
        title="Раздел в разработке"
        description={`«${title}» появится здесь. Пока можно работать с конвейером заявок.`}
        action={
          <Button asChild variant="secondary">
            <Link to="/">К конвейеру</Link>
          </Button>
        }
      />
    </>
  )
}
