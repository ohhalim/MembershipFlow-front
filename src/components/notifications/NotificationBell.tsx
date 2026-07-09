'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/utils'
import { useAlertContext } from './AlertContext'
import type { Alert } from '@/lib/types'

interface NotificationBellProps {
  /** sidenav: 데스크톱 사이드바용 아이콘 버튼 / bottombar: 모바일 하단 탭바용 아이콘+라벨 버튼 */
  variant?: 'sidenav' | 'bottombar'
}

export function NotificationBell({ variant = 'sidenav' }: NotificationBellProps) {
  const { alerts, unreadCount, markRead } = useAlertContext()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSelect(alert: Alert) {
    setOpen(false)
    if (alert.readAt == null) {
      await markRead(alert.id)
    }
    router.push(`/courses/${alert.courseId}`)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="알림"
        className={cn(
          'transition-colors',
          variant === 'sidenav'
            ? 'flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            : 'w-full flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-600',
        )}
      >
        <span className="relative inline-flex">
          <Bell size={variant === 'sidenav' ? 18 : 22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        {variant === 'bottombar' && <span>알림</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-50 w-72 max-h-96 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-lg',
              variant === 'sidenav' ? 'left-0 top-full mt-2' : 'right-0 bottom-full mb-2',
            )}
          >
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-900">알림</p>
            </div>
            {alerts.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-400">알림이 없습니다</p>
            ) : (
              <ul>
                {alerts.map((alert) => (
                  <li key={alert.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(alert)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col gap-0.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="flex items-center gap-1.5">
                        {alert.readAt == null && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {alert.courseName}
                        </span>
                      </span>
                      <span className="text-xs text-gray-500">
                        목표가 도달 · {formatPrice(alert.triggeredPrice)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
