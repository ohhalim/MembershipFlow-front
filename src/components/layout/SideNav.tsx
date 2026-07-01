'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Heart, User } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { href: '/home',      label: '홈',   Icon: Home },
  { href: '/ranking',   label: '랭킹', Icon: BarChart2 },
  { href: '/watchlist', label: '관심', Icon: Heart },
  { href: '/my',        label: 'MY',   Icon: User },
] as const

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full px-3 py-6">
      <div className="px-3 mb-8">
        <p className="text-base font-bold text-gray-900">MembershipFlow</p>
        <p className="text-xs text-gray-400 mt-0.5">골프 회원권 시세 추적</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
