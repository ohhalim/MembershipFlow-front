'use client'

import useSWR, { useSWRConfig } from 'swr'
import { watchlistApi } from '@/lib/api/watchlist'
import type { WatchlistItem, WatchlistAddRequest, WatchlistUpdateRequest } from '@/lib/types'

const KEY = '/api/v1/watchlist'

export function useWatchlist() {
  const { mutate } = useSWRConfig()
  const swr = useSWR<WatchlistItem[]>(KEY, watchlistApi.getList)

  async function add(body: WatchlistAddRequest) {
    const item = await watchlistApi.add(body)
    await mutate(KEY)
    return item
  }

  async function update(id: number, body: WatchlistUpdateRequest) {
    const item = await watchlistApi.update(id, body)
    await mutate(KEY)
    return item
  }

  async function remove(id: number) {
    await watchlistApi.remove(id)
    await mutate(KEY)
  }

  return { ...swr, add, update, remove }
}
