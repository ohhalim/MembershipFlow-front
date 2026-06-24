import { render, screen, fireEvent } from '@testing-library/react'
import MyPage from '../page'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }))
jest.mock('@/lib/auth', () => ({
  auth: { clearToken: jest.fn() },
}))

const mockUseMySubscription = jest.fn()
jest.mock('@/lib/hooks/useSubscription', () => ({
  useMySubscription: () => mockUseMySubscription(),
}))

describe('MyPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockUseMySubscription.mockReturnValue({ data: null, isLoading: false })
  })

  it('MY 헤더와 메뉴를 렌더링한다', () => {
    render(<MyPage />)
    expect(screen.getByText('MY')).toBeInTheDocument()
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })

  it('구독 없을 때 플랜 없음 메시지를 표시한다', () => {
    render(<MyPage />)
    expect(screen.getByText('구독 플랜 없음')).toBeInTheDocument()
  })

  it('구독 중일 때 플랜 정보를 표시한다', () => {
    mockUseMySubscription.mockReturnValue({
      data: {
        id: 1,
        plan: { id: 1, code: 'BASIC', name: '베이직', price: 9900 },
        status: 'ACTIVE',
        startedAt: '2024-01-01T00:00:00',
        nextBillingAt: '2024-02-01T00:00:00',
        cardCompany: '신한', cardNumberMasked: '**** 1234',
        cancelledAt: null,
      },
      isLoading: false,
    })
    render(<MyPage />)
    expect(screen.getByText('베이직')).toBeInTheDocument()
    expect(screen.getByText('구독 중')).toBeInTheDocument()
    expect(screen.getByText('신한 **** 1234')).toBeInTheDocument()
  })

  it('로그아웃 클릭 시 토큰 삭제 후 로그인 페이지로 이동한다', () => {
    render(<MyPage />)
    fireEvent.click(screen.getByText('로그아웃'))
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
