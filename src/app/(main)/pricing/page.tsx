'use client'

import Link from 'next/link'
import { Bell, Check, LineChart, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/lib/auth'
import { useSubscriptionPlans } from '@/lib/hooks/useSubscription'
import { rememberPostLoginPath } from '@/lib/postLoginRedirect'
import { billingCycleUnit, formatPrice } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const BENEFITS = [
  { Icon: Bell, label: '목표가 도달 즉시 알림' },
  { Icon: LineChart, label: '전체 기간 시세 차트' },
  { Icon: ShieldCheck, label: '관심 회원권 무제한 저장' },
] as const

export default function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: plans, isLoading, error } = useSubscriptionPlans(true)

  function rememberSubscriptionPath() {
    rememberPostLoginPath('/my/subscription')
  }

  return (
    <>
      <Header title="구독 상품" />
      <main className="px-4 pb-12 pt-2 lg:px-8">
        <section className="rounded-3xl bg-blue-50 px-5 py-6 text-center">
          <p className="text-xs font-semibold text-blue-600">MembershipFlow 유료 구독</p>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900">원하는 회원권 가격을 놓치지 마세요</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            여러 거래소의 최저가를 비교하고 목표 가격에 도달하면 바로 알려드립니다.
          </p>
          <div className="mt-5 grid gap-2 text-left sm:grid-cols-3">
            {BENEFITS.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-medium text-gray-700">
                <Icon size={16} className="shrink-0 text-blue-500" />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="subscription-plan-title" className="mt-7">
          <div className="mb-3">
            <h2 id="subscription-plan-title" className="text-lg font-bold text-gray-900">구독 플랜</h2>
            <p className="mt-1 text-xs text-gray-500">카드 인증 완료 시 선택한 금액이 즉시 결제됩니다.</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((item) => <Skeleton key={item} className="h-36 w-full rounded-2xl" />)}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              구독 상품을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plans?.map((plan) => (
                <article key={plan.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{plan.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <strong className="text-xl text-gray-900">{formatPrice(plan.price)}</strong>
                      <p className="text-[11px] text-gray-400">/ {billingCycleUnit(plan.billingCycle)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-600">
                    <Check size={14} className="text-blue-500" />
                    결제 주기마다 동일 금액 자동 갱신
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
          <h2 className="font-bold text-gray-800">결제 및 해지 안내</h2>
          <ul className="mt-2 space-y-1.5">
            <li>• 카드 인증 완료 후 선택한 플랜 금액이 최초 결제됩니다.</li>
            <li>• 월간 또는 연간 주기로 자동 갱신됩니다.</li>
            <li>• 다음 결제일 전까지 언제든 해지할 수 있으며 추가 결제가 중단됩니다.</li>
            <li>• 해지 후에도 이미 결제한 이용 기간까지 서비스를 사용할 수 있습니다.</li>
          </ul>
          <p className="mt-3">
            자세한 내용은{' '}
            <Link href="/terms" className="text-blue-600 underline underline-offset-2">이용약관</Link>
            {' · '}
            <Link href="/privacy" className="text-blue-600 underline underline-offset-2">개인정보처리방침</Link>
            에서 확인할 수 있습니다.
          </p>
        </section>

        {!authLoading && (
          isAuthenticated ? (
            <Link href="/my/subscription" className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-600">
              플랜 선택하고 결제하기
            </Link>
          ) : (
            <a
              href={`${API_URL}/oauth2/authorization/google`}
              onClick={rememberSubscriptionPath}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-600"
            >
              Google 로그인 후 구독하기
            </a>
          )
        )}
      </main>
    </>
  )
}
