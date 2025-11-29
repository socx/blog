import React from 'react'
import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle accessibility & snapshot', () => {
  it('is keyboard-focusable', () => {
    const { container } = render(<ThemeToggle />)
    const btn = screen.getByRole('switch')
    // simulate keyboard focus by calling focus()
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })

  it('matches DOM snapshot', () => {
    const { container } = render(<ThemeToggle />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
