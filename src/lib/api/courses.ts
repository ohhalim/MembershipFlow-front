import { apiClient } from './client'
import type {
  Course,
  CourseDetail,
  PriceChartData,
  ChartPeriod,
  RankingItem,
  RankingType,
  RankingPeriod,
  SourceComparisonItem,
  MarketSummary,
} from '@/lib/types'
import {
  courseDetailSchema,
  courseListPageSchema,
  marketSummarySchema,
  priceChartSchema,
  rankingPageSchema,
  sourceComparisonSchema,
} from './schemas'

export interface CourseListParams {
  keyword?: string
  category?: string
  membershipType?: string
  sort?: 'latest' | 'price_asc' | 'price_desc'
}

export function formatLocalDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
    const res = await apiClient.get(`/api/v1/courses?${query.toString()}`, courseListPageSchema)
    return { content: res.content, last: res.last, totalElements: res.totalElements }
  },

  getDetail(id: number): Promise<CourseDetail> {
    return apiClient.get(`/api/v1/courses/${id}`, courseDetailSchema)
  },

  async getPriceHistory(id: number, period: ChartPeriod): Promise<PriceChartData> {
    const days: Record<ChartPeriod, number> = { '1d': 1, '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
    const interval: Record<ChartPeriod, string> = { '1d': 'DAY', '1w': 'DAY', '1m': 'DAY', '3m': 'WEEK', '1y': 'MONTH' }
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - days[period])
    const res = await apiClient.get(
      `/api/v1/courses/${id}/prices?from=${formatLocalDateParam(from)}&to=${formatLocalDateParam(to)}&interval=${interval[period]}`,
      priceChartSchema,
    )
    return {
      interval: res.interval,
      from: res.from,
      to: res.to,
      points: res.points.map((p) => ({ date: p.date, price: p.minPrice })),
      subscriptionRequired: res.subscriptionRequired,
    }
  },

  getSourceComparison(limit = 10): Promise<SourceComparisonItem[]> {
    return apiClient.get(
      `/api/v1/courses/source-comparison?limit=${limit}`,
      sourceComparisonSchema,
    )
  },

  getSummary(): Promise<MarketSummary> {
    return apiClient.get('/api/v1/courses/summary', marketSummarySchema)
  },

  async getRankingPage(type: RankingType, period: RankingPeriod, page: number): Promise<RankingPage> {
    const sort = type === 'rise' ? 'GAIN' : 'LOSS'
    const res = await apiClient.get(
      `/api/v1/courses/ranking?period=${period}d&sort=${sort}&page=${page}&size=20`,
      rankingPageSchema,
    )
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
