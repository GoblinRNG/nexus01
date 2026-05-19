import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NexusPanel } from '../components/NexusPanel'

describe('NexusPanel', () => {
  it('renders player stats', () => {
    render(<NexusPanel />)
    expect(screen.getByText('134h 38m')).toBeInTheDocument()
    expect(screen.getByText('270.8M')).toBeInTheDocument()
    expect(screen.getByText('Year 5')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<NexusPanel />)
    expect(screen.getByPlaceholderText('Search player...')).toBeInTheDocument()
  })

  it('renders the active quest card', () => {
    render(<NexusPanel />)
    expect(screen.getByText(/Unlock Necromancy/i)).toBeInTheDocument()
  })

  it('renders the party broadcast section', () => {
    render(<NexusPanel />)
    expect(screen.getByText(/Party Broadcast/i)).toBeInTheDocument()
  })

  it('renders party member names', () => {
    render(<NexusPanel />)
    expect(screen.getByText('FireMage99')).toBeInTheDocument()
    expect(screen.getByText('NecroKing')).toBeInTheDocument()
  })

  it('renders current account section', () => {
    render(<NexusPanel />)
    expect(screen.getByText('Current Account')).toBeInTheDocument()
    expect(screen.getByText('Gielinor_Hero')).toBeInTheDocument()
  })
})
