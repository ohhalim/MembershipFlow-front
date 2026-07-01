'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import useSWR from 'swr'
import { coursesApi } from '@/lib/api/courses'
import { formatPriceCompact, formatChangeRate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { RankingItem, SourceComparisonItem } from '@/lib/types'

function useSourceComparison() {
  return useSWR(
    '/ranking/source-comparison',
    () => coursesApi.getSourceComparison(5),
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )
}

function useTopMovers(type: 'rise' | 'fall') {
  return useSWR(
    [`/ranking/top`, type],
    () => coursesApi.getRankingPage(type, 1, 0),
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )
}

function MoverList({ items, type }: { items: RankingItem[]; type: 'rise' | 'fall' }) {
  const isRise = type === 'rise'
  if (items.length === 0) {
    return <p className="text-[11px] text-gray-400 px-2 py-3">변동 데이터 없음</p>
  }
  return (
    <ul className="space-y-1">
      {items.slice(0, 5).map((item) => (
        <li key={item.courseId}>
          <Link
            href={`/courses/${item.courseId}`}
            className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.courseName}</p>
              <p className="text-[11px] text-gray-400 truncate">{item.region}</p>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className="text-xs font-bold text-gray-800">{formatPriceCompact(item.latestPrice)}</p>
              <p className={cn('text-[11px] font-semibold', isRise ? 'text-red-500' : 'text-blue-500')}>
                {formatChangeRate(item.changeRate)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function ComparisonList({ items }: { items: SourceComparisonItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const dongbuHigher = item.diffAmount > 0
        return (
          <li key={item.courseId}>
            <Link
              href={`/courses/${item.courseId}`}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{item.region}</p>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className={cn('text-[11px] font-bold', dongbuHigher ? 'text-red-500' : 'text-blue-500')}>
                  동부 {dongbuHigher ? '+' : ''}{formatChangeRate(item.diffRate)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatPriceCompact(item.dongaPrice)} / {formatPriceCompact(item.dongbuPrice)}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function MarketSidebar() {
  const { data: riseData, isLoading: riseLoading } = useTopMovers('rise')
  const { data: fallData, isLoading: fallLoading } = useTopMovers('fall')
  const { data: compData, isLoading: compLoading } = useSourceComparison()

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* 급상승 */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={15} className="text-red-500" />
          <h3 className="text-sm font-bold text-gray-800">급상승 TOP5</h3>
          <span className="text-[11px] text-gray-400 ml-1">1일</span>
        </div>
        {riseLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-14 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <MoverList items={riseData?.content ?? []} type="rise" />
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* 급하락 */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingDown size={15} className="text-blue-500" />
          <h3 className="text-sm font-bold text-gray-800">급하락 TOP5</h3>
          <span className="text-[11px] text-gray-400 ml-1">1일</span>
        </div>
        {fallLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-14 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <MoverList items={fallData?.content ?? []} type="fall" />
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* 동아 vs 동부 가격 차이 */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ArrowLeftRight size={15} className="text-purple-500" />
          <h3 className="text-sm font-bold text-gray-800">동아 vs 동부</h3>
          <span className="text-[11px] text-gray-400 ml-1">가격 차이 TOP5</span>
        </div>
        {compLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-14 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <ComparisonList items={compData ?? []} />
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* 랭킹 전체 보기 */}
      <Link
        href="/ranking"
        className="flex items-center justify-center py-2 text-xs text-blue-500 font-medium hover:underline"
      >
        전체 랭킹 보기 →
      </Link>
    </div>
  )
}
