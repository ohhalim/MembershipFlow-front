import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../page'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false, logout: jest.fn() }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('서비스 소개 텍스트를 렌더링한다', () => {
    render(<LoginPage />)
    expect(screen.getByText('MembershipFlow')).toBeInTheDocument()
    expect(screen.getByText('여러 거래소 시세를 비교해 최저가를 찾아드립니다')).toBeInTheDocument()
  })

  it('3개 기능 아이콘을 렌더링한다', () => {
    render(<LoginPage />)
    expect(screen.getByText('시세 차트')).toBeInTheDocument()
    expect(screen.getByText('목표가 알림')).toBeInTheDocument()
    expect(screen.getByText('실시간 랭킹')).toBeInTheDocument()
  })

  it('Google 로그인 버튼을 렌더링한다', () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /google로 계속하기/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
  })

  it('비인증 상태에서는 리디렉션하지 않는다', () => {
    render(<LoginPage />)
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
