import type { ApiErrorBody } from '@/lib/types'

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

let isRefreshing = false
let refreshSubscribers: Array<(ok: boolean) => void> = []

function onRefreshDone(ok: boolean) {
  refreshSubscribers.forEach(cb => cb(ok))
  refreshSubscribers = []
}

/**
 * refresh_token 쿠키로 access_token 쿠키를 재발급받는다.
 * 성공 시 서버가 Set-Cookie로 새 access_token을 내려주므로 응답 본문은 쓰지 않는다.
 */
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
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
    if (!isRefreshing) {
      isRefreshing = true
      const refreshed = await tryRefresh()
      isRefreshing = false
      onRefreshDone(refreshed)

      if (!refreshed) {
        if (typeof window !== 'undefined') window.location.href = '/login'
        throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      }
      return request<T>(path, init, false)
    }

    // 이미 갱신 중이면 완료될 때까지 대기
    return new Promise<T>((resolve, reject) => {
      refreshSubscribers.push(ok => {
        if (!ok) {
          reject(new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다'))
        } else {
          resolve(request<T>(path, init, false))
        }
      })
    })
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
  return res.json() as Promise<T>
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
