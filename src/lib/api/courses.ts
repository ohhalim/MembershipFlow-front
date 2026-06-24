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
  getList(params: CourseListParams = {}): Promise<Course[]> {
    const query = new URLSearchParams()
    if (params.keyword) query.set('keyword', params.keyword)
    if (params.category && params.category !== '전체') query.set('category', params.category)
    if (params.sort) query.set('sort', params.sort)
    const qs = query.toString()
    return apiClient.get<Course[]>(`/api/v1/courses${qs ? `?${qs}` : ''}`)
  },

  getDetail(id: number): Promise<CourseDetail> {
    return apiClient.get<CourseDetail>(`/api/v1/courses/${id}`)
  },

  getPriceHistory(id: number, period: ChartPeriod): Promise<PricePoint[]> {
    return apiClient.get<PricePoint[]>(`/api/v1/courses/${id}/price-history?period=${period}`)
  },

  getRanking(type: RankingType, period: RankingPeriod): Promise<RankingItem[]> {
    return apiClient.get<RankingItem[]>(`/api/v1/courses/ranking?type=${type}&period=${period}`)
  },
}
