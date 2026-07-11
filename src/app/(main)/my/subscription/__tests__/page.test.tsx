import { render, screen, fireEvent } from '@testing-library/react'
import SubscriptionPage from '../page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com', name: '테스터' },
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  }),
}))
jest.mock('@tosspayments/tosspayments-sdk', () => ({
  loadTossPayments: jest.fn(),
}))

const mockPrepare = jest.fn()
jest.mock('@/lib/api/subscription', () => ({
  subscriptionApi: {
    prepare: (...args: unknown[]) => mockPrepare(...args),
    cancel: jest.fn(),
  },
}))

const mockUsePlans = jest.fn()
const mockUseMySub = jest.fn()
jest.mock('@/lib/hooks/useSubscription', () => ({
  useSubscriptionPlans: () => mockUsePlans(),
  useMySubscription: () => mockUseMySub(),
}))

const mockPlans = [
  { id: 1, code: 'BASIC', name: '베이직', price: 9900, description: '기본 기능' },
  { id: 2, code: 'PRO', name: '프로', price: 19900, description: '모든 기능' },
]

describe('SubscriptionPage', () => {
  beforeEach(() => {
    mockUsePlans.mockReturnValue({ data: mockPlans, isLoading: false })
    mockUseMySub.mockReturnValue({ data: null, isLoading: false, mutate: jest.fn() })
    mockPrepare.mockResolvedValue({ customerKey: 'ck_test', clientKey: 'toss_test', planId: 1 })
  })

  it('플랜 목록을 렌더링한다', () => {
    render(<SubscriptionPage />)
    expect(screen.getByText('베이직')).toBeInTheDocument()
    expect(screen.getByText('프로')).toBeInTheDocument()
  })

  it('플랜 선택 시 선택됨 표시', () => {
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByText('베이직'))
    expect(screen.getByText('선택됨')).toBeInTheDocument()
  })

  it('플랜 미선택 시 결제 버튼 비활성화', () => {
    render(<SubscriptionPage />)
    expect(screen.getByRole('button', { name: '결제 카드 등록하기' })).toBeDisabled()
  })

  it('플랜 선택 후 결제 버튼 활성화', () => {
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByText('베이직'))
    expect(screen.getByRole('button', { name: '결제 카드 등록하기' })).not.toBeDisabled()
  })

  it('구독 중일 때 해지 버튼을 표시한다', () => {
    mockUseMySub.mockReturnValue({
      data: {
        id: 1,
        plan: { id: 1, code: 'BASIC', name: '베이직', price: 9900 },
        status: 'ACTIVE',
        startedAt: '2024-01-01',
        nextBillingAt: '2024-02-01',
        cardCompany: null, cardNumberMasked: null, cancelledAt: null,
      },
      isLoading: false,
      mutate: jest.fn(),
    })
    render(<SubscriptionPage />)
    expect(screen.getByText('구독 해지하기')).toBeInTheDocument()
  })

  it('로딩 중 스켈레톤을 표시한다', () => {
    mockUsePlans.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<SubscriptionPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
