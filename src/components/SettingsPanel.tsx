import React, { useState, useCallback } from 'react'
import {
  Settings, User, FolderOpen, Eye, Database, ShieldCheck, Info,
  Save, RefreshCw, Download, Upload, Trash2, CheckCircle2
} from 'lucide-react'
import type { AppSettings } from '../types'

interface SettingsPanelProps {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

const SCAN_INTERVAL_OPTIONS = [
  { label: '500ms', value: 500 },
  { label: '1 second', value: 1000 },
  { label: '2 seconds', value: 2000 },
  { label: '5 seconds', value: 5000 },
]

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-nexus-accent/10 border border-nexus-accent/20">
          <div className="text-nexus-accent">{icon}</div>
        </div>
        <span className="text-[10px] font-mono text-nexus-accent uppercase tracking-widest font-bold">{title}</span>
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  )
}

interface ToggleProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  note?: string
}

function Toggle({ label, value, onChange, note }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-nexus-text-bright">{label}</p>
        {note && <p className="text-[10px] font-mono text-nexus-text mt-0.5">{note}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full border transition-colors flex-shrink-0 ${
          value ? 'bg-nexus-accent/30 border-nexus-accent/60' : 'bg-nexus-bg border-nexus-border'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
            value ? 'right-0.5 bg-nexus-accent' : 'left-0.5 bg-nexus-text/40'
          }`}
        />
      </button>
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  display?: (v: number) => string
}

function SliderField({ label, value, min, max, onChange, display }: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-mono text-nexus-text-bright">{label}</label>
        <span className="text-xs font-mono text-nexus-accent font-bold">
          {display ? display(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#00c8e0' }}
      />
      <div className="flex justify-between">
        <span className="text-[9px] font-mono text-nexus-text/50">{min}%</span>
        <span className="text-[9px] font-mono text-nexus-text/50">{max}%</span>
      </div>
    </div>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  readOnly?: boolean
  button?: React.ReactNode
}

function TextField({ label, value, onChange, placeholder, readOnly, button }: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none transition-colors ${
            readOnly
              ? 'bg-nexus-bg/40 border-nexus-border/40 text-nexus-text cursor-default'
              : 'bg-nexus-bg border-nexus-border text-nexus-text-bright focus:border-nexus-accent'
          }`}
        />
        {button}
      </div>
    </div>
  )
}

function DangerButton({ icon, label, onClick, variant = 'default' }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
        variant === 'danger'
          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
          : 'bg-nexus-panel border-nexus-border text-nexus-text-bright hover:border-nexus-accent/40 hover:text-nexus-accent'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings })
  const [showToast, setShowToast] = useState(false)

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(() => {
    onSave(local)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [local, onSave])

  const handleExport = useCallback(() => {
    const data = JSON.stringify(local, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gielinor-nexus-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [local])

  const hasChanges = JSON.stringify(local) !== JSON.stringify(settings)

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/30">
          <Settings className="w-4 h-4 text-nexus-accent" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">Settings</h2>
          <p className="text-[10px] font-mono text-nexus-text">Configure Gielinor Nexus</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {hasChanges && (
            <span className="text-[9px] font-mono text-amber-400 animate-pulse">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/40 text-nexus-accent text-xs font-mono font-bold rounded-lg hover:bg-nexus-accent/20 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute top-16 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-nexus-green/20 border border-nexus-green/40 rounded-xl text-nexus-green text-xs font-mono shadow-xl">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

        {/* 1. Player */}
        <Section icon={<User className="w-3.5 h-3.5" />} title="Player">
          <TextField
            label="Player Name"
            value={local.playerName}
            onChange={v => update('playerName', v)}
            placeholder="Your RS3 username"
          />
          <button className="flex items-center gap-1.5 px-3 py-2 bg-nexus-panel border border-nexus-border text-nexus-text-bright text-xs font-mono rounded-lg hover:border-nexus-accent/40 hover:text-nexus-accent transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync HiScores
          </button>
        </Section>

        <div className="h-px bg-nexus-border" />

        {/* 2. Launcher */}
        <Section icon={<FolderOpen className="w-3.5 h-3.5" />} title="Launcher">
          <TextField
            label="Launcher Path"
            value={local.launcherPath}
            onChange={v => update('launcherPath', v)}
            placeholder="C:\Program Files\Jagex Launcher\JagexLauncher.exe"
            button={
              <button className="px-3 py-2 bg-nexus-panel border border-nexus-border text-nexus-text text-xs font-mono rounded-lg hover:border-nexus-accent/40 hover:text-nexus-accent transition-colors">
                Browse
              </button>
            }
          />
          <Toggle
            label="Auto-launch on startup"
            value={local.autoLaunch}
            onChange={v => update('autoLaunch', v)}
            note="Automatically opens the official Jagex Launcher when Gielinor Nexus starts"
          />
          <div className="flex items-start gap-2 p-2.5 bg-nexus-gold/5 border border-nexus-gold/20 rounded-lg">
            <Info className="w-3.5 h-3.5 text-nexus-gold flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono text-nexus-gold/80 leading-relaxed">
              Only the official Jagex Launcher is supported. Third-party launchers may void your account's standing with Jagex.
            </p>
          </div>
        </Section>

        <div className="h-px bg-nexus-border" />

        {/* 3. AI Observer */}
        <Section icon={<Eye className="w-3.5 h-3.5" />} title="AI Observer">
          <SliderField
            label="OCR Threshold"
            value={local.ocrThreshold}
            min={0}
            max={100}
            onChange={v => update('ocrThreshold', v)}
            display={v => `${v}%`}
          />
          <SliderField
            label="AI Confidence Threshold"
            value={local.aiConfidenceThreshold}
            min={0}
            max={100}
            onChange={v => update('aiConfidenceThreshold', v)}
            display={v => `${v}%`}
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Scan Interval</label>
            <div className="flex gap-2">
              {SCAN_INTERVAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('scanInterval', opt.value)}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
                    local.scanInterval === opt.value
                      ? 'bg-nexus-accent/20 border-nexus-accent/50 text-nexus-accent'
                      : 'bg-nexus-bg border-nexus-border text-nexus-text hover:border-nexus-border/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <div className="h-px bg-nexus-border" />

        {/* 4. Data */}
        <Section icon={<Database className="w-3.5 h-3.5" />} title="Data">
          <div className="flex flex-wrap gap-2">
            <DangerButton icon={<Download className="w-3.5 h-3.5" />} label="Export All Data" onClick={handleExport} />
            <DangerButton icon={<Upload className="w-3.5 h-3.5" />} label="Import Data" onClick={() => {}} />
            <DangerButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Reset Database" onClick={() => {}} variant="danger" />
          </div>
          <p className="text-[10px] font-mono text-nexus-text/60 leading-relaxed">
            Export saves all tracked items, sessions, goals, and events as JSON. Import merges data from a previous export. Reset deletes all local data permanently.
          </p>
        </Section>

        <div className="h-px bg-nexus-border" />

        {/* 5. Safety & Attribution */}
        <Section icon={<ShieldCheck className="w-3.5 h-3.5" />} title="Safety & Attribution">
          <div className="p-3 bg-nexus-green/5 border border-nexus-green/20 rounded-xl space-y-2">
            {[
              ['HiScores data', 'RS3 Public HiScores API (Jagex)'],
              ['Prices data', 'Grand Exchange public catalogue API'],
              ['Player data', 'Stored locally on your device only'],
              ['Screen reading', 'On-device OCR — no data leaves your PC'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-nexus-green flex-shrink-0" />
                <span className="text-[10px] font-mono text-nexus-text-bright">{label}:</span>
                <span className="text-[10px] font-mono text-nexus-text">{value}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-nexus-gold/5 border border-nexus-gold/20 rounded-xl">
            <p className="text-[10px] font-mono text-nexus-gold/80 leading-relaxed">
              Gielinor Nexus does not read memory, inject code, intercept packets, or automate any game actions. This tool is solely a companion for tracking publicly available and locally observed data.
            </p>
          </div>
        </Section>

        <div className="h-px bg-nexus-border" />

        {/* 6. About */}
        <Section icon={<Info className="w-3.5 h-3.5" />} title="About">
          <div className="p-3 bg-nexus-bg border border-nexus-border rounded-xl space-y-2">
            {[
              ['App', 'Gielinor Nexus'],
              ['Version', '0.1.0'],
              ['Runtime', 'Electron + React'],
              ['Author', 'Community project'],
              ['License', 'MIT'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-nexus-text w-20 flex-shrink-0">{label}:</span>
                <span className="text-[10px] font-mono text-nexus-text-bright">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-2.5 border-2 border-nexus-gold/40 rounded-xl bg-nexus-gold/5">
            <ShieldCheck className="w-4 h-4 text-nexus-gold" />
            <span className="text-xs font-mono font-bold text-nexus-gold">100% SAFE — No automation, no injection, no memory reading</span>
          </div>
        </Section>
      </div>
    </div>
  )
}
