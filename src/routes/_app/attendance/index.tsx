import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/attendance/')({
  beforeLoad: () => { throw redirect({ to: '/attendance/records' }) },
})
