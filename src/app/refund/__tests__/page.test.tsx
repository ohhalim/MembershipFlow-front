import { render, screen } from '@testing-library/react'
import RefundPage from '../page'

describe('RefundPage', () => {
  it('Paddle 환불 처리 주체와 요청 경로를 공개한다', () => {
    render(<RefundPage />)

    expect(screen.getByRole('heading', { name: '환불정책' })).toBeInTheDocument()
    expect(screen.getByText(/Merchant of Record/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Paddle Refund Policy' })).toHaveAttribute(
      'href',
      'https://www.paddle.com/legal/refund-policy',
    )
    expect(screen.getByRole('link', { name: 'Paddle Buyer Support' })).toHaveAttribute('href', 'https://paddle.net')
  })

  it('조건 없는 30일 환불 보장을 국문·영문으로 명시한다', () => {
    render(<RefundPage />)

    expect(screen.getByRole('heading', { name: '30일 무조건 환불 보장' })).toBeInTheDocument()
    expect(screen.getByText(/사유를 묻지 않고 전액 환불/)).toBeInTheDocument()
    expect(screen.getByText(/No questions asked/)).toBeInTheDocument()
    expect(screen.getByText(/조건은 없습니다/)).toBeInTheDocument()
  })
})
