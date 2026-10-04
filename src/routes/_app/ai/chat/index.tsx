import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const ChatPage = lazy(() =>
  import('@/modules/gyroai/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)

export const Route = createFileRoute('/_app/ai/chat/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <ChatPage />
    </Suspense>
  ),
})
