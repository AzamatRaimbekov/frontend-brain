import { Link } from '@tanstack/react-router'
import { PlusIcon } from '@/shared/components/crm/crm-icons'
import { SideMenu } from '@/shared/components/crm/SideMenu'
import { SideMenuBrand } from '@/shared/components/crm/SideMenuBrand'
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

type AppSideMenuProps = { activeId?: string; collapsed?: boolean; onToggleCollapsed?: () => void }

/** The app's side menu: Mbank logo, navigation.ts + router links, the signed-in user. */
export function AppSideMenu({ activeId, collapsed, onToggleCollapsed }: AppSideMenuProps) {
  return (
    <SideMenu
      brand={<SideMenuBrand name="MBANK CRM" />}
      sections={sections}
      footerSections={[helpSection]}
      activeId={activeId}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
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
