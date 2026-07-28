import { metadata } from '../layout'

describe('LoginLayout metadata', () => {
  it('로그인 페이지의 색인을 차단한다', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
