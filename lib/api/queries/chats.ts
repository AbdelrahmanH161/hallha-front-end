import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import { streamChatAudit } from "@/lib/api/sse"
import { useChatStore } from "@/lib/stores/chat"
import type { RetrievedSource } from "@/lib/types/retrieved-source"

export type { RetrievedSource }

export type ChatThreadSummary = {
  thread_id: string
  title: string | null
  createdAt: string
  lastMessageAt: string
}

export type ChatMessage = {
  role: "user" | "assistant" | "system" | "tool"
  content: string
}

export type ChatThread = {
  thread_id: string
  title: string | null
  createdAt: string
  lastMessageAt: string
  messages: ChatMessage[]
  sources: RetrievedSource[]
}

export const chatKeys = {
  all: ["chats"] as const,
  list: () => [...chatKeys.all, "list"] as const,
  detail: (threadId: string) => [...chatKeys.all, "detail", threadId] as const,
}

/** Shared with `useIsMutating` for send/stream lifecycle in the chat UI. */
export const chatAuditStreamMutationKey = ["chatAuditStream"] as const

export function useChatsQuery() {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: () =>
      apiFetch<{ threads: ChatThreadSummary[] }>("/chats").then((r) => r.threads),
  })
}

export function useChatQuery(threadId: string | null) {
  return useQuery({
    queryKey: threadId ? chatKeys.detail(threadId) : chatKeys.detail(""),
    queryFn: async () => {
      const thread = await apiFetch<ChatThread>(
        `/chats/${encodeURIComponent(threadId!)}`
      )
      return {
        ...thread,
        sources: Array.isArray(thread.sources) ? thread.sources : [],
      }
    },
    enabled: !!threadId,
    retry: (failureCount, error) => {
      const status = (error as { status?: number }).status
      if (status === 404) return false
      return failureCount < 1
    },
  })
}

export function useDeleteChatMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (threadId: string) =>
      apiFetch<{ status: "deleted" }>(`/chats/${encodeURIComponent(threadId)}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, threadId) => {
      qc.invalidateQueries({ queryKey: chatKeys.list() })
      qc.removeQueries({ queryKey: chatKeys.detail(threadId) })
    },
  })
}

type SendChatArgs = {
  threadId: string
  message?: string
  file?: File | null
}

export function useSendChatStream() {
  const qc = useQueryClient()
  const startStreaming = useChatStore((s) => s.startStreaming)
  const appendToken = useChatStore((s) => s.appendToken)
  const setStreamingSources = useChatStore((s) => s.setStreamingSources)
  const finishStreaming = useChatStore((s) => s.finishStreaming)

  return useMutation({
    mutationKey: chatAuditStreamMutationKey,
    onMutate: async ({ threadId }) => {
      await qc.cancelQueries({ queryKey: chatKeys.detail(threadId) })
      const previousThread = qc.getQueryData<ChatThread | undefined>(
        chatKeys.detail(threadId)
      )
      return { previousThread }
    },
    onError: (_err, { threadId }, context) => {
      finishStreaming()
      const prev = context?.previousThread
      if (prev !== undefined) {
        qc.setQueryData(chatKeys.detail(threadId), prev)
      } else {
        qc.removeQueries({ queryKey: chatKeys.detail(threadId) })
      }
    },
    mutationFn: async ({ threadId, message, file }: SendChatArgs) => {
      const controller = new AbortController()
      startStreaming(threadId, controller)

      qc.setQueryData<ChatThread | undefined>(
        chatKeys.detail(threadId),
        (existing) => {
          const next: ChatThread = existing ?? {
            thread_id: threadId,
            title: message ? message.slice(0, 60) : null,
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            messages: [],
            sources: [],
          }
          const userMsg: ChatMessage = {
            role: "user",
            content: message ?? (file ? `📎 ${file.name}` : ""),
          }
          return { ...next, messages: [...next.messages, userMsg] }
        }
      )

      let lastError: string | null = null

      try {
        await streamChatAudit({
          threadId,
          message,
          file,
          signal: controller.signal,
          onToken: (text) => appendToken(text),
          onSources: (sources) => setStreamingSources(sources),
          onError: (detail) => {
            lastError = detail
          },
        })
      } catch (err) {
        finishStreaming()
        throw err
      }

      if (lastError) {
        finishStreaming()
        throw new Error(lastError)
      }

      await qc.invalidateQueries({ queryKey: chatKeys.detail(threadId) })
      finishStreaming()
      await qc.invalidateQueries({ queryKey: chatKeys.list() })
    },
  })
}
