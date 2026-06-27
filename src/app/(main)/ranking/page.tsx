'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useRankingInfinite } from '@/lib/hooks/useCourses'
import { formatPriceCompact, formatChangeRate, changeRateColor } from '@/lib/utils'
import type { RankingType, RankingPeriod } from '@/lib/types'

const TYPES: { label: string; value: RankingType; Icon: typeof TrendingUp }[] = [
  { label: '상승', value: 'rise', Icon: TrendingUp },
  { label: '하락', value: 'fall', Icon: TrendingDown },
]

const PERIODS: { label: string; value: RankingPeriod }[] = [
  { label: '1일', value: 1 },
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
]

export default function RankingPage() {
  const [type, setType] = useState<RankingType>('rise')
  const [period, setPeriod] = useState<RankingPeriod>(1)

  const { items: ranking, isLoading, isLoadingMore, hasMore, loadMore } = useRankingInfinite(type, period)

  return (
    <>
      <Header title="랭킹" />

      {/* 상승/하락 토글 */}
      <div className="flex gap-2 px-4 pb-3">
        {TYPES.map(({ label, value, Icon }) => (
          <button
            key={value}
            onClick={() => setType(value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              type === value
                ? value === 'rise'
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-blue-50 text-blue-500 border border-blue-200'
                : 'bg-gray-100 text-gray-400',
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* 기간 탭 */}
      <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {PERIODS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={cn(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              period === value
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 랭킹 목록 */}
      <div>
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-dashed border-gray-100">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
                <div className="space-y-1.5 items-end flex flex-col">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-12 h-3" />
                </div>
              </div>
            ))
          : ranking?.map((item) => (
              <Link
                key={item.courseId}
                href={`/courses/${item.courseId}`}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-dashed border-gray-100 last:border-0 active:bg-gray-50"
              >
                {/* 순위 */}
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0',
                    item.rank <= 3
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {item.rank}
                </span>

                {/* 종목명 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.courseName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.region}</p>
                </div>

                {/* 가격 / 등락률 */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatPriceCompact(item.latestPrice)}
                  </p>
                  <p className={cn('text-xs font-medium mt-0.5', changeRateColor(item.changeRate))}>
                    {formatChangeRate(item.changeRate)}
                  </p>
                </div>
              </Link>
            ))}

        {!isLoading && ranking?.length === 0 && (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            랭킹 데이터가 없어요
          </div>
        )}

        {!isLoading && hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full py-4 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            {isLoadingMore ? '불러오는 중...' : '더 보기'}
          </button>
        )}
      </div>
    </>
  )
}
