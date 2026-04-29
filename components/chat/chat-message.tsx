"use client"

import { Bot, User } from "lucide-react"

import { cn } from "@/lib/utils"

export type ChatMessageProps = {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  pending?: boolean
}

export function ChatMessage({ role, content, pending }: ChatMessageProps) {
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
          "max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words",
          isUser
            ? "bg-primary text-primary-foreground border-transparent"
            : "bg-card text-foreground"
        )}
      >
        {content}
        {pending ? <span className="ml-1 inline-block animate-pulse">▍</span> : null}
      </div>
      {isUser ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground">
          <User className="size-4" aria-hidden />
        </div>
      ) : null}
    </div>
  )
}
