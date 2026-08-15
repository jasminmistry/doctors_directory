'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPlus, IconX } from '@tabler/icons-react'

interface ArrayEditorProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

export function ArrayEditor({ items, onChange, placeholder }: Readonly<ArrayEditorProps>) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(index)}
          >
            <IconX stroke={1.5} className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add new item..."
        />
        <Button onClick={addItem}>
          <IconPlus stroke={1.5} className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}
