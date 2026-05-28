import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import FFTChart from './FFTChart'

const TABS = [
  { id: 'analysis',  label: 'Analysis'  },
  { id: 'histogram', label: 'Histogram' },
  { id: 'fft',       label: 'FFT'       },
]

export default function BottomPanel({ result, hasOriginal, onAnalyze, isLoading }) {
  const [activeTab, setActiveTab] = useState('analysis')

  const statsOrig   = result?.stats_original
  const statsProc   = result?.stats_processed
  const histImgOrig = result?.histogram_original
  const histImgProc = result?.histogram_processed
  const histDataOrig = result?.hist_data_original
  const histDataProc = result?.hist_data_processed
  const fft1d        = result?.fft_data

  return (
    <div
      className="shrink-0 bg-white flex flex-col"
      style={{ height: 210, borderTop: '1px solid #e5e7eb' }}
    >
      {/* Tab bar — underline style */}
      <div
        className="flex items-end gap-6 shrink-0 px-6"
        style={{ borderBottom: '1px solid #e5e7eb', height: 40 }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="text-[12.5px] font-medium pb-0"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #111111' : '2px solid transparent',
                color: active ? '#111111' : '#6b7280',
                cursor: 'pointer',
                paddingBottom: 8,
                marginBottom: -1,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#374151' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6b7280' }}
            >
              {tab.label}
            </button>
          )
        })}

        <div style={{ flex: 1 }} />

        {hasOriginal && activeTab === 'analysis' && (
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="flex items-center gap-1 text-[11px] text-gray-400 pb-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#374151'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            <RefreshCw size={11} strokeWidth={2} className={isLoading ? 'animate-spin' : ''} />
            Analyze
          </button>
        )}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-hidden px-6 py-4">

        {activeTab === 'analysis' && (
          <div className="flex items-start gap-8 h-full">
            {statsOrig ? (
              <>
                <StatRow label="Mean"        orig={statsOrig.mean}        proc={statsProc?.mean} />
                <StatRow label="Std Dev"     orig={statsOrig.std_dev}     proc={statsProc?.std_dev} />
                <StatRow label="Correlation" orig={statsOrig.correlation} proc={statsProc?.correlation} decimals={4} />

                {/* per-channel breakdown for RGB images */}
                {statsOrig.channels && (
                  <div className="flex gap-6 border-l border-gray-100 pl-8">
                    {Object.entries(statsOrig.channels).map(([ch, s]) => {
                      const c = { Blue: '#3b82f6', Green: '#16a34a', Red: '#ef4444' }[ch] || '#6b7280'
                      const p = statsProc?.channels?.[ch]
                      return (
                        <div key={ch}>
                          <div className="text-[10px] font-semibold uppercase mb-1" style={{ color: c, letterSpacing: '0.06em' }}>{ch}</div>
                          <div className="text-[11px] font-mono text-gray-500">
                            μ {s.mean.toFixed(1)}{p && <span className="text-gray-300 ml-1">→ {p.mean.toFixed(1)}</span>}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">
                            σ {s.std.toFixed(1)}{p && <span className="text-gray-300 ml-1">→ {p.std.toFixed(1)}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <EmptyState text="Apply a tool or click Analyze to see image statistics" />
            )}
          </div>
        )}

        {activeTab === 'histogram' && (
          <div className="flex gap-6 h-full items-start">
            {histDataOrig ? (
              <>
                <HistChart data={histDataOrig} label="Before" />
                {histDataProc && <HistChart data={histDataProc} label="After" />}
              </>
            ) : histImgOrig ? (
              <img src={histImgOrig} alt="Histogram" className="h-full w-auto" />
            ) : (
              <EmptyState text="Apply a filter to see the histogram comparison" />
            )}
          </div>
        )}

        {activeTab === 'fft' && (
          <div className="h-full">
            {fft1d
              ? <FFTChart data={fft1d} />
              : <EmptyState text="Apply the FFT 1D tool to visualise the frequency spectrum" />
            }
          </div>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, orig, proc, decimals = 2 }) {
  const delta = proc !== undefined && orig !== undefined ? proc - orig : null
  return (
    <div>
      <div className="text-[10px] font-medium text-gray-400 uppercase mb-1"
           style={{ letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="text-[22px] font-mono font-semibold text-gray-900 leading-none"
           style={{ letterSpacing: '-0.04em' }}>
        {orig !== undefined ? orig.toFixed(decimals) : '—'}
      </div>
      {proc !== undefined && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[12px] font-mono text-gray-400">{proc.toFixed(decimals)}</span>
          {delta !== null && Math.abs(delta) > 0.0005 && (
            <span
              className="text-[10px] font-mono"
              style={{ color: delta > 0 ? '#16a34a' : '#dc2626' }}
            >
              {delta > 0 ? '+' : ''}{delta.toFixed(decimals)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function HistChart({ data, label }) {
  // downsample from 256 bins to 32 so the bars don't look too cramped
  const chartData = buildBins(data, 32)

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col">
      <div className="text-[10px] font-medium text-gray-400 mb-1 uppercase"
           style={{ letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="bin" tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} interval={7} />
            <YAxis tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} tickCount={3} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 10 }}
              itemStyle={{ color: '#374151' }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={v => [Math.round(v).toLocaleString(), 'Count']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[1, 1, 0, 0]} maxBarSize={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function buildBins(histData, bins = 32) {
  const step = Math.floor(256 / bins)
  const channels = Object.values(histData)
  return Array.from({ length: bins }, (_, i) => {
    const start = i * step
    const total = channels.reduce((sum, ch) => {
      const slice = ch.slice(start, start + step)
      return sum + slice.reduce((a, b) => a + b, 0) / slice.length
    }, 0)
    return { bin: start, count: total / channels.length }
  })
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[12px] text-gray-300">{text}</span>
    </div>
  )
}
