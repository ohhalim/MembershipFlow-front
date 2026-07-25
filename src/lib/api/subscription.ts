import { apiClient } from './client'
import type { SubscriptionPlan, BillingPrepareResponse, MySubscription } from '@/lib/types'
import { z } from 'zod'
import {
  billingPrepareSchema,
  cancelResponseSchema,
  mySubscriptionSchema,
  subscriptionPlanSchema,
} from './schemas'

export const subscriptionApi = {
  getPlans(): Promise<SubscriptionPlan[]> {
    return apiClient.get('/api/v1/subscriptions/plans', z.array(subscriptionPlanSchema))
  },

  prepare(planId: number): Promise<BillingPrepareResponse> {
    return apiClient.post(
      `/api/v1/subscriptions/prepare?planId=${planId}`,
      {},
      billingPrepareSchema,
    )
  },

  getMySubscription(): Promise<MySubscription> {
    return apiClient.get('/api/v1/subscriptions/me', mySubscriptionSchema)
  },

  async cancel(): Promise<void> {
    await apiClient.delete('/api/v1/subscriptions/me', cancelResponseSchema)
  },
}
