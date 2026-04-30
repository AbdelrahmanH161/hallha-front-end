"use client"

import * as React from "react"
import { HelpCircle, Moon, Settings, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { HalimAvatar } from "@/components/chat/halim-avatar"
import { Button } from "@/components/ui/button"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ChatHeader() {
  const t = useTranslations("app.chat")
  const tHeader = useTranslations("app.chat.header")
  const openSettings = useSettingsDialog((s) => s.openAt)
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="glass-nav relative z-[5] flex flex-shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2.5">
        <HalimAvatar size={28} />
        <div className="leading-tight">
          <div className="font-heading text-sm font-bold">
            <span className="gradient-text">{t("brand")}</span>
            <span className="ms-1.5 text-xs font-normal text-muted-foreground">
              {t("brandArabic")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500">
            <span className="animate-pulse-glow inline-block size-1.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              {t("tagline")} · <span className="text-emerald-500">{t("statusOnline")}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("settings")}
          onClick={() => openSettings("profile")}
          className="size-8 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur"
        >
          <Settings className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("toggleTheme")}
          disabled={!isClient}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="size-8 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("help")}
          className="size-8 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur"
        >
          <HelpCircle className="size-4" />
        </Button>

        <div className="ms-1 hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline-flex">
          <span className="animate-pulse-glow inline-block size-1.5 rounded-full bg-primary" />
          {t("aaoiAligned")}
        </div>
      </div>
    </header>
  )
}
