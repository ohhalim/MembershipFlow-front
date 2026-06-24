'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CourseCard } from '@/components/course/CourseCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useCourseList } from '@/lib/hooks/useCourses'
import type { CourseCategory } from '@/lib/types'

const CATEGORIES: { label: string; value: '' | CourseCategory }[] = [
  { label: '전체', value: '' },
  { label: '골프', value: 'GOLF' },
  { label: '콘도', value: 'CONDO' },
  { label: '피트니스', value: 'FITNESS' },
]

const SORTS = [
  { label: '최신순', value: 'latest' },
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
] as const

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<'' | CourseCategory>('')
  const [sort, setSort] = useState<'latest' | 'price_asc' | 'price_desc'>('latest')

  const { data: courses, isLoading } = useCourseList({ keyword, category, sort })

  return (
    <>
      <Header title="회원권 시세" />

      {/* 검색 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="골프장, 콘도 이름 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={cn(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              category === value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-500 border-gray-200',
            )}
          >
            {label}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto flex-shrink-0 text-xs text-gray-500 bg-transparent border-none outline-none cursor-pointer"
        >
          {SORTS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* 목록 */}
      <div className="divide-y divide-dashed divide-gray-200">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
                <div className="space-y-1.5 items-end flex flex-col">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-12 h-3" />
                </div>
              </div>
            ))
          : courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}

        {!isLoading && courses?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">검색 결과가 없어요</p>
          </div>
        )}
      </div>
    </>
  )
}
