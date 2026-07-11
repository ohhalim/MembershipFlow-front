import { renderHook } from '@testing-library/react'

const activateMock = jest.fn()
const deactivateMock = jest.fn()
const subscribeMock = jest.fn()

interface CapturedConfig {
  brokerURL: string
  connectHeaders?: Record<string, string>
  reconnectDelay: number
  onConnect: () => void
}

let capturedConfig: CapturedConfig | null = null

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation((config: CapturedConfig) => {
    capturedConfig = config
    return {
      activate: activateMock,
      deactivate: deactivateMock,
      subscribe: subscribeMock,
    }
  }),
}))

import { useAlertSocket, resolveBrokerUrl } from '../alertClient'

describe('useAlertSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedConfig = null
  })

  it('로그인 상태가 아니면(enabled=false) 연결하지 않는다', () => {
    renderHook(() => useAlertSocket({ enabled: false, onMessage: jest.fn() }))
    expect(activateMock).not.toHaveBeenCalled()
  })

  it('로그인 상태면(enabled=true) 연결한다 — 인증은 핸드셰이크 쿠키로 처리되므로 Authorization 헤더가 없다', () => {
    renderHook(() => useAlertSocket({ enabled: true, onMessage: jest.fn() }))
    expect(activateMock).toHaveBeenCalled()
    expect(capturedConfig?.connectHeaders).toBeUndefined()
    expect(capturedConfig?.brokerURL).toContain('/ws/websocket')
  })

  it('연결 후 /user/queue/alert 를 구독하고 수신 메시지를 파싱해서 콜백을 호출한다', () => {
    const onMessage = jest.fn()
    renderHook(() => useAlertSocket({ enabled: true, onMessage }))

    capturedConfig?.onConnect()

    expect(subscribeMock).toHaveBeenCalledWith('/user/queue/alert', expect.any(Function))
    const handler = subscribeMock.mock.calls[0][1]
    handler({
      body: JSON.stringify({
        id: 1,
        courseId: 5,
        courseName: '가야',
        triggeredPrice: 147000000,
        targetPrice: 150000000,
        sourceName: '동아골프',
        sentAt: '2026-07-09T10:00:00',
        readAt: null,
      }),
    })

    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, courseId: 5, courseName: '가야' }),
    )
  })

  it('메시지 파싱에 실패해도 예외를 던지지 않는다', () => {
    const onMessage = jest.fn()
    renderHook(() => useAlertSocket({ enabled: true, onMessage }))

    capturedConfig?.onConnect()
    const handler = subscribeMock.mock.calls[0][1]

    expect(() => handler({ body: 'not-json' })).not.toThrow()
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('언마운트 시 deactivate를 호출한다', () => {
    const { unmount } = renderHook(() => useAlertSocket({ enabled: true, onMessage: jest.fn() }))
    unmount()
    expect(deactivateMock).toHaveBeenCalled()
  })

  it('resolveBrokerUrl은 https를 wss로 변환한다', () => {
    const original = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://membershipflow.site'
    expect(resolveBrokerUrl()).toBe('wss://membershipflow.site/ws/websocket')
    process.env.NEXT_PUBLIC_API_URL = original
  })

  it('resolveBrokerUrl은 NEXT_PUBLIC_API_URL이 빈 문자열(프로덕션 실제값)이면 현재 페이지 origin을 사용한다', () => {
    // 프로덕션 docker-compose는 NEXT_PUBLIC_API_URL=(빈 문자열)로 설정됨 — nginx가 같은
    // 오리진으로 프록시하기 때문. ''는 falsy라 `||`로 기본값 처리하면 항상 폴백을
    // 타버리는 버그가 실제로 있었음 — window.location 기반으로 정정.
    const original = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = ''
    expect(resolveBrokerUrl()).toBe(`ws://${window.location.host}/ws/websocket`)
    process.env.NEXT_PUBLIC_API_URL = original
  })

  it('resolveBrokerUrl은 NEXT_PUBLIC_API_URL이 미설정이어도 현재 페이지 origin을 사용한다', () => {
    const original = process.env.NEXT_PUBLIC_API_URL
    delete process.env.NEXT_PUBLIC_API_URL
    expect(resolveBrokerUrl()).toBe(`ws://${window.location.host}/ws/websocket`)
    process.env.NEXT_PUBLIC_API_URL = original
  })
})
