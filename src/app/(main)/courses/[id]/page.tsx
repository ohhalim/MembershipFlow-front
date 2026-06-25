'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, ChevronLeft, ExternalLink } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCourseDetail, usePriceHistory } from '@/lib/hooks/useCourses'
import { useWatchlist } from '@/lib/hooks/useWatchlist'
import { formatPrice, formatPriceCompact, formatChangeRate, changeRateColor, formatCategory, formatMembershipType } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { ChartPeriod } from '@/lib/types'

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: '1일', value: '1d' },
  { label: '1주', value: '1w' },
  { label: '1개월', value: '1m' },
  { label: '3개월', value: '3m' },
  { label: '1년', value: '1y' },
]

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [period, setPeriod] = useState<ChartPeriod>('1m')
  const [heartLoading, setHeartLoading] = useState(false)

  const { data: course, isLoading: courseLoading } = useCourseDetail(id)
  const { data: history, isLoading: historyLoading } = usePriceHistory(id, period)
  const { data: watchlist, add: addWatch, remove: removeWatch } = useWatchlist()

  const watchlistItem = watchlist?.find((w) => w.courseId === id)
  const isWatched = !!watchlistItem

  async function handleToggleWatchlist() {
    if (heartLoading) return
    setHeartLoading(true)
    try {
      if (isWatched) {
        await removeWatch(watchlistItem.id)
      } else {
        await addWatch({ courseId: id, targetPrice: null, alertYn: false })
      }
    } finally {
      setHeartLoading(false)
    }
  }

  return (
    <>
      <Header
        title={courseLoading ? '' : (course?.name ?? '')}
        left={
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        }
        right={
          <button onClick={handleToggleWatchlist} disabled={heartLoading} className="p-1">
            <Heart
              size={20}
              className={cn(isWatched ? 'fill-red-400 text-red-400' : 'text-gray-400')}
            />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6">
        {/* 가격 헤더 */}
        {courseLoading ? (
          <div className="space-y-2 mb-6">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-20 h-4" />
          </div>
        ) : course ? (
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-1">
              {[course.region, formatCategory(course.category), formatMembershipType(course.membershipType)]
                .filter(Boolean).join(' · ')}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {course.latestPrice != null ? formatPrice(course.latestPrice) : '-'}
            </p>
            {course.changeRate != null && (
              <p className={cn('text-sm font-medium mt-1', changeRateColor(course.changeRate))}>
                {formatChangeRate(course.changeRate)}
              </p>
            )}
          </div>
        ) : null}

        {/* 기간 선택 */}
        <div className="flex gap-1 mb-3">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                period === value
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 차트 */}
        <div className="h-48 -mx-2 mb-6">
          {historyLoading ? (
            <Skeleton className="w-full h-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => formatPriceCompact(v)}
                  width={52}
                />
                <Tooltip
                  formatter={(value) => [formatPrice(Number(value)), '시세']}
                  labelFormatter={(label) => label}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 거래소별 시세 */}
        {!courseLoading && course?.sources && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">거래소별 시세</h2>
            <div className="space-y-2">
              {course.sources.map((source) => (
                <div
                  key={source.sourceName}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{source.sourceName}</span>
                    {source.isLowest && (
                      <Badge variant="blue" className="text-[10px] py-0">최저</Badge>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(source.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
