import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const longIntro = '한국 골프의 발상지라 불리는 유서 깊은 골프장으로, 수도권 접근성이 뛰어나고 사계절 잔디 관리가 우수하다는 평가를 받는다. '.repeat(3)

const mockCourse = {
  id: 1, name: '서울 CC', region: '서울', category: 'GOLF' as const,
  membershipType: '개인', latestPrice: 250000000, changeRate: 2.5, updatedAt: '2024-01-01',
  sources: [
    { sourceName: '한국거래소', price: 245000000, updatedAt: '2024-01-01', isLowest: true },
  ],
  info: {
    address: '경기도 용인시 기흥구 석성로521번길 169',
    membershipIntro: '짧은 회원권 소개.',
    courseIntro: longIntro,
    priceOutlook: null,
    greenFees: [
      { grade: '정회원', weekday: 68000, weekend: 73000 },
      { grade: '비회원', weekday: null, weekend: 210000 },
    ],
    caddieFee: '1캐디 4백 - 150,000 (1팀당)',
    cartFee: '100,000(1대당)',
  },
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

describe('CourseDetailPage 골프장 정보 섹션', () => {
  it('그린피 테이블과 캐디피/카트비를 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('이용 요금')).toBeInTheDocument()
    expect(screen.getByText('정회원')).toBeInTheDocument()
    expect(screen.getByText('68,000원')).toBeInTheDocument()
    expect(screen.getByText('73,000원')).toBeInTheDocument()
    expect(screen.getByText('캐디피')).toBeInTheDocument()
    expect(screen.getByText('1캐디 4백 - 150,000 (1팀당)')).toBeInTheDocument()
    expect(screen.getByText('카트비')).toBeInTheDocument()
    expect(screen.getByText('100,000(1대당)')).toBeInTheDocument()
  })

  it('그린피 누락 값은 "-"로 표시한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('비회원')).toBeInTheDocument()
    expect(screen.getByText('210,000원')).toBeInTheDocument()
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1)
  })

  it('위치 섹션에 주소를 렌더링한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('위치')).toBeInTheDocument()
    expect(screen.getByText('경기도 용인시 기흥구 석성로521번길 169')).toBeInTheDocument()
  })

  it('골프장 소개 문단을 렌더링하고 null 필드는 제외한다', async () => {
    const { default: Page } = await import('../page')
    render(<Page />)
    expect(screen.getByText('골프장 소개')).toBeInTheDocument()
    expect(screen.getByText('회원권 소개')).toBeInTheDocument()
    expect(screen.getByText('짧은 회원권 소개.')).toBeInTheDocument()
    expect(screen.getByText('코스 소개')).toBeInTheDocument()
    expect(screen.queryByText('시세 전망')).not.toBeInTheDocument()
  })

  it('긴 문단은 더보기/접기 토글을 제공한다', async () => {
    const user = userEvent.setup()
    const { default: Page } = await import('../page')
    render(<Page />)

    // 짧은 문단(회원권 소개)에는 토글 없음 → 긴 문단(코스 소개) 하나만 존재
    const toggle = screen.getByText('더보기')
    await user.click(toggle)
    expect(screen.getByText('접기')).toBeInTheDocument()

    await user.click(screen.getByText('접기'))
    expect(screen.getByText('더보기')).toBeInTheDocument()
  })
})
