"use client"

import * as React from "react"
import { Loader2, Paperclip, Send, Square, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { useSendChatStream } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"
import { cn } from "@/lib/utils"

const MAX_FILE_BYTES = 50 * 1024 * 1024

function newThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatComposer({ threadId }: { threadId: string | null }) {
  const t = useTranslations("app.chat.composer")
  const [message, setMessage] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [focused, setFocused] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingThreadId = useChatStore((s) => s.streamingThreadId)
  const abortStreaming = useChatStore((s) => s.abortStreaming)
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)

  const sendChat = useSendChatStream()

  const isThisThreadStreaming =
    isStreaming && !!threadId && streamingThreadId === threadId
  const canSend = !isStreaming && (message.trim().length > 0 || !!file)

  async function handleSend() {
    if (!canSend) return
    const targetId = threadId ?? newThreadId()
    if (!threadId) setActiveThreadId(targetId)
    const payload = {
      threadId: targetId,
      message: message.trim() || undefined,
      file,
    }
    setMessage("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    try {
      await sendChat.mutateAsync(payload)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const description =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : undefined
      toast.error(t("sendFailed"), { description })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0]
    if (!next) {
      setFile(null)
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      toast.error(t("fileTooLarge"), { description: t("fileTooLargeDescription") })
      e.target.value = ""
      return
    }
    setFile(next)
  }

  return (
    <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
      <div
        className={cn(
          "glass-card overflow-hidden rounded-2xl transition-shadow",
          focused
            ? "border-accent/40 shadow-[0_0_0_3px_rgba(212,175,55,0.10),var(--glass-shadow-card)]"
            : ""
        )}
      >
        {file ? (
          <div className="flex items-center justify-between gap-2 border-b border-[var(--glass-border-card)] bg-primary/[0.06] px-4 py-2 text-xs">
            <span className="truncate">📎 {file.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => {
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={threadId ? t("placeholder") : t("newPlaceholder")}
          rows={3}
          className="min-h-[72px] resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-relaxed shadow-none focus-visible:ring-0"
          disabled={isStreaming && !isThisThreadStreaming}
        />

        <div className="flex items-center justify-between gap-2 px-3 pb-2.5">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              aria-label={t("attach")}
              className="size-8 text-muted-foreground hover:text-primary"
            >
              <Paperclip className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              {t("enterToSend")}
            </span>
            {isThisThreadStreaming ? (
              <Button
                type="button"
                variant="outline"
                onClick={abortStreaming}
                className="gap-2"
              >
                <Square className="size-4" aria-hidden />
                {t("stop")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "shimmer gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_3px_12px_rgba(6,78,59,0.25)] transition-transform",
                  canSend
                    ? "bg-[linear-gradient(135deg,#064e3b_0%,#0a6652_100%)] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(6,78,59,0.35)]"
                    : "bg-primary/20 text-muted-foreground shadow-none"
                )}
              >
                {sendChat.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {t("send")}
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </div>
  )
}
