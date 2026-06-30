'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Bell } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Toggle } from '@/components/ui/Toggle'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useWatchlist } from '@/lib/hooks/useWatchlist'
import { formatPrice, formatPriceCompact, priceGap, changeRateColor } from '@/lib/utils'

export default function WatchlistPage() {
  const { data: items, isLoading, update, remove } = useWatchlist()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleToggleAlert(id: number, current: boolean, targetPrice: number | null) {
    await update(id, { alertYn: !current, targetPrice })
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await remove(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Header
        title="관심 종목"
        right={
          <Link href="/home" className="p-1">
            <Plus size={22} className="text-gray-700" />
          </Link>
        }
      />

      <div className="px-4 pt-2">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="w-28 h-5" />
                  <Skeleton className="w-16 h-5" />
                </div>
                <Skeleton className="w-full h-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-10 h-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Bell size={36} className="text-gray-200" />
            <p className="text-sm">관심 종목을 추가해보세요</p>
            <Link href="/home" className="text-sm text-blue-500 font-medium">
              종목 둘러보기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items?.map((item) => {
              const gap = item.targetPrice != null
                ? priceGap(item.targetPrice, item.latestPrice)
                : null

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* 상단: 종목명 + 현재가 */}
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/courses/${item.courseId}`} className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.courseName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.region}</p>
                    </Link>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-gray-900">
                        {formatPriceCompact(item.latestPrice)}
                      </p>
                    </div>
                  </div>

                  {/* 목표가 */}
                  {item.targetPrice != null && (
                    <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-500">목표가</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">
                          {formatPrice(item.targetPrice)}
                        </span>
                        {gap != null && (
                          <span className={cn('text-[10px] font-medium', changeRateColor(gap))}>
                            {gap > 0 ? `▲${gap}%` : gap < 0 ? `▼${Math.abs(gap)}%` : '목표 도달'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 하단: 알림 토글 + 삭제 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={13} className="text-gray-400" />
                      <span className="text-xs text-gray-500">알림</span>
                      <Toggle
                        checked={item.alertYn}
                        onChange={() => handleToggleAlert(item.id, item.alertYn, item.targetPrice)}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={15} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
