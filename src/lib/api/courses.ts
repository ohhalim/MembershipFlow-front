import { apiClient } from './client'
import type {
  Course,
  CourseDetail,
  PricePoint,
  ChartPeriod,
  RankingItem,
  RankingType,
  RankingPeriod,
  SourceComparisonItem,
  MarketSummary,
} from '@/lib/types'

export interface CourseListParams {
  keyword?: string
  category?: string
  membershipType?: string
  sort?: 'latest' | 'price_asc' | 'price_desc'
}

export interface CourseListPage {
  content: Course[]
  last: boolean
  totalElements: number
}

export interface RankingPage {
  content: RankingItem[]
  hasNext: boolean
  totalElements: number
}

export const coursesApi = {
  async getList(params: CourseListParams = {}, page = 0): Promise<CourseListPage> {
    const query = new URLSearchParams()
    if (params.keyword) query.set('q', params.keyword)
    if (params.category && params.category !== '전체') query.set('courseType', params.category)
    if (params.membershipType) query.set('membershipType', params.membershipType)
    if (params.sort) query.set('sort', params.sort)
    query.set('page', String(page))
    query.set('size', '20')
    const res = await apiClient.get<{ content: Course[]; last: boolean; totalElements: number }>(
      `/api/v1/courses?${query.toString()}`,
    )
    return { content: res.content, last: res.last, totalElements: res.totalElements }
  },

  getDetail(id: number): Promise<CourseDetail> {
    return apiClient.get<CourseDetail>(`/api/v1/courses/${id}`)
  },

  async getPriceHistory(id: number, period: ChartPeriod): Promise<PricePoint[]> {
    const days: Record<ChartPeriod, number> = { '1d': 1, '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
    const interval: Record<ChartPeriod, string> = { '1d': 'DAY', '1w': 'DAY', '1m': 'DAY', '3m': 'WEEK', '1y': 'MONTH' }
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - days[period])
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const res = await apiClient.get<{ points: { date: string; avgPrice: number }[] }>(
      `/api/v1/courses/${id}/prices?from=${fmt(from)}&to=${fmt(to)}&interval=${interval[period]}`,
    )
    return res.points.map((p) => ({ date: p.date, price: p.avgPrice }))
  },

  getSourceComparison(limit = 10): Promise<SourceComparisonItem[]> {
    return apiClient.get<SourceComparisonItem[]>(
      `/api/v1/courses/source-comparison?limit=${limit}`,
    )
  },

  getSummary(): Promise<MarketSummary> {
    return apiClient.get<MarketSummary>('/api/v1/courses/summary')
  },

  async getRankingPage(type: RankingType, period: RankingPeriod, page: number): Promise<RankingPage> {
    const sort = type === 'rise' ? 'GAIN' : 'LOSS'
    const res = await apiClient.get<{
      content: { rank: number; courseId: number; name: string; region: string; currentPrice: number; changeRate: number }[]
      page: number
      size: number
      totalElements: number
      hasNext: boolean
    }>(`/api/v1/courses/ranking?period=${period}d&sort=${sort}&page=${page}&size=20`)
    return {
      content: res.content.map((item) => ({
        rank: item.rank,
        courseId: item.courseId,
        courseName: item.name,
        region: item.region,
        latestPrice: item.currentPrice,
        changeRate: item.changeRate,
      })),
      hasNext: res.hasNext,
      totalElements: res.totalElements,
    }
  },
}
