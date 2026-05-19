import { Gamepad2, MousePointer2, Monitor, FileSearch, Database, RefreshCw } from 'lucide-react'

const STEPS = [
  { icon: <Gamepad2 size={18}/>,      num: '1', title: 'You Play',      desc: 'Play RuneScape 3 normally in the official Jagex client. No modifications.' },
  { icon: <MousePointer2 size={18}/>, num: '2', title: 'Mouse Action',  desc: 'Click on skills, items, chat. The game does its thing normally.' },
  { icon: <Monitor size={18}/>,       num: '3', title: 'Read Screen',   desc: 'AI Observer captures a selected chat/action region of your screen.' },
  { icon: <FileSearch size={18}/>,    num: '4', title: 'OCR & Parse',   desc: 'Tesseract.js reads visible action text, parser classifies the event.' },
  { icon: <Database size={18}/>,      num: '5', title: 'Update Bank',   desc: 'Parsed events update your local Bank mirror. You approve low-confidence events.' },
  { icon: <RefreshCw size={18}/>,     num: '6', title: 'Sync Data',     desc: 'HiScores & GE prices sync every 5 min via official public RS3 APIs.' },
]

export function HowItWorks() {
  return (
    <div className="flex items-stretch h-full">
      <div className="px-3 py-2 border-r border-nexus-border flex flex-col justify-center" style={{ minWidth: 140 }}>
        <div className="text-[9px] text-nexus-text-dim uppercase tracking-widest font-bold mb-0.5">How the</div>
        <div className="text-[11px] text-nexus-text-bright font-bold">Companion Works</div>
      </div>
      <div className="flex flex-1 divide-x divide-nexus-border">
        {STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center justify-center px-3 py-2 text-center gap-1 hover:bg-nexus-card transition-colors flex-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-nexus-accent/10 text-nexus-accent">
              {s.icon}
            </div>
            <div className="text-[9px] font-bold text-nexus-text-bright">{s.num}. {s.title}</div>
            <div className="text-[8px] text-nexus-text leading-tight max-w-[90px]">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
