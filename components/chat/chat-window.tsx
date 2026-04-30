"use client"

import * as React from "react"
import { Loader2, MessageSquare } from "lucide-react"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatMessage } from "@/components/chat/chat-message"
import { useChatQuery } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"

export function ChatWindow() {
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const streamingThreadId = useChatStore((s) => s.streamingThreadId)
  const streamingText = useChatStore((s) => s.streamingText)
  const isStreaming = useChatStore((s) => s.isStreaming)

  const streamingSources = useChatStore((s) => s.streamingSources)

  const { data, isFetching, isError, error } = useChatQuery(activeThreadId)

  const scrollerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [data?.messages.length, streamingText, streamingSources.length, activeThreadId])

  if (!activeThreadId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border bg-card/40 p-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-muted">
          <MessageSquare className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="text-sm font-medium">No conversation selected</div>
        <p className="max-w-sm text-xs text-muted-foreground">
          Start a new chat from the sidebar to ask the AI auditor about contracts, transactions,
          or upload a document for review.
        </p>
      </div>
    )
  }

  const messages = data?.messages ?? []
  const showStreamingBubble = isStreaming && streamingThreadId === activeThreadId

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto rounded-xl border bg-card/40 p-4"
      >
        {isFetching && messages.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Loading conversation…
          </div>
        ) : isError ? (
          <div className="text-xs text-destructive">
            {(error as Error)?.message ?? "Failed to load messages."}
          </div>
        ) : messages.length === 0 && !showStreamingBubble ? (
          <div className="text-xs text-muted-foreground">
            Send your first message to start this conversation.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => {
              const isLastAssistant =
                m.role === "assistant" && i === messages.length - 1
              const threadSources = data?.sources ?? []
              const sources =
                isLastAssistant && threadSources.length > 0 ? threadSources : undefined
              return (
                <ChatMessage
                  key={`${m.role}-${i}`}
                  role={m.role}
                  content={m.content}
                  structuredSources={sources}
                />
              )
            })}
            {showStreamingBubble ? (
              <ChatMessage
                role="assistant"
                content={streamingText || "…"}
                structuredSources={
                  streamingSources.length > 0 ? streamingSources : undefined
                }
                pending
              />
            ) : null}
          </div>
        )}
      </div>

      <ChatComposer threadId={activeThreadId} />
    </div>
  )
}
