import React from 'react'
import { Link2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { BridgeStatus } from '../types'

interface LocalBridgePanelProps {
  bridgeStatus: BridgeStatus
}

interface CapabilityRowProps {
  label: string
  active: boolean
}

function CapabilityRow({ label, active }: CapabilityRowProps) {
  return (
    <div className="flex items-center gap-3 py-1.5 px-3 rounded hover:bg-nexus-border/30 transition-colors">
      {active ? (
        <CheckCircle2 className="w-4 h-4 text-nexus-green flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
      )}
      <span className={`text-sm font-mono ${active ? 'text-nexus-text-bright' : 'text-amber-400'}`}>
        {label}
      </span>
      <div className="ml-auto">
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-mono ${
            active
              ? 'bg-nexus-green/10 text-nexus-green border border-nexus-green/30'
              : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
          }`}
        >
          {active ? 'OK' : 'WAIT'}
        </span>
      </div>
    </div>
  )
}

interface DataFlowNodeProps {
  label: string
  sub?: string
  color?: string
}

function DataFlowNode({ label, sub, color = 'border-nexus-accent/50 bg-nexus-accent/5' }: DataFlowNodeProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-center min-w-[80px] ${color}`}
    >
      <span className="text-xs font-mono font-bold text-nexus-text-bright whitespace-nowrap">{label}</span>
      {sub && <span className="text-[10px] text-nexus-text mt-0.5 whitespace-nowrap">{sub}</span>}
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center">
      <div className="w-4 h-px bg-nexus-accent/50" />
      <div
        className="w-0 h-0"
        style={{
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '6px solid rgba(0,200,224,0.5)',
        }}
      />
    </div>
  )
}

export function LocalBridgePanel({ bridgeStatus }: LocalBridgePanelProps) {
  const capabilities: Array<{ label: string; active: boolean }> = [
    { label: 'Launcher detected', active: bridgeStatus.launcherDetected },
    { label: 'Game process detected', active: bridgeStatus.gameProcessDetected },
    { label: 'Window focus tracking', active: bridgeStatus.windowFocusTracking },
    { label: 'Mouse capture, RS3 only', active: bridgeStatus.mouseCaptureActive },
    { label: 'Screen region capture', active: bridgeStatus.screenRegionCapture },
    { label: 'OCR text reading', active: bridgeStatus.ocrTextReading },
    { label: 'Data parsing & logic', active: bridgeStatus.dataParsingActive },
    { label: 'Bank updates', active: bridgeStatus.bankUpdating },
    { label: 'Account sync, public API', active: bridgeStatus.accountSyncActive },
  ]

  const activeCount = capabilities.filter((c) => c.active).length
  const totalCount = capabilities.length

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/30">
          <Link2 className="w-4 h-4 text-nexus-accent" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-accent tracking-widest">LOCAL BRIDGE</h2>
          <p className="text-[10px] text-nexus-text font-mono">
            {activeCount}/{totalCount} capabilities active
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${activeCount === totalCount ? 'bg-nexus-green' : 'bg-amber-400'} animate-pulse`}
          />
          <span className={`text-[10px] font-mono ${activeCount === totalCount ? 'text-nexus-green' : 'text-amber-400'}`}>
            {activeCount === totalCount ? 'FULL' : 'PARTIAL'}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* Capability Checklist */}
        <div>
          <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2 px-1">
            Bridge Capabilities
          </p>
          <div className="space-y-0.5">
            {capabilities.map((cap) => (
              <CapabilityRow key={cap.label} label={cap.label} active={cap.active} />
            ))}
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div>
          <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-3 px-1">
            Data Flow
          </p>
          <div className="bg-nexus-bg/60 border border-nexus-border rounded-xl p-4">
            {/* Row 1: Launcher → Bridge → Companion App */}
            <div className="flex items-center justify-center gap-1 mb-3">
              <DataFlowNode label="Launcher" sub="Jagex" color="border-nexus-gold/40 bg-nexus-gold/5" />
              <Arrow />
              <DataFlowNode label="Bridge" sub="Local" color="border-nexus-accent/50 bg-nexus-accent/5" />
              <Arrow />
              <DataFlowNode label="Companion" sub="App" color="border-purple-400/50 bg-purple-400/5" />
            </div>

            {/* Divider arrow down */}
            <div className="flex justify-center mb-3">
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-nexus-border" />
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '6px solid rgba(26,48,80,1)',
                  }}
                />
              </div>
            </div>

            {/* Row 2: outputs */}
            <div className="flex items-stretch justify-center gap-2">
              <DataFlowNode label="Account Data" sub="Public API" color="border-nexus-green/40 bg-nexus-green/5" />
              <div className="flex items-center">
                <div className="w-3 h-px bg-nexus-border/60" />
                <span className="text-nexus-text text-[10px] mx-0.5">/</span>
                <div className="w-3 h-px bg-nexus-border/60" />
              </div>
              <DataFlowNode label="Local Data" sub="On-device" color="border-nexus-text/30 bg-nexus-text/5" />
            </div>
          </div>
        </div>

        {/* 100% Safe Box */}
        <div className="border-2 border-nexus-gold/50 rounded-xl p-4 bg-nexus-gold/5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-nexus-gold" />
            <span className="text-sm font-mono font-bold text-nexus-gold tracking-wider">100% SAFE</span>
          </div>
          <div className="space-y-2">
            {[
              'No memory reading',
              'No injection',
              'No packet sniffing',
              'No automation',
              'Your account, your control',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-nexus-green flex-shrink-0" />
                <span className="text-xs font-mono text-nexus-text-bright">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last sync */}
        {bridgeStatus.lastSync && (
          <div className="px-3 py-2 rounded-lg bg-nexus-bg/40 border border-nexus-border">
            <span className="text-[10px] font-mono text-nexus-text">Last sync: </span>
            <span className="text-[10px] font-mono text-nexus-text-bright">{bridgeStatus.lastSync}</span>
          </div>
        )}
      </div>
    </div>
  )
}
