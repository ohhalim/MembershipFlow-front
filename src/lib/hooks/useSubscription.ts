'use client'

import useSWR from 'swr'
import { subscriptionApi } from '@/lib/api/subscription'
import type { SubscriptionPlan, MySubscription } from '@/lib/types'

export function useSubscriptionPlans() {
  return useSWR<SubscriptionPlan[]>('/api/v1/subscriptions/plans', subscriptionApi.getPlans)
}

export function useMySubscription() {
  return useSWR<MySubscription>('/api/v1/subscriptions/me', subscriptionApi.getMySubscription, {
    shouldRetryOnError: false,
  })
}
