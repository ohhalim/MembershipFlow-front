import { fireEvent, render, screen } from '@testing-library/react'
import { AccessGateProvider, ProtectedNavLink } from '../AccessGate'

const mockUseAuth = jest.fn()
jest.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseSubscription = jest.fn()
jest.mock('@/lib/hooks/useSubscription', () => ({
  useMySubscription: () => mockUseSubscription(),
}))

function renderLink() {
  return render(
    <AccessGateProvider>
      <ProtectedNavLink
        href="/watchlist"
        label="관심"
        active={false}
        requiresSubscription
        className="nav-link"
      >
        관심
      </ProtectedNavLink>
    </AccessGateProvider>,
  )
}

describe('AccessGate', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ authStatus: 'authenticated', isAuthenticated: true })
    mockUseSubscription.mockReturnValue({ data: { serviceActive: true }, isLoading: false })
  })

  it('비로그인 메뉴 클릭을 막고 로그인 안내를 표시한다', () => {
    mockUseAuth.mockReturnValue({ authStatus: 'anonymous', isAuthenticated: false })

    renderLink()
    fireEvent.click(screen.getByRole('link', { name: '관심' }))

    expect(screen.getByRole('status')).toHaveTextContent('로그인이 필요해요')
    expect(screen.getByRole('link', { name: '로그인하기' })).toHaveAttribute('href', '/login')
  })

  it('로그인했지만 구독하지 않은 메뉴 클릭을 막고 구독 안내를 표시한다', () => {
    mockUseSubscription.mockReturnValue({ data: null, isLoading: false })

    renderLink()
    fireEvent.click(screen.getByRole('link', { name: '관심' }))

    expect(screen.getByRole('status')).toHaveTextContent('구독이 필요해요')
    expect(screen.getByRole('link', { name: '구독하기' })).toHaveAttribute('href', '/my/subscription')
  })

  it('활성 구독자는 원래 메뉴로 이동할 수 있다', () => {
    renderLink()

    const link = screen.getByRole('link', { name: '관심' })
    fireEvent.click(link)

    expect(link).toHaveAttribute('href', '/watchlist')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
