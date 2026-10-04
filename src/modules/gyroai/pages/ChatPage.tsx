import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Spin } from 'antd'
import { Send, Bot, User, Plus } from 'lucide-react'
import { aiKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { apiClient } from '@/api/client'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/cn'
import type { AIConversation, AIMessage } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

export function ChatPage() {
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData } = useQuery({
    queryKey: aiKeys.conversations(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<AIConversation>>('/gyroai/conversations/', {
        params: { page_size: 25 },
      }),
    staleTime: 30_000,
  })

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: activeConversationId ? aiKeys.messages(activeConversationId) : ['no-conversation'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<AIMessage>>('/gyroai/messages/', {
        params: { conversation: activeConversationId, page_size: 100 },
      }),
    enabled: !!activeConversationId,
    staleTime: 10_000,
  })

  const conversations = conversationsData?.data.results ?? []
  const messages = messagesData?.data.results ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const newConversation = useMutation({
    mutationFn: () =>
      apiClient.post<AIConversation>('/gyroai/conversations/', { title: 'New Chat' }),
    onSuccess: (res) => {
      setActiveConversationId(res.data.id)
      void queryClient.invalidateQueries({ queryKey: aiKeys.conversations() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!activeConversationId) {
        const conv = await apiClient.post<AIConversation>('/gyroai/conversations/', {
          title: input.slice(0, 50),
        })
        setActiveConversationId(conv.data.id)
        return apiClient.post<AIMessage>('/gyroai/messages/', {
          conversation: conv.data.id,
          role: 'USER',
          content: input,
        })
      }
      return apiClient.post<AIMessage>('/gyroai/messages/', {
        conversation: activeConversationId,
        role: 'USER',
        content: input,
      })
    },
    onSuccess: () => {
      setInput('')
      void queryClient.invalidateQueries({ queryKey: aiKeys.conversations() })
      if (activeConversationId) {
        void queryClient.invalidateQueries({ queryKey: aiKeys.messages(activeConversationId) })
      }
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  function handleSend() {
    if (!input.trim()) return
    sendMessage.mutate()
  }

  return (
    <PageShell title="AI Assistant" breadcrumbs={[{ label: 'AI' }, { label: 'Chat' }]}>
      <div className="flex h-[calc(100vh-12rem)] gap-4 -mx-6 -mt-2 px-6">
        <div className="w-56 shrink-0 flex flex-col gap-2">
          <Button
            block
            size="small"
            icon={<Plus className="size-4" />}
            onClick={() => newConversation.mutate()}
            loading={newConversation.isPending}
          >
            New Chat
          </Button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm truncate',
                  conv.id === activeConversationId
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                {conv.title || 'Untitled'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeConversationId && (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
                <Bot className="size-12 mb-3 text-neutral-300" />
                <p className="text-lg font-medium text-neutral-500">GyroERP AI Assistant</p>
                <p className="text-sm mt-1">Start a new chat or select a conversation.</p>
              </div>
            )}

            {messagesLoading && (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'USER' ? 'justify-end' : 'justify-start')}
              >
                {msg.role !== 'USER' && (
                  <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                    <Bot className="size-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2.5 text-sm',
                    msg.role === 'USER'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-neutral-100 text-neutral-800 rounded-bl-none',
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.raw_text ?? JSON.stringify(msg.content)}
                  </p>
                </div>
                {msg.role === 'USER' && (
                  <div className="size-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                    <User className="size-4 text-neutral-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-neutral-100 p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 resize-none rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px] max-h-32"
              />
              <Button
                size="small"
                type="primary"
                icon={<Send className="size-4" />}
                disabled={!input.trim()}
                loading={sendMessage.isPending}
                onClick={handleSend}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
