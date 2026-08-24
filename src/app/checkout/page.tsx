'use client'

import { useEffect, useState } from 'react'
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js'
import Link from 'next/link'
import { AlertCircle, LoaderCircle } from 'lucide-react'

type CheckoutState = 'loading' | 'ready' | 'missing' | 'error'

export default function CheckoutPage() {
  const [state, setState] = useState<CheckoutState>('loading')

  useEffect(() => {
    let active = true
    void Promise.resolve().then(async () => {
      const transactionId = new URLSearchParams(window.location.search).get('_ptxn')
      if (!transactionId) {
        if (active) setState('missing')
        return
      }

      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      const configuredEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENV
      if (!token || (configuredEnvironment !== 'sandbox' && configuredEnvironment !== 'production')) {
        if (active) setState('error')
        return
      }

      const paddle = await initializePaddle({
        token,
        environment: configuredEnvironment,
        eventCallback: (event) => {
          if (!active) return
          if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
            window.location.assign('/my/subscription?success=1')
          } else if (event.name === CheckoutEventNames.CHECKOUT_ERROR
            || event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            setState('error')
          }
        },
      })
      if (active) {
        setState(paddle ? 'ready' : 'error')
      }
    }).catch(() => {
      if (active) {
          setState('error')
      }
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-blue-600">MembershipFlow 결제</p>

        {(state === 'loading' || state === 'ready') && (
          <>
            <LoaderCircle className="mx-auto mt-6 animate-spin text-blue-500" size={32} aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">안전한 결제창을 준비하고 있어요</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              잠시만 기다려주세요. Paddle 보안 결제창이 자동으로 열립니다.
            </p>
          </>
        )}

        {state === 'missing' && (
          <>
            <AlertCircle className="mx-auto mt-6 text-gray-400" size={32} aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">유효한 결제 링크가 아니에요</h1>
            <p className="mt-2 text-sm text-gray-500">구독 상품 페이지에서 플랜을 다시 선택해주세요.</p>
            <Link href="/pricing" className="mt-6 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white">
              구독 상품 보기
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="mx-auto mt-6 text-red-500" size={32} aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">결제창을 불러오지 못했어요</h1>
            <p className="mt-2 text-sm text-gray-500">잠시 후 다시 시도하거나 구독 상품 페이지로 돌아가주세요.</p>
            <Link href="/pricing" className="mt-6 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white">
              구독 상품으로 돌아가기
            </Link>
          </>
        )}
      </section>
    </main>
  )
}
