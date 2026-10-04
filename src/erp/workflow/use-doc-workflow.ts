import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import type { StateTransition, GyroButtonVariant } from '@/erp/display/StateTransitionButton'

export interface DocWorkflowAction {
  label: string
  action: string
  variant?: GyroButtonVariant
  confirm?: string
  confirmTitle?: string
}

export interface DocWorkflowState {
  label: string
  description?: string
  actions?: DocWorkflowAction[]
}

interface DocWorkflowConfig<S extends string> {
  current: S
  states: Record<S, DocWorkflowState>
  steps?: S[]
  endpoint: (action: string) => string
  invalidates: QueryKey[]
  successMessage?: (action: string) => string
  beforeAction?: (action: string) => Promise<void>
}

export function useDocWorkflow<S extends string>(config: DocWorkflowConfig<S>) {
  const queryClient = useQueryClient()
  const stateDef = config.states[config.current]

  async function run(action: string) {
    try {
      await config.beforeAction?.(action)
      await apiClient.post(config.endpoint(action))
      notify.success(config.successMessage?.(action) ?? 'Action completed')
      for (const key of config.invalidates) {
        void queryClient.invalidateQueries({ queryKey: key })
      }
    } catch (err) {
      notify.error(extractErrorMessage(err))
      throw err
    }
  }

  const transitions: StateTransition[] = (stateDef?.actions ?? []).map((a) => ({
    label: a.label,
    variant: a.variant ?? 'primary',
    confirmMessage: a.confirm,
    confirmTitle: a.confirmTitle,
    action: () => run(a.action),
  }))

  const steps = (config.steps ?? []).map((key) => ({
    key,
    label: config.states[key]?.label ?? key,
    description: config.states[key]?.description,
  }))

  return {
    transitions,
    description: stateDef?.description,
    steps,
    currentLabel: stateDef?.label ?? config.current,
  }
}
