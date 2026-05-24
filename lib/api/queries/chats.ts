import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import { streamChatAudit, type StreamErrorPayload } from "@/lib/api/sse"
import { useChatStore } from "@/lib/stores/chat"
import type { RetrievedSource } from "@/lib/types/retrieved-source"

export class ChatStreamError extends Error {
  readonly kind: StreamErrorPayload["kind"]
  readonly status?: number
  readonly provider?: StreamErrorPayload["provider"]
  readonly retryAfterSeconds?: number
  constructor(payload: StreamErrorPayload) {
    super(payload.detail)
    this.name = "ChatStreamError"
    this.kind = payload.kind
    this.status = payload.status
    this.provider = payload.provider
    this.retryAfterSeconds = payload.retryAfterSeconds
  }
}

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
  list: (clientId?: string | null) =>
    [...chatKeys.all, "list", clientId ?? null] as const,
  detail: (threadId: string) => [...chatKeys.all, "detail", threadId] as const,
}

/** Shared with `useIsMutating` for send/stream lifecycle in the chat UI. */
export const chatAuditStreamMutationKey = ["chatAuditStream"] as const

export function useChatsQuery(clientId?: string | null) {
  const query =
    clientId === undefined ? "" : `?clientId=${encodeURIComponent(clientId ?? "null")}`
  return useQuery({
    queryKey: chatKeys.list(clientId ?? null),
    queryFn: () =>
      apiFetch<{ threads: ChatThreadSummary[] }>(`/chats${query}`).then(
        (r) => r.threads
      ),
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
      qc.invalidateQueries({ queryKey: chatKeys.all })
      qc.removeQueries({ queryKey: chatKeys.detail(threadId) })
    },
  })
}

type SendChatArgs = {
  threadId: string
  clientId?: string | null
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
    onError: (err, { threadId }, context) => {
      // AbortError isn't a real error — it's user intent. The mutationFn already
      // committed the partial assistant message to cache; just unwind state.
      if (err instanceof Error && err.name === "AbortError") {
        finishStreaming()
        return
      }
      finishStreaming()
      const prev = context?.previousThread
      if (prev !== undefined) {
        qc.setQueryData(chatKeys.detail(threadId), prev)
      } else {
        qc.removeQueries({ queryKey: chatKeys.detail(threadId) })
      }
    },
    mutationFn: async ({ threadId, clientId, message, file }: SendChatArgs) => {
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

      let lastError: StreamErrorPayload | null = null

      try {
        await streamChatAudit({
          threadId,
          clientId,
          message,
          file,
          signal: controller.signal,
          onToken: (text) => appendToken(text),
          onSources: (sources) => setStreamingSources(sources),
          onError: (payload) => {
            lastError = payload
          },
        })
      } catch (err) {
        // Stop button fired AbortController.abort() — commit whatever partial
        // assistant text + sources we collected to the cache so the user keeps
        // the visible context, then return without throwing. The backend now
        // persists the thread up-front (before streaming starts), so a follow-up
        // GET /chats/:id will succeed instead of 404'ing.
        if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
          commitPartialAssistantMessage(qc, threadId)
          finishStreaming()
          // Schedule a sync with the backend (will pick up the persisted thread).
          void qc.invalidateQueries({ queryKey: chatKeys.detail(threadId) })
          void qc.invalidateQueries({ queryKey: chatKeys.all })
          return
        }
        finishStreaming()
        throw err
      }

      if (lastError) {
        finishStreaming()
        throw new ChatStreamError(lastError)
      }

      await qc.invalidateQueries({ queryKey: chatKeys.detail(threadId) })
      finishStreaming()
      await qc.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}

/**
 * Read the partial assistant text + sources from the chat store and commit them as a
 * finalized assistant message in the React Query cache. Called when the user stops the
 * stream — keeps whatever was generated visible instead of restoring the cache to its
 * pre-send state (which would erase both the user message and the partial response).
 */
function commitPartialAssistantMessage(
  qc: ReturnType<typeof useQueryClient>,
  threadId: string
) {
  const { streamingText, streamingSources } = useChatStore.getState()
  // No partial content yet (abort fired before first token) — leave the optimistic
  // user message alone. The follow-up invalidate will reconcile with the backend.
  if (!streamingText && streamingSources.length === 0) return

  qc.setQueryData<ChatThread | undefined>(chatKeys.detail(threadId), (existing) => {
    if (!existing) return existing
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: streamingText,
    }
    return {
      ...existing,
      messages: [...existing.messages, assistantMsg],
      sources: streamingSources.length > 0 ? streamingSources : existing.sources,
      lastMessageAt: new Date().toISOString(),
    }
  })
}
