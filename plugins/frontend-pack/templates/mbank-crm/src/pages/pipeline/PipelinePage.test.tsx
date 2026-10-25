import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server'
import { renderRoute } from '@/test/render'

// Seed = Figma frame "CRM / Конвейер заявок" (src/mocks/data/cards.ts).
const board = () => screen.findByRole('list', { name: 'Этапы конвейера' })

describe('PipelinePage', () => {
  it('shows skeletons while the pipeline loads', async () => {
    server.use(http.get('/api/pipeline', async () => {
      await delay('infinite')
      return HttpResponse.json({})
    }))
    renderRoute('/')
    expect(await screen.findByRole('status', { name: 'Загружаем конвейер' })).toBeInTheDocument()
  })

  it('shows KPIs and the five stages with cards, counts and SLA badges', async () => {
    renderRoute('/')
    const columns = within(await board()).getAllByRole('region')
    expect(columns.map((c) => within(c).getByRole('heading').textContent)).toEqual([
      'Новые', 'Скоринг', 'Проверка СБ', 'Андеррайтинг', 'Решение',
    ])
    expect(screen.getByRole('heading', { level: 1, name: 'Кредитный конвейер' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Конвейер на 12 октября' })).toBeInTheDocument()
    const kpis = screen.getByRole('list', { name: 'Показатели' })
    expect(within(kpis).getByText('2 ч 14 мин')).toBeInTheDocument()
    expect(within(kpis).getByText('−18 мин')).toHaveClass('text-success-text')
    expect(within(kpis).getByText('+4')).toHaveClass('text-destructive-text')

    const fresh = columns[0]
    expect(within(fresh).getByLabelText('24 заявок')).toBeInTheDocument()
    expect(within(fresh).getByText('Просрочено 7 мин')).toBeInTheDocument()
    expect(within(fresh).getByRole('button', { name: 'Показать ещё 21' })).toBeInTheDocument()
    expect(within(columns[2]).getByText('SLA 1 ч 05 мин')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CL-240118/ })).toHaveAttribute('href', '/applications/CL-240118')
  })

  it('switches the period through the segment and keeps it in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await board()
    await user.click(screen.getByRole('tab', { name: 'Неделя' }))
    expect(await screen.findByRole('heading', { name: 'Конвейер за неделю 6–12 октября' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ period: 'week' })
    expect(screen.getByRole('tab', { name: 'Неделя' })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows an empty state when there are no applications', async () => {
    server.use(http.get('/api/pipeline', ({ request }) => {
      const period = new URL(request.url).searchParams.get('period')
      return HttpResponse.json({ period, periodLabel: 'на 12 октября', kpis: [], columns: [] })
    }))
    renderRoute('/')
    expect(await screen.findByText('Заявок за период нет')).toBeVisible()
  })

  it('shows an error with Retry and recovers', async () => {
    server.use(http.get('/api/pipeline', () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }))
    const user = userEvent.setup()
    renderRoute('/')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Не удалось загрузить конвейер')
    await user.click(within(alert).getByRole('button', { name: 'Повторить' }))
    expect(await board()).toBeInTheDocument()
  })

  it('marks the current menu item and opens placeholder sections instead of 404', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const menu = await screen.findByRole('navigation', { name: 'Главное меню' })
    expect(within(menu).getByRole('link', { name: 'Конвейер заявок' })).toHaveAttribute('aria-current', 'page')
    await user.click(within(menu).getByRole('link', { name: 'Клиенты' }))
    expect(await screen.findByText('Раздел в разработке')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'Клиенты' })).toBeInTheDocument()
  })
})
