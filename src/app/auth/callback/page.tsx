'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
import { auth } from '@/lib/auth'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      auth.setToken(token)
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
