import { LauncherPanel } from './components/LauncherPanel'
import { NexusPanel } from './components/NexusPanel'
import { HowItWorks } from './components/HowItWorks'
import { AccountIntegration } from './components/AccountIntegration'

export default function App() {
  return (
    <div className="min-h-screen bg-nexus-bg flex flex-col">
      {/* Main panels */}
      <div className="flex gap-2 p-2 flex-1" style={{ minHeight: 0 }}>
        <LauncherPanel />
        <NexusPanel />
      </div>

      {/* Bottom info strip */}
      <div className="mx-2 mb-2 border border-nexus-border rounded overflow-hidden bg-nexus-panel">
        <HowItWorks />
        <AccountIntegration />
      </div>
    </div>
  )
}
