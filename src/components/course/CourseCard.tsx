import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Course } from '@/lib/types'
import { formatPrice, formatPriceCompact } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { courseDisplayMeta, parseCourseDisplayName } from '@/lib/courseDisplay'

interface CourseCardProps {
  course: Course
}

const MEMBERSHIP_CONTEXT_LABELS: Record<string, string> = {
  '일반': '일반 회원권',
  '우대': '우대 회원권',
  '남자': '남성 회원권',
  '여자': '여성 회원권',
  '주주': '주주 회원권',
  '주중': '주중 회원권',
}

function contextualizeMembership(value: string): string {
  return MEMBERSHIP_CONTEXT_LABELS[value] ?? value
}

export function CourseCard({ course }: CourseCardProps) {
  const { id, name, region, membershipType, latestPrice, sourcePrices = [] } = course
  const displayName = parseCourseDisplayName(name)
  const displayMeta = courseDisplayMeta(name, region, membershipType)
  const productMeta = displayMeta
    .filter((value) => value !== region)
    .map(contextualizeMembership)
  const sortedSourcePrices = [...sourcePrices].sort((a, b) => a.price - b.price)
  const lowestSource = sortedSourcePrices[0]
  const otherSources = sortedSourcePrices.slice(1)
  const displayedPrice = lowestSource?.price ?? latestPrice
  const hasComparison = sortedSourcePrices.length > 1
  const priceDifference = hasComparison
    ? sortedSourcePrices[sortedSourcePrices.length - 1].price - sortedSourcePrices[0].price
    : null

  return (
    <Link
      href={`/courses/${id}`}
      className="group grid min-h-28 grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-x-2 gap-y-3 bg-white px-4 py-4 transition-colors hover:bg-blue-50/30 active:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 lg:grid-cols-[minmax(180px,0.9fr)_minmax(210px,0.9fr)_minmax(300px,1.4fr)_16px] lg:gap-6 lg:px-6 lg:py-5"
    >
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold tracking-tight text-gray-900">
          {displayName.title}
        </p>
        {(region || productMeta.length > 0) && (
          <div className="mt-2.5 flex flex-wrap gap-2 text-gray-600">
            {region && (
              <span className="inline-flex items-baseline gap-2.5 whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1.5">
                <span className="text-[10px] font-medium tracking-wide text-gray-400">지역</span>
                <strong className="text-xs font-bold text-gray-800">{region}</strong>
              </span>
            )}
            {productMeta.map((value) => (
              <span
                key={value}
                className="inline-flex items-baseline gap-2.5 whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1.5"
              >
                <span className="text-[10px] font-medium tracking-wide text-gray-400">
                  {value.startsWith('분양가 ') ? '분양가' : '구분'}
                </span>
                <strong className="text-xs font-bold text-gray-800">
                  {value.startsWith('분양가 ') ? value.replace('분양가 ', '') : value}
                </strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          'min-w-[116px] rounded-xl border px-3 py-2 text-right lg:text-left',
          hasComparison ? 'border-blue-100 bg-blue-50' : 'border-gray-200 bg-gray-50',
        )}
      >
        <p className={cn('text-[10px] font-semibold', hasComparison ? 'text-blue-600' : 'text-gray-500')}>
          {hasComparison ? `${sortedSourcePrices.length}개 거래소 중 최저가` : '확인 시세'}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-gray-700">
          {lowestSource?.source ?? '거래소 정보 없음'}
        </p>
        <p className="mt-0.5 text-lg font-extrabold tabular-nums text-gray-950">
          {displayedPrice != null ? formatPriceCompact(displayedPrice) : '-'}
        </p>
      </div>

      <div className="col-span-3 min-w-0 lg:col-span-1" aria-label="거래소별 가격 비교">
        {hasComparison ? (
          <>
            <p className="text-[10px] font-semibold text-gray-400">다른 거래소</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {otherSources.map((sourcePrice) => (
                <span
                  key={sourcePrice.source}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-600"
                >
                  <strong className="font-semibold text-gray-800">{sourcePrice.source}</strong>{' '}
                  <span className="tabular-nums">{formatPriceCompact(sourcePrice.price)}</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              최대 가격 차이{' '}
              <strong className="font-bold text-blue-600">
                {priceDifference === 0 ? '동일 시세' : formatPrice(priceDifference ?? 0)}
              </strong>
            </p>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-3 py-3 text-xs text-gray-500">
            {sortedSourcePrices.length === 1
              ? '비교 가능한 거래소가 1곳뿐입니다'
              : '거래소별 비교 정보를 준비 중입니다'}
          </p>
        )}
      </div>

      <ChevronRight
        size={16}
        aria-hidden="true"
        className="col-start-3 row-start-1 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 lg:col-auto lg:row-auto"
      />
    </Link>
  )
}
