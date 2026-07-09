import { apiClient } from './client'
import type { Alert } from '@/lib/types'

export const alertsApi = {
  getList(): Promise<Alert[]> {
    return apiClient.get<Alert[]>('/api/v1/alerts')
  },

  markRead(id: number): Promise<void> {
    return apiClient.patch<void>(`/api/v1/alerts/${id}/read`)
  },
}
