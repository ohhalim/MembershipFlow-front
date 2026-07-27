'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Check, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useSubscriptionPlans, useMySubscription } from '@/lib/hooks/useSubscription'
import { subscriptionApi } from '@/lib/api/subscription'
import { formatPrice } from '@/lib/utils'
import type { SubscriptionPlan } from '@/lib/types'
import { resolveSubscriptionCallbackUrl } from '@/lib/subscriptionUrls'

function SubscriptionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const { data: mySubscription, isLoading: subLoading, mutate } = useMySubscription()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    () => searchParams.get('error') === '1' ? '카드 등록에 실패했어요. 다시 시도해주세요.' : null
  )
  const [success] = useState(() => searchParams.get('success') === '1')

  const serviceActive = mySubscription?.serviceActive ?? false
  const canCancel = mySubscription?.status === 'ACTIVE'
  const cancelled = mySubscription?.status === 'CANCELLED'
  const statusLabel = cancelled
    ? serviceActive ? '해지 예정' : '해지 완료'
    : mySubscription?.status === 'ACTIVE' ? '현재 구독 중'
      : mySubscription?.status === 'PAYMENT_FAILED' ? '결제 실패'
        : mySubscription?.status === 'SUSPENDED' ? '일시정지'
          : ''
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      mutate()
      router.replace('/my/subscription')
    } else if (searchParams.get('error') === '1') {
      router.replace('/my/subscription')
    }
  }, [searchParams, mutate, router])

  if (!isAuthenticated) return null

  async function handleSubscribe() {
    if (!selectedPlan) return
    setLoading(true)
    setError(null)

    try {
      const { customerKey, clientKey } = await subscriptionApi.prepare(selectedPlan.id)

      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey })

      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: resolveSubscriptionCallbackUrl(window.location.origin),
        failUrl: `${window.location.origin}/my/subscription?error=1`,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 중 오류가 발생했어요')
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm('구독을 해지하시겠어요? 현재 기간까지는 이용 가능해요.')) return
    setLoading(true)
    try {
      await subscriptionApi.cancel()
      await mutate()
    } catch {
      setError('해지 중 오류가 발생했어요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header
        title="구독 관리"
        left={
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        }
      />

      <div className="px-4 pt-2 pb-10">
        {/* 성공 배너 */}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-4">
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">구독이 완료되었어요!</p>
          </div>
        )}

        {/* 현재 구독 상태 */}
        {!subLoading && mySubscription && (
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6">
            <p className="text-xs text-blue-600 font-semibold mb-1">
              {statusLabel}
            </p>
            <p className="text-sm font-bold text-gray-900">{mySubscription.plan.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatPrice(mySubscription.plan.price)} / 월
              {cancelled && mySubscription.serviceEndsAt
                ? ` · 이용 종료일: ${mySubscription.serviceEndsAt.slice(0, 10)}`
                : mySubscription.nextBillingAt
                  ? ` · 다음 결제: ${mySubscription.nextBillingAt.slice(0, 10)}`
                  : ''}
            </p>
          </div>
        )}

        {/* 플랜 목록 */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {serviceActive ? '현재 플랜' : '플랜 선택'}
        </h2>

        {plansLoading ? (
          <div className="space-y-3 mb-6">
            {[1, 2].map((i) => <Skeleton key={i} className="w-full h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {plans?.map((plan) => {
              const isCurrent = serviceActive && mySubscription?.plan.id === plan.id
              const isSelected = selectedPlan?.id === plan.id

              return (
                <button
                  key={plan.id}
                  onClick={() => !isCurrent && setSelectedPlan(plan)}
                  disabled={isCurrent}
                  className={cn(
                    'w-full text-left rounded-2xl border p-4 transition-colors',
                    isCurrent
                      ? 'bg-blue-50 border-blue-300 cursor-default'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                        {isCurrent && (
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">현재</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(plan.price)}</p>
                      <p className="text-[10px] text-gray-400">/ 월</p>
                    </div>
                  </div>
                  {isSelected && !isCurrent && (
                    <div className="flex items-center gap-1 mt-2 text-blue-500">
                      <Check size={13} />
                      <span className="text-xs font-medium">선택됨</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* CTA */}
        {!serviceActive ? (
          <Button
            fullWidth
            size="lg"
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
          >
            {loading ? '처리 중...' : mySubscription ? '다시 구독하기' : '결제 카드 등록하기'}
          </Button>
        ) : canCancel ? (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full text-sm text-gray-400 underline underline-offset-2 py-2 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '구독 해지하기'}
          </button>
        ) : (
          <p className="py-2 text-center text-xs text-gray-400">
            이용 종료일까지 현재 구독을 사용할 수 있어요.
          </p>
        )}
      </div>
    </>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionPageContent />
    </Suspense>
  )
}
