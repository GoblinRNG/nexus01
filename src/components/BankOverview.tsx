import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, Package, Plus, X, Eye, Trash2, ShoppingCart, Edit2,
  TrendingUp, Coins, RefreshCw
} from 'lucide-react'
import type { BankItem, EventSource } from '../types'

interface BankOverviewProps {
  bank: BankItem[]
  onUpdate: (bank: BankItem[]) => void
}

interface ContextMenuState {
  x: number
  y: number
  item: BankItem
}

function formatQty(qty: number): string {
  return qty.toLocaleString('en-US')
}

function formatGP(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B gp'
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M gp'
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K gp'
  return value.toLocaleString('en-US') + ' gp'
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const SOURCE_COLORS: Record<EventSource, string> = {
  OCR: 'text-nexus-accent border-nexus-accent/30 bg-nexus-accent/10',
  AI: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Manual: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  RuneMetrics: 'text-nexus-green border-nexus-green/30 bg-nexus-green/10',
  Bridge: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  HiScores: 'text-nexus-gold border-nexus-gold/30 bg-nexus-gold/10',
}

interface ItemSpriteProps {
  itemId: number
  name: string
  size?: number
}

function ItemSprite({ itemId, name, size = 36 }: ItemSpriteProps) {
  const [errored, setErrored] = useState(false)
  const colors = ['#1a3050', '#0d2540', '#0f1a2a', '#162035', '#0a1828']
  const color = colors[itemId % colors.length]

  if (errored) {
    return (
      <div
        className="flex items-center justify-center rounded text-nexus-text text-[9px] font-mono flex-shrink-0"
        style={{ width: size, height: size, backgroundColor: color, border: '1px solid #1a3050' }}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://services.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${itemId}`}
      alt={name}
      width={size}
      height={size}
      className="flex-shrink-0 rounded object-contain"
      style={{ imageRendering: 'pixelated' }}
      onError={() => setErrored(true)}
    />
  )
}

interface AddItemFormProps {
  onAdd: (item: BankItem) => void
  onCancel: () => void
}

function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [itemId, setItemId] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [guidePrice, setGuidePrice] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = parseInt(itemId, 10)
    const qty = parseInt(quantity, 10)
    const price = parseInt(guidePrice.replace(/,/g, ''), 10)
    if (!name || isNaN(id) || isNaN(qty)) return
    onAdd({
      itemId: id,
      name,
      quantity: qty,
      guidePrice: isNaN(price) ? 0 : price,
      lastChanged: new Date().toISOString(),
      source: 'Manual',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-nexus-bg border border-nexus-border rounded-xl space-y-3">
      <p className="text-xs font-mono text-nexus-accent font-bold uppercase tracking-wider">Add Item Manually</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Item ID</label>
          <input
            type="number"
            value={itemId}
            onChange={e => setItemId(e.target.value)}
            placeholder="e.g. 4151"
            className="w-full mt-1 px-2 py-1.5 bg-nexus-panel border border-nexus-border rounded text-sm font-mono text-nexus-text-bright focus:outline-none focus:border-nexus-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Item Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Abyssal whip"
            className="w-full mt-1 px-2 py-1.5 bg-nexus-panel border border-nexus-border rounded text-sm font-mono text-nexus-text-bright focus:outline-none focus:border-nexus-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="1"
            className="w-full mt-1 px-2 py-1.5 bg-nexus-panel border border-nexus-border rounded text-sm font-mono text-nexus-text-bright focus:outline-none focus:border-nexus-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Guide Price (gp)</label>
          <input
            type="text"
            value={guidePrice}
            onChange={e => setGuidePrice(e.target.value)}
            placeholder="0"
            className="w-full mt-1 px-2 py-1.5 bg-nexus-panel border border-nexus-border rounded text-sm font-mono text-nexus-text-bright focus:outline-none focus:border-nexus-accent"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 py-1.5 bg-nexus-accent/20 border border-nexus-accent/50 text-nexus-accent text-xs font-mono font-bold rounded hover:bg-nexus-accent/30 transition-colors"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 bg-nexus-panel border border-nexus-border text-nexus-text text-xs font-mono rounded hover:border-nexus-border/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function BankOverview({ bank, onUpdate }: BankOverviewProps) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const totalValue = useMemo(
    () => bank.reduce((acc, item) => acc + item.quantity * item.guidePrice, 0),
    [bank]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return bank
    const q = search.toLowerCase()
    return bank.filter(item => item.name.toLowerCase().includes(q))
  }, [bank, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [contextMenu])

  const handleContextMenu = useCallback((e: React.MouseEvent, item: BankItem) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }, [])

  const handleRemove = useCallback((itemId: number) => {
    onUpdate(bank.filter(i => i.itemId !== itemId))
    setContextMenu(null)
  }, [bank, onUpdate])

  const handleAddItem = useCallback((item: BankItem) => {
    onUpdate([...bank, item])
    setShowAddForm(false)
  }, [bank, onUpdate])

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-gold/10 border border-nexus-gold/30">
          <Coins className="w-4 h-4 text-nexus-gold" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">Bank Overview</h2>
          <p className="text-[10px] font-mono text-nexus-text">{bank.length} items · {formatGP(totalValue)} total</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-xs font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-nexus-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-text" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-8 pr-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-sm font-mono text-nexus-text-bright placeholder:text-nexus-text focus:outline-none focus:border-nexus-accent transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-nexus-text hover:text-nexus-text-bright" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showAddForm && (
          <div className="px-4">
            <AddItemForm onAdd={handleAddItem} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {bank.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
            <div className="p-4 rounded-full bg-nexus-bg border border-nexus-border">
              <Package className="w-8 h-8 text-nexus-text/40" />
            </div>
            <p className="text-sm font-mono text-nexus-text">No items tracked yet.</p>
            <p className="text-xs font-mono text-nexus-text/60">Start the AI Observer to capture game activity.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm font-mono text-nexus-text">No items match "{search}"</p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {/* Column headers */}
            <div className="grid grid-cols-[36px_1fr_80px_90px_90px_60px] gap-3 px-3 pb-1 border-b border-nexus-border/50">
              <div />
              <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Item</span>
              <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Qty</span>
              <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Price ea</span>
              <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Stack value</span>
              <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider text-right">Changed</span>
            </div>
            {filtered.map(item => {
              const stackValue = item.quantity * item.guidePrice
              return (
                <div
                  key={item.itemId}
                  onContextMenu={e => handleContextMenu(e, item)}
                  className="grid grid-cols-[36px_1fr_80px_90px_90px_60px] gap-3 items-center px-3 py-2 rounded-lg hover:bg-nexus-bg/60 cursor-context-menu group transition-colors"
                >
                  <ItemSprite itemId={item.itemId} name={item.name} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-nexus-text-bright truncate">{item.name}</p>
                    <span className={`text-[9px] px-1 py-0.5 rounded border font-mono ${SOURCE_COLORS[item.source]}`}>
                      {item.source}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-nexus-text-bright text-right">{formatQty(item.quantity)}</span>
                  <span className="text-sm font-mono text-nexus-text text-right">{formatGP(item.guidePrice)}</span>
                  <span className="text-sm font-mono text-nexus-gold font-bold text-right">{formatGP(stackValue)}</span>
                  <span className="text-[10px] font-mono text-nexus-text text-right">{timeAgo(item.lastChanged)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-nexus-card border border-nexus-border rounded-xl shadow-2xl overflow-hidden py-1 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 border-b border-nexus-border">
            <p className="text-[10px] font-mono text-nexus-text uppercase tracking-wider truncate">{contextMenu.item.name}</p>
          </div>
          {[
            { icon: <Eye className="w-3.5 h-3.5" />, label: 'Examine stack', onClick: () => setContextMenu(null) },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'View price', onClick: () => setContextMenu(null) },
            { icon: <Edit2 className="w-3.5 h-3.5" />, label: 'Manual adjust', onClick: () => setContextMenu(null) },
            { icon: <ShoppingCart className="w-3.5 h-3.5" />, label: 'Mark sold', onClick: () => setContextMenu(null) },
            { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Remove', onClick: () => handleRemove(contextMenu.item.itemId), danger: true },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors hover:bg-nexus-border/30 text-left ${
                (opt as { danger?: boolean }).danger ? 'text-red-400' : 'text-nexus-text-bright'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
