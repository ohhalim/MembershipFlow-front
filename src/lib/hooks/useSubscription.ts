'use client'

import useSWR from 'swr'
import { subscriptionApi } from '@/lib/api/subscription'
import type { SubscriptionPlan, MySubscription } from '@/lib/types'

export function useSubscriptionPlans() {
  return useSWR<SubscriptionPlan[]>('/api/v1/subscriptions/plans', subscriptionApi.getPlans)
}

export function useMySubscription() {
  return useSWR<MySubscription | null>('/api/v1/subscriptions/me', subscriptionApi.getMySubscription, {
    shouldRetryOnError: false,
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      // 401(미인증)이나 404(구독 없음)는 재시도하지 않음
      if (error?.status === 401 || error?.status === 404) return
      if (retryCount >= 2) return
      setTimeout(() => revalidate({ retryCount }), 3000)
    },
  })
}
