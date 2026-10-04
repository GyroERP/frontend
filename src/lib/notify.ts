import { message, notification } from 'antd'

/** Central toast API (replaces sonner). Works under ConfigProvider. */
export const notify = {
  success: (content: string) => message.success(content),
  error: (content: string) => message.error(content),
  info: (content: string) => message.info(content),
  warning: (content: string) => message.warning(content),
  notification,
}
