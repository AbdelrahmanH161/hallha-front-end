"use client"

import * as React from "react"
import { Loader2, Paperclip, Send, Square, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { useSendChatStream } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"

const MAX_FILE_BYTES = 50 * 1024 * 1024

export function ChatComposer({ threadId }: { threadId: string }) {
  const [message, setMessage] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingThreadId = useChatStore((s) => s.streamingThreadId)
  const abortStreaming = useChatStore((s) => s.abortStreaming)

  const sendChat = useSendChatStream()

  const isThisThreadStreaming = isStreaming && streamingThreadId === threadId
  const canSend = !isStreaming && (message.trim().length > 0 || !!file)

  async function handleSend() {
    if (!canSend) return
    const payload = { threadId, message: message.trim() || undefined, file }
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
            : "Unknown error"
      toast.error("Failed to send message", { description })
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
      toast.error("File too large", { description: "Maximum size is 50MB." })
      e.target.value = ""
      return
    }
    setFile(next)
  }

  return (
    <div className="rounded-xl border bg-card/60 p-3 shadow-sm backdrop-blur">
      {file ? (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs">
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
        placeholder="Ask the auditor anything…"
        rows={3}
        className="min-h-[72px] resize-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        disabled={isStreaming && !isThisThreadStreaming}
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            aria-label="Attach file"
          >
            <Paperclip className="size-4" />
          </Button>
        </div>

        {isThisThreadStreaming ? (
          <Button type="button" variant="outline" onClick={abortStreaming} className="gap-2">
            <Square className="size-4" aria-hidden />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="gap-2"
          >
            {sendChat.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Send
          </Button>
        )}
      </div>
    </div>
  )
}
