import { auth } from '@/lib/auth'
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
let refreshSubscribers: Array<(token: string | null) => void> = []

function onRefreshDone(token: string | null) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      auth.clearToken()
      return null
    }
    const data: { accessToken: string } = await res.json()
    auth.setToken(data.accessToken)
    return data.accessToken
  } catch {
    auth.clearToken()
    return null
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = auth.getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await tryRefresh()
      isRefreshing = false
      onRefreshDone(newToken)

      if (!newToken) {
        if (typeof window !== 'undefined') window.location.href = '/login'
        throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      }
      return request<T>(path, init, false)
    }

    // 이미 갱신 중이면 완료될 때까지 대기
    return new Promise<T>((resolve, reject) => {
      refreshSubscribers.push(newToken => {
        if (!newToken) {
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
