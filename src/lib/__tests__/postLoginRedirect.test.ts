import { consumePostLoginPath, rememberPostLoginPath } from '../postLoginRedirect'

describe('postLoginRedirect', () => {
  beforeEach(() => sessionStorage.clear())

  it('로그인 후 이동할 내부 경로를 한 번만 반환한다', () => {
    rememberPostLoginPath('/my/subscription')

    expect(consumePostLoginPath()).toBe('/my/subscription')
    expect(consumePostLoginPath()).toBe('/home')
  })

  it('외부 URL과 프로토콜 상대 URL은 저장하지 않는다', () => {
    rememberPostLoginPath('https://evil.example')
    rememberPostLoginPath('//evil.example')

    expect(consumePostLoginPath()).toBe('/home')
  })
})
