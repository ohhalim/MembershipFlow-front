import { apiClient } from './client'
import type { Alert } from '@/lib/types'
import { alertSchema } from './schemas'
import { z } from 'zod'

export const alertsApi = {
  getList(): Promise<Alert[]> {
    return apiClient.get('/api/v1/alerts', z.array(alertSchema))
  },

  markRead(id: number): Promise<void> {
    return apiClient.patch<void>(`/api/v1/alerts/${id}/read`)
  },
}
