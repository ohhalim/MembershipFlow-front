import type { ApiErrorBody } from '@/lib/types'
import type { ZodType } from 'zod'
import { parseApiResponse } from './contract'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RefreshResult {
  ok: boolean
  /** 네트워크 오류처럼 HTTP 상태를 확인할 수 없으면 null */
  status: number | null
}

let refreshPromise: Promise<RefreshResult> | null = null

/**
 * refresh_token 쿠키로 access_token 쿠키를 재발급받는다.
 * 성공 시 서버가 Set-Cookie로 새 access_token을 내려주므로 응답 본문은 쓰지 않는다.
 */
export function refreshSession(): Promise<RefreshResult> {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => ({ ok: res.ok, status: res.status }))
    .catch(() => ({ ok: false, status: null }))
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
  schema?: ZodType<T>,
): Promise<T> {
  // 인증은 HttpOnly access_token 쿠키로 처리된다 (fe#50) — credentials: 'include' 필수
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (res.status === 401 && retry) {
    // 인증 상태 조회(fetchMe)와 일반 API 요청이 동시에 만료를 발견해도
    // 하나의 refresh 요청을 공유한다. refresh token rotation으로 인해
    // 두 번째 요청이 기존 토큰을 다시 사용하는 경쟁 상태를 방지한다.
    const refreshed = await refreshSession()
    if (!refreshed.ok) {
      if (refreshed.status === 401 || refreshed.status === 403) {
        if (typeof window !== 'undefined') window.location.href = '/login'
        throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      }

      throw new ApiError(
        refreshed.status ?? 503,
        'AUTH_REFRESH_UNAVAILABLE',
        '로그인 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요',
      )
    }

    return request<T>(path, init, false, schema)
  }

  if (!res.ok) {
    const body: ApiErrorBody = await res.json().catch(() => ({
      code: 'UNKNOWN',
      message: res.statusText,
      status: res.status,
    }))
    throw new ApiError(res.status, body.code, body.message)
  }

  if (res.status === 204) return undefined as T
  const data: unknown = await res.json()
  return schema ? parseApiResponse(data, schema, path) : data as T
}

export const apiClient = {
  get<T>(path: string, schema?: ZodType<T>): Promise<T> {
    return request<T>(path, {}, true, schema)
  },
  post<T>(path: string, body: unknown, schema?: ZodType<T>): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, true, schema)
  },
  put<T>(path: string, body: unknown, schema?: ZodType<T>): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, true, schema)
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string, schema?: ZodType<T>): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, true, schema)
  },
}
