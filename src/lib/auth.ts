'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

/** fe#50 이전 localStorage 토큰 방식에서 쓰던 키 — 잔여 토큰 정리용으로만 유지 */
const LEGACY_TOKEN_KEY = 'mf_token'

export const AUTH_ME_KEY = '/api/v1/auth/me'

export interface AuthUser {
  id: number
  email: string
  name: string
}

/**
 * HttpOnly access_token 쿠키로 현재 로그인 사용자를 조회한다. 미로그인이면 null.
 *
 * access_token이 만료/부재(401)면 refresh_token 쿠키로 1회 갱신을 시도한다.
 * 기존 localStorage 로그인 사용자(access_token 쿠키 없음, refresh_token 쿠키만 보유)도
 * 이 refresh 경로에서 자연스럽게 access_token 쿠키를 발급받는다 — 별도 마이그레이션 불필요.
 */
export async function fetchMe(): Promise<AuthUser | null> {
  // 과거 방식으로 저장된 토큰은 더 이상 사용하지 않으므로 정리한다 (fe#50)
  if (typeof window !== 'undefined') localStorage.removeItem(LEGACY_TOKEN_KEY)

  const res = await fetch(`${BASE_URL}${AUTH_ME_KEY}`, { credentials: 'include' })
  if (res.ok) return res.json()
  if (res.status !== 401) return null

  const refreshed = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!refreshed.ok) return null

  const retry = await fetch(`${BASE_URL}${AUTH_ME_KEY}`, { credentials: 'include' })
  return retry.ok ? retry.json() : null
}

interface UseAuthResult {
  user: AuthUser | null
  /** 로그인 여부 — isLoading 동안은 false */
  isAuthenticated: boolean
  /** 최초 사용자 조회가 끝나기 전까지 true */
  isLoading: boolean
  /** 서버 세션(쿠키) 종료 후 클라이언트 인증 상태를 비운다 */
  logout: () => Promise<void>
}

/**
 * HttpOnly 쿠키 기반 로그인 상태 훅.
 * 쿠키는 JS로 읽을 수 없으므로 /api/v1/auth/me 호출 성공 여부로 판정한다 (fe#49/fe#50).
 */
export function useAuth(): UseAuthResult {
  const { data, isLoading, mutate } = useSWR<AuthUser | null>(AUTH_ME_KEY, fetchMe, {
    revalidateOnFocus: false,
  })

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      await mutate(null, false)
    }
  }, [mutate])

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    logout,
  }
}
