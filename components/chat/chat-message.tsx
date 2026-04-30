"use client"

import * as React from "react"
import { User } from "lucide-react"

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
  const reactId = React.useId()
  const anchorPrefix = `cite-${(id ?? reactId).replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isUser = role === "user"

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
          "flex max-w-[78%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed break-words",
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
        </div>
      </div>
    </div>
  )
}
