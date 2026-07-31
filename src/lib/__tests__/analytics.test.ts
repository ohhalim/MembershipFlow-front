import { isValidMeasurementId } from '@/lib/analytics'

describe('Google Analytics measurement ID', () => {
  it('accepts a GA4 measurement ID', () => {
    expect(isValidMeasurementId('G-ABC123XYZ')).toBe(true)
  })

  it.each(['', 'UA-123456-1', 'G-', 'G-abc123'])('rejects invalid IDs: %s', (id) => {
    expect(isValidMeasurementId(id)).toBe(false)
  })
})
