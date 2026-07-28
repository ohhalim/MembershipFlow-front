import { metadata } from '../layout'

describe('RankingLayout metadata', () => {
  it('랭킹 대표 URL을 canonical로 제공한다', () => {
    expect(metadata.alternates).toEqual({ canonical: '/ranking' })
  })
})
