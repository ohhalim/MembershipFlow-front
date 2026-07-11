'use client'

import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { courseDisplayTitle } from '@/lib/courseDisplay'
import type { Alert } from '@/lib/types'

export interface AlertToastItem {
  id: number
  alert: Alert
}

interface AlertToastStackProps {
  toasts: AlertToastItem[]
  onDismiss: (id: number) => void
}

export function AlertToastStack({ toasts, onDismiss }: AlertToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map(({ id, alert }) => (
        <div
          key={id}
          role="status"
          className="pointer-events-auto w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-lg px-4 py-3 flex items-start gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">목표가 알림</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {courseDisplayTitle(alert.courseName)} · {formatPrice(alert.triggeredPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(id)}
            aria-label="알림 닫기"
            className="p-0.5 text-gray-300 hover:text-gray-500 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
