"use client"

import * as React from "react"
import { useIsMutating } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { ChatSuggestionChip } from "@/components/chat/chat-suggestion-chip"
import { HalimAvatar } from "@/components/chat/halim-avatar"
import { chatAuditStreamMutationKey } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"

export function ChatWelcome() {
  const t = useTranslations("app.chat.welcome")
  const setComposerPrefill = useChatStore((s) => s.setComposerPrefill)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const sendMutationBusy =
    useIsMutating({ mutationKey: chatAuditStreamMutationKey }) > 0
  const chipsDisabled = isStreaming || sendMutationBusy

  const suggestions = React.useMemo(
    () =>
      [
        {
          id: "reviewContract",
          icon: "⚖️",
          label: t("suggestions.reviewContract"),
          sub: t("suggestions.reviewContractSub"),
          prompt: t("suggestions.reviewContractPrompt"),
        },
        {
          id: "shariaScreening",
          icon: "🔍",
          label: t("suggestions.shariaScreening"),
          sub: t("suggestions.shariaScreeningSub"),
          prompt: t("suggestions.shariaScreeningPrompt"),
        },
        {
          id: "auditChecklist",
          icon: "📋",
          label: t("suggestions.auditChecklist"),
          sub: t("suggestions.auditChecklistSub"),
          prompt: t("suggestions.auditChecklistPrompt"),
        },
        {
          id: "zakat",
          icon: "🧮",
          label: t("suggestions.zakat"),
          sub: t("suggestions.zakatSub"),
          prompt: t("suggestions.zakatPrompt"),
        },
      ] as const,
    [t]
  )

  function handleSuggestion(prompt: string) {
    if (chipsDisabled) return
    setComposerPrefill(prompt)
  }

  return (
    <div className="animate-fade-up flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-y-contain px-6 py-2 [scrollbar-gutter:stable] sm:gap-8 sm:py-4">
      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="relative">
          <div className="animate-pulse-glow pointer-events-none absolute -inset-3 rounded-2xl bg-[radial-gradient(circle,rgba(6,78,59,0.18)_0%,transparent_70%)]" />
          <HalimAvatar size={68} />
        </div>
        <div className="text-center">
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-3xl shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((s) => (
          <ChatSuggestionChip
            key={s.id}
            icon={s.icon}
            label={s.label}
            sub={s.sub}
            onClick={() => handleSuggestion(s.prompt)}
            disabled={chipsDisabled}
          />
        ))}
      </div>
    </div>
  )
}
