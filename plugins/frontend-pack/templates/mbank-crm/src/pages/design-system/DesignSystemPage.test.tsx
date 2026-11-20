import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '@/test/render'

describe('DesignSystemPage (dev only)', () => {
  it('shows the palette, scales and kit components on the project tokens', async () => {
    renderRoute('/design-system')
    expect(await screen.findByRole('heading', { name: 'Палитра' })).toBeInTheDocument()
    expect(screen.getByText('--primary')).toBeInTheDocument()
    expect(screen.getByText('--success')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Скругления' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Сохранить' }).length).toBeGreaterThan(5)
    expect(screen.getByRole('heading', { name: 'Поля ввода' })).toBeInTheDocument()
    expect(screen.getByLabelText('Продукт')).toBeInTheDocument()
  })
})
