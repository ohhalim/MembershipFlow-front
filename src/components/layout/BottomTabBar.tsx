'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Heart, User } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { href: '/',          label: '홈',   Icon: Home },
  { href: '/ranking',   label: '랭킹', Icon: BarChart2 },
  { href: '/watchlist', label: '관심', Icon: Heart },
  { href: '/my',        label: 'MY',   Icon: User },
] as const

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100">
      <ul className="flex">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                  active ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Icon size={22} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
