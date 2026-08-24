'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Check, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useSubscriptionPlans, useMySubscription } from '@/lib/hooks/useSubscription'
import { subscriptionApi } from '@/lib/api/subscription'
import { billingCycleUnit, formatPrice } from '@/lib/utils'
import type { SubscriptionPlan } from '@/lib/types'

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: '카드 등록을 취소했어요.',
  PAY_PROCESS_ABORTED: '카드 인증을 완료하지 못했어요. 입력 정보를 확인해주세요.',
  REJECT_CARD_COMPANY: '카드사에서 등록을 거절했어요. 카드사 또는 다른 카드를 확인해주세요.',
  BILLING_KEY_ISSUE_FAILED: '카드 등록 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.',
  PAYMENT_FAILED: '최초 결제를 완료하지 못했어요. 카드 한도와 잔액을 확인해주세요.',
  PAYMENT_IN_PROGRESS: '이미 처리 중인 결제가 있어요. 잠시 후 구독 상태를 확인해주세요.',
  PAYMENT_STATUS_CHECK_FAILED: '결제 승인 상태를 확인하지 못했어요. 다시 결제하지 말고 잠시 후 확인해주세요.',
  INTERNAL_ERROR: '결제 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
  '1': '카드 등록에 실패했어요. 다시 시도해주세요.',
}

export function paymentErrorMessage(code: string | null) {
  if (!code) return null
  return PAYMENT_ERROR_MESSAGES[code] ?? '결제를 완료하지 못했어요. 잠시 후 다시 시도해주세요.'
}

function SubscriptionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    isAuthenticated,
    isLoading: authLoading,
    authStatus: rawAuthStatus,
  } = useAuth()
  const authStatus = rawAuthStatus ?? (
    authLoading ? 'checking' : isAuthenticated ? 'authenticated' : 'anonymous'
  )
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans(authStatus === 'authenticated')
  const {
    data: mySubscription,
    isLoading: subLoading,
    error: subError,
    mutate,
  } = useMySubscription(authStatus === 'authenticated')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [billingConsent, setBillingConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const checkoutCompletedRef = useRef(false)
  const [error, setError] = useState<string | null>(() => paymentErrorMessage(
    searchParams.get('error') ?? searchParams.get('code'),
  ))
  const [success, setSuccess] = useState(() => searchParams.get('success') === '1')

  const serviceActive = mySubscription?.serviceActive ?? false
  const canCancel = mySubscription?.status === 'ACTIVE'
  const cancelled = mySubscription?.status === 'CANCELLED'
  const expiredCancellation = cancelled && !serviceActive
  const statusLabel = cancelled
    ? '해지 예정'
    : mySubscription?.status === 'ACTIVE' ? '현재 구독 중'
      : mySubscription?.status === 'PAYMENT_FAILED' ? '결제 실패'
        : mySubscription?.status === 'SUSPENDED' ? '일시정지'
          : ''
  useEffect(() => {
    if (authStatus === 'anonymous') router.replace('/')
  }, [authStatus, router])

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      mutate()
      router.replace('/my/subscription')
    } else if (searchParams.get('error') ?? searchParams.get('code')) {
      router.replace('/my/subscription')
    }
  }, [searchParams, mutate, router])

  if (authStatus === 'checking') return null
  if (authStatus === 'unavailable') {
    return <p className="px-4 py-8 text-center text-sm text-gray-500">로그인 상태를 확인할 수 없어요. 잠시 후 다시 시도해주세요.</p>
  }
  if (!isAuthenticated) return null

  const subscriptionDataUnavailable = Boolean(subError || plansError)

  async function handleSubscribe() {
    if (!selectedPlan || !billingConsent) return
    setLoading(true)
    setError(null)

    try {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      if (!token) throw new Error('Paddle 결제 설정을 확인해주세요.')
      const environment = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
        ? 'production'
        : 'sandbox'

      const { transactionId } = await subscriptionApi.createPaddleTransaction(selectedPlan.id)
      checkoutCompletedRef.current = false
      const paddle = await initializePaddle({
        token,
        environment,
        eventCallback: (event) => {
          if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
            checkoutCompletedRef.current = true
            void refreshCompletedSubscription()
          } else if (event.name === CheckoutEventNames.CHECKOUT_CLOSED
            && !checkoutCompletedRef.current) {
            setLoading(false)
          } else if (event.name === CheckoutEventNames.CHECKOUT_ERROR
            || event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            setError('결제를 완료하지 못했어요. 입력 정보와 결제수단을 확인해주세요.')
            setLoading(false)
          }
        },
      })
      if (!paddle) throw new Error('결제창을 불러오지 못했어요.')
      paddle.Checkout.open({ transactionId })
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 중 오류가 발생했어요')
      setLoading(false)
    }
  }

  async function refreshCompletedSubscription() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const subscription = await mutate()
      if (subscription?.serviceActive) {
        setSuccess(true)
        setSelectedPlan(null)
        setBillingConsent(false)
        setLoading(false)
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
    }
    setError('결제는 완료됐지만 구독 반영을 확인 중이에요. 잠시 후 새로고침해주세요.')
    setLoading(false)
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
        {!subLoading && mySubscription && !expiredCancellation && (
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6">
            <p className="text-xs text-blue-600 font-semibold mb-1">
              {statusLabel}
            </p>
            <p className="text-sm font-bold text-gray-900">{mySubscription.plan.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatPrice(mySubscription.plan.price)} / {billingCycleUnit(mySubscription.plan.billingCycle)}
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
                  onClick={() => {
                    if (!isCurrent) {
                      setSelectedPlan(plan)
                      setBillingConsent(false)
                    }
                  }}
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
                      <p className="text-[10px] text-gray-400">/ {billingCycleUnit(plan.billingCycle)}</p>
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

        {subscriptionDataUnavailable && (
          <p className="mb-4 text-xs text-gray-500">구독 정보를 불러오지 못했어요. 결제 상태를 확인한 뒤 다시 시도해주세요.</p>
        )}

        {!serviceActive && selectedPlan && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">최초 결제 금액</span>
              <strong className="text-gray-900">{formatPrice(selectedPlan.price)}</strong>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              카드 인증이 완료되면 위 금액이 즉시 결제되고, 이후 {billingCycleUnit(selectedPlan.billingCycle)} 단위로 자동 갱신됩니다.
              다음 결제일 전까지 언제든 해지할 수 있으며, 해지 후에는 결제된 이용 기간까지 사용할 수 있습니다.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={billingConsent}
                onChange={(event) => setBillingConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <span>
                최초 결제와 정기 자동결제에 동의합니다.{' '}
                <Link href="/terms" className="text-blue-600 underline underline-offset-2">이용약관</Link>
                {' · '}
                <Link href="/privacy" className="text-blue-600 underline underline-offset-2">개인정보처리방침</Link>
              </span>
            </label>
          </div>
        )}

        {/* CTA */}
        {!serviceActive ? (
          <Button
            fullWidth
            size="lg"
            onClick={handleSubscribe}
            disabled={!selectedPlan || !billingConsent || loading || subscriptionDataUnavailable}
          >
            {loading
              ? '처리 중...'
              : selectedPlan
                ? `${formatPrice(selectedPlan.price)} 결제하고 ${selectedPlan.name} 시작하기`
                : '플랜을 선택해주세요'}
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
