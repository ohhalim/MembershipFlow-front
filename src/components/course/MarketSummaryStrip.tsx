'use client'

import useSWR from 'swr'
import { coursesApi } from '@/lib/api/courses'

export function MarketSummaryStrip() {
  const { data } = useSWR('/courses/summary', () => coursesApi.getSummary(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (!data) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-500 bg-gray-50 border-y border-gray-100">
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
    </div>
  )
}
