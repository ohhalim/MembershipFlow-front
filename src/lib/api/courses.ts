import { apiClient } from './client'
import type {
  Course,
  CourseDetail,
  PricePoint,
  ChartPeriod,
  RankingItem,
  RankingType,
  RankingPeriod,
} from '@/lib/types'

export interface CourseListParams {
  keyword?: string
  category?: string
  sort?: 'latest' | 'price_asc' | 'price_desc'
}

export const coursesApi = {
  async getList(params: CourseListParams = {}): Promise<Course[]> {
    const query = new URLSearchParams()
    if (params.keyword) query.set('q', params.keyword)
    if (params.category && params.category !== '전체') query.set('courseType', params.category)
    const qs = query.toString()
    const res = await apiClient.get<{ content: Course[] } | Course[]>(`/api/v1/courses${qs ? `?${qs}` : ''}`)
    return Array.isArray(res) ? res : res.content
  },

  getDetail(id: number): Promise<CourseDetail> {
    return apiClient.get<CourseDetail>(`/api/v1/courses/${id}`)
  },

  async getPriceHistory(id: number, period: ChartPeriod): Promise<PricePoint[]> {
    const days: Record<ChartPeriod, number> = { '1d': 1, '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - days[period])
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const res = await apiClient.get<{ points: { date: string; avgPrice: number }[] }>(
      `/api/v1/courses/${id}/prices?from=${fmt(from)}&to=${fmt(to)}&interval=DAY`,
    )
    return res.points.map((p) => ({ date: p.date, price: p.avgPrice }))
  },

  async getRanking(type: RankingType, period: RankingPeriod): Promise<RankingItem[]> {
    const sort = type === 'rise' ? 'GAIN' : 'LOSS'
    const res = await apiClient.get<{ rank: number; courseId: number; name: string; region: string; currentPrice: number; changeRate: number }[]>(
      `/api/v1/courses/ranking?period=${period}d&sort=${sort}&size=20`,
    )
    return res.map((item) => ({
      rank: item.rank,
      courseId: item.courseId,
      courseName: item.name,
      region: item.region,
      latestPrice: item.currentPrice,
      changeRate: item.changeRate,
    }))
  },
}
