import { metadata } from '../layout'

describe('HomeLayout metadata', () => {
  it('홈 대표 URL을 canonical로 제공한다', () => {
    expect(metadata.alternates).toEqual({ canonical: '/home' })
  })
})
