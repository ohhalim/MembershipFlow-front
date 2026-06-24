import { apiClient } from './client'
import type { SubscriptionPlan, BillingPrepareResponse, MySubscription } from '@/lib/types'

export const subscriptionApi = {
  getPlans(): Promise<SubscriptionPlan[]> {
    return apiClient.get<SubscriptionPlan[]>('/api/v1/subscriptions/plans')
  },

  prepare(planId: number): Promise<BillingPrepareResponse> {
    return apiClient.post<BillingPrepareResponse>(`/api/v1/subscriptions/prepare?planId=${planId}`, {})
  },

  getMySubscription(): Promise<MySubscription> {
    return apiClient.get<MySubscription>('/api/v1/subscriptions/me')
  },

  cancel(): Promise<void> {
    return apiClient.delete<void>('/api/v1/subscriptions/me')
  },
}
