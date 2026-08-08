import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationBell } from '../NotificationBell'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockMarkRead = jest.fn()
const mockUseAlertContext = jest.fn()
jest.mock('../AlertContext', () => ({
  useAlertContext: () => mockUseAlertContext(),
}))

const mockUseAuth = jest.fn()
jest.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseSubscription = jest.fn()
jest.mock('@/lib/hooks/useSubscription', () => ({
  useMySubscription: (...args: unknown[]) => mockUseSubscription(...args),
}))

const mockShowAccessNotice = jest.fn()
jest.mock('@/components/layout/AccessGate', () => ({
  useAccessGate: () => ({ showAccessNotice: mockShowAccessNotice }),
}))

const alerts = [
  {
    id: 1, courseId: 10, courseName: '서울 CC', triggeredPrice: 230_000_000,
    targetPrice: 240_000_000, sourceName: '동아', sentAt: '2024-01-01T00:00:00', readAt: null,
  },
]

describe('NotificationBell', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockMarkRead.mockReset().mockResolvedValue(undefined)
    mockUseAlertContext.mockReturnValue({
      alerts, unreadCount: 1, isLoading: false, markRead: mockMarkRead,
    })
    mockUseAuth.mockReturnValue({
      authStatus: 'authenticated', isAuthenticated: true,
    })
    mockUseSubscription.mockReturnValue({
      data: { serviceActive: true }, isLoading: false,
    })
    mockShowAccessNotice.mockReset()
  })

  it('안읽은 개수 뱃지를 표시한다', () => {
    render(<NotificationBell />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('안읽은 알림이 없으면 뱃지를 표시하지 않는다', () => {
    mockUseAlertContext.mockReturnValue({
      alerts: [], unreadCount: 0, isLoading: false, markRead: mockMarkRead,
    })
    render(<NotificationBell />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('벨 클릭 시 알림 목록 패널이 열린다', () => {
    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))
    expect(screen.getByText('서울 CC')).toBeInTheDocument()
  })

  it('목록이 비어있으면 빈 상태 문구를 보여준다', () => {
    mockUseAlertContext.mockReturnValue({
      alerts: [], unreadCount: 0, isLoading: false, markRead: mockMarkRead,
    })
    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))
    expect(screen.getByText('알림이 없습니다')).toBeInTheDocument()
  })

  it('알림 항목 클릭 시 읽음 처리 후 코스 상세 페이지로 이동한다', async () => {
    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))
    fireEvent.click(screen.getByText('서울 CC'))

    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith(1))
    expect(mockPush).toHaveBeenCalledWith('/courses/10')
  })

  it('이미 읽은 알림 클릭 시 읽음 처리를 다시 호출하지 않는다', async () => {
    mockUseAlertContext.mockReturnValue({
      alerts: [{ ...alerts[0], readAt: '2024-01-02T00:00:00' }],
      unreadCount: 0,
      isLoading: false,
      markRead: mockMarkRead,
    })
    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))
    fireEvent.click(screen.getByText('서울 CC'))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/courses/10'))
    expect(mockMarkRead).not.toHaveBeenCalled()
  })

  it('비로그인 상태에서 알림을 열면 로그인 안내를 표시한다', () => {
    mockUseAuth.mockReturnValue({ authStatus: 'anonymous', isAuthenticated: false })

    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))

    expect(mockShowAccessNotice).toHaveBeenCalledWith('login')
    expect(screen.queryByText('서울 CC')).not.toBeInTheDocument()
  })

  it('로그인했지만 구독하지 않은 상태에서 알림을 열면 구독 안내를 표시한다', () => {
    mockUseSubscription.mockReturnValue({ data: null, isLoading: false })

    render(<NotificationBell />)
    fireEvent.click(screen.getByLabelText('알림'))

    expect(mockShowAccessNotice).toHaveBeenCalledWith('subscription')
    expect(screen.queryByText('서울 CC')).not.toBeInTheDocument()
  })
})
