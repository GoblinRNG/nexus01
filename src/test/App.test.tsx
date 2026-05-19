import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the Gielinor Nexus heading', () => {
    render(<App />)
    expect(screen.getByText(/Gielinor Nexus/i)).toBeInTheDocument()
  })

  it('renders the launcher play button', () => {
    render(<App />)
    expect(screen.getByText('PLAY')).toBeInTheDocument()
  })

  it('renders How the Companion Works section', () => {
    render(<App />)
    expect(screen.getByText(/How the Companion Works/i)).toBeInTheDocument()
  })

  it('renders Account & Data Integration section', () => {
    render(<App />)
    expect(screen.getByText(/Account & Data Integration/i)).toBeInTheDocument()
  })

  it('shows the 100% SAFE badge', () => {
    render(<App />)
    expect(screen.getByText('100% SAFE')).toBeInTheDocument()
  })
})
