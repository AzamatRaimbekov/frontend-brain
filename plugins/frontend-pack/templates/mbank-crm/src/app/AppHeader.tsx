import { Link, useMatches, useNavigate } from '@tanstack/react-router'
import { Breadcrumbs } from '@/shared/components/crm/Breadcrumbs'
import { BellIcon, ChevronLeftIcon, SettingsIcon } from '@/shared/components/crm/crm-icons'
import { HeaderIconButton } from '@/shared/components/crm/HeaderIconButton'
import { HeaderSearch } from '@/shared/components/crm/HeaderSearch'
import { SideMenuSheet } from '@/shared/components/crm/SideMenuSheet'
import { TopHeader } from '@/shared/components/crm/TopHeader'
import { UserMenu } from '@/shared/components/crm/UserMenu'
import { Button } from '@/shared/ui/button'
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu'
import { ChevronDownIcon } from '@/shared/ui/icons'
import { AppSideMenu } from './AppSideMenu'

/** TopHeader of the current route: title or breadcrumbs from staticData.header (route-header.ts). */
export function AppHeader() {
  const matches = useMatches()
  const leaf = matches[matches.length - 1]
  const header = leaf?.staticData.header
  const params = (leaf?.params ?? {}) as Record<string, string>
  const navigate = useNavigate()

  return (
    <TopHeader
      leading={
        <SideMenuSheet>
          <AppSideMenu activeId={header?.navId} />
        </SideMenuSheet>
      }
      title={header?.crumbs ? undefined : header?.title}
      back={
        header?.backTo && (
          <Button asChild variant="ghost" size="icon-sm" className="-ml-2 max-md:hidden">
            <Link to={header.backTo} aria-label="Назад">
              <ChevronLeftIcon />
            </Link>
          </Button>
        )
      }
      breadcrumbs={
        header?.crumbs && (
          <Breadcrumbs items={header.crumbs(params)} renderLink={({ item, ...props }) => <Link to={item.href} activeOptions={{ exact: true }} {...props} />} />
        )
      }
      search={
        <HeaderSearch
          onSearch={(query) => query && navigate({ to: '/applications/$applicationId', params: { applicationId: query.toUpperCase() } })}
        />
      }
      actions={
        <>
          <Button variant="secondary" size="sm" className="max-sm:hidden">
            Экспорт
            <ChevronDownIcon />
          </Button>
          <HeaderIconButton label="Настройки" className="max-sm:hidden">
            <SettingsIcon />
          </HeaderIconButton>
          <HeaderIconButton label="Уведомления" indicator>
            <BellIcon />
          </HeaderIconButton>
        </>
      }
      user={
        <UserMenu name="Бакыт Токтосунов" role="Кредитный аналитик" initials="БТ">
          <DropdownMenuItem>Профиль</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Выйти</DropdownMenuItem>
        </UserMenu>
      }
    />
  )
}
