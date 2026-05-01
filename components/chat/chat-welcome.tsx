"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { ChatSuggestionChip } from "@/components/chat/chat-suggestion-chip"
import { HalimAvatar } from "@/components/chat/halim-avatar"
import { ApiError } from "@/lib/api/client"
import { useSendChatStream } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"

function newThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatWelcome() {
  const t = useTranslations("app.chat.welcome")
  const tComposer = useTranslations("app.chat.composer")
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)
  const sendChat = useSendChatStream()

  const suggestions = React.useMemo(
    () => [
      {
        icon: "⚖️",
        label: t("suggestions.reviewContract"),
        sub: t("suggestions.reviewContractSub"),
      },
      {
        icon: "🔍",
        label: t("suggestions.shariaScreening"),
        sub: t("suggestions.shariaScreeningSub"),
      },
      {
        icon: "📋",
        label: t("suggestions.auditChecklist"),
        sub: t("suggestions.auditChecklistSub"),
      },
      {
        icon: "🧮",
        label: t("suggestions.zakat"),
        sub: t("suggestions.zakatSub"),
      },
    ],
    [t]
  )

  async function handleSuggestion(label: string) {
    if (sendChat.isPending) return
    const threadId = newThreadId()
    setActiveThreadId(threadId)
    try {
      await sendChat.mutateAsync({ threadId, message: label })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const description =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : undefined
      toast.error(tComposer("sendFailed"), { description })
    }
  }

  return (
    <div className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="animate-pulse-glow pointer-events-none absolute -inset-3 rounded-2xl bg-[radial-gradient(circle,rgba(6,78,59,0.18)_0%,transparent_70%)]" />
          <HalimAvatar size={68} />
        </div>
        <div className="text-center">
          <h1 className="font-heading text-2xl leading-tight font-bold sm:text-3xl">
            <span className="ms-2 align-middle font-arabic text-lg font-normal text-muted-foreground">
              {t("titleArabic")}
            </span>
          </h1>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {suggestions.map((s) => (
          <ChatSuggestionChip
            key={s.label}
            icon={s.icon}
            label={s.label}
            sub={s.sub}
            onClick={() => void handleSuggestion(s.label)}
            disabled={sendChat.isPending}
          />
        ))}
      </div>
    </div>
  )
}
