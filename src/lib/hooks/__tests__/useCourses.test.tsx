import { act, renderHook } from '@testing-library/react'
import useSWRInfinite from 'swr/infinite'
import { ApiError } from '@/lib/api/client'
import { ApiContractError } from '@/lib/api/contract'
import { shouldRetryCourseRequest, useCourseList } from '../useCourses'

jest.mock('swr/infinite', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockUseSWRInfinite = jest.mocked(useSWRInfinite)
const setSize = jest.fn()

describe('useCourseList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('첫 페이지 오류 상태에서 추가 페이지 요청을 차단한다', () => {
    mockUseSWRInfinite.mockReturnValue({
      data: undefined,
      size: 1,
      setSize,
      isLoading: false,
      isValidating: false,
      error: new ApiContractError('/api/v1/courses', ['content.0.region']),
    } as unknown as ReturnType<typeof useSWRInfinite>)

    const { result } = renderHook(() => useCourseList())

    expect(result.current.hasMore).toBe(false)
    act(() => result.current.loadMore())
    expect(setSize).not.toHaveBeenCalled()
  })

  it('정상 페이지의 다음 페이지만 요청한다', () => {
    mockUseSWRInfinite.mockReturnValue({
      data: [{ content: [], last: false, totalElements: 40 }],
      size: 1,
      setSize,
      isLoading: false,
      isValidating: false,
      error: undefined,
    } as unknown as ReturnType<typeof useSWRInfinite>)

    const { result } = renderHook(() => useCourseList())

    expect(result.current.hasMore).toBe(true)
    act(() => result.current.loadMore())
    expect(setSize).toHaveBeenCalledTimes(1)
    expect(setSize.mock.calls[0][0](1)).toBe(2)
  })
})

describe('shouldRetryCourseRequest', () => {
  it('429와 API 계약 오류는 재시도하지 않는다', () => {
    expect(shouldRetryCourseRequest(new ApiError(429, 'RATE_LIMITED', '요청 제한'))).toBe(false)
    expect(shouldRetryCourseRequest(new ApiContractError('/api/v1/courses', ['region']))).toBe(false)
    expect(shouldRetryCourseRequest(new ApiError(500, 'INTERNAL_ERROR', '서버 오류'))).toBe(true)
  })
})
