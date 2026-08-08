'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useMySubscription } from '@/lib/hooks/useSubscription'

type AccessRequirement = 'login' | 'subscription'

interface AccessNotice {
  requirement: AccessRequirement
  title: string
  message: string
  href: string
  actionLabel: string
}

interface AccessGateContextValue {
  showAccessNotice: (requirement: AccessRequirement) => void
}

const AccessGateContext = createContext<AccessGateContextValue>({
  showAccessNotice: () => {},
})

const NOTICE_BY_REQUIREMENT: Record<AccessRequirement, Omit<AccessNotice, 'requirement'>> = {
  login: {
    title: '로그인이 필요해요',
    message: '관심 종목과 목표가 알림을 이용하려면 먼저 로그인해 주세요.',
    href: '/login',
    actionLabel: '로그인하기',
  },
  subscription: {
    title: '구독이 필요해요',
    message: '관심 종목과 목표가 알림은 구독 후 이용할 수 있어요.',
    href: '/my/subscription',
    actionLabel: '구독하기',
  },
}

export function AccessGateProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<AccessNotice | null>(null)

  const showAccessNotice = useCallback((requirement: AccessRequirement) => {
    setNotice({ requirement, ...NOTICE_BY_REQUIREMENT[requirement] })
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  return (
    <AccessGateContext.Provider value={{ showAccessNotice }}>
      {children}
      {notice && (
        <div className="fixed top-4 inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
          <div role="status" className="pointer-events-auto w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{notice.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{notice.message}</p>
            </div>
            <Link
              href={notice.href}
              className="shrink-0 rounded-lg bg-blue-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
            >
              {notice.actionLabel}
            </Link>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="안내 닫기"
              className="shrink-0 p-0.5 text-gray-300 hover:text-gray-500"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </AccessGateContext.Provider>
  )
}

export function useAccessGate() {
  return useContext(AccessGateContext)
}

interface ProtectedNavLinkProps {
  href: string
  label: string
  active: boolean
  requiresSubscription?: boolean
  className: string
  children: ReactNode
}

export function ProtectedNavLink({
  href,
  label,
  active,
  requiresSubscription = false,
  className,
  children,
}: ProtectedNavLinkProps) {
  const { authStatus, isAuthenticated } = useAuth()
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription(
    requiresSubscription && authStatus === 'authenticated',
  )
  const { showAccessNotice } = useAccessGate()

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (authStatus === 'checking') {
      event.preventDefault()
      return
    }
    if (authStatus === 'unavailable' || !isAuthenticated) {
      event.preventDefault()
      showAccessNotice('login')
      return
    }
    if (requiresSubscription && (subscriptionLoading || !subscription?.serviceActive)) {
      event.preventDefault()
      if (!subscriptionLoading) showAccessNotice('subscription')
    }
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  )
}

export function AccessRequirementState({ requirement }: { requirement: AccessRequirement }) {
  const notice = NOTICE_BY_REQUIREMENT[requirement]

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <p className="text-base font-bold text-gray-900">{notice.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{notice.message}</p>
      <Link
        href={notice.href}
        className="mt-5 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
      >
        {notice.actionLabel}
      </Link>
    </div>
  )
}
