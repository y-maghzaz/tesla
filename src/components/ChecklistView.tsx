import React, { useMemo, useState } from 'react'
import type { ChecklistCategory, ChecklistGroup, ChecklistItem } from '../lib/parseChecklist'
import { CheckboxRow } from './CheckboxRow'

type Props = {
  category: ChecklistCategory
  checked: (id: string) => boolean
  toggle: (id: string) => void
  resetCategory: (ids: string[]) => void
}

type Filter = 'all' | 'open' | 'done'

export function ChecklistView({ category, checked, toggle, resetCategory }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const groups = category.groups

  const idsInCategory = useMemo(() => {
    const ids: string[] = []
    for (const g of groups) collectIds(g.items, ids)
    return ids
  }, [groups])

  const { done, total } = useMemo(() => {
    let t = 0, d = 0
    for (const id of idsInCategory) {
      t++
      if (checked(id)) d++
    }
    return { done: d, total: t }
  }, [idsInCategory, checked])

  return (
    <div className="checklist">
      <div className="toolbar">
        <div className="progress" aria-label="progress">
          <div className="progress-bar" style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
          <div className="progress-text">{done}/{total} complete</div>
        </div>

        <div className="controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Filter">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
          <button className="reset" onClick={() => resetCategory(idsInCategory)}>Reset</button>
        </div>
      </div>

      {groups.map((g) => (
        <GroupView
          key={g.name}
          group={g}
          checked={checked}
          toggle={toggle}
          filter={filter}
        />
      ))}
    </div>
  )
}

function collectIds(items: ChecklistItem[], out: string[]) {
  for (const it of items) {
    out.push(it.id)
    if (it.children) collectIds(it.children, out)
  }
}

function GroupView({ group, checked, toggle, filter }: {
  group: ChecklistGroup
  checked: (id: string) => boolean
  toggle: (id: string) => void
  filter: Filter
}) {
  const [open, setOpen] = useState(true)

  const visible = useMemo(() => filterItems(group.items, checked, filter), [group.items, checked, filter])

  if (visible.length === 0) return null

  return (
    <section className="group">
      <button className="group-header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="group-title">{group.name}</span>
        <span className="group-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="group-content">
          {visible.map((item) => (
            <ItemRow key={item.id} item={item} checked={checked} toggle={toggle} filter={filter} />
          ))}
        </div>
      )}
    </section>
  )
}

function filterItems(items: ChecklistItem[], checkedFn: (id: string) => boolean, filter: Filter): ChecklistItem[] {
  const out: ChecklistItem[] = []
  for (const it of items) {
    const isDone = checkedFn(it.id)
    if (filter === 'all' || (filter === 'done' && isDone) || (filter === 'open' && !isDone)) {
      out.push(it)
    } else if (it.children) {
      const childVisible = filterItems(it.children, checkedFn, filter)
      if (childVisible.length) out.push({ ...it, children: childVisible })
    }
  }
  return out
}

function ItemRow({ item, checked, toggle, filter }: {
  item: ChecklistItem
  checked: (id: string) => boolean
  toggle: (id: string) => void
  filter: Filter
}) {
  const isChecked = checked(item.id)
  const hasChildren = !!item.children?.length
  const [open, setOpen] = useState(false)

  return (
    <div className="item">
      <CheckboxRow checked={isChecked} label={item.text} onChange={() => toggle(item.id)} />
      {hasChildren && (
        <div className="children">
          <button className="child-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide details' : 'Show details'}
          </button>
          {open && (
            <div className="child-list">
              {item.children!.map((c) => (
                <CheckboxRow key={c.id} checked={checked(c.id)} label={c.text} onChange={() => toggle(c.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

