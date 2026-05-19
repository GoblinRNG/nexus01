import { Link, BarChart2, Users, Shield, Cloud } from 'lucide-react'

const STEPS = [
  {
    icon: <Link size={20}/>,
    title: '1. Link Account',
    desc: 'Connect your Jagex account securely via OAuth — no passwords stored.',
    color: '#00c8e0',
  },
  {
    icon: <BarChart2 size={20}/>,
    title: '2. Track Progress',
    desc: 'Live skill XP, quest log, and drop rates pulled directly from the hiscores API.',
    color: '#3498db',
  },
  {
    icon: <Users size={20}/>,
    title: '3. Build a Party',
    desc: 'Invite friends to a shared session and view combined DPS & broadcast hits.',
    color: '#9b59b6',
  },
  {
    icon: <Cloud size={20}/>,
    title: '4. Sync & Save',
    desc: 'Cloud saves keep your goals, notes, and overlays synced across devices.',
    color: '#27ae60',
  },
  {
    icon: <Shield size={20}/>,
    title: '5. Stay Safe',
    desc: 'Read-only API access. We never touch your credentials or in-game items.',
    color: '#f39c12',
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-nexus-border bg-[#060d18]">
      <div className="px-4 py-3 border-b border-nexus-border">
        <h2 className="text-xs font-bold tracking-widest text-nexus-text-bright uppercase">
          How the Companion Works
        </h2>
        <p className="text-[10px] text-nexus-text mt-0.5">
          Built for RuneScape 3 · Full OSRS support · Powerful · Personal
        </p>
      </div>
      <div className="flex divide-x divide-nexus-border">
        {STEPS.map((step) => (
          <div key={step.title} className="flex-1 px-3 py-3 flex flex-col items-center text-center gap-1.5 hover:bg-nexus-card transition-colors">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: step.color + '22', border: `1px solid ${step.color}44`, color: step.color }}
            >
              {step.icon}
            </div>
            <div className="text-[10px] font-bold text-nexus-text-bright">{step.title}</div>
            <div className="text-[9px] text-nexus-text leading-relaxed">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
