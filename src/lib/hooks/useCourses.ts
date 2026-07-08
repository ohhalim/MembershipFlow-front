'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { coursesApi, type CourseListParams, type CourseListPage, type RankingPage } from '@/lib/api/courses'
import type { Course, CourseDetail, PricePoint, ChartPeriod, RankingItem, RankingType, RankingPeriod } from '@/lib/types'

export function useCourseList(params: CourseListParams = {}) {
  const { keyword = '', category = '', membershipType = '', sort = 'latest' } = params

  const getKey = (pageIndex: number, previousPageData: CourseListPage | null) => {
    if (previousPageData && previousPageData.last) return null
    return ['/api/v1/courses', keyword, category, membershipType, sort, pageIndex] as const
  }

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<CourseListPage>(
    getKey,
    ([, kw, cat, mt, s, page]) => coursesApi.getList(
      { keyword: kw as string, category: cat as string, membershipType: mt as string, sort: s as CourseListParams['sort'] },
      page as number,
    ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onErrorRetry: (err, _key, _cfg, revalidate, { retryCount }) => {
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    },
  )

  const courses = data ? data.flatMap((p) => p.content) : []
  const isLoadingMore = isValidating && size > (data?.length ?? 0)
  const hasMore = data ? !data[data.length - 1]?.last : true

  return {
    courses,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore: () => setSize(size + 1),
    total: data?.[0]?.totalElements ?? 0,
  }
}

export function useCourseDetail(id: number) {
  return useSWR<CourseDetail>(id ? `/api/v1/courses/${id}` : null, () => coursesApi.getDetail(id))
}

export function usePriceHistory(id: number, period: ChartPeriod) {
  const key = id ? `/api/v1/courses/${id}/price-history?period=${period}` : null
  return useSWR<PricePoint[]>(key, () => coursesApi.getPriceHistory(id, period))
}

export function useRankingInfinite(type: RankingType, period: RankingPeriod) {
  const getKey = (pageIndex: number, previousPageData: RankingPage | null) => {
    if (previousPageData && !previousPageData.hasNext) return null
    return [`/api/v1/courses/ranking`, type, period, pageIndex] as const
  }

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<RankingPage>(
    getKey,
    ([, t, p, page]) => coursesApi.getRankingPage(t as RankingType, p as RankingPeriod, page as number),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onErrorRetry: (_err, _key, _cfg, revalidate, { retryCount }) => {
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    },
  )

  const items = data ? data.flatMap((p) => p.content) : []
  const isLoadingMore = isValidating && size > (data?.length ?? 0)
  const hasMore = data ? data[data.length - 1]?.hasNext : true

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore: () => setSize(size + 1),
    total: data?.[0]?.totalElements ?? 0,
  }
}
