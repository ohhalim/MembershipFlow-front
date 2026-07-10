'use client'

import useSWR from 'swr'
import { coursesApi } from '@/lib/api/courses'

export function MarketSummaryStrip() {
  const { data } = useSWR('/courses/summary', () => coursesApi.getSummary(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (!data) return null

  // 최대 격차율은 개별 거래소 데이터 오류(예: 시세닷컴 오기입)가 지배적이라
  // 헤드라인으로 노출하면 사용자에게 오해를 줄 수 있어 표시하지 않음 — 종목 수만 노출
  const hasSpread = typeof data.comparedCourses === 'number'

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-500 bg-gray-50 border-y border-gray-100">
      {hasSpread ? (
        <>
          <span className="font-semibold text-blue-600">4개 거래소 비교</span>
          <span className="text-gray-300">|</span>
          <span>
            가격차 나는 종목{' '}
            <b className="text-gray-800 font-semibold">{data.comparedCourses}</b>개
          </span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline text-gray-400">
            오늘 업데이트 {data.updatedToday}
          </span>
        </>
      ) : (
        <>
          <span className="font-semibold text-blue-600">4개 거래소 비교 중</span>
          <span className="text-gray-300">|</span>
          <span>
            오늘 업데이트 <b className="text-gray-800 font-semibold">{data.updatedToday}</b>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            상승 <b className="text-red-500 font-semibold">{data.risers}</b>
          </span>
          <span>
            하락 <b className="text-blue-500 font-semibold">{data.fallers}</b>
          </span>
        </>
      )}
    </div>
  )
}
