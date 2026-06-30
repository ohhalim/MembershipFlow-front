'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { SideNav } from '@/components/layout/SideNav'
import { MarketSidebar } from '@/components/layout/MarketSidebar'
import { auth } from '@/lib/auth'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace('/')
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true)
    }
  }, [router])

  if (!checked) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데스크톱 좌측 사이드 네비 */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-52 bg-white border-r border-gray-100 z-10">
        <SideNav />
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="
        max-w-md mx-auto bg-white min-h-screen pb-20
        lg:max-w-none lg:ml-52 lg:mr-72 lg:pb-0 lg:min-h-screen lg:border-x lg:border-gray-100
      ">
        {children}
      </main>

      {/* 데스크톱 우측 마켓 사이드바 */}
      <aside className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 overflow-y-auto z-10">
        <MarketSidebar />
      </aside>

      {/* 모바일 하단 탭 */}
      <BottomTabBar />
    </div>
  )
}
