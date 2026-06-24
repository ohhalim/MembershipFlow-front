import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

const mockCourses = [
  { id: 1, name: '서울 CC', region: '서울', category: 'GOLF' as const, membershipType: '개인', latestPrice: 250000000, changeRate: 2.5, updatedAt: '2024-01-01' },
  { id: 2, name: '하이원 콘도', region: '강원', category: 'CONDO' as const, membershipType: '가족', latestPrice: 50000000, changeRate: -1.2, updatedAt: '2024-01-01' },
]

const mockUseCourseList = jest.fn()
jest.mock('@/lib/hooks/useCourses', () => ({
  useCourseList: (...args: unknown[]) => mockUseCourseList(...args),
}))

describe('HomePage', () => {
  beforeEach(() => {
    mockUseCourseList.mockReturnValue({ data: mockCourses, isLoading: false })
  })

  it('종목 목록을 렌더링한다', () => {
    render(<HomePage />)
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
    expect(screen.getByText('하이원 콘도')).toBeInTheDocument()
  })

  it('검색창을 렌더링한다', () => {
    render(<HomePage />)
    expect(screen.getByPlaceholderText(/검색/)).toBeInTheDocument()
  })

  it('카테고리 탭을 렌더링한다', () => {
    render(<HomePage />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('골프')).toBeInTheDocument()
    expect(screen.getByText('콘도')).toBeInTheDocument()
  })

  it('카테고리 버튼 클릭 시 활성화된다', () => {
    render(<HomePage />)
    const golfBtn = screen.getByRole('button', { name: '골프' })
    fireEvent.click(golfBtn)
    expect(golfBtn).toHaveClass('bg-blue-500')
  })

  it('데이터 없을 때 "검색 결과가 없어요" 메시지를 표시한다', () => {
    mockUseCourseList.mockReturnValue({ data: [], isLoading: false })
    render(<HomePage />)
    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument()
  })

  it('로딩 중 스켈레톤을 표시한다', () => {
    mockUseCourseList.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<HomePage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
