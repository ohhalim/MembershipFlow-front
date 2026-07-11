import Link from 'next/link'
import type { Course } from '@/lib/types'
import { formatPriceCompact, formatChangeRate, changeRateColor } from '@/lib/utils'
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
      className="flex items-center justify-between px-4 py-3.5 border-b border-dashed border-gray-200 last:border-0 active:bg-gray-50"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{displayName.title}</p>
        {displayMeta.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{displayMeta.join(' · ')}</p>
        )}
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {latestPrice != null ? formatPriceCompact(latestPrice) : '-'}
        </p>
        {changeRate != null && (
          <p className={cn('text-xs font-medium mt-0.5', changeRateColor(changeRate))}>
            {formatChangeRate(changeRate)}
          </p>
        )}
        {showSources && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {sourcePrices
              .map((sp) => `${shortSourceName(sp.source)} ${formatPriceCompact(sp.price)}`)
              .join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
