import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server'
import { renderRoute } from '@/test/render'

// CL-240118 = Figma frame "CRM / Заявка на кредит / Андеррайтинг" (src/mocks/data/details.ts).
const loaded = () => screen.findByRole('heading', { level: 1, name: 'Заявка CL-240118' })
const region = (name: string) => screen.getByRole('region', { name })

describe('ApplicationPage', () => {
  it('shows a skeleton while the application loads', async () => {
    server.use(http.get('/api/applications/:id', async () => {
      await delay('infinite')
      return HttpResponse.json({})
    }))
    renderRoute('/applications/CL-240118')
    expect(await screen.findByRole('status', { name: 'Загружаем заявку' })).toBeInTheDocument()
  })

  it('shows summary, stages, key-value sections, scoring and history like the Figma frame', async () => {
    renderRoute('/applications/CL-240118')
    await loaded()
    expect(screen.getByText('Андеррайтинг', { selector: '[data-slot=badge]' })).toBeInTheDocument()
    expect(screen.getByText(/^450\s000 KGS$/)).toBeInTheDocument()
    const crumbs = screen.getByRole('navigation', { name: 'Хлебные крошки' })
    expect(within(crumbs).getByText('CL-240118')).toHaveAttribute('aria-current', 'page')
    const steps = screen.getByRole('list', { name: 'Этапы заявки' })
    expect(within(steps).getAllByRole('listitem')).toHaveLength(5)
    expect(within(steps).getByText('Андеррайтинг').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(within(region('Заёмщик')).getByText('Асанов Нурлан Бекович')).toBeInTheDocument()
    expect(within(region('Документы')).getByText('Не загружена — нужна за 6 мес')).toHaveClass('text-destructive-text')
    expect(within(region('Скоринг')).getByText('712')).toHaveClass('text-warning-text')
    expect(within(region('История заявки')).getAllByRole('listitem')).toHaveLength(4)
  })

  it('shows "not found" with a way back for an unknown id', async () => {
    renderRoute('/applications/CL-000000')
    expect(await screen.findByText('Заявка не найдена')).toBeVisible()
    expect(screen.getByRole('link', { name: 'К конвейеру' })).toHaveAttribute('href', '/')
  })

  it('shows an error with Retry on 500 and recovers', async () => {
    server.use(http.get('/api/applications/:id', () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }))
    const user = userEvent.setup()
    renderRoute('/applications/CL-240118')
    const alert = await screen.findByRole('alert')
    await user.click(within(alert).getByRole('button', { name: 'Повторить' }))
    expect(await loaded()).toBeVisible()
  })

  it('rejects after confirmation: dialog closes, status and history update, focus on h1', async () => {
    const user = userEvent.setup()
    renderRoute('/applications/CL-240118')
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Отклонить' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Отклонить заявку?' })
    expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Отклонить' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(screen.getByText('Отказ', { selector: '[data-slot=badge]' })).toBeInTheDocument()
    expect(within(region('История заявки')).getByText('Заявка отклонена')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Одобрить кредит' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Заявка отклонена')
  })

  it('keeps the dialog open and shows the error inside when the decision fails', async () => {
    server.use(http.post('/api/applications/:id/decision', () => HttpResponse.json({ message: 'boom' }, { status: 500 })))
    const user = userEvent.setup()
    renderRoute('/applications/CL-240118')
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Одобрить кредит' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Одобрить кредит?' })
    await user.click(within(dialog).getByRole('button', { name: 'Одобрить' }))
    expect(await within(dialog).findByText(/Не удалось сохранить решение/)).toBeVisible()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Андеррайтинг', { selector: '[data-slot=badge]' })).toBeInTheDocument()
  })

  it('requests documents and adds a history entry', async () => {
    const user = userEvent.setup()
    renderRoute('/applications/CL-240118')
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Запросить документы' }))
    expect(await within(region('История заявки')).findByText('Запрошены документы у клиента')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Запрос документов отправлен клиенту')
  })
})
