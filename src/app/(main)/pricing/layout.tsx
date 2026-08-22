import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '구독 상품 및 가격',
  description: 'MembershipFlow 월간·연간 구독 가격과 자동결제, 갱신, 해지 조건을 확인하세요.',
  alternates: { canonical: '/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
