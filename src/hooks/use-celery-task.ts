import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

type TaskStatus = 'PENDING' | 'STARTED' | 'RETRY' | 'SUCCESS' | 'FAILURE'

interface CeleryTaskResult {
  task_id: string
  status: TaskStatus
  result: unknown
  traceback: string | null
}

/**
 * Poll a Celery task result via django-celery-results.
 * Automatically stops polling when the task reaches a terminal state.
 *
 * @example
 * const { data, isPolling } = useCeleryTask(taskId)
 */
export function useCeleryTask(taskId: string | null) {
  return useQuery({
    queryKey: ['celery-task', taskId],
    queryFn: async () => {
      const res = await apiClient.get<CeleryTaskResult>(`/kernel/tasks/${taskId}/`)
      return res.data
    },
    enabled: !!taskId,
    // Poll every 2 seconds while pending/started; stop when done
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'SUCCESS' || status === 'FAILURE') return false
      return 2000
    },
    refetchIntervalInBackground: true,
  })
}
