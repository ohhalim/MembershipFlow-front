import { apiClient } from './client'
import type { WatchlistItem, WatchlistAddRequest, WatchlistUpdateRequest } from '@/lib/types'
import { watchlistItemSchema } from './schemas'
import { z } from 'zod'

export const watchlistApi = {
  getList(): Promise<WatchlistItem[]> {
    return apiClient.get('/api/v1/watchlist', z.array(watchlistItemSchema))
  },

  add(body: WatchlistAddRequest): Promise<WatchlistItem> {
    return apiClient.post('/api/v1/watchlist', body, watchlistItemSchema)
  },

  update(id: number, body: WatchlistUpdateRequest): Promise<WatchlistItem> {
    return apiClient.put(`/api/v1/watchlist/${id}`, body, watchlistItemSchema)
  },

  remove(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/v1/watchlist/${id}`)
  },
}
