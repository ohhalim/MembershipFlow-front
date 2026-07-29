import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '골프 회원권 최저가 찾기',
  alternates: { canonical: '/home' },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children
}
