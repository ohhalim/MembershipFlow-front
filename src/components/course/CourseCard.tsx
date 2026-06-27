import Link from 'next/link'
import type { Course } from '@/lib/types'
import { formatPriceCompact, formatChangeRate, changeRateColor, formatMembershipType } from '@/lib/utils'
import { cn } from '@/lib/cn'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const { id, name, region, membershipType, latestPrice, changeRate } = course

  return (
    <Link
      href={`/courses/${id}`}
      className="flex items-center justify-between px-4 py-3.5 border-b border-dashed border-gray-200 last:border-0 active:bg-gray-50"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{region} · {formatMembershipType(membershipType)}</p>
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
      </div>
    </Link>
  )
}
