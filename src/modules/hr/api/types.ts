import type { UUID, DateTimeString, DateString } from '@/api/types/common'

export type EmploymentType =
  | 'PERMANENT' | 'FIXED_TERM' | 'INTERN' | 'APPRENTICE'
  | 'FREELANCER' | 'AGENCY_WORKER' | 'CONSULTANT'

export type WorkLocation = 'OFFICE' | 'REMOTE' | 'HYBRID' | 'FIELD'

export interface HrEmployee {
  id: UUID
  company: UUID
  employee_number: string
  first_name: string
  last_name: string
  full_name: string
  legal_name: string | null
  employment_type: EmploymentType
  position: UUID | null
  position_name: string | null
  department: UUID | null
  department_name: string | null
  org_unit: UUID | null
  manager: UUID | null
  manager_name: string | null
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' | null
  date_of_birth: DateString | null
  date_of_join: DateString
  date_of_retirement: DateString | null
  work_email: string
  personal_email: string | null
  phone: string | null
  work_location: WorkLocation
  is_active: boolean
  is_manager: boolean
  avatar_url: string | null
  user: UUID | null
  created_at: DateTimeString
}

export interface HrDepartment {
  id: UUID
  company: UUID
  name: string
  code: string
  parent: UUID | null
  parent_name: string | null
  manager: UUID | null
  manager_name: string | null
  employee_count: number
  is_active: boolean
}

export interface HrPosition {
  id: UUID
  company: UUID
  name: string
  code: string
  department: UUID | null
  department_name: string | null
  is_active: boolean
}

export interface HrLeaveRequest {
  id: UUID
  employee: UUID
  employee_name: string
  leave_type: UUID
  leave_type_name: string
  company: UUID
  request_date_from: DateString
  request_date_to: DateString
  number_of_days: string
  state: 'DRAFT' | 'CONFIRM' | 'APPROVED' | 'REFUSED'
  name: string | null
  notes: string | null
  manager_id: UUID | null
  created_at: DateTimeString
}

export interface HrLeaveAllocation {
  id: UUID
  employee: UUID
  employee_name: string
  leave_type: UUID
  leave_type_name: string
  company: UUID
  number_of_days: string
  state: 'DRAFT' | 'CONFIRMED'
  validity_start: DateString | null
  validity_stop: DateString | null
}

export interface HrLeaveType {
  id: UUID
  company: UUID
  name: string
  validation: 'NO_VALIDATION' | 'MANAGER' | 'HR'
  carryover_allowance: string
  is_active: boolean
}

export interface HrPerformanceCycle {
  id: UUID
  company: UUID
  name: string
  cycle_type: 'ANNUAL' | 'QUARTERLY'
  start_date: DateString
  end_date: DateString
  state: 'DRAFT' | 'ACTIVE' | 'COMPLETED'
}

export interface HrGoal {
  id: UUID
  employee: UUID
  employee_name: string
  cycle: UUID
  cycle_name: string
  name: string
  state: 'DRAFT' | 'STARTED' | 'ACHIEVED' | 'FAILED'
  target_value: string
  actual_value: string
  start_date: DateString
  due_date: DateString
}

export interface HrAppraisal {
  id: UUID
  employee: UUID
  employee_name: string
  appraisee: UUID
  cycle: UUID
  cycle_name: string
  state: 'DRAFT' | 'SUBMITTED' | 'APPROVED'
  rating: string | null
  feedback: string | null
  created_at: DateTimeString
}

export interface HrOnboardingRecord {
  id: UUID
  employee: UUID
  employee_name: string
  template: UUID
  template_name: string
  state: 'IN_PROGRESS' | 'COMPLETED'
  task_count: number
  completed_task_count: number
}

export interface HrSkill {
  id: UUID
  name: string
  code: string
  category: UUID
  category_name: string
  is_active: boolean
}
