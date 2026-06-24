'use client'

import useSWR from 'swr'
import { coursesApi, type CourseListParams } from '@/lib/api/courses'
import type { Course, CourseDetail, PricePoint, ChartPeriod, RankingItem, RankingType, RankingPeriod } from '@/lib/types'

export function useCourseList(params: CourseListParams = {}) {
  const key = ['/api/v1/courses', params] as const
  return useSWR<Course[]>(key, () => coursesApi.getList(params))
}

export function useCourseDetail(id: number) {
  return useSWR<CourseDetail>(id ? `/api/v1/courses/${id}` : null, () => coursesApi.getDetail(id))
}

export function usePriceHistory(id: number, period: ChartPeriod) {
  const key = id ? `/api/v1/courses/${id}/price-history?period=${period}` : null
  return useSWR<PricePoint[]>(key, () => coursesApi.getPriceHistory(id, period))
}

export function useRanking(type: RankingType, period: RankingPeriod) {
  const key = `/api/v1/courses/ranking?type=${type}&period=${period}`
  return useSWR<RankingItem[]>(key, () => coursesApi.getRanking(type, period))
}
