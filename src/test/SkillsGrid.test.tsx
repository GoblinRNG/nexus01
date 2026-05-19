import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkillsGrid } from '../components/SkillsGrid'
import { SKILLS } from '../data/skills'

describe('SkillsGrid', () => {
  it('renders a row for every skill', () => {
    render(<SkillsGrid />)
    SKILLS.forEach((skill) => {
      expect(screen.getByText(skill.abbr)).toBeInTheDocument()
    })
  })

  it('shows skill levels', () => {
    render(<SkillsGrid />)
    const nineties = screen.getAllByText('99')
    expect(nineties.length).toBeGreaterThan(0)
  })

  it('renders the total level display', () => {
    render(<SkillsGrid />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })
})
