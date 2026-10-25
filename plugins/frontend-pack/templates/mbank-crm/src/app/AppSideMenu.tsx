import { Link } from '@tanstack/react-router'
import { PlusIcon } from '@/shared/components/crm/crm-icons'
import { SideMenu } from '@/shared/components/crm/SideMenu'
import { SideMenuUser } from '@/shared/components/crm/SideMenuUser'
import { Button } from '@/shared/ui/button'
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu'
import { helpSection, mainSections, newApplicationHref } from './navigation'

const sections = mainSections.map((section) =>
  section.id === 'credits'
    ? {
        ...section,
        action: (
          <Button asChild variant="ghost" size="icon-sm" className="size-8 text-muted-foreground">
            <Link to={newApplicationHref} aria-label="Новая заявка">
              <PlusIcon className="size-5" />
            </Link>
          </Button>
        ),
      }
    : section,
)

/** The app's side menu: navigation.ts + router links + the signed-in user. */
export function AppSideMenu({ activeId }: { activeId?: string }) {
  return (
    <SideMenu
      brand={
        <span className="flex items-center gap-3 text-xl font-bold text-foreground">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-sm bg-brand text-lg text-brand-foreground">
            M
          </span>
          MBANK CRM
        </span>
      }
      sections={sections}
      footerSections={[helpSection]}
      activeId={activeId}
      // exact: TanStack Link would mark "/applications" current on "/applications/CL-1" too; navId decides.
      renderLink={({ item, ...props }) => <Link to={item.href} activeOptions={{ exact: true }} {...props} />}
      user={
        <SideMenuUser name="Бакыт Т." role="Кредитный аналитик" initials="БТ">
          <DropdownMenuItem>Профиль</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Выйти</DropdownMenuItem>
        </SideMenuUser>
      }
    />
  )
}
