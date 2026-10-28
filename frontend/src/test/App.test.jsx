import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('Alumni Connect Portal App Component', () => {
  it('renders landing page brand and header elements', () => {
    render(<App />)
    const elements = screen.getAllByText(/Alumni/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders sign in call to action button', () => {
    render(<App />)
    const signInLinks = screen.getAllByRole('link', { name: /Sign In|Log In/i })
    expect(signInLinks.length).toBeGreaterThan(0)
  })
})
