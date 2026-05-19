import { Tv, Users } from 'lucide-react'

export function LiveWindow() {
  return (
    <div>
      <div className="panel-header rounded-none -mx-2 px-2 mb-2">Live Window</div>
      <div className="relative bg-[#0a1a2a] border border-nexus-border rounded overflow-hidden" style={{ height: 70 }}>
        {/* Stream preview mockup */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Tv size={20} className="text-nexus-accent mx-auto mb-1 opacity-50"/>
            <span className="text-[9px] text-nexus-text">Stream Preview</span>
          </div>
        </div>
        {/* Overlay badges */}
        <div className="absolute top-1 left-1 flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
          <span className="w-1 h-1 bg-white rounded-full animate-pulse"/>
          LIVE
        </div>
        <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/60 text-nexus-text text-[8px] px-1.5 py-0.5 rounded">
          <Users size={8}/>
          <span>1,204</span>
        </div>
        {/* Channel name */}
        <div className="absolute bottom-1 left-1 bg-black/60 text-nexus-accent text-[8px] font-bold px-1.5 py-0.5 rounded">
          NexusStream_RS
        </div>
      </div>
    </div>
  )
}
