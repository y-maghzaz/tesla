import { useEffect, useMemo, useState } from 'react'

export type ChecklistState = Record<string, boolean>

const STORAGE_KEY = 'tesla-checklist-state-v1'

export function useLocalChecklist() {
  const [state, setState] = useState<ChecklistState>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const actions = useMemo(() => ({
    toggle(id: string) {
      setState((s) => ({ ...s, [id]: !s[id] }))
    },
    set(id: string, val: boolean) {
      setState((s) => ({ ...s, [id]: val }))
    },
    resetAll() {
      setState({})
    },
    resetMany(ids: string[]) {
      setState((s) => {
        const copy = { ...s }
        ids.forEach((id) => delete copy[id])
        return copy
      })
    },
  }), [])

  return { state, ...actions }
}

