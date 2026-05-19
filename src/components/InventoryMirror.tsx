import React, { useState, useEffect, useCallback } from 'react'
import { Grid3X3, RefreshCw, AlertCircle, Edit3 } from 'lucide-react'
import type { BankItem } from '../types'

interface InventoryMirrorProps {
  inventory: BankItem[]
}

const COLS = 4
const ROWS = 7
const TOTAL_SLOTS = COLS * ROWS

interface ItemSpriteProps {
  itemId: number
  name: string
  quantity: number
}

function InventorySlotFilled({ itemId, name, quantity }: ItemSpriteProps) {
  const [errored, setErrored] = useState(false)
  const colors = ['#1a2a40', '#0f2035', '#152030', '#0d1825', '#121e30']
  const bg = colors[itemId % colors.length]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {errored ? (
        <div
          className="w-full h-full flex items-center justify-center rounded text-[9px] font-mono text-nexus-text"
          style={{ backgroundColor: bg }}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>
      ) : (
        <img
          src={`https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${itemId}`}
          alt={name}
          className="w-9 h-9 object-contain"
          style={{ imageRendering: 'pixelated' }}
          onError={() => setErrored(true)}
        />
      )}
      {quantity > 1 && (
        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-mono font-bold leading-none"
          style={{
            color: quantity >= 100000 ? '#00c8e0' : quantity >= 1000 ? '#f0a030' : '#ffffff',
            textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}>
          {quantity >= 1_000_000
            ? `${(quantity / 1_000_000).toFixed(1)}M`
            : quantity >= 1_000
            ? `${(quantity / 1_000).toFixed(quantity >= 100_000 ? 0 : 1)}K`
            : quantity}
        </span>
      )}
    </div>
  )
}

function EmptySlot() {
  return (
    <div className="w-full h-full rounded border border-nexus-border/30 bg-nexus-bg/40 hover:border-nexus-border/60 transition-colors" />
  )
}

export function InventoryMirror({ inventory }: InventoryMirrorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [lastUpdateTime] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdateTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdateTime])

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null)

  const formatLastUpdated = useCallback((): string => {
    if (secondsAgo < 60) return `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`
    const mins = Math.floor(secondsAgo / 60)
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
    const hours = Math.floor(mins / 60)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }, [secondsAgo])

  const itemCount = inventory.length
  const emptyCount = TOTAL_SLOTS - itemCount

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/30">
          <Grid3X3 className="w-4 h-4 text-nexus-accent" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">
            Inventory Mirror
            <span className="ml-2 text-[10px] text-nexus-green font-mono animate-pulse">● LIVE</span>
          </h2>
          <p className="text-[10px] font-mono text-nexus-text">{itemCount}/{TOTAL_SLOTS} slots filled</p>
        </div>
        <div className="ml-auto">
          <button className="p-1.5 rounded-lg border border-nexus-border hover:border-nexus-accent/50 hover:bg-nexus-accent/10 text-nexus-text hover:text-nexus-accent transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
        {/* RS3 style inventory - dark background panel */}
        <div
          className="rounded-xl border border-nexus-border p-3 w-full max-w-[240px]"
          style={{ background: 'linear-gradient(135deg, #0a1525 0%, #060e1a 100%)' }}
        >
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {slots.map((item, idx) => (
              <div
                key={idx}
                className="aspect-square relative rounded"
                style={{
                  background: item
                    ? 'linear-gradient(135deg, #1a2a40 0%, #0d1a2a 100%)'
                    : 'transparent',
                  border: item ? '1px solid rgba(0,200,224,0.15)' : undefined,
                }}
                title={item ? `${item.name} × ${item.quantity.toLocaleString()}` : 'Empty slot'}
              >
                {item ? (
                  <InventorySlotFilled
                    itemId={item.itemId}
                    name={item.name}
                    quantity={item.quantity}
                  />
                ) : (
                  <EmptySlot />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slot summary */}
        <div className="mt-3 flex gap-4 text-[10px] font-mono">
          <span className="text-nexus-accent">{itemCount} items</span>
          <span className="text-nexus-text">{emptyCount} empty</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-nexus-border bg-nexus-bg/30 flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-nexus-text" />
            <span className="text-[10px] font-mono text-nexus-text">
              Last updated: <span className="text-nexus-text-bright">{formatLastUpdated()}</span>
            </span>
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-nexus-panel border border-nexus-border rounded text-[10px] font-mono text-nexus-text hover:border-nexus-accent/40 hover:text-nexus-accent transition-colors">
            <Edit3 className="w-2.5 h-2.5" />
            Manual correction
          </button>
        </div>

        <div className="flex items-start gap-1.5 p-2 bg-amber-400/5 border border-amber-400/20 rounded-lg">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] font-mono text-amber-400/80 leading-relaxed">
            Items detected via OCR. Approve changes in Activity feed.
          </p>
        </div>
      </div>
    </div>
  )
}
