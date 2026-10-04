import { useMemo, useState } from 'react'
import { useRouter, Link, type ErrorComponentProps } from '@tanstack/react-router'
import {
  CopyOutlined,
  ExpandOutlined,
  HomeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Card, Modal, Result, Space, Typography } from 'antd'
import { notify } from '@/lib/notify'

function formatError(error: unknown): { message: string; stack?: string; fullText: string } {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  const fullText = stack ? `${message}\n\n${stack}` : message
  return { message, stack, fullText }
}

export function ModuleErrorFallback({ error }: ErrorComponentProps) {
  const router = useRouter()
  const [showDetail, setShowDetail] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  const { message, stack, fullText } = useMemo(() => formatError(error), [error])

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      notify.success('Error copied to clipboard')
    } catch {
      notify.error('Could not copy — select the text manually')
    }
  }

  const detailBlock = (
    <pre className="text-left text-[11px] leading-relaxed text-red-700 bg-red-50 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-words m-0">
      {message}
      {stack ? `\n\n${stack}` : ''}
    </pre>
  )

  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-lg w-full">
        <Result
          status="error"
          title="This module hit an error"
          subTitle="The rest of GyroERP keeps running — switch to another module from the sidebar while this one is being fixed."
          extra={
            <>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  void router.invalidate()
                }}
              >
                Retry
              </Button>
              <Link to="/">
                <Button icon={<HomeOutlined />}>Back to Dashboard</Button>
              </Link>
            </>
          }
        />
        <Space wrap className="w-full justify-between mb-2">
          <Button type="link" size="small" className="!px-0" onClick={() => setShowDetail((v) => !v)}>
            {showDetail ? 'Hide' : 'Show'} technical details
          </Button>
          {showDetail && (
            <Space size="small">
              <Button size="small" icon={<CopyOutlined />} onClick={() => void copyError()}>
                Copy error
              </Button>
              <Button size="small" icon={<ExpandOutlined />} onClick={() => setFullscreenOpen(true)}>
                View full screen
              </Button>
            </Space>
          )}
        </Space>
        {showDetail && (
          <Typography.Paragraph className="!mb-0">
            <div className="max-h-48 overflow-auto">{detailBlock}</div>
          </Typography.Paragraph>
        )}
      </Card>

      <Modal
        title="Error details"
        open={fullscreenOpen}
        onCancel={() => setFullscreenOpen(false)}
        width="min(960px, 96vw)"
        footer={
          <Space>
            <Button icon={<CopyOutlined />} onClick={() => void copyError()}>
              Copy error
            </Button>
            <Button type="primary" onClick={() => setFullscreenOpen(false)}>
              Close
            </Button>
          </Space>
        }
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        {detailBlock}
      </Modal>
    </div>
  )
}
