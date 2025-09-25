import React from 'react'
import type { ChecklistCategory } from '../lib/parseChecklist'

type Props = {
  categories: ChecklistCategory[]
  activeIndex: number
  onSelect: (i: number) => void
  progress: (category: ChecklistCategory) => { done: number; total: number }
}

export function CategoryTabs({ categories, activeIndex, onSelect, progress }: Props) {
  return (
    <div className="tabs" role="tablist">
      {categories.map((c, i) => {
        const { done, total } = progress(c)
        return (
          <button
            key={c.name}
            className={i === activeIndex ? 'tab active' : 'tab'}
            onClick={() => onSelect(i)}
            role="tab"
            aria-selected={i === activeIndex}
          >
            <div className="tab-title">{c.name}</div>
            <div className="tab-sub">{done}/{total}</div>
          </button>
        )
      })}
    </div>
  )
}

