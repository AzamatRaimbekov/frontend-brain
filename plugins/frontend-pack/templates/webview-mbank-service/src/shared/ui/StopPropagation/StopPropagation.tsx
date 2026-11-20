import { KeyboardEvent, MouseEvent, ReactNode } from 'react'

interface StopPropagationProps {
  className?: string
  onClick?: () => void
  children: ReactNode
}

export function StopPropagation({
  className,
  onClick,
  children,
}: StopPropagationProps) {
  const click = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation() // Останавливаем распространение события
    if (onClick) {
      onClick() // Вызываем переданный обработчик onClick, если он существует
    }
  }

  // Обработчик нажатий клавиш
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault() // Предотвращаем действие по умолчанию для Space
      click(event as unknown as MouseEvent<HTMLDivElement>) // Передаем событие в обработчик
    }
  }

  return (
    <div
      onClick={click} // Обработка клика
      onKeyDown={onKeyDown} // Обработка нажатий клавиш
      tabIndex={0} // Делаем div фокусируемым
      role="button" // Устанавливаем роль на кнопку для доступности
      className={className}
      style={{ cursor: 'pointer' }} // Меняем курсор на указатель
    >
      {children}
    </div>
  )
}
