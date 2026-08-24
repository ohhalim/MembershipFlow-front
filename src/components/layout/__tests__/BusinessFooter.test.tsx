import { render, screen } from '@testing-library/react'
import { BusinessFooter } from '../BusinessFooter'

describe('BusinessFooter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_BUSINESS_NAME: '테스트상점',
      NEXT_PUBLIC_BUSINESS_REGISTRATION_NUMBER: '000-00-00000',
      NEXT_PUBLIC_BUSINESS_REPRESENTATIVE: '대표자',
      NEXT_PUBLIC_BUSINESS_ADDRESS: '인천광역시 테스트로 1',
      NEXT_PUBLIC_BUSINESS_PHONE: '010-0000-0000',
      NEXT_PUBLIC_BUSINESS_EMAIL: 'support@example.com',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('심사에 필요한 사업자 정보를 표시한다', () => {
    render(<BusinessFooter />)

    expect(screen.getByText(/테스트상점/)).toBeInTheDocument()
    expect(screen.getByText(/000-00-00000/)).toBeInTheDocument()
    expect(screen.getByText(/인천광역시 테스트로 1/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '010-0000-0000' })).toHaveAttribute('href', 'tel:010-0000-0000')
    expect(screen.getByRole('link', { name: 'support@example.com' })).toHaveAttribute('href', 'mailto:support@example.com')
    expect(screen.getByRole('link', { name: '구독 상품' })).toHaveAttribute('href', '/pricing')
    expect(screen.getByRole('link', { name: '환불정책' })).toHaveAttribute('href', '/refund')
  })
})
