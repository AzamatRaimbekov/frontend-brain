import { useState } from 'react'
import { Outlet, useMatches } from '@tanstack/react-router'
import { CrmLayout } from '@/shared/components/crm/CrmLayout'
import { OfflineBanner } from '@/shared/components/OfflineBanner'
import { AppHeader } from './AppHeader'
import { AppSideMenu } from './AppSideMenu'

/** Root route component: Figma CRM frame = side menu + top header + page body. */
export function AppLayout() {
  const matches = useMatches()
  const navId = matches[matches.length - 1]?.staticData.header?.navId
  // Figma sideMenu "«" button: 280px menu <-> 72px icon rail.
  const [collapsed, setCollapsed] = useState(false)
  return (
    <CrmLayout
      banner={<OfflineBanner />}
      collapsed={collapsed}
      sideMenu={<AppSideMenu activeId={navId} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />}
      header={<AppHeader />}
    >
      <Outlet />
    </CrmLayout>
  )
}
