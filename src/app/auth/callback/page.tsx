'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 토큰은 백엔드가 HttpOnly 쿠키로 발급한다 (fe#49) — 여기서는 성공 여부만 보고 이동.
    // URL에 병행 발급 중인 ?token=은 읽지도 저장하지도 않는다.
    if (searchParams.get('success') === 'true') {
      router.replace('/home')
    } else {
      router.replace('/login')
    }
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="w-32 h-4" />
      <p className="text-sm text-gray-400">로그인 처리 중...</p>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
