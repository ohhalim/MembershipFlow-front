import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import { fetchMe, useAuth } from '../auth'

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

  it('401 외의 실패는 refresh 없이 null을 반환한다', async () => {
    mockFetch.mockResolvedValueOnce(response(500))

    await expect(fetchMe()).resolves.toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(1)
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
