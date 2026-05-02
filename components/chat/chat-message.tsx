"use client"

import * as React from "react"
import { Loader2, User } from "lucide-react"
import { useTranslations } from "next-intl"

import { ChatMessageContent } from "@/components/chat/chat-message-content"
import { HalimAvatar } from "@/components/chat/halim-avatar"
import { cn } from "@/lib/utils"
import type { RetrievedSource } from "@/lib/types/retrieved-source"

export type ChatMessageProps = {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  pending?: boolean
  id?: string
  structuredSources?: RetrievedSource[]
}

export function ChatMessage({
  role,
  content,
  pending,
  id,
  structuredSources,
}: ChatMessageProps) {
  const t = useTranslations("app.chat")
  const reactId = React.useId()
  const anchorPrefix = `cite-${(id ?? reactId).replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isUser = role === "user"
  const showThinkingPlaceholder =
    !isUser && pending === true && content.trim().length === 0

  return (
    <div
      className={cn(
        "animate-msg-in flex items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground shadow-sm">
          <User className="size-4" aria-hidden />
        </div>
      ) : (
        <HalimAvatar size={34} />
      )}

      <div
        className={cn(
          "flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-1.5 sm:max-w-[78%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "min-w-0 max-w-full px-3 py-2.5 text-sm leading-relaxed break-words sm:px-4",
            isUser
              ? "bubble-user whitespace-pre-wrap bg-[linear-gradient(135deg,#064e3b_0%,#0a6652_100%)] text-primary-foreground shadow-[0_4px_16px_rgba(6,78,59,0.25)]"
              : "bubble-assistant glass-card text-foreground"
          )}
        >
          {isUser ? (
            <>
              {content}
              {pending ? (
                <span className="ms-1 inline-block animate-pulse">▍</span>
              ) : null}
            </>
          ) : (
            <>
              {showThinkingPlaceholder ? (
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <Loader2
                    className="size-4 shrink-0 animate-spin text-primary"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-foreground/80">
                    {t("thinking")}
                  </span>
                </div>
              ) : (
                <>
                  <ChatMessageContent
                    content={content}
                    anchorPrefix={anchorPrefix}
                    structuredSources={structuredSources}
                  />
                  {pending ? (
                    <span className="ms-1 inline-block animate-pulse">▍</span>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
