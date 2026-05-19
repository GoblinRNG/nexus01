import { useCallback } from 'react'
import { useApp, AppAction as CtxAction } from '../context/AppContext'
import { AppAction as ShellAction }       from './NexusShell'
import { LauncherPanel }                  from './LauncherPanel'
import { LocalBridgePanel }               from './LocalBridgePanel'
import { NexusShell }                     from './NexusShell'
import { HowItWorks }                     from './HowItWorks'
import { AccountIntegration }             from './AccountIntegration'
import type { Session, SourceEvent }      from '../types'
import { classifyEvent }                  from '../logic/aiClassifier'

export function AppShell() {
  const { state, dispatch, syncHiscores, syncRuneMetrics, syncPrices } = useApp()

  // ── Bridge NexusShell actions to AppContext actions ──────────────────────────

  function bridgedDispatch(action: ShellAction) {
    switch (action.type) {
      case 'UPDATE_BANK':
        dispatch({ type: 'SET_BANK', bank: action.bank } satisfies CtxAction)
        break
      case 'SAVE_SETTINGS':
        dispatch({ type: 'SET_SETTINGS', settings: action.settings } satisfies CtxAction)
        break
      case 'START_SESSION': {
        const session: Session = {
          id:          crypto.randomUUID(),
          skill:       action.skill,
          startTime:   new Date().toISOString(),
          startXP:     state.hiscores?.skills?.Overall?.xp ?? 0,
          currentXP:   state.hiscores?.skills?.Overall?.xp ?? 0,
          itemsGained: [], itemsUsed: [], gpGained: 0, active: true,
        }
        dispatch({ type: 'START_SESSION', session } satisfies CtxAction)
        break
      }
      case 'START_OCR':
        dispatch({ type: 'SET_OCR_RUNNING', running: true } satisfies CtxAction)
        break
      case 'STOP_OCR':
        dispatch({ type: 'SET_OCR_RUNNING', running: false } satisfies CtxAction)
        break
      case 'SET_TAB':
        dispatch(action as unknown as CtxAction); break
      case 'APPROVE_EVENT':
        dispatch(action as unknown as CtxAction); break
      case 'REJECT_EVENT':
        dispatch(action as unknown as CtxAction); break
      case 'STOP_SESSION':
        dispatch(action as unknown as CtxAction); break
      case 'COMPLETE_CHALLENGE':
        dispatch(action as unknown as CtxAction); break
    }
  }

  // ── OCR screen region selection ──────────────────────────────────────────────

  const handleSelectRegion = useCallback(async () => {
    const region = await window.electronAPI?.selectRegion().catch(() => null)
    if (region) {
      dispatch({ type: 'SET_SETTINGS', settings: { ...state.settings, selectedRegion: region } })
    }
  }, [state.settings, dispatch])

  // ── OCR event detected → classify → dispatch ─────────────────────────────────

  const handleEventDetected = useCallback((event: SourceEvent) => {
    // Re-classify to attach a proper BankOperation if the rawText is parseable
    const classified = classifyEvent(event.rawText)
    const enriched: SourceEvent = {
      ...event,
      confidence:      classified.confidence || event.confidence,
      parsedOperation: classified.operation ?? event.parsedOperation,
    }
    dispatch({ type: 'ADD_EVENT', event: enriched })

    const threshold = state.settings.aiConfidenceThreshold / 100
    if (
      enriched.parsedOperation &&
      enriched.confidence >= threshold &&
      enriched.parsedOperation.confirmed
    ) {
      dispatch({ type: 'APPLY_OPERATION', op: enriched.parsedOperation })
    }
  }, [state.settings.aiConfidenceThreshold, dispatch])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-nexus-bg text-nexus-text">
      {/* Top three panels */}
      <div className="flex flex-1 min-h-0 gap-1.5 p-1.5">
        {/* Left — Launcher */}
        <div className="flex-shrink-0" style={{ width: 290 }}>
          <LauncherPanel />
        </div>

        {/* Center — Bridge */}
        <div className="flex-shrink-0" style={{ width: 270 }}>
          <LocalBridgePanel bridgeStatus={state.bridgeStatus} />
        </div>

        {/* Right — Nexus Companion */}
        <div className="flex-1 min-w-0">
          <NexusShell
            state={state}
            dispatch={bridgedDispatch}
            syncHiscores={syncHiscores}
            syncRuneMetrics={syncRuneMetrics}
            syncPrices={syncPrices}
            onSelectRegion={handleSelectRegion}
            onEventDetected={handleEventDetected}
          />
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex-shrink-0 flex border-t border-nexus-border bg-nexus-panel" style={{ height: 90 }}>
        <div className="flex-1">
          <HowItWorks />
        </div>
        <div className="border-l border-nexus-border" style={{ width: 340 }}>
          <AccountIntegration />
        </div>
      </div>
    </div>
  )
}
