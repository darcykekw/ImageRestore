import { useEffect, useRef, useState } from 'react'

export default function ProgressBar({ isLoading }) {
  const [visible, setVisible]   = useState(false)
  const [phase,   setPhase]     = useState('idle')  // 'running' | 'done' | 'idle'
  const doneTimer = useRef(null)

  useEffect(() => {
    if (isLoading) {
      clearTimeout(doneTimer.current)
      setVisible(true)
      setPhase('running')
    } else {
      setPhase('done')
      doneTimer.current = setTimeout(() => {
        setVisible(false)
        setPhase('idle')
      }, 500)
    }
    return () => clearTimeout(doneTimer.current)
  }, [isLoading])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        background: '#e5e7eb',
        pointerEvents: 'none',
      }}
    >
      <div
        className={phase === 'running' ? 'progress-running' : 'progress-done'}
        style={{
          height: '100%',
          transition: phase === 'done' ? 'width 0.2s ease, opacity 0.3s ease 0.15s' : 'none',
          opacity: phase === 'done' ? 0 : 1,
        }}
      />
    </div>
  )
}
