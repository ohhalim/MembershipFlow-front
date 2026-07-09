'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, ChevronLeft, ExternalLink, MapPin } from 'lucide-react'
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
import type { ChartPeriod, CourseInfo } from '@/lib/types'

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: '1일', value: '1d' },
  { label: '1주', value: '1w' },
  { label: '1개월', value: '1m' },
  { label: '3개월', value: '3m' },
  { label: '1년', value: '1y' },
]

export function CourseDetailClient() {
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
              {course.sources.map((source) => {
                const rowClassName = cn(
                  'flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3',
                  source.url && 'hover:bg-gray-100 transition-colors',
                )
                const rowContent = (
                  <>
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
                  </>
                )

                return source.url ? (
                  <a
                    key={source.sourceName}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClassName}
                  >
                    {rowContent}
                  </a>
                ) : (
                  <div key={source.sourceName} className={rowClassName}>
                    {rowContent}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 골프장 정보 (info 있을 때만) */}
        {!courseLoading && course?.info && <CourseInfoSections info={course.info} />}
      </div>
    </>
  )
}

/** 원 단위 숫자를 "68,000원" 형식으로 변환 */
function formatWon(value: number): string {
  return `${value.toLocaleString()}원`
}

function CourseInfoSections({ info }: { info: CourseInfo }) {
  const hasFees = (info.greenFees?.length ?? 0) > 0 || !!info.caddieFee || !!info.cartFee
  const intros = [
    { title: '회원권 소개', text: info.membershipIntro },
    { title: '코스 소개', text: info.courseIntro },
    { title: '시세 전망', text: info.priceOutlook },
  ].filter((item): item is { title: string; text: string } => !!item.text)

  return (
    <>
      {/* 이용 요금 */}
      {hasFees && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">이용 요금</h2>
          <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-3">
            {(info.greenFees?.length ?? 0) > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left font-medium pb-2">구분</th>
                    <th className="text-right font-medium pb-2">주중</th>
                    <th className="text-right font-medium pb-2">주말</th>
                  </tr>
                </thead>
                <tbody>
                  {info.greenFees!.map((fee, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 text-gray-700">{fee.grade ?? '-'}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {fee.weekday != null ? formatWon(fee.weekday) : '-'}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {fee.weekend != null ? formatWon(fee.weekend) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {info.caddieFee && (
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-500 shrink-0">캐디피</span>
                <span className="text-gray-900 text-right">{info.caddieFee}</span>
              </div>
            )}
            {info.cartFee && (
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-500 shrink-0">카트비</span>
                <span className="text-gray-900 text-right">{info.cartFee}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 위치 */}
      {info.address && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">위치</h2>
          <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700">{info.address}</span>
          </div>
        </section>
      )}

      {/* 골프장 소개 */}
      {intros.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">골프장 소개</h2>
          <div className="space-y-2">
            {intros.map(({ title, text }) => (
              <div key={title} className="bg-gray-50 rounded-xl px-4 py-3">
                <h3 className="text-xs font-semibold text-gray-500 mb-1.5">{title}</h3>
                <ExpandableText text={text} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

/** 긴 문단은 3줄로 접고 더보기/접기 토글 제공 */
const EXPAND_THRESHOLD = 100

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const collapsible = text.length > EXPAND_THRESHOLD

  return (
    <div>
      <p
        className={cn(
          'text-sm text-gray-700 leading-relaxed whitespace-pre-line',
          collapsible && !expanded && 'line-clamp-3',
        )}
      >
        {text}
      </p>
      {collapsible && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  )
}
