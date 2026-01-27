import React from 'react'

interface ViewToggleProps {
  view: 'rankings' | 'statistics'
  onViewChange: (view: 'rankings' | 'statistics') => void
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-nomad-olive-mid/15 p-1">
      <button
        onClick={() => onViewChange('rankings')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'rankings'
            ? 'bg-nomad-olive text-nomad-surface shadow'
            : 'text-nomad-olive-mid hover:text-nomad-olive'
        }`}
      >
        Rankings
      </button>
      <button
        onClick={() => onViewChange('statistics')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'statistics'
            ? 'bg-nomad-olive text-nomad-surface shadow'
            : 'text-nomad-olive-mid hover:text-nomad-olive'
        }`}
      >
        Statistics
      </button>
    </div>
  )
}
