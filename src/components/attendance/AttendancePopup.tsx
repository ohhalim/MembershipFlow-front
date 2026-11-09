'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { Check, Gift, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api/client'
import { ATTENDANCE_STATUS_KEY, PARTICIPANT_COUNT_KEY, attendanceApi } from '@/lib/api/attendance'
import { useAttendanceStatus, useTodayParticipants } from '@/lib/hooks/useAttendance'
import { useMySubscription } from '@/lib/hooks/useSubscription'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const EVENT_DAYS = 7
export const SHOWN_KEY = 'attendance-popup-shown'

function todayKst(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function shownToday(): boolean {
  try {
    return localStorage.getItem(SHOWN_KEY) === todayKst()
  } catch {
    return false
  }
}

function rememberShown() {
  try {
    localStorage.setItem(SHOWN_KEY, todayKst())
  } catch {
    // 저장이 막힌 브라우저에서는 다음 방문 때 다시 뜬다
  }
}

export function AttendancePopup() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: participants } = useTodayParticipants()
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription(isAuthenticated)
  const { data: status, mutate: mutateStatus } = useAttendanceStatus(isAuthenticated)
  const { mutate } = useSWRConfig()

  const [phase, setPhase] = useState<'pending' | 'open' | 'closed'>('pending')
  const [submitting, setSubmitting] = useState(false)
  const [streakBroken, setStreakBroken] = useState(false)
  const [stampedDay, setStampedDay] = useState<number | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const ready = !authLoading && !!participants && (!isAuthenticated || (!subscriptionLoading && !!status))
  const eligible = ready
    && participants.inPeriod
    && (!isAuthenticated || (!subscription?.serviceActive && !!status?.inPeriod))
  const nothingToDo = !!status && (status.attendedToday || status.couponLimitReached)

  if (phase === 'pending' && ready) {
    setPhase(eligible && !nothingToDo && !shownToday() ? 'open' : 'closed')
  }
  const open = phase === 'open'

  useEffect(() => {
    if (open) rememberShown()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setPhase('closed')
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open || !participants) return null

  function close() {
    setPhase('closed')
  }

  async function handleAttend() {
    if (submitting) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const result = await attendanceApi.attend()
      setStreakBroken(result.streakBroken)
      setStampedDay(result.dayNo)
      if (result.dayNo === EVENT_DAYS) setCelebrating(true)
      await mutateStatus()
      void mutate(PARTICIPANT_COUNT_KEY)
    } catch (e) {
      if (e instanceof ApiError && e.code === 'FORBIDDEN') {
        setPhase('closed')
      } else if (e instanceof ApiError && (e.code === 'COUPON_LIMIT_REACHED' || e.code === 'ATTENDANCE_EVENT_NOT_IN_PERIOD')) {
        await mutate(ATTENDANCE_STATUS_KEY)
      } else {
        setErrorMessage('출석하지 못했어요. 잠시 후 다시 시도해 주세요')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const dayNo = status?.dayNo ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-popup-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        {celebrating ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Gift size={24} className="text-blue-500" />
            </div>
            <h2 id="attendance-popup-title" className="text-lg font-bold text-gray-900">7일 연속 출석 달성!</h2>
            <p className="mt-2 text-sm text-gray-700">구독 10% 할인권을 받았어요</p>
            {status && (
              <p className="mt-1 text-xs text-gray-500">이번 이벤트에서 받은 할인권 {status.couponCount}장 (최대 2장)</p>
            )}
            <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">할인권은 결제 오픈 후 사용 가능해요</p>
            <Button fullWidth className="mt-5" onClick={close}>확인</Button>
          </div>
        ) : (
          <>
            <h2 id="attendance-popup-title" className="text-base font-bold text-gray-900">7일 연속 출석 이벤트</h2>
            <p className="mt-1 mb-4 text-xs text-gray-500">
              7일 연속 출석하면 구독 10% 할인권을 드려요
              {dayNo > 0 && <span className="ml-1 font-semibold text-blue-600">· {dayNo}일째</span>}
            </p>

            <ol className="mb-4 grid grid-cols-7 gap-1.5" aria-label="출석 스탬프">
              {Array.from({ length: EVENT_DAYS }, (_, i) => i + 1).map((day) => {
                const stamped = day <= dayNo
                return (
                  <li
                    key={day}
                    aria-label={stamped ? `${day}일째 출석 완료` : `${day}일째`}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-full border text-[11px] font-semibold',
                      stamped ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-gray-50 text-gray-400',
                      stamped && day === stampedDay && 'animate-[stamp_0.35s_ease-out]',
                    )}
                  >
                    {stamped ? <Check size={14} /> : day}
                  </li>
                )
              })}
            </ol>

            {streakBroken && (
              <p role="status" className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                아쉽게도 연속 기록이 끊겼어요. 오늘부터 다시 1일째예요
              </p>
            )}
            {errorMessage && <p role="alert" className="mb-3 text-xs text-red-500">{errorMessage}</p>}

            {!isAuthenticated ? (
              <Button fullWidth onClick={() => { window.location.href = `${API_URL}/oauth2/authorization/google` }}>
                로그인하고 출석 시작하기
              </Button>
            ) : status?.couponLimitReached ? (
              <p className="rounded-xl bg-gray-50 py-2.5 text-center text-sm font-medium text-gray-600">
                이번 이벤트 할인권을 모두 받았어요
              </p>
            ) : status?.attendedToday ? (
              <Button fullWidth disabled>내일 또 만나요</Button>
            ) : (
              <Button fullWidth onClick={handleAttend} disabled={submitting}>
                {submitting ? '출석하는 중...' : '출석하기'}
              </Button>
            )}

            <p className="mt-3 text-center text-xs text-gray-500">
              지금 <b className="font-semibold text-gray-800">{participants.count.toLocaleString()}</b>명이 도전 중
            </p>
          </>
        )}
      </div>
    </div>
  )
}
