import { metadata } from '../layout'

describe('HomeLayout metadata', () => {
  it('검색 제목에 골프 회원권 최저가 찾기를 표시한다', () => {
    expect(metadata.title).toBe('골프 회원권 최저가 찾기')
  })

  it('홈 대표 URL을 canonical로 제공한다', () => {
    expect(metadata.alternates).toEqual({ canonical: '/home' })
  })
})
