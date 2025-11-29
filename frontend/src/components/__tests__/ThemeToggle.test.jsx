import React from 'react'
import { describe, it, beforeEach, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    // default matchMedia stub
    window.matchMedia = window.matchMedia || function() {
      return { matches: false, addListener: ()=>{}, removeListener: ()=>{} }
    }
  })

  it('defaults to light when no saved preference and prefers-color-scheme is false', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('switch')
    expect(btn).toHaveAttribute('aria-checked', 'false')
  })

  it('reads saved dark preference from localStorage', () => {
    localStorage.setItem('theme','dark')
    render(<ThemeToggle />)
    const btn = screen.getByRole('switch')
    expect(btn).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles theme and calls onChange and updates localStorage', () => {
    const onChange = vi.fn()
    render(<ThemeToggle onChange={onChange} />)
  const btn = screen.getByRole('switch')
  // click to enable dark
    fireEvent.click(btn)
  expect(onChange).toHaveBeenCalledWith(true)
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(btn).toHaveAttribute('aria-checked', 'true')

    // click to go back to light
    fireEvent.click(btn)
  expect(onChange).toHaveBeenCalledWith(false)
  expect(localStorage.getItem('theme')).toBe('light')
  expect(btn).toHaveAttribute('aria-checked', 'false')
  })
})
