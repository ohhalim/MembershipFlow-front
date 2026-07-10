import { render, screen } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { MarketSummaryStrip } from '../MarketSummaryStrip'
import type { MarketSummary } from '@/lib/types'

const mockGetSummary = jest.fn()
jest.mock('@/lib/api/courses', () => ({
  coursesApi: {
    getSummary: () => mockGetSummary(),
  },
}))

function setSummary(summary: MarketSummary) {
  mockGetSummary.mockResolvedValue(summary)
}

// 각 렌더마다 새 SWR 캐시를 제공해 테스트 간 캐시 누수를 막는다
function renderStrip() {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MarketSummaryStrip />
    </SWRConfig>,
  )
}

describe('MarketSummaryStrip', () => {
  beforeEach(() => {
    mockGetSummary.mockReset()
  })

  it('스프레드 필드가 있으면 가격차 중심으로 표시한다', async () => {
    setSummary({ updatedToday: 448, risers: 0, fallers: 0, comparedCourses: 62, maxSpreadRate: 900.0 })
    renderStrip()

    expect(await screen.findByText('62')).toBeInTheDocument()
    expect(screen.getByText('900%')).toBeInTheDocument()
    expect(screen.getByText(/가격차 나는 종목/)).toBeInTheDocument()
    expect(screen.getByText(/최대 격차/)).toBeInTheDocument()
    // 상승/하락은 헤드라인에서 제거됨
    expect(screen.queryByText(/상승/)).not.toBeInTheDocument()
    expect(screen.queryByText(/하락/)).not.toBeInTheDocument()
  })

  it('maxSpreadRate를 정수로 반올림해 표시한다', async () => {
    setSummary({ updatedToday: 100, risers: 0, fallers: 0, comparedCourses: 10, maxSpreadRate: 12.7 })
    renderStrip()

    expect(await screen.findByText('13%')).toBeInTheDocument()
  })

  it('스프레드 필드가 없으면 기존 업데이트/상승/하락 폴백을 표시한다', async () => {
    setSummary({ updatedToday: 132, risers: 3, fallers: 5 })
    renderStrip()

    expect(await screen.findByText('132')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/상승/)).toBeInTheDocument()
    expect(screen.getByText(/하락/)).toBeInTheDocument()
    expect(screen.queryByText(/가격차 나는 종목/)).not.toBeInTheDocument()
  })
})
