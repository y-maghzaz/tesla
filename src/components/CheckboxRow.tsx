import React from 'react'

type Props = {
  checked: boolean
  label: string
  onChange: () => void
}

export function CheckboxRow({ checked, label, onChange }: Props) {
  return (
    <label className="row" onClick={onChange}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
      />
      <span className="label">{label}</span>
    </label>
  )
}

