'use client'

import Link from 'next/link'
import { CreditCard, ChevronRight, LogOut, User } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMySubscription } from '@/lib/hooks/useSubscription'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const STATUS_LABEL: Record<string, { label: string; variant: 'green' | 'gray' | 'red' | 'blue' }> = {
  ACTIVE:          { label: '구독 중', variant: 'green' },
  CANCELLED:       { label: '해지 예정', variant: 'gray' },
  SUSPENDED:       { label: '일시정지', variant: 'gray' },
  PAYMENT_FAILED:  { label: '결제 실패', variant: 'red' },
}

export default function MyPage() {
  const { data: subscription, isLoading } = useMySubscription()
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/')
  }, [authLoading, isAuthenticated, router])

  if (!isAuthenticated) return null

  async function handleLogout() {
    try {
      await logout()
    } finally {
      router.replace('/')
    }
  }

  return (
    <>
      <Header title="MY" />

      <div className="px-4 pt-2 space-y-4">
        {/* 구독 카드 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">구독</h2>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-48 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>
            ) : subscription ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-gray-900">{subscription.plan.name}</p>
                  <Badge variant={STATUS_LABEL[subscription.status]?.variant ?? 'gray'}>
                    {STATUS_LABEL[subscription.status]?.label ?? subscription.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {formatPrice(subscription.plan.price)} / 월
                </p>
                {subscription.cardCompany && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {subscription.cardCompany} {subscription.cardNumberMasked}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  다음 결제일: {subscription.nextBillingAt?.slice(0, 10)}
                </p>
                <Link
                  href="/my/subscription"
                  className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
                >
                  <span className="text-xs text-blue-500 font-medium">구독 관리</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              </div>
            ) : (
              <Link href="/my/subscription" className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">구독 플랜 없음</p>
                  <p className="text-xs text-gray-400 mt-0.5">목표가 알림을 이용하려면 구독이 필요해요</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            )}
          </div>
        </section>

        {/* 계정 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">계정</h2>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-50">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <User size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">프로필</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="text-red-400" />
              <span className="text-sm text-red-400">로그아웃</span>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
