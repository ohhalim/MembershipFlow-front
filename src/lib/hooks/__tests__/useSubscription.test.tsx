import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { subscriptionApi } from '@/lib/api/subscription'
import { useMySubscription, useSubscriptionPlans } from '../useSubscription'

jest.mock('@/lib/api/subscription', () => ({
  subscriptionApi: {
    getPlans: jest.fn(),
    getMySubscription: jest.fn(),
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('subscription hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('인증 확인 전에는 플랜 API를 호출하지 않는다', () => {
    renderHook(() => useSubscriptionPlans(false), { wrapper })

    expect(subscriptionApi.getPlans).not.toHaveBeenCalled()
  })

  it('인증 확인 전에는 내 구독 API를 호출하지 않는다', () => {
    renderHook(() => useMySubscription(false), { wrapper })

    expect(subscriptionApi.getMySubscription).not.toHaveBeenCalled()
  })
})
