export type ChecklistItem = {
  id: string
  text: string
  children?: ChecklistItem[]
}

export type ChecklistGroup = {
  name: string
  items: ChecklistItem[]
}

export type ChecklistCategory = {
  name: string
  groups: ChecklistGroup[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`_*~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function isCheckboxLine(line: string): boolean {
  return /^\s*-\s*\[( |x|X)\]\s+/.test(line)
}

function extractCheckboxText(line: string): { indent: number; text: string } {
  const indent = (line.match(/^\s*/)?.[0].length ?? 0)
  const text = line.replace(/^\s*-\s*\[( |x|X)\]\s+/, '').trim()
  return { indent, text }
}

// Very lightweight parser tuned to this repo's README structure
export function parseChecklist(markdown: string): ChecklistCategory[] {
  const lines = markdown.split(/\r?\n/)

  const categories: ChecklistCategory[] = []
  let currentCategory: ChecklistCategory | null = null
  let currentGroup: ChecklistGroup | null = null
  const seenIds = new Set<string>()

  const pushCategory = (name: string) => {
    currentCategory = { name, groups: [] }
    categories.push(currentCategory)
    currentGroup = null
  }

  const pushGroup = (name: string) => {
    if (!currentCategory) return
    currentGroup = { name, items: [] }
    currentCategory.groups.push(currentGroup)
  }

  const ensureDefaultGroup = () => {
    if (!currentCategory) return
    if (!currentGroup) pushGroup('General')
  }

  const makeId = (cat: string, group: string, text: string): string => {
    let base = `${slugify(cat)}__${slugify(group)}__${slugify(text)}`
    let id = base
    let i = 1
    while (seenIds.has(id)) {
      id = `${base}-${i++}`
    }
    seenIds.add(id)
    return id
  }

  // Track nesting for sub-items using indent width (2 spaces per level)
  let stack: { level: number; item: ChecklistItem }[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    if (!line) continue
    if (/^>/.test(line)) continue // skip blockquotes (photos/fixes/notes)

    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      pushCategory(h2[1].trim())
      stack = []
      continue
    }

    const h3 = line.match(/^###\s+(.+)/)
    if (h3 && currentCategory) {
      pushGroup(h3[1].trim())
      stack = []
      continue
    }

    if (isCheckboxLine(line)) {
      ensureDefaultGroup()
      if (!currentCategory || !currentGroup) continue

      const { indent, text } = extractCheckboxText(line)
      const level = Math.floor(indent / 2)
      const id = makeId(currentCategory.name, currentGroup.name, text)
      const node: ChecklistItem = { id, text }

      if (level <= 0 || stack.length === 0) {
        currentGroup.items.push(node)
        stack = [{ level, item: node }]
      } else {
        // find nearest parent with lower level
        while (stack.length && stack[stack.length - 1].level >= level) {
          stack.pop()
        }
        const parent = stack[stack.length - 1]?.item
        if (parent) {
          parent.children ||= []
          parent.children.push(node)
          stack.push({ level, item: node })
        } else {
          currentGroup.items.push(node)
          stack = [{ level, item: node }]
        }
      }
      continue
    }
  }

  // Filter out categories without any groups/items
  return categories.filter((c) => c.groups.some((g) => g.items.length > 0))
}

