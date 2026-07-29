import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Course } from '@/lib/types'
import { formatPriceCompact, formatChangeRate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { courseDisplayMeta, parseCourseDisplayName } from '@/lib/courseDisplay'

interface CourseCardProps {
  course: Course
}

// "동아골프" → "동아", "동부회원권" → "동부"
function shortSourceName(source: string): string {
  return source.slice(0, 2)
}

export function CourseCard({ course }: CourseCardProps) {
  const { id, name, region, membershipType, latestPrice, changeRate, sourcePrices } = course
  const showSources = sourcePrices != null && sourcePrices.length > 1
  const displayName = parseCourseDisplayName(name)
  const displayMeta = courseDisplayMeta(name, region, membershipType)

  return (
    <Link
      href={`/courses/${id}`}
      className="group flex min-h-24 items-center gap-3 bg-white px-4 py-4 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold tracking-tight text-gray-900">
          {displayName.title}
        </p>
        {displayMeta.length > 0 && (
          <p className="mt-1 truncate text-xs text-gray-500">{displayMeta.join(' · ')}</p>
        )}

        {showSources && (
          <div className="mt-2 flex flex-wrap gap-1" aria-label="거래소별 시세">
            {sourcePrices.map((sourcePrice) => (
              <span
                key={sourcePrice.source}
                className="rounded-md bg-gray-100 px-1.5 py-1 text-[10px] font-medium text-gray-600"
              >
                {shortSourceName(sourcePrice.source)} {formatPriceCompact(sourcePrice.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <div className="text-right">
          <p className="text-[10px] font-medium text-gray-400">최근 시세</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-gray-950">
            {latestPrice != null ? formatPriceCompact(latestPrice) : '-'}
          </p>
          {changeRate != null && (
            <p
              className={cn(
                'mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                changeRate > 0 && 'bg-red-50 text-red-500',
                changeRate < 0 && 'bg-blue-50 text-blue-500',
                changeRate === 0 && 'bg-gray-100 text-gray-500',
              )}
            >
              {formatChangeRate(changeRate)}
            </p>
          )}
        </div>

        <ChevronRight
          size={16}
          aria-hidden="true"
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </Link>
  )
}
