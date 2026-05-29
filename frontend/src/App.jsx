import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import Navbar       from './components/Navbar'
import Sidebar      from './components/Sidebar'
import ImageCanvas  from './components/ImageCanvas'
import BottomPanel  from './components/BottomPanel'
import ProgressBar  from './components/ProgressBar'
import { TOOLS }    from './toolsConfig'

export default function App() {
  const [originalImage,  setOriginalImage]  = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [activeToolId,   setActiveToolId]   = useState(null)
  const [params,         setParams]         = useState({})
  const [result,         setResult]         = useState(null)
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState(null)
  const [justApplied,    setJustApplied]    = useState(false)
  const [history,        setHistory]        = useState([])
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const appliedTimer = useRef(null)

  const activeTool = TOOLS.find(t => t.id === activeToolId) || null

  function markApplied() {
    clearTimeout(appliedTimer.current)
    setJustApplied(true)
    appliedTimer.current = setTimeout(() => setJustApplied(false), 3000)
  }

  // read the file and reset everything when a new image is dropped
  const handleUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target.result)
      setProcessedImage(null)
      setResult(null)
      setError(null)
      setJustApplied(false)
      setHistory([])
    }
    reader.readAsDataURL(file)
  }, [])

  // switching tools resets params to their defaults
  const handleSelectTool = useCallback((toolId) => {
    setActiveToolId(toolId)
    const tool = TOOLS.find(t => t.id === toolId)
    if (tool) {
      const defaults = {}
      tool.params.forEach(p => { defaults[p.id] = p.default })
      setParams(defaults)
    }
    setError(null)
    setJustApplied(false)
  }, [])

  // send image + current params to the backend, update result on success
  const handleApply = useCallback(async () => {
    if (!originalImage || !activeTool) return
    setIsLoading(true)
    setError(null)
    try {
      const payload = { image: originalImage, method: activeTool.method, params }

      if (activeTool.endpoint === '/api/fft' && activeTool.fftType)
        payload.type = activeTool.fftType
      if (activeTool.endpoint === '/api/intensity-slice') {
        payload.low   = params.low   ?? 100
        payload.high  = params.high  ?? 200
        payload.color = [params.color_r ?? 0, params.color_g ?? 255, params.color_b ?? 0]
        delete payload.method
      }
      if (activeTool.endpoint === '/api/bitplane') {
        payload.bit = params.bit ?? 7
        delete payload.method
      }

      const { data } = await axios.post(activeTool.endpoint, payload)
      if (data.error) {
        setError(data.error)
      } else {
        // save current state + tool label to undo stack before overwriting
        setHistory(prev => [...prev, { processedImage, result, label: activeTool.label }])
        setProcessedImage(data.processed || null)
        setResult(data)
        markApplied()
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Server error')
    } finally {
      setIsLoading(false)
    }
  }, [originalImage, activeTool, params])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setProcessedImage(prev.processedImage)
    setResult(prev.result)
  }, [history])

  // just get the stats without applying any filter
  const handleAnalyze = useCallback(async () => {
    if (!originalImage) return
    setIsLoading(true)
    try {
      const { data } = await axios.post('/api/analyze', { image: originalImage })
      setResult(prev => ({
        ...prev,
        stats_original:     data.stats,
        histogram_original: data.histogram_image,
        hist_data_original: data.histogram_data,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [originalImage])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-gray-900"
         style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ProgressBar isLoading={isLoading} />
      <Navbar
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        canUndo={history.length > 0}
        onUndo={handleUndo}
        lastToolLabel={history.length > 0 ? history[history.length - 1].label : null}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {sidebarOpen && (
          <Sidebar
            activeToolId={activeToolId}
            onSelectTool={handleSelectTool}
            params={params}
            onParamChange={(id, val) => setParams(prev => ({ ...prev, [id]: val }))}
            onApply={handleApply}
            isLoading={isLoading}
            hasImage={!!originalImage}
            justApplied={justApplied}
          />
        )}

        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <ImageCanvas
            originalImage={originalImage}
            processedImage={processedImage}
            isLoading={isLoading}
            onUpload={handleUpload}
          />

          {error && (
            <div className="shrink-0 px-4 py-2 bg-red-50 border-t border-red-100 text-red-600 text-xs font-mono">
              {error.split('\n')[0]}
            </div>
          )}

          <BottomPanel
            result={result}
            hasOriginal={!!originalImage}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
