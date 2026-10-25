import {
  AlertIcon, BookIcon, ChartIcon, ClockIcon, DownloadIcon, EyeIcon, FileCheckIcon, FileIcon, HomeIcon,
  LayersIcon, LifeBuoyIcon, ListIcon, MapPinIcon, ScanIcon, SettingsIcon, ShieldIcon, UserIcon, UsersIcon,
} from '@/shared/components/crm/crm-icons'
import type { SideMenuItemData, SideMenuSectionData } from '@/shared/components/crm/side-menu-types'

/*
 * The side menu is driven by this config (Figma `sideMenu` of "CRM / Кредитный конвейер").
 * A new page = a route in router.tsx + an item here with the same href. Items without their
 * own page yet open SectionPage ("Раздел в разработке") through placeholderItems.
 */
const item = (id: string, label: string, href: string, icon: SideMenuItemData['icon']): SideMenuItemData => ({ id, label, href, icon })

export const mainSections: SideMenuSectionData[] = [
  {
    id: 'credits',
    title: 'Кредиты',
    collapsible: true,
    items: [
      item('pipeline', 'Конвейер заявок', '/', HomeIcon),
      item('applications', 'Все заявки', '/applications', UserIcon),
      item('underwriting', 'На андеррайтинге', '/underwriting', ChartIcon),
      item('waiting-docs', 'Ждут документы', '/waiting-docs', ClockIcon),
      item('payouts', 'Выдачи', '/payouts', ListIcon),
      item('clients', 'Клиенты', '/clients', LayersIcon),
      item('products', 'Кредитные продукты', '/products', MapPinIcon),
      item('scoring-models', 'Скоринг-модели', '/scoring-models', ScanIcon),
      item('collateral', 'Залоги', '/collateral', FileCheckIcon),
      item('reports', 'Отчёты', '/reports', FileIcon),
      item('exports', 'Выгрузки', '/exports', DownloadIcon),
      item('audit', 'Журнал действий', '/audit', EyeIcon),
      item('overdue', 'Просрочка', '/overdue', AlertIcon),
    ],
  },
  {
    id: 'admin',
    title: 'Администрирование',
    items: [item('users', 'Пользователи', '/users', UsersIcon), item('roles', 'Роли и доступы', '/roles', ShieldIcon)],
  },
]

export const helpSection: SideMenuSectionData = {
  id: 'help',
  title: 'Помощь',
  items: [
    item('settings', 'Настройки', '/settings', SettingsIcon),
    item('knowledge', 'База знаний', '/knowledge', BookIcon),
    item('support', 'Служба поддержки', '/support', LifeBuoyIcon),
  ],
}

/** Placeholder route for the "+" in the Кредиты header (typed string: generated routes). */
export const newApplicationHref: string = '/applications/new'

/** Pages that exist in router.tsx; everything else in the menu is a placeholder route. */
const implemented = new Set(['pipeline'])

export const placeholderItems = [...mainSections, helpSection]
  .flatMap((section) => section.items)
  .filter((entry) => !implemented.has(entry.id))
