"use client"

import * as React from "react"
import { Bot, User } from "lucide-react"

import { ChatMessageContent } from "@/components/chat/chat-message-content"
import { cn } from "@/lib/utils"

export type ChatMessageProps = {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  pending?: boolean
  id?: string
}

export function ChatMessage({ role, content, pending, id }: ChatMessageProps) {
  const reactId = React.useId()
  const anchorPrefix = `cite-${(id ?? reactId).replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isUser = role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground">
          <Bot className="size-4" aria-hidden />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words",
          isUser
            ? "bg-primary text-primary-foreground border-transparent whitespace-pre-wrap"
            : "bg-card text-foreground"
        )}
      >
        {isUser ? (
          <>
            {content}
            {pending ? <span className="ml-1 inline-block animate-pulse">▍</span> : null}
          </>
        ) : (
          <>
            <ChatMessageContent content={content} anchorPrefix={anchorPrefix} />
            {pending ? <span className="ml-1 inline-block animate-pulse">▍</span> : null}
          </>
        )}
      </div>
      {isUser ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground">
          <User className="size-4" aria-hidden />
        </div>
      ) : null}
    </div>
  )
}
