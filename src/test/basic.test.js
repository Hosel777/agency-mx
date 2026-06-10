import { describe, it, expect } from 'vitest'

describe('Agency MX Sanity', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have environment configured', () => {
    expect(typeof window).not.toBe('undefined')
  })
})
