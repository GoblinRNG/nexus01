import { Shield, CheckCircle, XCircle } from 'lucide-react'

export function CurrentAccount() {
  const features = [
    { label: 'Membership',         ok: true  },
    { label: 'Two-Factor Auth',    ok: true  },
    { label: 'Bank PIN',           ok: true  },
    { label: 'Email Verified',     ok: true  },
    { label: 'JAG Active',         ok: false },
    { label: 'Authenticator App',  ok: true  },
  ]

  return (
    <div className="space-y-2">
      <div className="panel-header rounded-none -mx-2 px-2">Current Account</div>
      <div className="flex items-center gap-2 py-1">
        <div className="w-7 h-7 rounded-full bg-nexus-accent/20 border border-nexus-accent/40 flex items-center justify-center">
          <Shield size={14} className="text-nexus-accent"/>
        </div>
        <div>
          <div className="text-[11px] text-nexus-text-bright font-bold">Gielinor_Hero</div>
          <div className="text-[9px] text-nexus-green">● Member</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[9px] text-nexus-text">Account Age</div>
          <div className="text-[10px] text-nexus-text-bright font-bold">5 Years</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0.5">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5">
            {f.ok
              ? <CheckCircle size={9} className="text-nexus-green flex-shrink-0"/>
              : <XCircle size={9} className="text-red-400 flex-shrink-0"/>
            }
            <span className={`text-[9px] ${f.ok ? 'text-nexus-text' : 'text-red-400'}`}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
