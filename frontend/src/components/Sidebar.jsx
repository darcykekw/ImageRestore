import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CATEGORIES, TOOLS } from '../toolsConfig'

export default function Sidebar({
  activeToolId, onSelectTool,
  params, onParamChange,
  onApply, isLoading, hasImage, justApplied,
}) {
  const [openCats, setOpenCats] = useState({ contrast: true })
  const activeTool = TOOLS.find(t => t.id === activeToolId) || null
  const canApply   = hasImage && activeTool && !isLoading

  function toggle(id) {
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      className="flex flex-col shrink-0 bg-white"
      style={{ width: 240, borderRight: '1px solid #e5e7eb' }}
    >
      {/* ── Scrollable tool list ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 4, paddingBottom: 8 }}>
        {CATEGORIES.map((cat, catIdx) => {
          const catTools  = TOOLS.filter(t => t.category === cat.id)
          const isOpen    = !!openCats[cat.id]
          const hasActive = catTools.some(t => t.id === activeToolId)

          return (
            <div key={cat.id}>
              {/* ── Category header — click to toggle ── */}
              <button
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between"
                style={{
                  padding: '8px 12px 8px 16px',
                  background: 'none',
                  border: 'none',
                  borderLeft: hasActive ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'   }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold uppercase"
                    style={{
                      letterSpacing: '0.07em',
                      color: hasActive ? '#3b82f6' : '#6b7280',
                    }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[9px] text-gray-300">{cat.exercise}</span>
                </div>
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  style={{
                    color: '#9ca3af',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* ── Tool list — visible when open ── */}
              {isOpen && (
                <div>
                  {catTools.map(tool => {
                    const isActive = tool.id === activeToolId
                    return (
                      <div key={tool.id}>
                        <button
                          onClick={() => onSelectTool(tool.id)}
                          title={tool.desc}
                          className="w-full text-left text-[12.5px]"
                          style={{
                            padding: '5px 16px 5px 20px',
                            borderTop: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                            color:      isActive ? '#3b82f6' : '#374151',
                            fontWeight: isActive ? 500 : 400,
                            background: 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => {
                            if (!isActive) e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseLeave={e => {
                            if (!isActive) e.currentTarget.style.background = 'none'
                          }}
                        >
                          {tool.label}
                        </button>

                        {/* Inline params for selected tool */}
                        {isActive && tool.params.length > 0 && (
                          <div
                            className="space-y-4"
                            style={{
                              padding: '10px 16px 14px 20px',
                              background: '#f9fafb',
                              borderTop: '1px solid #f3f4f6',
                              borderBottom: '1px solid #f3f4f6',
                            }}
                          >
                            {tool.params.map(param => (
                              <ParamControl
                                key={param.id}
                                param={param}
                                value={params[param.id] ?? param.default}
                                onChange={v => onParamChange(param.id, v)}
                              />
                            ))}
                          </div>
                        )}

                        {isActive && tool.params.length === 0 && (
                          <div
                            className="text-[11px] text-gray-400"
                            style={{
                              padding: '5px 16px 8px 20px',
                              background: '#f9fafb',
                              borderTop: '1px solid #f3f4f6',
                              borderBottom: '1px solid #f3f4f6',
                            }}
                          >
                            No parameters — ready to apply
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Thin divider between categories */}
              {catIdx < CATEGORIES.length - 1 && (
                <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Fixed Apply section ───────────────────────────────────────────── */}
      <div
        className="shrink-0 bg-white"
        style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}
      >
        {activeTool && (
          <div className="text-[11px] text-gray-400 mb-2 truncate">
            {activeTool.label}
          </div>
        )}

        <button
          onClick={onApply}
          disabled={!canApply}
          className="w-full h-9 text-[13px] font-semibold text-white"
          style={{
            background:   canApply ? '#3b82f6' : '#e5e7eb',
            color:        canApply ? '#ffffff'  : '#9ca3af',
            border:       'none',
            borderRadius: 8,
            cursor:       canApply ? 'pointer'  : 'not-allowed',
          }}
          onMouseEnter={e => { if (canApply) e.currentTarget.style.background = '#2563eb' }}
          onMouseLeave={e => { if (canApply) e.currentTarget.style.background = '#3b82f6' }}
        >
          {isLoading ? 'Applying…' : 'Apply'}
        </button>

        <div
          className="text-center text-[11px] mt-2"
          style={{ color: justApplied ? '#6b7280' : 'transparent', height: 16 }}
        >
          {justApplied ? '✓ Applied' : ''}
        </div>

        {!hasImage && (
          <p className="text-center text-[11px] text-gray-300 mt-1">
            Upload an image to get started
          </p>
        )}
      </div>
    </aside>
  )
}

/* ── Param controls ──────────────────────────────────────────────────────── */

function ParamControl({ param, value, onChange }) {
  const isFloat = !Number.isInteger(param.step)
  const pct     = ((value - param.min) / (param.max - param.min)) * 100

  if (param.type === 'slider') {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-medium text-gray-500">{param.label}</label>
          <span className="text-[11px] font-mono text-gray-700">
            {isFloat ? Number(value).toFixed(2) : value}
          </span>
        </div>
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={e => {
            const v = parseFloat(e.target.value)
            onChange(isFloat ? v : Math.round(v))
          }}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] font-mono text-gray-300">{param.min}</span>
          <span className="text-[9px] font-mono text-gray-300">{param.max}</span>
        </div>
      </div>
    )
  }

  if (param.type === 'select') {
    return (
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">
          {param.label}
        </label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-7 px-2 text-[11.5px] text-gray-700 rounded"
          style={{ background: '#fff', border: '1px solid #e5e7eb', outline: 'none' }}
        >
          {param.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  return null
}
