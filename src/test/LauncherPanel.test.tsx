import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LauncherPanel } from '../components/LauncherPanel'

describe('LauncherPanel', () => {
  it('renders Settings, About, Update nav items', () => {
    render(<LauncherPanel />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Update')).toBeInTheDocument()
  })

  it('renders game tabs', () => {
    render(<LauncherPanel />)
    expect(screen.getByText('RuneScape 3')).toBeInTheDocument()
    expect(screen.getByText('Old School RS')).toBeInTheDocument()
  })

  it('toggles active tab on click', () => {
    render(<LauncherPanel />)
    const osrsTab = screen.getByText('Old School RS')
    fireEvent.click(osrsTab)
    expect(osrsTab.className).toContain('tab-active')
  })

  it('renders news items', () => {
    render(<LauncherPanel />)
    expect(screen.getByText('The New in RuneScape')).toBeInTheDocument()
    expect(screen.getByText('Yak Track 3494 §.0')).toBeInTheDocument()
    expect(screen.getByText('Combat Beta Phase 3')).toBeInTheDocument()
  })

  it('renders Jagex Nexus Companion CTA', () => {
    render(<LauncherPanel />)
    expect(screen.getByText('Jagex Nexus Companion')).toBeInTheDocument()
  })

  it('shows Quests and Clue Scrolls stats', () => {
    render(<LauncherPanel />)
    expect(screen.getByText('247')).toBeInTheDocument()
    expect(screen.getByText('1,204')).toBeInTheDocument()
  })
})
