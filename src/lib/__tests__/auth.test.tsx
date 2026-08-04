import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import { fetchMe, useAuth } from '../auth'
import { ApiError, apiClient } from '../api/client'

const mockFetch = jest.fn()
const user = { id: 1, email: 'test@test.com', name: '테스터' }

function response(status: number, body?: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

/** 테스트마다 SWR 전역 캐시를 격리한다 */
function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
}

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch as unknown as typeof fetch
  localStorage.clear()
})

describe('fetchMe', () => {
  it('me 호출 성공 시 사용자 정보를 반환한다', async () => {
    mockFetch.mockResolvedValueOnce(response(200, user))

    await expect(fetchMe()).resolves.toEqual(user)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/me', { credentials: 'include' })
  })

  it('과거 localStorage 토큰(mf_token)을 정리한다 (fe#50)', async () => {
    localStorage.setItem('mf_token', 'legacy-jwt')
    mockFetch.mockResolvedValueOnce(response(200, user))

    await fetchMe()

    expect(localStorage.getItem('mf_token')).toBeNull()
  })

  it('401이면 refresh 후 me를 재시도한다 — 기존 localStorage 로그인 사용자의 쿠키 마이그레이션 경로', async () => {
    mockFetch
      .mockResolvedValueOnce(response(401)) // me: access_token 쿠키 없음
      .mockResolvedValueOnce(response(200, { accessToken: 'new' })) // refresh: Set-Cookie로 쿠키 발급
      .mockResolvedValueOnce(response(200, user)) // me 재시도

    await expect(fetchMe()).resolves.toEqual(user)
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
  })

  it('refresh까지 실패하면 null을 반환한다 (비로그인)', async () => {
    mockFetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401))

    await expect(fetchMe()).resolves.toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('401 외의 실패는 비로그인이 아니라 인증 서버 오류로 구분한다', async () => {
    mockFetch.mockResolvedValueOnce(response(500))

    await expect(fetchMe()).rejects.toMatchObject({
      status: 500,
      code: 'AUTH_REQUEST_FAILED',
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('refresh 5xx는 비로그인이 아니라 인증 서버 오류로 구분한다', async () => {
    mockFetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(503))

    await expect(fetchMe()).rejects.toMatchObject({
      status: 503,
      code: 'AUTH_REFRESH_UNAVAILABLE',
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('fetchMe와 보호 API 요청은 동시에 만료되어도 refresh 요청 하나를 공유한다', async () => {
    let meCalls = 0
    let watchlistCalls = 0
    let refreshCalls = 0

    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === '/api/v1/auth/me') {
        meCalls += 1
        return response(meCalls === 1 ? 401 : 200, user)
      }
      if (url === '/api/v1/watchlist') {
        watchlistCalls += 1
        return response(watchlistCalls === 1 ? 401 : 200, [])
      }
      if (url === '/api/v1/auth/refresh') {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 0))
        return response(204)
      }
      throw new Error(`unexpected request: ${url}`)
    })

    const [me, watchlist] = await Promise.all([
      fetchMe(),
      apiClient.get('/api/v1/watchlist'),
    ])

    expect(me).toEqual(user)
    expect(watchlist).toEqual([])
    expect(refreshCalls).toBe(1)
  })
})

describe('useAuth', () => {
  it('me 성공 시 isAuthenticated=true가 된다', async () => {
    mockFetch.mockResolvedValueOnce(response(200, user))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.user).toEqual(user)
  })

  it('미로그인(401)이면 isAuthenticated=false가 된다', async () => {
    mockFetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.authStatus).toBe('anonymous')
  })

  it('인증 API 5xx이면 인증 불가 상태로 유지한다', async () => {
    mockFetch.mockResolvedValueOnce(response(500))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.authStatus).toBe('unavailable'))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeInstanceOf(ApiError)
  })

  it('logout 호출 시 로그아웃 API를 호출하고 비로그인 상태가 된다', async () => {
    mockFetch.mockResolvedValueOnce(response(200, user))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    mockFetch.mockResolvedValueOnce(response(204))
    await act(async () => {
      await result.current.logout()
    })

    expect(mockFetch).toHaveBeenLastCalledWith('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    expect(result.current.isAuthenticated).toBe(false)
  })
})
