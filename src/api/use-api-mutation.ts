/**
 * useApiMutation — useMutation with the standard GyroERP behavior baked in:
 * success toast, cache invalidation, and normalized error toasts.
 */
import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { extractErrorMessage } from './client'

interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, unknown, TVariables>, 'onSuccess' | 'onError'> {
  success?: string | ((data: TData, variables: TVariables) => string)
  invalidates?: QueryKey[] | ((variables: TVariables, data: TData) => QueryKey[])
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: unknown, variables: TVariables) => void
}

export function useApiMutation<TData = unknown, TVariables = void>(
  options: ApiMutationOptions<TData, TVariables>,
) {
  const { success, invalidates, onSuccess, onError, ...rest } = options
  const queryClient = useQueryClient()

  return useMutation<TData, unknown, TVariables>({
    ...rest,
    onSuccess: (data, variables) => {
      if (success) {
        notify.success(typeof success === 'function' ? success(data, variables) : success)
      }
      const keys =
        typeof invalidates === 'function' ? invalidates(variables, data) : invalidates
      for (const key of keys ?? []) {
        void queryClient.invalidateQueries({ queryKey: key })
      }
      onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      if (onError) onError(error, variables)
      else notify.error(extractErrorMessage(error))
    },
  })
}
