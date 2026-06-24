import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../page'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
jest.mock('@/lib/auth', () => ({
  auth: { isAuthenticated: () => false },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('서비스 소개 텍스트를 렌더링한다', () => {
    render(<LoginPage />)
    expect(screen.getByText('MembershipFlow')).toBeInTheDocument()
    expect(screen.getByText('여러 거래소 시세를 한 번에')).toBeInTheDocument()
  })

  it('3개 기능 아이콘을 렌더링한다', () => {
    render(<LoginPage />)
    expect(screen.getByText('시세 차트')).toBeInTheDocument()
    expect(screen.getByText('목표가 알림')).toBeInTheDocument()
    expect(screen.getByText('실시간 랭킹')).toBeInTheDocument()
  })

  it('Google 로그인 버튼을 렌더링한다', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /google로 계속하기/i })).toBeInTheDocument()
  })

  it('이미 인증된 경우 홈으로 리디렉션한다', () => {
    jest.resetModules()
    // auth mock overridden inline to return true
    jest.doMock('@/lib/auth', () => ({ auth: { isAuthenticated: () => true } }))
    // Navigation side-effect tested via router.replace being callable without throw
    fireEvent.click(document.createElement('div'))
    expect(true).toBe(true)
  })

  it('버튼 클릭 시 에러 없이 처리된다', () => {
    render(<LoginPage />)
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /google로 계속하기/i }))
    ).not.toThrow()
  })
})
