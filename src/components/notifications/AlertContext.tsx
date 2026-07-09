'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { alertsApi } from '@/lib/api/alerts'
import { useAlertSocket } from '@/lib/ws/alertClient'
import { auth } from '@/lib/auth'
import type { Alert } from '@/lib/types'
import { AlertToastStack, type AlertToastItem } from './AlertToastStack'

const ALERTS_KEY = '/api/v1/alerts'
const TOAST_DURATION_MS = 4000

interface AlertContextValue {
  alerts: Alert[]
  unreadCount: number
  isLoading: boolean
  markRead: (id: number) => Promise<void>
}

const AlertContext = createContext<AlertContextValue>({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  markRead: async () => {},
})

export function useAlertContext(): AlertContextValue {
  return useContext(AlertContext)
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig()
  const { data: alerts, isLoading } = useSWR<Alert[]>(
    auth.isAuthenticated() ? ALERTS_KEY : null,
    alertsApi.getList,
    {
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (error?.status === 401) return
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    },
  )

  const [toasts, setToasts] = useState<AlertToastItem[]>([])
  const toastIdRef = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleIncoming = useCallback(
    (alert: Alert) => {
      mutate(ALERTS_KEY, (current: Alert[] | undefined) => [alert, ...(current ?? [])], false)

      const toastId = ++toastIdRef.current
      setToasts((prev) => [...prev, { id: toastId, alert }])
      setTimeout(() => dismissToast(toastId), TOAST_DURATION_MS)
    },
    [mutate, dismissToast],
  )

  useAlertSocket({ onMessage: handleIncoming })

  const markRead = useCallback(
    async (id: number) => {
      await alertsApi.markRead(id)
      await mutate(
        ALERTS_KEY,
        (current: Alert[] | undefined) =>
          current?.map((a) => (a.id === id ? { ...a, readAt: new Date().toISOString() } : a)),
        false,
      )
    },
    [mutate],
  )

  const unreadCount = (alerts ?? []).filter((a) => a.readAt == null).length

  return (
    <AlertContext.Provider
      value={{ alerts: alerts ?? [], unreadCount, isLoading: isLoading ?? false, markRead }}
    >
      {children}
      <AlertToastStack toasts={toasts} onDismiss={dismissToast} />
    </AlertContext.Provider>
  )
}
