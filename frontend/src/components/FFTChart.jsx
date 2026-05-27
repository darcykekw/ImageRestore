import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function FFTChart({ data }) {
  if (!data || data.length === 0) return null

  const step = Math.max(1, Math.floor(data.length / 300))
  const half = Math.floor(data.length / 2)
  const chartData = data
    .filter((_, i) => i % step === 0)
    .map((v, i) => ({ freq: (i * step) - half, magnitude: v }))

  return (
    <div className="h-full flex flex-col">
      <div className="text-[10px] font-medium text-gray-400 mb-1 uppercase"
           style={{ letterSpacing: '0.06em' }}>
        1D FFT — Row Frequency Spectrum
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
            <XAxis
              dataKey="freq"
              tick={{ fill: '#d1d5db', fontSize: 8 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#d1d5db', fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              tickCount={3}
            />
            <ReferenceLine x={0} stroke="#e5e7eb" />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                fontSize: 10,
                fontFamily: 'ui-monospace',
              }}
              itemStyle={{ color: '#3b82f6' }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={v => [v.toFixed(4), 'Magnitude']}
            />
            <Line
              type="monotone"
              dataKey="magnitude"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: '#2563eb', stroke: 'none' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
