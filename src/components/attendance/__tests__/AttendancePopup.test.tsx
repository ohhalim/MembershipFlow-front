import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { AttendancePopup, SHOWN_KEY } from '../AttendancePopup'
import { ApiError } from '@/lib/api/client'
import type { AttendanceStatus } from '@/lib/api/attendance'

const mockUseAuth = jest.fn()
jest.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockGetMySubscription = jest.fn()
jest.mock('@/lib/api/subscription', () => ({
  subscriptionApi: {
    getMySubscription: () => mockGetMySubscription(),
  },
}))

const mockGetMyStatus = jest.fn()
const mockAttend = jest.fn()
const mockGetTodayParticipants = jest.fn()
jest.mock('@/lib/api/attendance', () => ({
  ...jest.requireActual('@/lib/api/attendance'),
  attendanceApi: {
    getMyStatus: () => mockGetMyStatus(),
    attend: () => mockAttend(),
    getTodayParticipants: () => mockGetTodayParticipants(),
  },
}))

function status(overrides: Partial<AttendanceStatus> = {}): AttendanceStatus {
  return {
    attendedToday: false,
    dayNo: 0,
    couponCount: 0,
    couponLimitReached: false,
    inPeriod: true,
    ...overrides,
  }
}

function loggedIn() {
  mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
  mockGetMySubscription.mockRejectedValue(new ApiError(404, 'SUBSCRIPTION_NOT_FOUND', '구독 없음'))
}

function todayKst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function renderPopup() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AttendancePopup />
    </SWRConfig>,
  )
}

describe('AttendancePopup', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
    mockGetTodayParticipants.mockResolvedValue({ count: 42, inPeriod: true })
  })

  it('처음 들어오면 팝업을 띄운다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status({ dayNo: 3 }))

    renderPopup()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/3일째/)).toBeInTheDocument()
    expect(screen.getByLabelText('3일째 출석 완료')).toBeInTheDocument()
    expect(screen.getByLabelText('4일째')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('비로그인이면 로그인 유도 버튼을 보여준다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

    renderPopup()

    expect(await screen.findByRole('button', { name: '로그인하고 출석 시작하기' })).toBeInTheDocument()
    expect(mockGetMyStatus).not.toHaveBeenCalled()
  })

  it('하루에 한 번만 띄운다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())

    const { unmount } = renderPopup()
    await screen.findByRole('dialog')
    expect(localStorage.getItem(SHOWN_KEY)).toBe(todayKst())

    unmount()
    renderPopup()
    await waitFor(() => expect(mockGetMyStatus).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('어제 띄웠으면 오늘 다시 띄운다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())
    localStorage.setItem(SHOWN_KEY, '2000-01-01')

    renderPopup()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('닫기 버튼으로 닫는다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())

    renderPopup()
    fireEvent.click(await screen.findByRole('button', { name: '닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('Esc로 닫을 수 있다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())

    renderPopup()
    await screen.findByRole('dialog')
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('오늘 이미 출석했으면 띄우지 않는다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status({ attendedToday: true, dayNo: 2 }))

    renderPopup()

    await waitFor(() => expect(mockGetMyStatus).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('할인권 2장을 모두 받았으면 띄우지 않는다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status({ couponCount: 2, couponLimitReached: true }))

    renderPopup()

    await waitFor(() => expect(mockGetMyStatus).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('이벤트 기간이 아니면 띄우지 않는다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })
    mockGetTodayParticipants.mockResolvedValue({ count: 0, inPeriod: false })

    renderPopup()

    await waitFor(() => expect(mockGetTodayParticipants).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('구독자에게는 띄우지 않는다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
    mockGetMySubscription.mockResolvedValue({ serviceActive: true })
    mockGetMyStatus.mockResolvedValue(status())

    renderPopup()

    await waitFor(() => expect(mockGetMySubscription).toHaveBeenCalled())
    await waitFor(() => expect(mockGetMyStatus).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('출석하면 버튼이 내일 또 만나요로 바뀌고 팝업은 열려 있다', async () => {
    loggedIn()
    mockGetMyStatus
      .mockResolvedValueOnce(status({ dayNo: 2 }))
      .mockResolvedValue(status({ attendedToday: true, dayNo: 3 }))
    mockAttend.mockResolvedValue({ attendDate: '2026-11-10', dayNo: 3, streakBroken: false })

    renderPopup()
    fireEvent.click(await screen.findByRole('button', { name: '출석하기' }))

    expect(await screen.findByRole('button', { name: '내일 또 만나요' })).toBeDisabled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('끊긴 뒤 첫 출석이면 끊김 안내를 보여준다', async () => {
    loggedIn()
    mockGetMyStatus
      .mockResolvedValueOnce(status())
      .mockResolvedValue(status({ attendedToday: true, dayNo: 1 }))
    mockAttend.mockResolvedValue({ attendDate: '2026-11-10', dayNo: 1, streakBroken: true })

    renderPopup()
    fireEvent.click(await screen.findByRole('button', { name: '출석하기' }))

    expect(await screen.findByText(/아쉽게도 연속 기록이 끊겼어요/)).toBeInTheDocument()
  })

  it('7일째 출석하면 같은 팝업에서 축하 화면으로 바뀐다', async () => {
    loggedIn()
    mockGetMyStatus
      .mockResolvedValueOnce(status({ dayNo: 6 }))
      .mockResolvedValue(status({ attendedToday: true, dayNo: 7, couponCount: 1 }))
    mockAttend.mockResolvedValue({ attendDate: '2026-11-10', dayNo: 7, streakBroken: false })

    renderPopup()
    fireEvent.click(await screen.findByRole('button', { name: '출석하기' }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('7일 연속 출석 달성!')).toBeInTheDocument()
    expect(dialog).toHaveTextContent('결제 오픈 후 사용 가능')
    fireEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('출석 요청 중에는 버튼을 다시 누를 수 없다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())
    let resolveAttend: (value: unknown) => void = () => {}
    mockAttend.mockReturnValue(new Promise((resolve) => { resolveAttend = resolve }))

    renderPopup()
    const button = await screen.findByRole('button', { name: '출석하기' })
    fireEvent.click(button)
    fireEvent.click(button)

    expect(screen.getByRole('button', { name: '출석하는 중...' })).toBeDisabled()
    expect(mockAttend).toHaveBeenCalledTimes(1)
    resolveAttend({ attendDate: '2026-11-10', dayNo: 1, streakBroken: false })
    await waitFor(() => expect(screen.queryByText('출석하는 중...')).not.toBeInTheDocument())
  })

  it('알 수 없는 오류면 다시 시도 안내를 보여준다', async () => {
    loggedIn()
    mockGetMyStatus.mockResolvedValue(status())
    mockAttend.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'boom'))

    renderPopup()
    fireEvent.click(await screen.findByRole('button', { name: '출석하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('잠시 후 다시 시도해 주세요')
  })
})
