import { Undo2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function Navbar({ onToggleSidebar, sidebarOpen, canUndo, onUndo }) {
  return (
    <header
      className="flex items-center justify-between px-4 shrink-0 bg-white"
      style={{ height: 56, borderBottom: '1px solid #e5e7eb' }}
    >
      <div className="flex items-center gap-3">
        {/* sidebar toggle — useful on small screens */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center rounded"
          style={{
            width: 30, height: 30,
            background: 'none', border: 'none',
            color: '#9ca3af', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#374151' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen
            ? <PanelLeftClose size={17} strokeWidth={1.8} />
            : <PanelLeftOpen  size={17} strokeWidth={1.8} />
          }
        </button>

        <span
          className="text-[15px] font-semibold text-gray-900"
          style={{ letterSpacing: '-0.01em' }}
        >
          Art of Image Processing
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 hidden sm:block">
          Digital Image Processing
        </span>

        {/* undo button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last apply"
          className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded"
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            color: canUndo ? '#374151' : '#d1d5db',
            cursor: canUndo ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canUndo) e.currentTarget.style.background = '#f9fafb' }}
          onMouseLeave={e => { if (canUndo) e.currentTarget.style.background = 'none' }}
        >
          <Undo2 size={13} strokeWidth={2} />
          Undo
        </button>
      </div>
    </header>
  )
}
