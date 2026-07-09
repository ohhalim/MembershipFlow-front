import { render, screen } from '@testing-library/react'
import { MarketSidebar } from '../MarketSidebar'

const mockComparisonItems = [
  {
    courseId: 1,
    name: '88',
    region: '경기',
    courseType: 'GOLF',
    prices: [
      { sourceName: '시세닷컴', price: 390000000 },
      { sourceName: '동부회원권', price: 420000000 },
      { sourceName: '동아골프', price: 445000000 },
      { sourceName: '에이스회원권', price: 450000000 },
    ],
    minPrice: 390000000,
    maxPrice: 450000000,
    diffAmount: 60000000,
    diffRate: 15.38,
  },
  {
    courseId: 2,
    name: '남서울 CC',
    region: '서울',
    courseType: 'GOLF',
    prices: [
      { sourceName: '동아골프', price: 200000000 },
      { sourceName: '동부회원권', price: 210000000 },
    ],
    minPrice: 200000000,
    maxPrice: 210000000,
    diffAmount: 10000000,
    diffRate: 5,
  },
]

jest.mock('@/lib/api/courses', () => ({
  coursesApi: {
    getSourceComparison: jest.fn().mockResolvedValue([]),
    getRankingPage: jest.fn().mockResolvedValue({ content: [], hasNext: false, totalElements: 0 }),
  },
}))

import { coursesApi } from '@/lib/api/courses'

describe('MarketSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(coursesApi.getRankingPage as jest.Mock).mockResolvedValue({
      content: [],
      hasNext: false,
      totalElements: 0,
    })
  })

  it('섹션 헤딩을 "거래소 간 가격 차이"로 렌더링한다', async () => {
    ;(coursesApi.getSourceComparison as jest.Mock).mockResolvedValue(mockComparisonItems)
    render(<MarketSidebar />)
    expect(await screen.findByText('거래소 간 가격 차이')).toBeInTheDocument()
    expect(screen.getByText('TOP5')).toBeInTheDocument()
    expect(screen.queryByText('동아 vs 동부')).not.toBeInTheDocument()
  })

  it('소스가 4개인 코스는 최저가/최고가 거래소와 격차율, 남은 개수를 표시한다', async () => {
    ;(coursesApi.getSourceComparison as jest.Mock).mockResolvedValue(mockComparisonItems)
    render(<MarketSidebar />)

    expect(await screen.findByText('88')).toBeInTheDocument()
    expect(screen.getByText('최저 시세닷컴 3.9억')).toBeInTheDocument()
    expect(screen.getByText('최고 에이스회원권 · 15.4% 차이 +2')).toBeInTheDocument()
  })

  it('소스가 2개인 코스는 "+N개" 표기 없이 렌더링한다', async () => {
    ;(coursesApi.getSourceComparison as jest.Mock).mockResolvedValue(mockComparisonItems)
    render(<MarketSidebar />)

    expect(await screen.findByText('남서울 CC')).toBeInTheDocument()
    expect(screen.getByText('최저 동아골프 2억')).toBeInTheDocument()
    expect(screen.getByText('최고 동부회원권 · 5.0% 차이')).toBeInTheDocument()
  })
})
