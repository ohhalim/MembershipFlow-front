'use client'

import { useEffect, useRef } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import { auth } from '@/lib/auth'
import type { Alert } from '@/lib/types'

const ALERT_DESTINATION = '/user/queue/alert'

/**
 * NEXT_PUBLIC_API_URL(http/https)을 STOMP brokerURL(ws/wss)로 변환한다.
 * - 로컬(.env.local에 절대 URL 설정): http://localhost:8081 → ws://localhost:8081/ws/websocket
 * - 프로덕션: NEXT_PUBLIC_API_URL이 빈 문자열(nginx가 같은 오리진으로 프록시 — REST apiClient와 동일 전제).
 *   `''`은 falsy라 `||`로 기본값을 주면 항상 폴백을 타버리므로 반드시 `??`로 판별하고,
 *   비어 있으면 현재 페이지 origin(window.location) 기준으로 조립한다.
 */
export function resolveBrokerUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  if (apiUrl) {
    const wsUrl = apiUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
    return `${wsUrl}/ws/websocket`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/websocket`
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
