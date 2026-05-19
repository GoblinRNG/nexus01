import React, { useMemo } from 'react'
import { Coins, Clock, Star, Sword } from 'lucide-react'
import type { PlayerHiscores, BankItem, Session } from '../types'

interface StatCardsProps {
  hiscores: PlayerHiscores | null
  bank: BankItem[]
  sessions: Session[]
}

function formatGP(value: number): string {
  if (value === 0) return '0 gp'
  return value.toLocaleString('en-US') + ' gp'
}

function formatXP(xp: number): string {
  return xp.toLocaleString('en-US')
}

function formatTimePlayed(sessions: Session[]): string {
  const totalMs = sessions.reduce((acc, s) => {
    const start = new Date(s.startTime).getTime()
    const end = s.endTime ? new Date(s.endTime).getTime() : s.active ? Date.now() : start
    return acc + Math.max(0, end - start)
  }, 0)
  const totalMinutes = Math.floor(totalMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

function calcCombatLevel(hiscores: PlayerHiscores | null): string {
  if (!hiscores) return '--'
  const s = hiscores.skills
  const def = s.Defence?.level ?? 1
  const hp = s.Constitution?.level ?? 10
  const pray = s.Prayer?.level ?? 1
  const atk = s.Attack?.level ?? 1
  const str = s.Strength?.level ?? 1
  const ranged = s.Ranged?.level ?? 1
  const magic = s.Magic?.level ?? 1
  const base = (def + hp + Math.floor(pray / 2)) / 4
  const melee = ((atk + str) * 13) / 40
  const range = (ranged * 13) / 40
  const mage = (magic * 13) / 40
  const combat = base + Math.max(melee, range, mage)
  return Math.floor(combat).toString()
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
  sub?: string
}

function StatCard({ icon, label, value, accent, sub }: StatCardProps) {
  return (
    <div className="flex-1 bg-nexus-card border border-nexus-border rounded-xl px-4 py-3 flex items-center gap-3 min-w-0 hover:border-nexus-border/80 transition-colors group">
      <div
        className="p-2 rounded-lg flex-shrink-0 transition-colors"
        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40` }}
      >
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-mono font-bold text-nexus-text-bright truncate leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-nexus-text font-mono mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function StatCards({ hiscores, bank, sessions }: StatCardsProps) {
  const totalBankValue = useMemo(
    () => bank.reduce((acc, item) => acc + item.quantity * item.guidePrice, 0),
    [bank]
  )

  const timePlayed = useMemo(() => formatTimePlayed(sessions), [sessions])

  const totalXP = useMemo(() => {
    const xp = hiscores?.skills?.Overall?.xp
    return xp !== undefined ? formatXP(xp) : '--'
  }, [hiscores])

  const combatLevel = useMemo(() => calcCombatLevel(hiscores), [hiscores])

  const activeSessions = sessions.filter((s) => s.active).length

  return (
    <div className="flex gap-3">
      <StatCard
        icon={<Coins className="w-4 h-4" />}
        label="Total Bank Value"
        value={formatGP(totalBankValue)}
        accent="#f0a030"
        sub={`${bank.length} item${bank.length !== 1 ? 's' : ''} tracked`}
      />
      <StatCard
        icon={<Clock className="w-4 h-4" />}
        label="Time Played"
        value={timePlayed}
        accent="#00c8e0"
        sub={`${activeSessions} session${activeSessions !== 1 ? 's' : ''} active`}
      />
      <StatCard
        icon={<Star className="w-4 h-4" />}
        label="Total XP"
        value={totalXP}
        accent="#a855f7"
        sub={hiscores ? `as of ${new Date(hiscores.fetchedAt).toLocaleDateString()}` : 'not synced'}
      />
      <StatCard
        icon={<Sword className="w-4 h-4" />}
        label="Combat Level"
        value={combatLevel}
        accent="#22c55e"
        sub="RS3 formula"
      />
    </div>
  )
}
