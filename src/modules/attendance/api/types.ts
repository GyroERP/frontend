import type { UUID, DateTimeString, DateString, DecimalString } from '@/api/types/common'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'ON_LEAVE'
export type TimesheetState = 'DRAFT' | 'SUBMITTED' | 'APPROVED'
export type OvertimeState = 'DRAFT' | 'SUBMITTED' | 'APPROVED'

export interface AttWorkSchedule {
  id: UUID
  company: UUID
  name: string
  employee: UUID | null
  employee_name: string | null
  is_active: boolean
}

export interface AttShift {
  id: UUID
  schedule: UUID
  employee: UUID
  employee_name: string
  name: string
  date_from: DateString
  date_to: DateString
  start_time: string    // 'HH:MM'
  end_time: string      // 'HH:MM'
}

export interface AttAttendanceRecord {
  id: UUID
  employee: UUID
  employee_name: string
  date: DateString
  check_in: DateTimeString | null
  check_out: DateTimeString | null
  worked_hours: DecimalString
  overtime: DecimalString
  status: AttendanceStatus
}

export interface AttTimesheet {
  id: UUID
  employee: UUID
  employee_name: string
  date_from: DateString
  date_to: DateString
  state: TimesheetState
  total_hours: DecimalString
  line_count: number
}

export interface AttTimesheetLine {
  id: UUID
  timesheet: UUID
  date: DateString
  hours: DecimalString
  task: string | null
  project: UUID | null
  project_name: string | null
}

export interface AttOvertimeRequest {
  id: UUID
  employee: UUID
  employee_name: string
  from_date: DateTimeString
  to_date: DateTimeString
  hours: DecimalString
  reason: string | null
  state: OvertimeState
  created_at: DateTimeString
}

/** Analytics endpoint response shapes */
export interface AttendanceSummaryData {
  date: DateString
  present: number
  absent: number
  late: number
  on_leave: number
}

export interface LaborCostData {
  department: string
  budget: DecimalString
  actual: DecimalString
  variance: DecimalString
}

export interface OvertimeRiskData {
  employee: string
  department: string
  overtime_hours: DecimalString
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
}
