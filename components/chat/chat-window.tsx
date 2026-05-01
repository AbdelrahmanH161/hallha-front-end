"use client"

import * as React from "react"
import { CircleAlert, Loader2 } from "lucide-react"
import { useIsMutating } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ApiError } from "@/lib/api/client"
import {
  chatAuditStreamMutationKey,
  useChatQuery,
  type ChatMessage as ThreadMessage,
} from "@/lib/api/queries/chats"
import { sourcesForAssistantFooter } from "@/lib/chat/sources-for-footer"
import { useChatStore } from "@/lib/stores/chat"
import { cn } from "@/lib/utils"

function isVisibleThreadMessage(m: ThreadMessage): boolean {
  if (m.role === "tool") return false
  if (m.role === "assistant" && m.content.trim().length === 0) return false
  return true
}

function fatalErrorTitle(apiErr: ApiError | null, t: (k: string) => string) {
  if (!apiErr) return t("errorTitleGeneric")
  switch (apiErr.status) {
    case 404:
      return t("errorTitleNotFound")
    case 402:
      return t("errorTitleQuota")
    case 429:
      return t("errorTitleRateLimit")
    default:
      return t("errorTitleGeneric")
  }
}

export function ChatWindow() {
  const t = useTranslations("app.chat")
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const streamingThreadId = useChatStore((s) => s.streamingThreadId)
  const streamingText = useChatStore((s) => s.streamingText)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingSources = useChatStore((s) => s.streamingSources)

  const sendMutationBusy =
    useIsMutating({ mutationKey: chatAuditStreamMutationKey }) > 0

  const { data, isFetching, isError, error } = useChatQuery(activeThreadId)

  const scrollerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [
    data?.messages.length,
    streamingText,
    streamingSources.length,
    activeThreadId,
  ])

  const rawMessages = activeThreadId ? data?.messages : undefined
  const visibleMessages = React.useMemo(
    () => (rawMessages ?? []).filter(isVisibleThreadMessage),
    [rawMessages]
  )

  if (!activeThreadId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ChatWelcome />
        <ChatComposer threadId={null} />
      </div>
    )
  }

  const messages = rawMessages ?? []
  const showStreamingBubble =
    isStreaming && streamingThreadId === activeThreadId

  const apiErr = error instanceof ApiError ? error : null

  const transientNotFound =
    apiErr?.status === 404 &&
    (showStreamingBubble || sendMutationBusy || messages.length > 0)

  const fatalError = isError && !transientNotFound

  const showConversationLoading =
    !fatalError &&
    messages.length === 0 &&
    !showStreamingBubble &&
    (isFetching || transientNotFound)

  const errorDetail =
    apiErr?.detail ??
    (error instanceof Error ? error.message : "") ??
    t("loadMessagesFailed")

  const streamingFooterSources =
    streamingSources.length > 0
      ? sourcesForAssistantFooter(streamingText, streamingSources)
      : []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {showConversationLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {t("loadingConversation")}
          </div>
        ) : fatalError ? (
          <div
            className={cn(
              "glass-card flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            )}
            role="alert"
          >
            <CircleAlert
              className="size-5 shrink-0 text-destructive"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-destructive">
                {fatalErrorTitle(apiErr, t)}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {errorDetail || t("loadMessagesFailed")}
              </p>
            </div>
          </div>
        ) : visibleMessages.length === 0 && !showStreamingBubble ? (
          <div className="text-xs text-muted-foreground">
            {t("firstMessageHint")}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMessages.map((m, i) => {
              const isLastAssistant =
                m.role === "assistant" && i === visibleMessages.length - 1
              const threadSources = data?.sources ?? []
              const footerSources =
                isLastAssistant && threadSources.length > 0
                  ? sourcesForAssistantFooter(m.content, threadSources)
                  : []
              const sources =
                footerSources.length > 0 ? footerSources : undefined
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
                content={streamingText}
                structuredSources={
                  streamingFooterSources.length > 0
                    ? streamingFooterSources
                    : undefined
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
