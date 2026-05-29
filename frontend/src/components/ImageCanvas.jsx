import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload } from 'lucide-react'

export default function ImageCanvas({ originalImage, processedImage, isLoading, onUpload }) {
  const [divPos,     setDivPos]     = useState(50)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragging     = useRef(false)
  const containerRef = useRef(null)
  const fileRef      = useRef(null)

  useEffect(() => { if (processedImage) setDivPos(50) }, [processedImage])

  const onMove = useCallback((clientX) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDivPos(Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  useEffect(() => {
    const mm = (e) => onMove(e.clientX)
    const mu = ()  => { dragging.current = false }
    const tm = (e) => { e.preventDefault(); onMove(e.touches[0].clientX) }
    const tu = ()  => { dragging.current = false }
    document.addEventListener('mousemove', mm)
    document.addEventListener('mouseup',   mu)
    document.addEventListener('touchmove', tm, { passive: false })
    document.addEventListener('touchend',  tu)
    return () => {
      document.removeEventListener('mousemove', mm)
      document.removeEventListener('mouseup',   mu)
      document.removeEventListener('touchmove', tm)
      document.removeEventListener('touchend',  tu)
    }
  }, [onMove])

  function handleDragOver(e) { e.preventDefault(); setIsDragOver(true) }
  function handleDragLeave()  { setIsDragOver(false) }
  function handleDrop(e) {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onUpload(file)
  }
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  const showCompare    = originalImage && (processedImage || isLoading)
  const showSingleOrig = originalImage && !processedImage && !isLoading

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">

      {!originalImage && (
        <div className="flex-1 flex items-center justify-center" style={{ background: '#f9fafb' }}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-center gap-3 cursor-pointer select-none"
            style={{
              padding: '40px 48px',
              border: `2px dashed ${isDragOver ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: 8,
              background: isDragOver ? '#eff6ff' : 'transparent',
            }}
          >
            <Upload size={24} strokeWidth={1.5} style={{ color: isDragOver ? '#3b82f6' : '#9ca3af' }} />
            <div className="text-center">
              <p className="text-[13px] font-medium text-gray-600">
                Drop image here or click to upload
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WebP supported</p>
            </div>
          </div>
        </div>
      )}

      {showSingleOrig && (
        <div
          className="flex-1 relative overflow-hidden"
          style={{ background: '#f9fafb' }}
        >
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
          <span
            className="absolute top-3 left-4 text-[11px] font-medium"
            style={{ color: '#9ca3af' }}
          >
            Before
          </span>
          <span
            className="absolute bottom-3 right-4 text-[11px]"
            style={{ color: '#d1d5db' }}
          >
            Select a tool and click Apply
          </span>
        </div>
      )}

      {showCompare && (
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className="flex items-center shrink-0"
            style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }}
          >
            <span className="flex-1 text-[11px] font-medium text-gray-400">Before</span>
            <span className="flex-1 text-[11px] font-medium text-right"
                  style={{ color: '#3b82f6' }}>After</span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden select-none"
            style={{ background: '#f9fafb', cursor: dragging.current ? 'ew-resize' : 'default' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Before */}
            <img
              src={originalImage}
              alt="Before"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />

            {/* after image clipped to the right of the divider */}
            {processedImage && !isLoading && (
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${divPos}%)` }}
              >
                <img
                  src={processedImage}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            )}

            {/* shimmer placeholder while waiting for the result */}
            {isLoading && (
              <div
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 0 0 ${divPos}%)`,
                  background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'progress-advance 1.5s linear infinite',
                }}
              />
            )}

            {/* drag handle */}
            <div
              className="absolute top-0 bottom-0 flex items-center justify-center z-10"
              style={{
                left: `${divPos}%`,
                transform: 'translateX(-50%)',
                width: 24,
                cursor: 'ew-resize',
              }}
              onMouseDown={() => { dragging.current = true }}
              onTouchStart={() => { dragging.current = true }}
            >
              <div
                className="absolute top-0 bottom-0"
                style={{ width: 1, background: '#e5e7eb', left: '50%', transform: 'translateX(-50%)' }}
              />
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  border: '2px solid #fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

          {processedImage && (
            <div
              className="shrink-0 flex items-center justify-end"
              style={{ padding: '6px 16px', borderTop: '1px solid #f3f4f6' }}
            >
              <a
                href={processedImage}
                download="imagerestore.png"
                className="text-[12px] text-gray-400"
                style={{ textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                ↓ Download
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
