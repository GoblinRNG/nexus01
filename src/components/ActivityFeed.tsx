import React, { useMemo } from 'react'
import { Activity, CheckCircle2, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react'
import type { SourceEvent, EventSource } from '../types'

interface ActivityFeedProps {
  activities: SourceEvent[]
  pendingEvents: SourceEvent[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

const SOURCE_CONFIG: Record<EventSource, { label: string; className: string; dot: string }> = {
  OCR:        { label: 'OCR',        className: 'text-nexus-accent border-nexus-accent/30 bg-nexus-accent/10',     dot: '#00c8e0' },
  AI:         { label: 'AI',         className: 'text-purple-400 border-purple-400/30 bg-purple-400/10',            dot: '#a855f7' },
  Manual:     { label: 'Manual',     className: 'text-blue-400 border-blue-400/30 bg-blue-400/10',                  dot: '#60a5fa' },
  RuneMetrics:{ label: 'RuneMetrics',className: 'text-nexus-green border-nexus-green/30 bg-nexus-green/10',         dot: '#22c55e' },
  Bridge:     { label: 'Bridge',     className: 'text-orange-400 border-orange-400/30 bg-orange-400/10',            dot: '#fb923c' },
  HiScores:   { label: 'HiScores',  className: 'text-nexus-gold border-nexus-gold/30 bg-nexus-gold/10',            dot: '#f0a030' },
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function confidenceColor(conf: number): string {
  if (conf >= 0.85) return 'text-nexus-green'
  if (conf >= 0.6) return 'text-amber-400'
  return 'text-red-400'
}

function SourceBadge({ source }: { source: EventSource }) {
  const cfg = SOURCE_CONFIG[source]
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function OperationSummary({ event }: { event: SourceEvent }) {
  const op = event.parsedOperation
  if (!op) return null
  const { op: opType, inputItem, inputQty, outputItem, outputQty } = op
  if (opType === 'add' && outputItem) {
    return (
      <span className="text-[10px] font-mono text-nexus-green">
        +{outputQty ?? 1}× {outputItem}
      </span>
    )
  }
  if (opType === 'remove' && inputItem) {
    return (
      <span className="text-[10px] font-mono text-red-400">
        -{inputQty ?? 1}× {inputItem}
      </span>
    )
  }
  if (opType === 'transform') {
    return (
      <span className="text-[10px] font-mono text-purple-400">
        {inputQty ?? 1}× {inputItem ?? '?'} → {outputQty ?? 1}× {outputItem ?? '?'}
      </span>
    )
  }
  return null
}

interface PendingEventRowProps {
  event: SourceEvent
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function PendingEventRow({ event, onApprove, onReject }: PendingEventRowProps) {
  const pct = Math.round(event.confidence * 100)
  return (
    <div className="border border-amber-400/20 bg-amber-400/5 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-[10px] font-mono text-nexus-text">{formatTime(event.timestamp)}</span>
        <SourceBadge source={event.source} />
        <span className={`ml-auto text-[10px] font-mono font-bold ${confidenceColor(event.confidence)}`}>
          {pct}% confidence
        </span>
      </div>

      <div className="px-2 py-1.5 bg-nexus-bg rounded border border-nexus-border">
        <p className="text-[10px] font-mono text-nexus-text-bright leading-relaxed break-all">
          {event.rawText || <em className="text-nexus-text">(no text)</em>}
        </p>
      </div>

      {event.parsedOperation && (
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-nexus-text" />
          <OperationSummary event={event} />
        </div>
      )}

      {/* Confidence bar */}
      <div className="h-1 bg-nexus-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: event.confidence >= 0.6 ? '#f0a030' : '#ef4444',
          }}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onApprove(event.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-nexus-green/10 border border-nexus-green/30 text-nexus-green text-xs font-mono font-bold rounded-lg hover:bg-nexus-green/20 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={() => onReject(event.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-400/10 border border-red-400/30 text-red-400 text-xs font-mono font-bold rounded-lg hover:bg-red-400/20 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  )
}

interface HistoryEventRowProps {
  event: SourceEvent
}

function HistoryEventRow({ event }: HistoryEventRowProps) {
  const cfg = SOURCE_CONFIG[event.source]
  return (
    <div className="flex items-start gap-2.5 py-2 px-3 rounded-lg hover:bg-nexus-bg/40 transition-colors group">
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-nexus-text">{timeAgo(event.timestamp)}</span>
          <SourceBadge source={event.source} />
          <OperationSummary event={event} />
        </div>
        {event.rawText && (
          <p className="text-[10px] font-mono text-nexus-text/70 truncate">{event.rawText}</p>
        )}
      </div>
      <span className={`text-[10px] font-mono flex-shrink-0 ${confidenceColor(event.confidence)}`}>
        {Math.round(event.confidence * 100)}%
      </span>
    </div>
  )
}

export function ActivityFeed({ activities, pendingEvents, onApprove, onReject }: ActivityFeedProps) {
  const sortedHistory = useMemo(
    () => [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [activities]
  )

  const totalCount = activities.length + pendingEvents.length

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/30">
          <Activity className="w-4 h-4 text-nexus-accent" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">Recent Activity</h2>
          <p className="text-[10px] font-mono text-nexus-text">
            {pendingEvents.length > 0 && (
              <span className="text-amber-400 mr-2">{pendingEvents.length} pending</span>
            )}
            {activities.length} confirmed
          </p>
        </div>
        {totalCount > 0 && (
          <div className="ml-auto px-2 py-0.5 bg-nexus-accent/10 border border-nexus-accent/30 rounded-full">
            <span className="text-[10px] font-mono text-nexus-accent font-bold">{totalCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
            <div className="p-4 rounded-full bg-nexus-bg border border-nexus-border">
              <Activity className="w-8 h-8 text-nexus-text/30" />
            </div>
            <p className="text-sm font-mono text-nexus-text">No activity recorded yet.</p>
            <p className="text-xs font-mono text-nexus-text/50">Events will appear here as the AI Observer detects game actions.</p>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Pending Approval */}
            {pendingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                    Pending Approval
                  </span>
                  <div className="ml-auto px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded-full">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{pendingEvents.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {pendingEvents.map(event => (
                    <PendingEventRow
                      key={event.id}
                      event={event}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Event History */}
            {sortedHistory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-nexus-text" />
                  <span className="text-[10px] font-mono text-nexus-text uppercase tracking-widest">
                    Event History
                  </span>
                </div>
                <div className="border border-nexus-border rounded-xl overflow-hidden divide-y divide-nexus-border/50">
                  {sortedHistory.map(event => (
                    <HistoryEventRow key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
