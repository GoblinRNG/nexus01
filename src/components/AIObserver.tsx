import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Eye, EyeOff, Crosshair, ShieldAlert, Cpu, ChevronDown } from 'lucide-react'
import Tesseract from 'tesseract.js'
import type { SourceEvent, EventSource, AppSettings } from '../types'

interface AIObserverProps {
  running: boolean
  onStart: () => void
  onStop: () => void
  onSelectRegion: () => void
  onEventDetected: (event: SourceEvent) => void
  selectedRegion?: { x: number; y: number; width: number; height: number }
  settings: AppSettings
}

const SOURCE_COLORS: Record<EventSource, string> = {
  OCR:         'text-nexus-accent border-nexus-accent/30 bg-nexus-accent/10',
  AI:          'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Manual:      'text-blue-400 border-blue-400/30 bg-blue-400/10',
  RuneMetrics: 'text-nexus-green border-nexus-green/30 bg-nexus-green/10',
  Bridge:      'text-orange-400 border-orange-400/30 bg-orange-400/10',
  HiScores:    'text-nexus-gold border-nexus-gold/30 bg-nexus-gold/10',
}

const INTERVAL_OPTIONS = [
  { label: '500ms', value: 500 },
  { label: '1s',    value: 1000 },
  { label: '2s',    value: 2000 },
  { label: '5s',    value: 5000 },
]

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function confidenceColor(conf: number): string {
  if (conf >= 0.85) return 'text-nexus-green'
  if (conf >= 0.6)  return 'text-amber-400'
  return 'text-red-400'
}

export function AIObserver({
  running,
  onStart,
  onStop,
  onSelectRegion,
  onEventDetected,
  selectedRegion,
  settings,
}: AIObserverProps) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(settings.aiConfidenceThreshold ?? 75)
  const [scanInterval, setScanInterval] = useState(settings.scanInterval ?? 2000)
  const [eventLog, setEventLog] = useState<SourceEvent[]>([])
  const [lastOcrText, setLastOcrText] = useState<string>('')
  const [lastDecision, setLastDecision] = useState<string>('')

  const ocrLoopRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const selectedRegionRef = useRef(selectedRegion)
  const confThreshRef   = useRef(confidenceThreshold)

  useEffect(() => { selectedRegionRef.current = selectedRegion }, [selectedRegion])
  useEffect(() => { confThreshRef.current = confidenceThreshold }, [confidenceThreshold])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (ocrLoopRef.current) clearInterval(ocrLoopRef.current)
    }
  }, [])

  const pushLog = useCallback((event: SourceEvent) => {
    setEventLog(prev => [event, ...prev].slice(0, 50))
  }, [])

  const handleStart = useCallback(() => {
    onStart()
    if (ocrLoopRef.current) clearInterval(ocrLoopRef.current)

    const initEvent: SourceEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: 'OCR',
      rawText: 'Observer started — scanning for game text…',
      confidence: 1.0,
      parsedOperation: null,
    }
    pushLog(initEvent)
    setLastOcrText(initEvent.rawText)
    setLastDecision('idle — waiting for region capture')

    ocrLoopRef.current = setInterval(async () => {
      const region = selectedRegionRef.current
      if (!region) {
        setLastDecision('no region selected — click "Select Region"')
        return
      }
      const api = window.electronAPI
      if (!api) {
        setLastDecision('Electron API unavailable (renderer-only mode)')
        return
      }

      let capture: { success: boolean; dataUrl?: string } | null = null
      try {
        capture = await api.captureRegion(region)
      } catch {
        setLastDecision('screen capture error')
        return
      }
      if (!capture?.success || !capture.dataUrl) {
        setLastDecision('capture failed — game window may be minimised')
        return
      }

      try {
        const { data: { text, confidence } } = await Tesseract.recognize(
          capture.dataUrl,
          'eng',
          { logger: () => {} }
        )

        const trimmed = text.trim()
        setLastOcrText(trimmed || '(no text detected)')

        const confPct = confidence / 100
        if (!trimmed || confPct < confThreshRef.current / 100) {
          setLastDecision(`low confidence (${Math.round(confidence)}%) — skipped`)
          return
        }

        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean)
        for (const line of lines) {
          const event: SourceEvent = {
            id:              crypto.randomUUID(),
            timestamp:       new Date().toISOString(),
            source:          'OCR',
            rawText:         line,
            confidence:      confPct,
            parsedOperation: null,
          }
          pushLog(event)
          onEventDetected(event)
        }
        setLastDecision(`${lines.length} line(s) · ${Math.round(confidence)}% confidence`)
      } catch (err) {
        setLastDecision(`OCR error: ${String(err)}`)
      }
    }, scanInterval)
  }, [onStart, scanInterval, pushLog, onEventDetected])

  const handleStop = useCallback(() => {
    onStop()
    if (ocrLoopRef.current) {
      clearInterval(ocrLoopRef.current)
      ocrLoopRef.current = null
    }
    setLastDecision('stopped')
    const stopEvent: SourceEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: 'OCR',
      rawText: 'Observer stopped.',
      confidence: 1.0,
      parsedOperation: null,
    }
    pushLog(stopEvent)
    setLastOcrText('Observer stopped.')
  }, [onStop, pushLog])

  const sessionEvents = eventLog.length

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <Cpu className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">AI Observer</h2>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${running ? 'bg-nexus-green animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-mono ${running ? 'text-nexus-green' : 'text-red-400'}`}>
                {running ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-nexus-text">OCR-based game screen reader · Tesseract.js</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={running}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
              running
                ? 'bg-nexus-green/5 border-nexus-green/20 text-nexus-green/40 cursor-not-allowed'
                : 'bg-nexus-green/10 border-nexus-green/40 text-nexus-green hover:bg-nexus-green/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Start AI Vision
          </button>
          <button
            onClick={handleStop}
            disabled={!running}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
              !running
                ? 'bg-red-500/5 border-red-500/20 text-red-400/40 cursor-not-allowed'
                : 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Stop AI Vision
          </button>
          <button
            onClick={onSelectRegion}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg border border-nexus-border text-nexus-text hover:border-nexus-accent/40 hover:text-nexus-accent transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Select Region
          </button>
        </div>

        {/* Config row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-nexus-bg rounded-xl border border-nexus-border space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Confidence threshold</label>
              <span className="text-[10px] font-mono text-nexus-accent font-bold">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min={0} max={100}
              value={confidenceThreshold}
              onChange={e => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#00c8e0' }}
            />
          </div>

          <div className="p-3 bg-nexus-bg rounded-xl border border-nexus-border space-y-2">
            <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Scan interval</label>
            <div className="relative">
              <select
                value={scanInterval}
                onChange={e => setScanInterval(Number(e.target.value))}
                className="w-full appearance-none bg-nexus-panel border border-nexus-border rounded px-2 py-1 text-xs font-mono text-nexus-text-bright focus:outline-none focus:border-nexus-accent"
              >
                {INTERVAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-nexus-text pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status box */}
        <div className="bg-nexus-bg border border-nexus-border rounded-xl p-4 space-y-2.5">
          <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-1">Observer Status</p>

          <div className="flex items-start gap-2">
            <span className="text-[10px] font-mono text-nexus-text w-36 flex-shrink-0">Selected region:</span>
            {selectedRegion ? (
              <span className="text-[10px] font-mono text-nexus-text-bright">
                {selectedRegion.x},{selectedRegion.y} · {selectedRegion.width}×{selectedRegion.height}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400">No region — click "Select Region"</span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <span className="text-[10px] font-mono text-nexus-text w-36 flex-shrink-0">Last OCR text:</span>
            <span className="text-[10px] font-mono text-nexus-text-bright italic break-all">
              {lastOcrText || '—'}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-[10px] font-mono text-nexus-text w-36 flex-shrink-0">Last decision:</span>
            <span className="text-[10px] font-mono text-nexus-accent break-all">
              {lastDecision || '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-nexus-text w-36 flex-shrink-0">Events this session:</span>
            <span className="text-[10px] font-mono text-nexus-text-bright font-bold">{sessionEvents}</span>
          </div>
        </div>

        {/* Live event stream */}
        <div>
          <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2">Live Event Stream</p>
          {eventLog.length === 0 ? (
            <div className="flex items-center justify-center h-20 border border-nexus-border rounded-xl">
              <p className="text-[10px] font-mono text-nexus-text/50">No events yet — start the observer to begin.</p>
            </div>
          ) : (
            <div className="border border-nexus-border rounded-xl overflow-hidden divide-y divide-nexus-border/50 max-h-[220px] overflow-y-auto custom-scrollbar">
              {eventLog.map(event => (
                <div key={event.id} className="px-3 py-2 hover:bg-nexus-bg/40 transition-colors">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-nexus-text">{formatTime(event.timestamp)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${SOURCE_COLORS[event.source]}`}>
                      {event.source}
                    </span>
                    <span className={`ml-auto text-[10px] font-mono font-bold ${confidenceColor(event.confidence)}`}>
                      {Math.round(event.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-nexus-text/80 truncate">{event.rawText}</p>
                  {event.parsedOperation && (
                    <p className="text-[10px] font-mono text-purple-400 mt-0.5">
                      [{event.parsedOperation.op}] conf {Math.round(event.parsedOperation.confidence * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety note */}
        <div className="flex items-start gap-2.5 p-3 bg-nexus-green/5 border border-nexus-green/20 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-nexus-green flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-nexus-green/80 leading-relaxed">
            AI Observer reads visible text only via on-device OCR. It does not click, type, or control the game in any way.
          </p>
        </div>
      </div>
    </div>
  )
}
