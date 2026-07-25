import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { watchlistApi } from '@/lib/api/watchlist'
import { useWatchlist } from '../useWatchlist'

jest.mock('@/lib/api/watchlist', () => ({
  watchlistApi: {
    getList: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('useWatchlist', () => {
  beforeEach(() => jest.clearAllMocks())

  it('비로그인 공개 화면에서는 관심목록 API를 호출하지 않는다', () => {
    renderHook(() => useWatchlist(false), { wrapper })

    expect(watchlistApi.getList).not.toHaveBeenCalled()
  })
})
