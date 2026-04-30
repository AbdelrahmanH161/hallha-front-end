"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { useChatQuery } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"

export function ChatWindow() {
  const t = useTranslations("app.chat")
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
      <div className="flex min-h-0 flex-1 flex-col">
        <ChatWelcome />
        <ChatComposer threadId={null} />
      </div>
    )
  }

  const messages = data?.messages ?? []
  const showStreamingBubble = isStreaming && streamingThreadId === activeThreadId

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isFetching && messages.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {t("loadingConversation")}
          </div>
        ) : isError ? (
          <div className="text-xs text-destructive">
            {(error as Error)?.message ?? t("loadMessagesFailed")}
          </div>
        ) : messages.length === 0 && !showStreamingBubble ? (
          <div className="text-xs text-muted-foreground">{t("firstMessageHint")}</div>
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
