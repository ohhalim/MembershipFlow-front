import { render, screen, fireEvent } from '@testing-library/react'
import RankingPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

const mockRanking = [
  { rank: 1, courseId: 1, courseName: '서울 CC', region: '서울', latestPrice: 250000000, changeRate: 8.2 },
  { rank: 2, courseId: 2, courseName: '제주 CC', region: '제주', latestPrice: 180000000, changeRate: 5.1 },
  { rank: 3, courseId: 3, courseName: '부산 CC', region: '부산', latestPrice: 120000000, changeRate: 3.4 },
]

const mockUseRankingInfinite = jest.fn()
jest.mock('@/lib/hooks/useCourses', () => ({
  useRankingInfinite: (...args: unknown[]) => mockUseRankingInfinite(...args),
}))

describe('RankingPage', () => {
  beforeEach(() => {
    mockUseRankingInfinite.mockReturnValue({
      items: mockRanking,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      loadMore: jest.fn(),
      total: mockRanking.length,
    })
  })

  it('랭킹 목록을 렌더링한다', () => {
    render(<RankingPage />)
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
    expect(screen.getByText('제주 CC')).toBeInTheDocument()
  })

  it('상승/하락 탭을 렌더링한다', () => {
    render(<RankingPage />)
    expect(screen.getByRole('button', { name: /상승/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /하락/ })).toBeInTheDocument()
  })

  it('기간 탭을 렌더링한다', () => {
    render(<RankingPage />)
    expect(screen.getByRole('button', { name: '1일' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '30일' })).toBeInTheDocument()
  })

  it('하락 탭 클릭 시 활성화된다', () => {
    render(<RankingPage />)
    const fallBtn = screen.getByRole('button', { name: /하락/ })
    fireEvent.click(fallBtn)
    expect(fallBtn).toHaveClass('bg-blue-50')
  })

  it('기간 탭 클릭 시 활성화된다', () => {
    render(<RankingPage />)
    const sevenDayBtn = screen.getByRole('button', { name: '7일' })
    fireEvent.click(sevenDayBtn)
    expect(sevenDayBtn).toHaveClass('bg-gray-800')
  })

  it('로딩 중 스켈레톤을 표시한다', () => {
    mockUseRankingInfinite.mockReturnValue({
      items: [],
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      loadMore: jest.fn(),
      total: 0,
    })
    const { container } = render(<RankingPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
