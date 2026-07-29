import { render, screen } from '@testing-library/react'

const mockRetryPriceHistory = jest.fn()
const mockUsePriceHistory = jest.fn()

const mockCourse = {
  id: 1, name: '서울 CC', region: '서울', category: 'GOLF' as const,
  membershipType: '개인', latestPrice: 250000000, changeRate: 2.5, updatedAt: '2024-01-01',
  sources: [
    { sourceName: '한국거래소', price: 245000000, updatedAt: '2024-01-01', isLowest: true },
    { sourceName: '골프시세닷컴', price: 250000000, updatedAt: '2024-01-01', isLowest: false },
  ],
}

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ back: jest.fn() }),
}))
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="chart">{children}</div>,
  Line: ({ dot }: { dot: unknown }) => <div data-testid="chart-line" data-dot={dot ? 'visible' : 'hidden'} />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
jest.mock('@/lib/hooks/useCourses', () => ({
  useCourseDetail: () => ({ data: mockCourse, isLoading: false }),
  usePriceHistory: () => mockUsePriceHistory(),
}))

describe('CourseDetailPage', () => {
  beforeEach(() => {
    mockUsePriceHistory.mockReturnValue({
      data: {
        interval: 'DAY',
        from: '2024-01-01',
        to: '2024-01-01',
        points: [{ date: '2024-01-01', price: 245000000 }],
        subscriptionRequired: false,
      },
      isLoading: false,
      error: undefined,
      mutate: mockRetryPriceHistory,
    })
  })

  it('종목명과 가격을 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
    expect(screen.getAllByText('2억 5,000만원').length).toBeGreaterThanOrEqual(1)
  })

  it('기간 선택 탭을 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('1일')).toBeInTheDocument()
    expect(screen.getByText('1개월')).toBeInTheDocument()
    expect(screen.getByText('1년')).toBeInTheDocument()
  })

  it('거래소별 시세를 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('한국거래소')).toBeInTheDocument()
    expect(screen.getByText('골프시세닷컴')).toBeInTheDocument()
    expect(screen.getByText('최저')).toBeInTheDocument()
  })

  it('차트를 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByTestId('chart')).toBeInTheDocument()
    expect(screen.getByTestId('chart-line')).toHaveAttribute('data-dot', 'visible')
  })

  it('제한된 기간과 빈 시세를 안내한다', async () => {
    mockUsePriceHistory.mockReturnValue({
      data: {
        interval: 'DAY',
        from: '2024-01-01',
        to: '2024-01-08',
        points: [],
        subscriptionRequired: true,
      },
      isLoading: false,
      error: undefined,
      mutate: mockRetryPriceHistory,
    })

    const { default: Page } = await import('../page')
    render(<Page />)

    expect(screen.getByText(/무료 조회는 최근 7일/)).toBeInTheDocument()
    expect(screen.getByText('선택한 기간의 시세 데이터가 없습니다.')).toBeInTheDocument()
  })

  it('시세 요청 실패 시 재시도 상태를 표시한다', async () => {
    mockUsePriceHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('network'),
      mutate: mockRetryPriceHistory,
    })

    const { default: Page } = await import('../page')
    render(<Page />)

    expect(screen.getByRole('alert')).toHaveTextContent('시세를 불러오지 못했습니다.')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('info가 없으면 골프장 정보 섹션을 렌더링하지 않는다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.queryByText('이용 요금')).not.toBeInTheDocument()
    expect(screen.queryByText('위치')).not.toBeInTheDocument()
    expect(screen.queryByText('골프장 소개')).not.toBeInTheDocument()
  })
})
