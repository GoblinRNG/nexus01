import { CheckCircle, Shield } from 'lucide-react'

const DATA_POINTS = [
  'Hiscores (Skills, Bosses, Clues)',
  'Quest & Achievement Diary log',
  'Grand Exchange price feeds',
  'Drop-rate broadcast events',
  'Party session sharing (opt-in)',
  'Account security score',
]

export function AccountIntegration() {
  return (
    <section className="flex items-stretch border-t border-nexus-border">
      {/* Left: data list */}
      <div className="flex-1 px-4 py-3 border-r border-nexus-border">
        <h2 className="text-xs font-bold tracking-widest text-nexus-text-bright uppercase mb-2">
          Account &amp; Data Integration <span className="text-nexus-green">(Safe)</span>
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {DATA_POINTS.map((pt) => (
            <div key={pt} className="flex items-center gap-1.5">
              <CheckCircle size={9} className="text-nexus-green flex-shrink-0"/>
              <span className="text-[9px] text-nexus-text">{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Jagex 100% SAFE badge */}
      <div className="flex flex-col items-center justify-center px-6 py-3 gap-2 bg-[#060d18]">
        <JagexBadge />
        <div className="text-center">
          <div className="text-nexus-green font-bold text-sm tracking-widest">100% SAFE</div>
          <div className="text-[8px] text-nexus-text mt-0.5 max-w-[120px] text-center">
            No passwords · Read-only API · Jagex approved partner
          </div>
        </div>
        <div className="flex flex-col gap-0.5 text-[8px] text-nexus-text">
          {['No keyloggers', 'No bots', 'No input injection'].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <CheckCircle size={7} className="text-nexus-green"/>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function JagexBadge() {
  return (
    <div className="relative">
      <svg viewBox="0 0 60 60" width="52" height="52">
        <polygon points="30,3 57,18 57,42 30,57 3,42 3,18" fill="#0d2040" stroke="#00c8e0" strokeWidth="1.5"/>
        <polygon points="30,8 52,21 52,39 30,52 8,39 8,21" fill="none" stroke="#00c8e0" strokeWidth="0.5" opacity="0.4"/>
        <text x="30" y="38" textAnchor="middle" fill="#00c8e0" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif">J</text>
      </svg>
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-nexus-green rounded-full flex items-center justify-center">
        <Shield size={8} className="text-white"/>
      </div>
    </div>
  )
}
