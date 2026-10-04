import { Steps } from 'antd'
import { cn } from '@/lib/cn'

interface WorkflowStep {
  key: string
  label: string
  description?: string
}

interface WorkflowStatusBarProps {
  steps: WorkflowStep[]
  currentState: string
  className?: string
}

/**
 * Document workflow progress using antd Steps (accessible, responsive).
 */
export function WorkflowStatusBar({ steps, currentState, className }: WorkflowStatusBarProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === currentState),
  )

  return (
    <nav aria-label="Document progress" className={cn('w-full', className)}>
      <Steps
        size="small"
        responsive
        current={currentIndex}
        items={steps.map((step, i) => ({
          title: step.label,
          description: step.description,
          status:
            i < currentIndex ? 'finish' : i === currentIndex ? 'process' : 'wait',
        }))}
      />
    </nav>
  )
}
