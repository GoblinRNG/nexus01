import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, CheckCircle2, Play, Square, Timer, Coins, ChevronRight, Plus } from 'lucide-react'
import type { DailyChallenge, Session } from '../types'

interface DailyPanelProps {
  challenges: DailyChallenge[]
  sessions: Session[]
  onCompleteChallenge: (id: string) => void
  onStartSession: (skill: string) => void
  onStopSession: (id: string) => void
}

const SESSION_PRESETS = [
  'Woodcutting', 'Firemaking', 'Fletching', 'Cooking',
  'Fishing', 'Mining', 'Prayer', 'Combat',
]

const SKILL_COLORS: Record<string, string> = {
  Woodcutting: '#22c55e',
  Firemaking: '#f97316',
  Fletching: '#a855f7',
  Cooking: '#ef4444',
  Fishing: '#06b6d4',
  Mining: '#78716c',
  Prayer: '#f0a030',
  Combat: '#dc2626',
}

function formatGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M gp`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K gp`
  return `${n} gp`
}

function formatXP(n: number): string {
  return n.toLocaleString('en-US') + ' XP'
}

function formatDuration(startTime: string): string {
  const diff = Date.now() - new Date(startTime).getTime()
  const totalSecs = Math.floor(diff / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

function formatResetTime(ts: string): string {
  const diff = new Date(ts).getTime() - Date.now()
  if (diff <= 0) return 'reset now'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

interface ChallengeRowProps {
  challenge: DailyChallenge
  onComplete: (id: string) => void
}

function ChallengeRow({ challenge, onComplete }: ChallengeRowProps) {
  const pct = challenge.target > 0
    ? Math.min((challenge.current / challenge.target) * 100, 100)
    : 0
  const skillColor = SKILL_COLORS[challenge.skill] ?? '#00c8e0'

  return (
    <div className={`border rounded-xl p-3 space-y-2.5 transition-colors ${
      challenge.completed
        ? 'border-nexus-green/30 bg-nexus-green/5'
        : 'border-nexus-border bg-nexus-card'
    }`}>
      <div className="flex items-start gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: skillColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-mono font-bold truncate ${
              challenge.completed ? 'text-nexus-green line-through' : 'text-nexus-text-bright'
            }`}>
              {challenge.title}
            </p>
            {challenge.completed && <CheckCircle2 className="w-3.5 h-3.5 text-nexus-green flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ color: skillColor, backgroundColor: `${skillColor}18`, border: `1px solid ${skillColor}30` }}
            >
              {challenge.skill}
            </span>
            <span className="text-[10px] font-mono text-nexus-gold">+{formatXP(challenge.xpReward)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-mono text-nexus-text-bright font-bold">{challenge.current}/{challenge.target}</p>
          <p className="text-[10px] font-mono text-nexus-text">resets in {formatResetTime(challenge.resetTime)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-nexus-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: skillColor }}
        />
      </div>

      {!challenge.completed && (
        <button
          onClick={() => onComplete(challenge.id)}
          className="w-full py-1.5 bg-nexus-green/10 border border-nexus-green/30 text-nexus-green text-xs font-mono font-bold rounded-lg hover:bg-nexus-green/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Complete
        </button>
      )}
    </div>
  )
}

interface ActiveSessionCardProps {
  session: Session
  onStop: (id: string) => void
}

function ActiveSessionCard({ session, onStop }: ActiveSessionCardProps) {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const xpGained = session.currentXP - session.startXP
  const skillColor = SKILL_COLORS[session.skill] ?? '#00c8e0'

  return (
    <div className="border-2 rounded-xl p-4 space-y-3"
      style={{ borderColor: `${skillColor}40`, backgroundColor: `${skillColor}08` }}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: skillColor }} />
        <span className="text-sm font-mono font-bold text-nexus-text-bright">{session.skill}</span>
        <span className="text-[10px] font-mono text-nexus-green ml-auto">● ACTIVE</span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 px-3 py-2 bg-nexus-bg rounded-lg border border-nexus-border">
        <Timer className="w-4 h-4" style={{ color: skillColor }} />
        <span className="text-lg font-mono font-bold" style={{ color: skillColor }}>
          {formatDuration(session.startTime)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="px-2 py-2 bg-nexus-bg rounded-lg border border-nexus-border text-center">
          <p className="text-[9px] font-mono text-nexus-text uppercase">XP Gained</p>
          <p className="text-xs font-mono font-bold text-nexus-text-bright">{formatXP(xpGained)}</p>
        </div>
        <div className="px-2 py-2 bg-nexus-bg rounded-lg border border-nexus-border text-center">
          <p className="text-[9px] font-mono text-nexus-text uppercase">GP</p>
          <p className="text-xs font-mono font-bold text-nexus-gold">{formatGP(session.gpGained)}</p>
        </div>
        <div className="px-2 py-2 bg-nexus-bg rounded-lg border border-nexus-border text-center">
          <p className="text-[9px] font-mono text-nexus-text uppercase">Items</p>
          <p className="text-xs font-mono font-bold text-nexus-text-bright">{session.itemsGained.length}</p>
        </div>
      </div>

      {/* Items gained */}
      {session.itemsGained.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-nexus-text mb-1">Items gained:</p>
          <div className="flex flex-wrap gap-1">
            {session.itemsGained.map((item, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-nexus-green/10 border border-nexus-green/30 text-nexus-green">
                +{item.qty}× {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onStop(session.id)}
        className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
      >
        <Square className="w-3.5 h-3.5" />
        Stop Session
      </button>
    </div>
  )
}

export function DailyPanel({
  challenges,
  sessions,
  onCompleteChallenge,
  onStartSession,
  onStopSession,
}: DailyPanelProps) {
  const displayChallenges = challenges
  const activeSession = sessions.find(s => s.active) ?? null
  const completedCount = displayChallenges.filter(c => c.completed).length

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-gold/10 border border-nexus-gold/30">
          <Calendar className="w-4 h-4 text-nexus-gold" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">Daily Challenges</h2>
          <p className="text-[10px] font-mono text-nexus-text">
            {completedCount}/{displayChallenges.length} complete
          </p>
        </div>
        {displayChallenges.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-nexus-border rounded-full overflow-hidden">
              <div
                className="h-full bg-nexus-gold rounded-full transition-all"
                style={{ width: `${(completedCount / displayChallenges.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-nexus-gold font-bold">
              {Math.round((completedCount / displayChallenges.length) * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {/* Daily Challenges Section */}
        {displayChallenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center border border-dashed border-nexus-border rounded-xl">
            <Calendar className="w-8 h-8 text-nexus-text/20" />
            <p className="text-xs font-mono text-nexus-text">No daily challenges loaded.</p>
            <p className="text-[10px] font-mono text-nexus-text/60">
              Daily challenges reset at 00:00 UTC. Sync your account to load them.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayChallenges.map(challenge => (
              <ChallengeRow
                key={challenge.id}
                challenge={challenge}
                onComplete={onCompleteChallenge}
              />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-1 h-px bg-nexus-border" />
          <div className="mx-3 p-1 rounded-lg bg-nexus-bg border border-nexus-border">
            <Timer className="w-3.5 h-3.5 text-nexus-text" />
          </div>
          <div className="flex-1 h-px bg-nexus-border" />
        </div>

        {/* Sessions Section */}
        <div>
          <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-3">
            Training Sessions
          </p>

          {activeSession ? (
            <ActiveSessionCard session={activeSession} onStop={onStopSession} />
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-nexus-text mb-2">Start a session:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {SESSION_PRESETS.map(skill => {
                  const color = SKILL_COLORS[skill] ?? '#00c8e0'
                  return (
                    <button
                      key={skill}
                      onClick={() => onStartSession(skill)}
                      className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all hover:scale-105"
                      style={{
                        borderColor: `${color}30`,
                        backgroundColor: `${color}08`,
                      }}
                    >
                      <Play className="w-3.5 h-3.5" style={{ color }} />
                      <span className="text-[9px] font-mono font-bold" style={{ color }}>
                        {skill}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent sessions */}
        {sessions.filter(s => !s.active).length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2">Past Sessions</p>
            <div className="space-y-1 border border-nexus-border rounded-xl overflow-hidden divide-y divide-nexus-border/50">
              {sessions.filter(s => !s.active).slice(0, 5).map(session => {
                const xpGained = session.currentXP - session.startXP
                const skillColor = SKILL_COLORS[session.skill] ?? '#00c8e0'
                return (
                  <div key={session.id} className="flex items-center gap-3 px-3 py-2 hover:bg-nexus-bg/40 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                    <span className="text-xs font-mono text-nexus-text-bright flex-1">{session.skill}</span>
                    <span className="text-[10px] font-mono text-nexus-gold">+{formatXP(xpGained)}</span>
                    <ChevronRight className="w-3 h-3 text-nexus-text/40" />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
