import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const AttendanceRecordsPage = lazy(() =>
  import('@/modules/attendance/pages/AttendanceRecordsPage').then((m) => ({ default: m.AttendanceRecordsPage })),
)

export const Route = createFileRoute('/_app/attendance/records/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <AttendanceRecordsPage />
    </Suspense>
  ),
})
