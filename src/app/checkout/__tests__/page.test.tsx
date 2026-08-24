import { render, screen, waitFor } from '@testing-library/react'
import CheckoutPage from '../page'

const mockInitializePaddle = jest.fn()
jest.mock('@paddle/paddle-js', () => ({
  CheckoutEventNames: {
    CHECKOUT_COMPLETED: 'checkout.completed',
    CHECKOUT_ERROR: 'checkout.error',
    CHECKOUT_FAILED: 'checkout.failed',
  },
  initializePaddle: (...args: unknown[]) => mockInitializePaddle(...args),
}))

describe('CheckoutPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/checkout?_ptxn=txn_test')
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN = 'test_token'
    process.env.NEXT_PUBLIC_PADDLE_ENV = 'sandbox'
    mockInitializePaddle.mockResolvedValue({ Checkout: {} })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Paddle 결제 링크의 거래 ID가 있으면 Sandbox SDK를 초기화한다', async () => {
    render(<CheckoutPage />)

    await waitFor(() => {
      expect(mockInitializePaddle).toHaveBeenCalledWith(expect.objectContaining({
        token: 'test_token',
        environment: 'sandbox',
      }))
    })
    expect(screen.getByText('안전한 결제창을 준비하고 있어요')).toBeInTheDocument()
  })

  it('거래 ID가 없으면 결제창을 초기화하지 않고 상품 페이지 이동을 안내한다', async () => {
    window.history.replaceState({}, '', '/checkout')
    render(<CheckoutPage />)

    expect(await screen.findByText('유효한 결제 링크가 아니에요')).toBeInTheDocument()
    expect(mockInitializePaddle).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: '구독 상품 보기' })).toHaveAttribute('href', '/pricing')
  })

  it('Paddle 환경값이 없으면 설정 오류를 표시한다', async () => {
    delete process.env.NEXT_PUBLIC_PADDLE_ENV
    render(<CheckoutPage />)

    expect(await screen.findByText('결제창을 불러오지 못했어요')).toBeInTheDocument()
    expect(mockInitializePaddle).not.toHaveBeenCalled()
  })
})
