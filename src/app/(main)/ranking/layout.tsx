import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/ranking' },
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children
}
