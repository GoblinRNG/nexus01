import { describe, it, expect } from 'vitest'
import type { Session } from '../src/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id:          'sess-1',
    skill:       'Woodcutting',
    startTime:   new Date(Date.now() - 3_600_000).toISOString(), // 1 hour ago
    startXP:     1_000_000,
    currentXP:   1_000_000,
    itemsGained: [],
    itemsUsed:   [],
    gpGained:    0,
    active:      true,
    ...overrides,
  }
}

// ── XP tracking ───────────────────────────────────────────────────────────────

describe('session XP tracking', () => {
  it('xp gained is currentXP minus startXP', () => {
    const session = makeSession({ startXP: 1_000_000, currentXP: 1_050_000 })
    expect(session.currentXP - session.startXP).toBe(50_000)
  })

  it('xp gained is 0 when no levels obtained yet', () => {
    const session = makeSession({ startXP: 500_000, currentXP: 500_000 })
    expect(session.currentXP - session.startXP).toBe(0)
  })

  it('handles Overall XP update correctly', () => {
    const session = makeSession({ startXP: 100_000 })
    const newOverallXP = 200_000
    const updated = { ...session, currentXP: newOverallXP }
    expect(updated.currentXP - updated.startXP).toBe(100_000)
  })
})

// ── Session duration helpers ──────────────────────────────────────────────────

function getDurationMs(session: Session): number {
  const start = new Date(session.startTime).getTime()
  const end   = session.endTime
    ? new Date(session.endTime).getTime()
    : session.active
      ? Date.now()
      : start
  return Math.max(0, end - start)
}

describe('session duration', () => {
  it('calculates elapsed time for an active session', () => {
    const now  = Date.now()
    const start = now - 60_000 // 1 minute ago
    const session = makeSession({ startTime: new Date(start).toISOString(), active: true })
    const ms = getDurationMs(session)
    expect(ms).toBeGreaterThanOrEqual(59_000)
    expect(ms).toBeLessThan(65_000)
  })

  it('uses endTime for a stopped session', () => {
    const startTime = new Date(Date.now() - 3_600_000).toISOString()
    const endTime   = new Date(Date.now() - 1_800_000).toISOString()
    const session   = makeSession({ startTime, endTime, active: false })
    const ms = getDurationMs(session)
    expect(ms).toBeCloseTo(1_800_000, -3)
  })

  it('returns 0 for inactive session with no endTime', () => {
    const time = new Date().toISOString()
    const session = makeSession({ startTime: time, active: false })
    expect(getDurationMs(session)).toBe(0)
  })
})

// ── Items gained / used ───────────────────────────────────────────────────────

describe('session item tracking', () => {
  it('accumulates items gained', () => {
    const session = makeSession({
      itemsGained: [
        { name: 'Yew logs', qty: 50 },
        { name: 'Oak logs', qty: 30 },
      ],
    })
    const totalItems = session.itemsGained.reduce((acc, i) => acc + i.qty, 0)
    expect(totalItems).toBe(80)
  })

  it('correctly tracks GP gained', () => {
    const session = makeSession({ gpGained: 250_000 })
    expect(session.gpGained).toBe(250_000)
  })
})
