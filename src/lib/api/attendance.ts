import type { z } from 'zod'
import { apiClient } from './client'
import { attendanceResultSchema, attendanceStatusSchema, participantCountSchema } from './schemas'

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>
export type AttendanceResult = z.infer<typeof attendanceResultSchema>
export type ParticipantCount = z.infer<typeof participantCountSchema>

export const ATTENDANCE_STATUS_KEY = '/api/v1/attendances/me'
export const PARTICIPANT_COUNT_KEY = '/api/v1/attendances/participants/today'

export const attendanceApi = {
  getMyStatus(): Promise<AttendanceStatus> {
    return apiClient.get(ATTENDANCE_STATUS_KEY, attendanceStatusSchema)
  },

  attend(): Promise<AttendanceResult> {
    return apiClient.post('/api/v1/attendances', {}, attendanceResultSchema)
  },

  getTodayParticipants(): Promise<ParticipantCount> {
    return apiClient.get(PARTICIPANT_COUNT_KEY, participantCountSchema)
  },
}
