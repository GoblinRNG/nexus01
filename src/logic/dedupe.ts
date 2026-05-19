import type { SourceEvent } from '../types/index.ts'

const DEFAULT_WINDOW_MS = 10000

export function hashEvent(event: SourceEvent): string {
  return `${event.source}:${event.rawText.toLowerCase().trim()}`
}

export function isDuplicate(
  event: SourceEvent,
  recentEvents: SourceEvent[],
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const normalizedText = event.rawText.toLowerCase().trim()
  const eventTime = new Date(event.timestamp).getTime()

  return recentEvents.some((recent) => {
    if (recent.source !== event.source) {
      return false
    }
    if (recent.rawText.toLowerCase().trim() !== normalizedText) {
      return false
    }
    const recentTime = new Date(recent.timestamp).getTime()
    return Math.abs(eventTime - recentTime) <= windowMs
  })
}
