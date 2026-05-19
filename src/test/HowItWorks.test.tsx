import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HowItWorks } from '../components/HowItWorks'

describe('HowItWorks', () => {
  it('renders all 5 steps', () => {
    render(<HowItWorks />)
    expect(screen.getByText('1. Link Account')).toBeInTheDocument()
    expect(screen.getByText('2. Track Progress')).toBeInTheDocument()
    expect(screen.getByText('3. Build a Party')).toBeInTheDocument()
    expect(screen.getByText('4. Sync & Save')).toBeInTheDocument()
    expect(screen.getByText('5. Stay Safe')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/How the Companion Works/i)).toBeInTheDocument()
  })

  it('shows the platform tagline', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/Built for RuneScape 3/i)).toBeInTheDocument()
  })
})
