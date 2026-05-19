import { CheckCircle, ShieldCheck } from 'lucide-react'

const DATA_SOURCES = [
  'HiScores (all 29 RS3 skills)',
  'RuneMetrics public activity',
  'Grand Exchange item prices',
  'RS3 ItemDB sprites & data',
]

const SAFE_GUARANTEES = [
  'No memory reading',
  'No injection or hooking',
  'No packet sniffing',
  'No automation or macros',
  'Read-only public APIs only',
]

export function AccountIntegration() {
  return (
    <div className="flex h-full items-stretch">
      <div className="flex flex-col justify-center px-3 py-2 flex-1">
        <div className="text-[9px] text-nexus-green font-bold uppercase tracking-widest mb-1.5">
          Account &amp; Data Integration (Safe)
        </div>
        <div className="space-y-0.5 mb-2">
          {DATA_SOURCES.map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <CheckCircle size={9} className="text-nexus-green flex-shrink-0"/>
              <span className="text-[9px] text-nexus-text">{s}</span>
            </div>
          ))}
        </div>
        <div className="space-y-0.5">
          {SAFE_GUARANTEES.map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <CheckCircle size={9} className="text-nexus-accent flex-shrink-0"/>
              <span className="text-[9px] text-nexus-text">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-2 gap-2 border-l border-nexus-border bg-nexus-deep">
        <JagexHexBadge />
        <div className="text-nexus-green font-bold text-sm tracking-widest text-glow-accent">100% SAFE</div>
        <div className="text-[8px] text-nexus-text text-center max-w-[80px]">
          Jagex TOS compliant · Read-only
        </div>
      </div>
    </div>
  )
}

function JagexHexBadge() {
  return (
    <div className="relative">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <polygon
          points="26,2 50,15 50,37 26,50 2,37 2,15"
          fill="#0d1520" stroke="#00c8e0" strokeWidth="1.5"
        />
        <polygon
          points="26,7 45,18 45,34 26,45 7,34 7,18"
          fill="none" stroke="#00c8e040" strokeWidth="0.5"
        />
        <text x="26" y="33" textAnchor="middle" fill="#00c8e0"
          fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">J</text>
      </svg>
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-nexus-green rounded-full flex items-center justify-center">
        <ShieldCheck size={9} className="text-white"/>
      </div>
    </div>
  )
}
