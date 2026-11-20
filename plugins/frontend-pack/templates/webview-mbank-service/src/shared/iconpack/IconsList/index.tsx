'use client'

import { Icon } from '@shared/iconpack'
import { iconMap } from '@shared/iconpack/model/icon'

import { ChangeEvent, useState } from 'react'

const IconsList = () => {
  const [color, setColor] = useState('')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('lg')

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSize(e.target.value as 'sm' | 'md' | 'lg')
  }

  const iconKeys = Object.keys(iconMap) as Array<keyof typeof iconMap>

  return (
    <div className="p-6">
      <div className="bg-red"> 123</div>
      <h1 className="mb-6 text-2xl font-bold">Icons Showcase</h1>
      <div className="mb-6 flex items-center gap-6">
        <label className="flex items-center gap-2">
          <span>Color:</span>
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="rounded-md border border-gray-200 p-1"
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Size:</span>
          <select
            value={size}
            onChange={handleSizeChange}
            className="rounded-md border border-gray-300 p-1"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-6 sm:grid-cols-6 lg:grid-cols-8">
        {iconKeys.sort().map((iconName) => (
          <div
            key={iconName}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
              <Icon
                name={iconName}
                color={color}
                size={size}
              />
            </div>
            <span className="mt-2 text-center text-sm">{iconName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IconsList
