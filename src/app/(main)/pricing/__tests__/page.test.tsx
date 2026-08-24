import { fireEvent, render, screen } from '@testing-library/react'
import PricingPage from '../page'

const mockUseAuth = jest.fn()
jest.mock('@/lib/auth', () => ({ useAuth: () => mockUseAuth() }))
jest.mock('@/lib/hooks/useSubscription', () => ({
  useSubscriptionPlans: () => ({
    data: [
      { id: 1, code: 'MONTHLY', name: '월간 구독', price: 10000, billingCycle: 'MONTHLY', description: '월간 상품' },
      { id: 2, code: 'ANNUAL', name: '연간 구독', price: 90000, billingCycle: 'ANNUAL', description: '연간 상품' },
    ],
    isLoading: false,
  }),
}))

describe('PricingPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })
  })

  it('미로그인 사용자에게 상품 가격과 결제 조건을 공개한다', () => {
    render(<PricingPage />)

    expect(screen.getByText('월간 구독')).toBeInTheDocument()
    expect(screen.getByText('연간 구독')).toBeInTheDocument()
    expect(screen.getByText('1만원')).toBeInTheDocument()
    expect(screen.getByText('9만원')).toBeInTheDocument()
    expect(screen.getByText(/카드 인증 완료 후 선택한 플랜 금액이 최초 결제/)).toBeInTheDocument()
    expect(screen.getByText(/다음 결제일 전까지 언제든 해지/)).toBeInTheDocument()
    expect(screen.getByText(/Paddle이 판매·결제 주체/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '환불정책' })).toHaveAttribute('href', '/refund')
  })

  it('로그인 진입 전에 구독 화면 복귀 경로를 저장한다', () => {
    render(<PricingPage />)

    fireEvent.click(screen.getByRole('link', { name: 'Google 로그인 후 구독하기' }))

    expect(sessionStorage.getItem('membershipflow_post_login_path')).toBe('/my/subscription')
  })

  it('로그인 사용자는 구독 결제 화면으로 이동할 수 있다', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
    render(<PricingPage />)

    expect(screen.getByRole('link', { name: '플랜 선택하고 결제하기' }))
      .toHaveAttribute('href', '/my/subscription')
  })
})
