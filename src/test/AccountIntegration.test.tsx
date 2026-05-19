import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AccountIntegration } from '../components/AccountIntegration'

describe('AccountIntegration', () => {
  it('renders all data integration points', () => {
    render(<AccountIntegration />)
    expect(screen.getByText(/Hiscores/i)).toBeInTheDocument()
    expect(screen.getByText(/Quest & Achievement/i)).toBeInTheDocument()
    expect(screen.getByText(/Grand Exchange/i)).toBeInTheDocument()
  })

  it('shows 100% SAFE text', () => {
    render(<AccountIntegration />)
    expect(screen.getByText('100% SAFE')).toBeInTheDocument()
  })

  it('shows no-bot and no-keylogger guarantees', () => {
    render(<AccountIntegration />)
    expect(screen.getByText('No keyloggers')).toBeInTheDocument()
    expect(screen.getByText('No bots')).toBeInTheDocument()
    expect(screen.getByText('No input injection')).toBeInTheDocument()
  })
})
