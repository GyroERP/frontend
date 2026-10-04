import { useState } from 'react'
import { Button, Modal, Space } from 'antd'
import type { ButtonProps } from 'antd'

export type GyroButtonVariant =
  | 'primary'
  | 'default'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-ghost'
  | 'link'

function mapButtonProps(variant?: GyroButtonVariant): Pick<ButtonProps, 'type' | 'danger'> {
  switch (variant) {
    case 'danger':
      return { type: 'primary', danger: true }
    case 'danger-ghost':
      return { type: 'text', danger: true }
    case 'secondary':
    case 'default':
      return { type: 'default' }
    case 'ghost':
      return { type: 'text' }
    case 'link':
      return { type: 'link' }
    default:
      return { type: 'primary' }
  }
}

export interface StateTransition {
  label: string
  action: () => Promise<void>
  variant?: GyroButtonVariant
  confirmMessage?: string
  confirmTitle?: string
  size?: ButtonProps['size']
}

interface StateTransitionButtonProps {
  transitions: StateTransition[]
  disabled?: boolean
}

export function StateTransitionButton({ transitions, disabled }: StateTransitionButtonProps) {
  const [pending, setPending] = useState<string | null>(null)

  async function execute(t: StateTransition) {
    setPending(t.label)
    try {
      await t.action()
    } finally {
      setPending(null)
    }
  }

  function handleClick(t: StateTransition) {
    if (t.confirmMessage) {
      Modal.confirm({
        title: t.confirmTitle ?? 'Confirm action',
        content: t.confirmMessage,
        okText: t.label,
        okButtonProps: { danger: t.variant === 'danger' || t.variant === 'danger-ghost' },
        onOk: () => execute(t),
      })
    } else {
      void execute(t)
    }
  }

  return (
    <Space wrap>
      {transitions.map((t) => {
        const btnProps = mapButtonProps(t.variant ?? 'primary')
        return (
          <Button
            key={t.label}
            {...btnProps}
            size={t.size ?? 'small'}
            loading={pending === t.label}
            disabled={disabled || (pending !== null && pending !== t.label)}
            onClick={() => handleClick(t)}
          >
            {t.label}
          </Button>
        )
      })}
    </Space>
  )
}
