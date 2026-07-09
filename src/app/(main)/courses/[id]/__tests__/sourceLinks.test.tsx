import { render, screen } from '@testing-library/react'

const mockCourse = {
  id: 1, name: '서울 CC', region: '서울', category: 'GOLF' as const,
  membershipType: '개인', latestPrice: 250000000, changeRate: 2.5, updatedAt: '2024-01-01',
  sources: [
    {
      sourceName: '동아회원권',
      price: 245000000,
      updatedAt: '2024-01-01',
      isLowest: true,
      sourceUrl: 'https://www.donga-membership.com/course/1',
    },
    {
      sourceName: '시세닷컴',
      price: 248000000,
      updatedAt: '2024-01-01',
      isLowest: false,
      sourceUrl: 'https://www.sise.com',
    },
    {
      // 과거 캐시된 응답 등 url이 없는 케이스
      sourceName: '에이스회원권',
      price: 249000000,
      updatedAt: '2024-01-01',
      isLowest: false,
    },
  ],
}

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ back: jest.fn() }),
}))
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
jest.mock('@/lib/hooks/useCourses', () => ({
  useCourseDetail: () => ({ data: mockCourse, isLoading: false }),
  usePriceHistory: () => ({ data: [], isLoading: false }),
}))

describe('거래소별 시세 원본 사이트 링크', () => {
  it('url이 있는 소스는 새 탭으로 열리는 링크로 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)

    const donggaLink = screen.getByText('동아회원권').closest('a')
    expect(donggaLink).not.toBeNull()
    expect(donggaLink).toHaveAttribute('href', 'https://www.donga-membership.com/course/1')
    expect(donggaLink).toHaveAttribute('target', '_blank')
    expect(donggaLink).toHaveAttribute('rel', 'noopener noreferrer')

    const siseLink = screen.getByText('시세닷컴').closest('a')
    expect(siseLink).toHaveAttribute('href', 'https://www.sise.com')
    expect(siseLink).toHaveAttribute('target', '_blank')
    expect(siseLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('url이 없는 소스는 링크 없이 텍스트만 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)

    const aceRow = screen.getByText('에이스회원권')
    expect(aceRow.closest('a')).toBeNull()
  })
})
