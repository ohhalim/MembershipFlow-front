import { apiClient } from './client'
import type { WatchlistItem, WatchlistAddRequest, WatchlistUpdateRequest } from '@/lib/types'

export const watchlistApi = {
  getList(): Promise<WatchlistItem[]> {
    return apiClient.get<WatchlistItem[]>('/api/v1/watchlist')
  },

  add(body: WatchlistAddRequest): Promise<WatchlistItem> {
    return apiClient.post<WatchlistItem>('/api/v1/watchlist', body)
  },

  update(id: number, body: WatchlistUpdateRequest): Promise<WatchlistItem> {
    return apiClient.put<WatchlistItem>(`/api/v1/watchlist/${id}`, body)
  },

  remove(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/v1/watchlist/${id}`)
  },
}
