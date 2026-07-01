import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WatchlistPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }))
jest.mock('@/lib/auth', () => ({ auth: { isAuthenticated: () => true } }))

const mockUpdate = jest.fn()
const mockRemove = jest.fn()
const mockUseWatchlist = jest.fn()

jest.mock('@/lib/hooks/useWatchlist', () => ({
  useWatchlist: () => mockUseWatchlist(),
}))

const mockItems = [
  {
    id: 1, courseId: 10, courseName: '서울 CC', region: '서울',
    targetPrice: 230000000, alertYn: true, latestPrice: 250000000, createdAt: '2024-01-01',
  },
  {
    id: 2, courseId: 20, courseName: '제주 CC', region: '제주',
    targetPrice: null, alertYn: false, latestPrice: 180000000, createdAt: '2024-01-02',
  },
]

describe('WatchlistPage', () => {
  beforeEach(() => {
    mockUpdate.mockResolvedValue({})
    mockRemove.mockResolvedValue(undefined)
    mockUseWatchlist.mockReturnValue({
      data: mockItems, isLoading: false,
      update: mockUpdate, remove: mockRemove,
    })
  })

  it('관심 종목 목록을 렌더링한다', () => {
    render(<WatchlistPage />)
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
    expect(screen.getByText('제주 CC')).toBeInTheDocument()
  })

  it('목표가를 표시한다', () => {
    render(<WatchlistPage />)
    expect(screen.getByText('목표가')).toBeInTheDocument()
    expect(screen.getByText('2억 3,000만원')).toBeInTheDocument()
  })

  it('알림 토글을 렌더링한다', () => {
    render(<WatchlistPage />)
    const toggles = screen.getAllByRole('switch')
    expect(toggles).toHaveLength(2)
    expect(toggles[0]).toHaveAttribute('aria-checked', 'true')
    expect(toggles[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('알림 토글 클릭 시 update를 호출한다', async () => {
    render(<WatchlistPage />)
    const toggles = screen.getAllByRole('switch')
    fireEvent.click(toggles[0])
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(1, { alertYn: false, targetPrice: 230000000 })
    })
  })

  it('삭제 버튼 클릭 시 remove를 호출한다', async () => {
    render(<WatchlistPage />)
    const deleteButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(deleteButtons[0])
    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(1)
    })
  })

  it('목록이 비었을 때 빈 상태를 표시한다', () => {
    mockUseWatchlist.mockReturnValue({
      data: [], isLoading: false, update: mockUpdate, remove: mockRemove,
    })
    render(<WatchlistPage />)
    expect(screen.getByText('관심 종목을 추가해보세요')).toBeInTheDocument()
  })

  it('로딩 중 스켈레톤을 표시한다', () => {
    mockUseWatchlist.mockReturnValue({
      data: undefined, isLoading: true, update: mockUpdate, remove: mockRemove,
    })
    const { container } = render(<WatchlistPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
