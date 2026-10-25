import { Outlet, useMatches } from '@tanstack/react-router'
import { CrmLayout } from '@/shared/components/crm/CrmLayout'
import { OfflineBanner } from '@/shared/components/OfflineBanner'
import { AppHeader } from './AppHeader'
import { AppSideMenu } from './AppSideMenu'

/** Root route component: Figma CRM frame = side menu + top header + page body. */
export function AppLayout() {
  const matches = useMatches()
  const navId = matches[matches.length - 1]?.staticData.header?.navId
  return (
    <CrmLayout banner={<OfflineBanner />} sideMenu={<AppSideMenu activeId={navId} />} header={<AppHeader />}>
      <Outlet />
    </CrmLayout>
  )
}
