'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, Bell, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { auth } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

const FEATURES = [
  { Icon: BarChart2, title: '시세 차트', desc: '동부·동아\n통합 조회' },
  { Icon: Bell,      title: '목표가 알림', desc: '원하는 가격에\n바로 알림' },
  { Icon: TrendingUp, title: '실시간 랭킹', desc: '상승·하락\n순위 확인' },
] as const

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated()) router.replace('/')
  }, [router])

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-10 text-center">
        <p className="text-sm text-gray-500 mb-1">여러 거래소 시세를 한 번에</p>
        <p className="text-xs text-gray-400 mb-10">목표가 도달 시 즉시 알림</p>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">MembershipFlow</h1>
        <p className="text-sm text-gray-500 mb-12">회원권 시세를 한눈에, 목표가 알림까지</p>

        {/* Feature icons */}
        <div className="flex justify-center gap-10 mb-14">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Icon size={22} className="text-gray-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700">{title}</p>
              <p className="text-[10px] text-gray-400 text-center whitespace-pre-line">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 space-y-3">
        <Button fullWidth size="lg" onClick={handleGoogleLogin} className="gap-2">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Google로 계속하기
        </Button>
        <p className="text-[10px] text-center text-gray-400">
          로그인 시 이용약관 및 개인정보처리방침에 동의합니다.
        </p>
      </div>
    </div>
  )
}
