import { render, screen, act, waitFor, fireEvent, within } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { AlertProvider, useAlertContext } from '../AlertContext'
import type { Alert } from '@/lib/types'

/** 테스트마다 SWR 전역 캐시를 격리해서 이전 테스트의 알림 상태가 새지 않도록 한다 */
function renderWithIsolatedCache(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>,
  )
}

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com', name: '테스터' },
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  }),
}))

const mockGetList = jest.fn()
const mockMarkRead = jest.fn()
jest.mock('@/lib/api/alerts', () => ({
  alertsApi: {
    getList: (...args: unknown[]) => mockGetList(...args),
    markRead: (...args: unknown[]) => mockMarkRead(...args),
  },
}))

let capturedOnMessage: ((alert: Alert) => void) | null = null
let capturedEnabled: boolean | null = null
jest.mock('@/lib/ws/alertClient', () => ({
  useAlertSocket: ({ enabled, onMessage }: { enabled: boolean; onMessage: (alert: Alert) => void }) => {
    capturedEnabled = enabled
    capturedOnMessage = onMessage
  },
}))

function TestConsumer() {
  const { alerts, unreadCount, markRead } = useAlertContext()
  return (
    <div>
      <span data-testid="unread">{unreadCount}</span>
      {alerts.map((a) => (
        <div key={a.id}>{a.courseName}</div>
      ))}
      <button onClick={() => markRead(1)}>read</button>
    </div>
  )
}

const initialAlerts: Alert[] = [
  {
    id: 1, courseId: 10, courseName: '서울 CC', triggeredPrice: 100_000_000,
    targetPrice: 110_000_000, sourceName: '동아', sentAt: '2024-01-01T00:00:00', readAt: null,
  },
  {
    id: 2, courseId: 20, courseName: '제주 CC', triggeredPrice: 200_000_000,
    targetPrice: 210_000_000, sourceName: '동아', sentAt: '2024-01-02T00:00:00', readAt: '2024-01-03T00:00:00',
  },
]

describe('AlertProvider', () => {
  beforeEach(() => {
    mockGetList.mockReset().mockResolvedValue(initialAlerts)
    mockMarkRead.mockReset().mockResolvedValue(undefined)
    capturedOnMessage = null
  })

  it('초기 알림 목록을 불러와 안읽은 개수를 계산한다', async () => {
    renderWithIsolatedCache(
      <AlertProvider>
        <TestConsumer />
      </AlertProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('1'))
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
    expect(screen.getByText('제주 CC')).toBeInTheDocument()
    // 로그인 상태이므로 소켓 연결이 활성화되어야 한다
    expect(capturedEnabled).toBe(true)
  })

  it('WebSocket 메시지 수신 시 안읽은 개수가 증가하고 토스트가 표시된다', async () => {
    renderWithIsolatedCache(
      <AlertProvider>
        <TestConsumer />
      </AlertProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('1'))

    act(() => {
      capturedOnMessage?.({
        id: 3, courseId: 30, courseName: '부산 CC', triggeredPrice: 147_000_000,
        targetPrice: 150_000_000, sourceName: '동아골프', sentAt: '2026-07-09T10:00:00', readAt: null,
      })
    })

    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('2'))
    const toast = screen.getByRole('status')
    expect(within(toast).getByText('목표가 알림')).toBeInTheDocument()
    expect(within(toast).getByText(/부산 CC/)).toBeInTheDocument()
  })

  it('markRead 호출 시 읽음 처리 API를 호출한다', async () => {
    renderWithIsolatedCache(
      <AlertProvider>
        <TestConsumer />
      </AlertProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('1'))

    fireEvent.click(screen.getByText('read'))

    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith(1))
  })
})
