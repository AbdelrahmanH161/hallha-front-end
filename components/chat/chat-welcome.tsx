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

  function handleSuggestion(label: string) {
    if (chipsDisabled) return
    setComposerPrefill(label)
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
            onClick={() => handleSuggestion(s.label)}
            disabled={chipsDisabled}
          />
        ))}
      </div>
    </div>
  )
}
