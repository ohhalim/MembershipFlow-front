'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, BarChart2, Bell, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CourseCard } from '@/components/course/CourseCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useCourseList } from '@/lib/hooks/useCourses'
import { auth } from '@/lib/auth'
import type { CourseCategory } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const FEATURES = [
  { Icon: BarChart2, label: '시세 차트' },
  { Icon: Bell,      label: '목표가 알림' },
  { Icon: TrendingUp, label: '실시간 랭킹' },
] as const

function LoginBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!auth.isAuthenticated())
  }, [])

  if (!visible) return null

  return (
    <div className="mx-4 mt-3 mb-1 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-4">
      <p className="text-xs text-blue-500 font-semibold mb-0.5">여러 골프거래소 시세를 한눈에</p>
      <p className="text-sm font-bold text-gray-900 mb-3">목표가 도달 시 즉시 알림</p>

      <div className="flex gap-4 mb-4">
        {FEATURES.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon size={13} className="text-blue-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => { window.location.href = `${API_URL}/oauth2/authorization/google` }}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        Google로 계속하기
      </button>
    </div>
  )
}

const CATEGORIES: { label: string; value: '' | CourseCategory }[] = [
  { label: '전체', value: '' },
  { label: '골프', value: 'GOLF' },
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
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { courses, isLoading, isLoadingMore, hasMore, loadMore } = useCourseList({ keyword, category, sort })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMore])

  return (
    <>
      <Header title="골프 회원권 시세" />

      <LoginBanner />

      {/* 검색 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="골프장 이름 검색"
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
          : courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}

        {!isLoading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">검색 결과가 없어요</p>
          </div>
        )}
      </div>

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-12 flex items-center justify-center">
        {isLoadingMore && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
