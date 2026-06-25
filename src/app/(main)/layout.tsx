'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { auth } from '@/lib/auth'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto bg-white min-h-screen pb-20">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
