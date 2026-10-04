import { Component, type ReactNode, type ErrorInfo } from 'react'
import {
  CopyOutlined,
  ExpandOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Modal, Result, Space, Typography } from 'antd'
import { notify } from '@/lib/notify'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
  showDetail: boolean
  fullscreenOpen: boolean
}

function formatError(error: Error): { message: string; stack?: string; fullText: string } {
  const message = error.message
  const stack = error.stack
  const fullText = stack ? `${message}\n\n${stack}` : message
  return { message, stack, fullText }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, showDetail: false, fullscreenOpen: false }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info.componentStack)
    }
  }

  reset = () => this.setState({ error: null, showDetail: false, fullscreenOpen: false })

  copyError = async (fullText: string) => {
    try {
      await navigator.clipboard.writeText(fullText)
      notify.success('Error copied to clipboard')
    } catch {
      notify.error('Could not copy — select the text manually')
    }
  }

  render() {
    const { error, showDetail, fullscreenOpen } = this.state
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset)
      const { message, stack, fullText } = formatError(error)

      const detailBlock = (
        <pre className="text-left text-[11px] leading-relaxed text-red-700 bg-red-50 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-words m-0">
          {message}
          {stack ? `\n\n${stack}` : ''}
        </pre>
      )

      return (
        <>
          <Result
            status="error"
            title="Something went wrong"
            subTitle={error.message}
            extra={
              <Space wrap>
                <Button type="primary" icon={<ReloadOutlined />} onClick={this.reset}>
                  Try again
                </Button>
              </Space>
            }
          />
          <div className="max-w-lg mx-auto px-4 pb-8">
            <Space wrap className="w-full justify-between mb-2">
              <Button type="link" size="small" className="!px-0" onClick={() => this.setState({ showDetail: !showDetail })}>
                {showDetail ? 'Hide' : 'Show'} technical details
              </Button>
              {showDetail && (
                <Space size="small">
                  <Button size="small" icon={<CopyOutlined />} onClick={() => void this.copyError(fullText)}>
                    Copy error
                  </Button>
                  <Button size="small" icon={<ExpandOutlined />} onClick={() => this.setState({ fullscreenOpen: true })}>
                    View full screen
                  </Button>
                </Space>
              )}
            </Space>
            {showDetail && detailBlock}
          </div>
          <Modal
            open={fullscreenOpen}
            onCancel={() => this.setState({ fullscreenOpen: false })}
            footer={
              <Button icon={<CopyOutlined />} onClick={() => void this.copyError(fullText)}>
                Copy error
              </Button>
            }
            width="90vw"
            title="Error details"
          >
            <Typography.Paragraph className="!mb-0">{detailBlock}</Typography.Paragraph>
          </Modal>
        </>
      )
    }
    return this.props.children
  }
}
