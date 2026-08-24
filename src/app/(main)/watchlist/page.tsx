'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Bell } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth'
import { Toggle } from '@/components/ui/Toggle'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useWatchlist } from '@/lib/hooks/useWatchlist'
import { formatPrice, formatPriceCompact, priceGap, changeRateColor } from '@/lib/utils'
import { courseDisplayTitle } from '@/lib/courseDisplay'
import { AccessRequirementState } from '@/components/layout/AccessGate'
import { useMySubscription } from '@/lib/hooks/useSubscription'

export default function WatchlistPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading: authLoading,
    authStatus: rawAuthStatus,
  } = useAuth()
  const authStatus = rawAuthStatus ?? (
    authLoading ? 'checking' : isAuthenticated ? 'authenticated' : 'anonymous'
  )
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription(
    authStatus === 'authenticated',
  )
  const hasSubscription = subscription?.serviceActive === true
  const { data: items, isLoading, update, remove } = useWatchlist(
    authStatus === 'authenticated' && !subscriptionLoading && hasSubscription,
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [targetDrafts, setTargetDrafts] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    if (authStatus === 'anonymous') router.replace('/')
  }, [authStatus, router])

  if (authStatus === 'checking') return null
  if (authStatus === 'unavailable') {
    return <p className="px-4 py-8 text-center text-sm text-gray-500">로그인 상태를 확인할 수 없어요. 잠시 후 다시 시도해주세요.</p>
  }
  if (!isAuthenticated) return null
  if (subscriptionLoading) return <p className="px-4 py-12 text-center text-sm text-gray-500">구독 상태를 확인하고 있어요.</p>
  if (!hasSubscription) return <AccessRequirementState requirement="subscription" />

  async function handleToggleAlert(id: number, current: boolean, targetPrice: number | null) {
    if (!current && targetPrice == null) {
      setErrors((prev) => ({ ...prev, [id]: '목표가를 먼저 입력해주세요.' }))
      return
    }
    await update(id, { alertYn: !current, targetPrice })
  }

  async function handleSaveTarget(
    event: FormEvent<HTMLFormElement>,
    id: number,
    alertYn: boolean,
  ) {
    event.preventDefault()
    const rawValue = targetDrafts[id]?.replaceAll(',', '').trim() ?? ''
    const targetPrice = Number(rawValue)

    if (!/^\d+$/.test(rawValue) || !Number.isSafeInteger(targetPrice) || targetPrice <= 0) {
      setErrors((prev) => ({ ...prev, [id]: '목표가는 1원 이상의 숫자로 입력해주세요.' }))
      return
    }

    setSavingId(id)
    setErrors((prev) => ({ ...prev, [id]: '' }))
    try {
      await update(id, { targetPrice, alertYn })
    } catch {
      setErrors((prev) => ({ ...prev, [id]: '목표가를 저장하지 못했어요. 다시 시도해주세요.' }))
    } finally {
      setSavingId(null)
    }
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
              const gap = item.targetPrice != null && item.latestPrice != null
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
                      <p className="text-sm font-bold text-gray-900 truncate">{courseDisplayTitle(item.courseName)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.region}</p>
                    </Link>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-gray-900">
                        {item.latestPrice != null ? formatPriceCompact(item.latestPrice) : '-'}
                      </p>
                    </div>
                  </div>

                  {/* 목표가 */}
                  <div className="mb-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">목표가</span>
                      {item.targetPrice != null && (
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
                      )}
                    </div>
                    <form
                      aria-label={`${courseDisplayTitle(item.courseName)} 목표가 설정`}
                      className="flex gap-2"
                      onSubmit={(event) => handleSaveTarget(event, item.id, item.alertYn)}
                    >
                      <label htmlFor={`target-price-${item.id}`} className="sr-only">목표가(원)</label>
                      <input
                        id={`target-price-${item.id}`}
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        placeholder="예: 120000000"
                        value={targetDrafts[item.id] ?? item.targetPrice?.toString() ?? ''}
                        onChange={(event) => setTargetDrafts((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))}
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
                      />
                      <button
                        type="submit"
                        disabled={savingId === item.id}
                        className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingId === item.id ? '저장 중' : '저장'}
                      </button>
                    </form>
                    {errors[item.id] && (
                      <p role="alert" className="mt-1.5 text-xs text-red-500">{errors[item.id]}</p>
                    )}
                  </div>

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
