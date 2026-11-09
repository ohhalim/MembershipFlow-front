'use client'

import useSWR from 'swr'
import {
  ATTENDANCE_STATUS_KEY,
  PARTICIPANT_COUNT_KEY,
  attendanceApi,
  type AttendanceStatus,
  type ParticipantCount,
} from '@/lib/api/attendance'

const FIVE_MINUTES = 5 * 60 * 1000

export function useAttendanceStatus(enabled: boolean) {
  return useSWR<AttendanceStatus>(enabled ? ATTENDANCE_STATUS_KEY : null, attendanceApi.getMyStatus, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
}

export function useTodayParticipants() {
  return useSWR<ParticipantCount>(PARTICIPANT_COUNT_KEY, attendanceApi.getTodayParticipants, {
    refreshInterval: FIVE_MINUTES,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
}
