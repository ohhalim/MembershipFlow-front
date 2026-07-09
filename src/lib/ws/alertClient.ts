'use client'

import { useEffect, useRef } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import { auth } from '@/lib/auth'
import type { Alert } from '@/lib/types'

const ALERT_DESTINATION = '/user/queue/alert'

/**
 * NEXT_PUBLIC_API_URL(http/https)을 STOMP brokerURL(ws/wss)로 변환한다.
 * - 프로덕션: https://membershipflow.site → wss://membershipflow.site/ws/websocket
 * - 로컬: http://localhost:8080(기본값) → ws://localhost:8080/ws/websocket
 */
export function resolveBrokerUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const wsUrl = apiUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
  return `${wsUrl}/ws/websocket`
}

interface UseAlertSocketOptions {
  /** 목표가 알림 메시지 수신 시 호출 */
  onMessage: (alert: Alert) => void
}

/**
 * 목표가 알림 실시간 수신용 STOMP 소켓 훅.
 * 로그인 상태에서만 연결하고, 언마운트 시 자동으로 해제한다.
 */
export function useAlertSocket({ onMessage }: UseAlertSocketOptions): void {
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!auth.isAuthenticated()) return

    const client = new Client({
      brokerURL: resolveBrokerUrl(),
      connectHeaders: {
        Authorization: `Bearer ${auth.getToken()}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(ALERT_DESTINATION, (message: IMessage) => {
          try {
            const alert = JSON.parse(message.body) as Alert
            onMessageRef.current(alert)
          } catch {
            // 파싱 불가한 메시지는 무시
          }
        })
      },
    })

    client.activate()

    return () => {
      void client.deactivate()
    }
  }, [])
}
