import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubscriptionPage, { paymentErrorMessage } from '../page'

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
const mockRequestBillingAuth = jest.fn()
const mockLoadTossPayments = jest.fn()
jest.mock('@tosspayments/tosspayments-sdk', () => ({
  loadTossPayments: (...args: unknown[]) => mockLoadTossPayments(...args),
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
  { id: 1, code: 'MONTHLY', name: '월간 구독', price: 10000, billingCycle: 'MONTHLY', description: '기본 기능' },
  { id: 2, code: 'ANNUAL', name: '연간 구독', price: 90000, billingCycle: 'ANNUAL', description: '모든 기능' },
]

describe('SubscriptionPage', () => {
  beforeEach(() => {
    mockUsePlans.mockReturnValue({ data: mockPlans, isLoading: false })
    mockUseMySub.mockReturnValue({ data: null, isLoading: false, mutate: jest.fn() })
    mockPrepare.mockResolvedValue({ customerKey: 'ck_test', clientKey: 'toss_test', planId: 1 })
    mockRequestBillingAuth.mockResolvedValue(undefined)
    mockLoadTossPayments.mockResolvedValue({
      payment: () => ({ requestBillingAuth: mockRequestBillingAuth }),
    })
  })

  it('플랜 목록을 렌더링한다', () => {
    render(<SubscriptionPage />)
    expect(screen.getByText('월간 구독')).toBeInTheDocument()
    expect(screen.getByText('연간 구독')).toBeInTheDocument()
    expect(screen.getByText('1만원')).toBeInTheDocument()
    expect(screen.getByText('9만원')).toBeInTheDocument()
    expect(screen.getByText('/ 월')).toBeInTheDocument()
    expect(screen.getByText('/ 년')).toBeInTheDocument()
  })

  it('Toss 카드 인증 실패 코드를 사용자 안내로 변환한다', () => {
    expect(paymentErrorMessage('PAY_PROCESS_CANCELED')).toBe('카드 등록을 취소했어요.')
    expect(paymentErrorMessage('REJECT_CARD_COMPANY')).toContain('카드사에서 등록을 거절')
    expect(paymentErrorMessage('UNKNOWN_CODE')).toContain('결제를 완료하지 못했어요')
  })

  it('플랜 선택 시 선택됨 표시', () => {
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByRole('button', { name: /월간 구독/ }))
    expect(screen.getByText('선택됨')).toBeInTheDocument()
  })

  it('플랜 미선택 시 결제 버튼 비활성화', () => {
    render(<SubscriptionPage />)
    expect(screen.getByRole('button', { name: '플랜을 선택해주세요' })).toBeDisabled()
  })

  it('플랜 선택 후 자동결제 동의 전에는 결제 버튼이 비활성화된다', () => {
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByText('월간 구독'))
    expect(screen.getByText('최초 결제 금액')).toBeInTheDocument()
    expect(screen.getByText(/카드 인증이 완료되면 위 금액이 즉시 결제/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1만원 결제하고 월간 구독 시작하기' })).toBeDisabled()
  })

  it('자동결제 동의 후 사용자 정보와 콜백 URL로 Toss 등록창을 요청한다', async () => {
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByRole('button', { name: /월간 구독/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /최초 결제와 정기 자동결제에 동의/ }))
    fireEvent.click(screen.getByRole('button', { name: '1만원 결제하고 월간 구독 시작하기' }))

    await waitFor(() => {
      expect(mockRequestBillingAuth).toHaveBeenCalledWith(expect.objectContaining({
        method: 'CARD',
        customerEmail: 'test@test.com',
        customerName: '테스터',
        failUrl: 'http://localhost/my/subscription',
      }))
    })
  })

  it('구독 중일 때 해지 버튼을 표시한다', () => {
    mockUseMySub.mockReturnValue({
      data: {
        id: 1,
        plan: { id: 1, code: 'MONTHLY', name: '월간 구독', price: 10000, billingCycle: 'MONTHLY' },
        status: 'ACTIVE',
        serviceActive: true,
        serviceEndsAt: null,
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

  it('이용 종료일이 지난 취소 구독은 신규 구독 화면으로 표시한다', () => {
    mockUseMySub.mockReturnValue({
      data: {
        id: 1,
        plan: { id: 1, code: 'MONTHLY', name: '월간 구독', price: 10000, billingCycle: 'MONTHLY' },
        status: 'CANCELLED',
        serviceActive: false,
        serviceEndsAt: '2026-07-25T00:00:00',
        startedAt: '2026-06-25T00:00:00',
        nextBillingAt: '2026-07-25T00:00:00',
        cardCompany: null, cardNumberMasked: null,
        cancelledAt: '2026-07-20T00:00:00',
      },
      isLoading: false,
      mutate: jest.fn(),
    })

    render(<SubscriptionPage />)

    expect(screen.queryByText('해지 완료')).not.toBeInTheDocument()
    expect(screen.queryByText(/이용 종료일: 2026-07-25/)).not.toBeInTheDocument()
    expect(screen.getByText('플랜 선택')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '플랜을 선택해주세요' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /월간 구독/ }))
    expect(screen.getByRole('button', { name: '1만원 결제하고 월간 구독 시작하기' })).toBeDisabled()
  })

  it('이용 기간이 남은 취소 구독은 해지 예정으로 표시한다', () => {
    mockUseMySub.mockReturnValue({
      data: {
        id: 1,
        plan: { id: 1, code: 'MONTHLY', name: '월간 구독', price: 10000, billingCycle: 'MONTHLY' },
        status: 'CANCELLED',
        serviceActive: true,
        serviceEndsAt: '2026-08-25T00:00:00',
        startedAt: '2026-07-25T00:00:00',
        nextBillingAt: '2026-08-25T00:00:00',
        cardCompany: null, cardNumberMasked: null,
        cancelledAt: '2026-07-27T00:00:00',
      },
      isLoading: false,
      mutate: jest.fn(),
    })

    render(<SubscriptionPage />)

    expect(screen.getByText('해지 예정')).toBeInTheDocument()
    expect(screen.getByText(/이용 종료일: 2026-08-25/)).toBeInTheDocument()
    expect(screen.getByText('현재 플랜')).toBeInTheDocument()
    expect(screen.getByText('이용 종료일까지 현재 구독을 사용할 수 있어요.')).toBeInTheDocument()
  })

  it('로딩 중 스켈레톤을 표시한다', () => {
    mockUsePlans.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<SubscriptionPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
