import React, { useMemo, useState } from 'react'
import readme from '../README.md?raw'
import { parseChecklist, type ChecklistCategory } from './lib/parseChecklist'
import { useLocalChecklist } from './lib/useLocalChecklist'
import { CategoryTabs } from './components/CategoryTabs'
import { ChecklistView } from './components/ChecklistView'

function App() {
  const data = useMemo<ChecklistCategory[]>(() => parseChecklist(readme), [])
  const [active, setActive] = useState(0)
  const { state, toggle, resetAll, resetMany } = useLocalChecklist()

  const checked = (id: string) => !!state[id]

  const categoryProgress = (cat: ChecklistCategory) => {
    let total = 0
    let done = 0
    for (const g of cat.groups) {
      for (const it of g.items) collectProgress(it)
    }
    function collectProgress(it: any) {
      total++
      if (state[it.id]) done++
      if (it.children) it.children.forEach(collectProgress)
    }
    return { done, total }
  }

  const activeCategory = data[active]

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Tesla Model Y Delivery Checklist</h1>
        <div className="header-actions">
          <button className="reset-all" onClick={resetAll}>Reset All</button>
        </div>
      </header>

      <CategoryTabs
        categories={data}
        activeIndex={active}
        onSelect={setActive}
        progress={categoryProgress}
      />

      {activeCategory && (
        <ChecklistView
          category={activeCategory}
          checked={checked}
          toggle={toggle}
          resetCategory={resetMany}
        />
      )}

      <footer className="footer">
        <small>
          Data parsed from README; your progress is saved locally in this browser.
        </small>
      </footer>
    </div>
  )
}

export default App
