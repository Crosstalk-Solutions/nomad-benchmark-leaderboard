import React from 'react'

interface ViewToggleProps {
  view: 'rankings' | 'statistics'
  onViewChange: (view: 'rankings' | 'statistics') => void
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onViewChange('rankings')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'rankings'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Rankings
      </button>
      <button
        onClick={() => onViewChange('statistics')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'statistics'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Statistics
      </button>
    </div>
  )
}
