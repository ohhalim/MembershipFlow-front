import { render, screen } from '@testing-library/react'
import { CourseCard } from '../CourseCard'
import type { Course } from '@/lib/types'

const mockCourse: Course = {
  id: 1,
  name: '레이크사이드CC',
  region: '경기',
  category: 'GOLF',
  membershipType: '주말회원',
  latestPrice: 250_000_000,
  changeRate: 2.5,
  updatedAt: '2026-06-24T10:00:00',
}

describe('CourseCard', () => {
  it('종목명과 지역을 렌더링한다', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('레이크사이드CC')).toBeInTheDocument()
    expect(screen.getByText('경기 · 주말회원')).toBeInTheDocument()
  })

  it('가격을 간략 형식으로 렌더링한다', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('2.5억')).toBeInTheDocument()
  })

  it('상승률을 ▲ 기호와 함께 렌더링한다', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('▲ 2.5%')).toBeInTheDocument()
  })

  it('가격 정보가 없으면 - 를 표시한다', () => {
    render(<CourseCard course={{ ...mockCourse, latestPrice: null, changeRate: null }} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('종목 상세 페이지로 이동하는 링크를 가진다', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/1')
  })

  it('거래소가 2곳 이상이면 거래소별 가격을 표시한다', () => {
    render(
      <CourseCard
        course={{
          ...mockCourse,
          sourcePrices: [
            { source: '동아골프', price: 250_000_000 },
            { source: '동부회원권', price: 240_000_000 },
          ],
        }}
      />,
    )
    expect(screen.getByText('동아 2.5억 · 동부 2.4억')).toBeInTheDocument()
  })

  it('거래소가 1곳이면 거래소별 가격을 표시하지 않는다', () => {
    render(
      <CourseCard
        course={{ ...mockCourse, sourcePrices: [{ source: '동아골프', price: 250_000_000 }] }}
      />,
    )
    expect(screen.queryByText(/동아 2\.5억/)).not.toBeInTheDocument()
  })

  it('숫자 tier를 제목에서 분리해 단위가 있는 보조정보로 표시한다', () => {
    render(
      <CourseCard
        course={{ ...mockCourse, name: '휘닉스파크(8500)', region: '', membershipType: 'REGULAR' }}
      />,
    )

    expect(screen.getByText('휘닉스파크')).toBeInTheDocument()
    expect(screen.queryByText('휘닉스파크(8500)')).not.toBeInTheDocument()
    expect(screen.getByText('일반 · 분양가 8,500만')).toBeInTheDocument()
  })

  it('이름에 붙은 회원 구분을 제목에서 분리하고 중복 표시하지 않는다', () => {
    render(
      <CourseCard
        course={{ ...mockCourse, name: '에딘버러주중가족', region: '', membershipType: 'WEEKDAY' }}
      />,
    )

    expect(screen.getByText('에딘버러')).toBeInTheDocument()
    expect(screen.getByText('주중 가족')).toBeInTheDocument()
    expect(screen.queryByText(/· 주중/)).not.toBeInTheDocument()
  })
})
